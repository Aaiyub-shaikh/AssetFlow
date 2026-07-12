import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  Tags,
  Plus,
  PencilLine,
  ShieldCheck,
  CheckCircle2,
  Ban,
  UserCog,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useAuthStore } from '@/stores'
import { categories as seedCategories, departments as seedDepartments } from '@/data/mock'
import type { Category, Department, User, UserRole } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ROLE_LABELS, ROLE_POSITION_DEFAULTS, MANAGEABLE_ROLES } from '@/lib/rbac'

const departmentStatus = (department: Department) => (department.isActive === false ? 'inactive' : 'active')
const categoryStatus = (category: Category) => (category.isActive === false ? 'inactive' : 'active')
const ORGANIZATION_STORAGE_KEY = 'assetflow-organization-setup'

const getStoredOrganizationState = () => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(ORGANIZATION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

type OrganizationTab = 'departments' | 'categories' | 'employees'

type DepartmentFormState = {
  name: string
  code: string
  location: string
  head: string
  budget: string
}

type CategoryFormState = {
  name: string
  code: string
  description: string
  depreciationRate: string
  warrantyPeriod: string
}

type EmployeeFormState = {
  name: string
  email: string
  department: string
  role: UserRole
  position: string
  status: 'active' | 'inactive'
}

const emptyDepartmentForm = (): DepartmentFormState => ({ name: '', code: '', location: '', head: '', budget: '' })
const emptyCategoryForm = (): CategoryFormState => ({ name: '', code: '', description: '', depreciationRate: '', warrantyPeriod: '' })
const emptyEmployeeForm = (): EmployeeFormState => ({ name: '', email: '', department: '', role: 'employee', position: '', status: 'active' })

export function OrganizationPage() {
  const [searchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const authEmployees = useAuthStore((state) => state.employees)
  const createEmployee = useAuthStore((state) => state.createEmployee)
  const updateEmployee = useAuthStore((state) => state.updateEmployee)
  const toggleEmployeeStatus = useAuthStore((state) => state.toggleEmployeeStatus)

  const [activeTab, setActiveTab] = useState<OrganizationTab>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'categories' || tab === 'employees' || tab === 'departments') {
      return tab
    }
    return 'departments'
  })
  const [departments, setDepartments] = useState<Department[]>(() => {
    const stored = getStoredOrganizationState()
    if (Array.isArray(stored?.departments) && stored.departments.length) {
      return stored.departments.map((dept: Department) => ({ ...dept, isActive: dept.isActive ?? true }))
    }

    return seedDepartments.map((dept) => ({ ...dept, isActive: true }))
  })
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = getStoredOrganizationState()
    if (Array.isArray(stored?.categories) && stored.categories.length) {
      return stored.categories.map((cat: Category) => ({ ...cat, isActive: cat.isActive ?? true }))
    }

    return seedCategories.map((cat) => ({ ...cat, isActive: true }))
  })
  const [employees, setEmployees] = useState<User[]>(authEmployees)
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null)
  const [departmentForm, setDepartmentForm] = useState<DepartmentFormState>(emptyDepartmentForm())
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm())
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(emptyEmployeeForm())

  useEffect(() => {
    setEmployees(authEmployees)
  }, [authEmployees])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify({ departments, categories }))
    }
  }, [departments, categories])

  useEffect(() => {
    const loadRemoteData = async () => {
      const stored = getStoredOrganizationState()
      const hasLocalDepartments = Array.isArray(stored?.departments) && stored.departments.length > 0
      const hasLocalCategories = Array.isArray(stored?.categories) && stored.categories.length > 0
      if (hasLocalDepartments && hasLocalCategories) return

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('assetflow-token') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      try {
        const [deptResponse, categoryResponse, userResponse] = await Promise.all([
          fetch(`${baseUrl}/departments?limit=100`, { headers }),
          fetch(`${baseUrl}/categories?limit=100`, { headers }),
          fetch(`${baseUrl}/users?limit=100`, { headers }),
        ])

        if (!hasLocalDepartments && deptResponse.ok) {
          const payload = await deptResponse.json()
          const nextDepartments = Array.isArray(payload?.data) ? payload.data : payload?.departments || []
          if (nextDepartments.length) {
            setDepartments(nextDepartments.map((dept: any) => ({
              id: dept._id || dept.id,
              name: dept.name,
              code: dept.code,
              head: dept.head?.name || dept.head || 'Unassigned',
              headEmail: dept.head?.email || '',
              employees: dept.employees ?? 0,
              assets: dept.assets ?? 0,
              budget: dept.budget ?? 0,
              location: dept.location || 'TBD',
              createdAt: dept.createdAt || '',
              isActive: dept.isActive !== false,
            })))
          }
        }

        if (!hasLocalCategories && categoryResponse.ok) {
          const payload = await categoryResponse.json()
          const nextCategories = Array.isArray(payload?.data) ? payload.data : payload?.categories || []
          if (nextCategories.length) {
            setCategories(nextCategories.map((cat: any) => ({
              id: cat._id || cat.id,
              name: cat.name,
              code: cat.code,
              description: cat.description || 'No description provided',
              assets: cat.assets ?? 0,
              depreciationRate: cat.depreciationRate ?? 0,
              warrantyPeriod: cat.warrantyPeriod ?? 12,
              icon: cat.icon || 'Laptop',
              isActive: cat.isActive !== false,
            })))
          }
        }

        if (userResponse.ok) {
          const payload = await userResponse.json()
          const nextUsers = Array.isArray(payload?.data) ? payload.data : payload?.users || []
          if (nextUsers.length) {
            setEmployees(nextUsers.map((user: any) => ({
              id: user._id || user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
              department: user.department?.name || user.department || 'Unassigned',
              position: user.position || 'Employee',
              phone: user.phone,
              joinedAt: user.createdAt || user.joinedAt || '',
              status: user.status || 'active',
            })))
          }
        }
      } catch {
        // fall back to the seeded demo data
      }
    }

    void loadRemoteData()
  }, [])

  const stats = useMemo(() => [
    { label: 'Departments', value: departments.length.toString(), icon: Building2 },
    { label: 'Categories', value: categories.length.toString(), icon: Tags },
    { label: 'Employees', value: employees.filter((user) => user.status !== 'inactive').length.toString(), icon: Users },
    { label: 'Asset Managers', value: employees.filter((user) => user.role === 'manager' && user.status !== 'inactive').length.toString(), icon: ShieldCheck },
  ], [categories.length, departments.length, employees])

  const closeDepartmentModal = () => {
    setDepartmentModalOpen(false)
    setEditingDepartment(null)
    setDepartmentForm(emptyDepartmentForm())
  }

  const openDepartmentModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department)
      setDepartmentForm({
        name: department.name,
        code: department.code,
        location: department.location || '',
        head: department.head || '',
        budget: String(department.budget || 0),
      })
    } else {
      setEditingDepartment(null)
      setDepartmentForm(emptyDepartmentForm())
    }
    setDepartmentModalOpen(true)
  }

  const saveDepartment = (event: React.FormEvent) => {
    event.preventDefault()
    if (!departmentForm.name || !departmentForm.code) {
      toast.error('Department name and code are required')
      return
    }

    const nextDepartment: Department = {
      id: editingDepartment?.id || `dept-${Date.now()}`,
      name: departmentForm.name,
      code: departmentForm.code.toUpperCase(),
      head: departmentForm.head || editingDepartment?.head || 'Unassigned',
      headEmail: editingDepartment?.headEmail || '',
      employees: editingDepartment?.employees || 0,
      assets: editingDepartment?.assets || 0,
      budget: Number(departmentForm.budget || 0),
      location: departmentForm.location || 'TBD',
      createdAt: editingDepartment?.createdAt || new Date().toISOString(),
      isActive: editingDepartment?.isActive ?? true,
    }

    if (editingDepartment) {
      setDepartments((current) => current.map((department) => (department.id === editingDepartment.id ? nextDepartment : department)))
      toast.success(`${nextDepartment.name} updated`)
    } else {
      setDepartments((current) => [nextDepartment, ...current])
      toast.success(`${nextDepartment.name} created`)
    }

    closeDepartmentModal()
  }

  const toggleDepartmentStatus = (department: Department) => {
    const nextStatus = departmentStatus(department) === 'active' ? 'inactive' : 'active'
    setDepartments((current) => current.map((item) => (item.id === department.id ? { ...item, isActive: nextStatus === 'active' } : item)))
    toast.success(`${department.name} marked ${nextStatus}`)
  }

  const closeCategoryModal = () => {
    setCategoryModalOpen(false)
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm())
  }

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        code: category.code,
        description: category.description || '',
        depreciationRate: String(category.depreciationRate || 0),
        warrantyPeriod: String(category.warrantyPeriod || 12),
      })
    } else {
      setEditingCategory(null)
      setCategoryForm(emptyCategoryForm())
    }
    setCategoryModalOpen(true)
  }

  const saveCategory = (event: React.FormEvent) => {
    event.preventDefault()
    if (!categoryForm.name || !categoryForm.code) {
      toast.error('Category name and code are required')
      return
    }

    const nextCategory: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: categoryForm.name,
      code: categoryForm.code.toUpperCase(),
      description: categoryForm.description || 'No description provided',
      assets: editingCategory?.assets || 0,
      depreciationRate: Number(categoryForm.depreciationRate || 0),
      warrantyPeriod: Number(categoryForm.warrantyPeriod || 12),
      icon: editingCategory?.icon || 'Laptop',
      isActive: editingCategory?.isActive ?? true,
    }

    if (editingCategory) {
      setCategories((current) => current.map((category) => (category.id === editingCategory.id ? nextCategory : category)))
      toast.success(`${nextCategory.name} updated`)
    } else {
      setCategories((current) => [nextCategory, ...current])
      toast.success(`${nextCategory.name} created`)
    }

    closeCategoryModal()
  }

  const toggleCategoryStatus = (category: Category) => {
    const nextStatus = categoryStatus(category) === 'active' ? 'inactive' : 'active'
    setCategories((current) => current.map((item) => (item.id === category.id ? { ...item, isActive: nextStatus === 'active' } : item)))
    toast.success(`${category.name} marked ${nextStatus}`)
  }

  const closeEmployeeModal = () => {
    setEmployeeModalOpen(false)
    setEditingEmployee(null)
    setEmployeeForm(emptyEmployeeForm())
  }

  const openEmployeeModal = (employee?: User) => {
    if (employee) {
      setEditingEmployee(employee)
      setEmployeeForm({
        name: employee.name,
        email: employee.email,
        department: employee.department || '',
        role: employee.role,
        position: employee.position || '',
        status: (employee.status as 'active' | 'inactive') || 'active',
      })
    } else {
      setEditingEmployee(null)
      setEmployeeForm(emptyEmployeeForm())
    }
    setEmployeeModalOpen(true)
  }

  const saveEmployee = (event: React.FormEvent) => {
    event.preventDefault()
    if (!employeeForm.name || !employeeForm.email || !employeeForm.department || !employeeForm.position) {
      toast.error('Name, email, department, and position are required')
      return
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name: employeeForm.name,
        email: employeeForm.email,
        department: employeeForm.department,
        role: employeeForm.role,
        position: employeeForm.position,
        status: employeeForm.status,
      })
      setEmployees((current) => current.map((employee) => (employee.id === editingEmployee.id ? { ...employee, ...{ name: employeeForm.name, email: employeeForm.email, department: employeeForm.department, role: employeeForm.role, position: employeeForm.position, status: employeeForm.status } } : employee)))
      toast.success(`${employeeForm.name} updated`)
    } else {
      createEmployee({
        name: employeeForm.name,
        email: employeeForm.email,
        department: employeeForm.department,
        role: employeeForm.role,
        position: employeeForm.position,
        password: 'password123',
        status: employeeForm.status,
      })
      toast.success(`${employeeForm.name} added to the directory`)
    }

    closeEmployeeModal()
  }

  const toggleEmployeeDirectoryStatus = (employee: User) => {
    const nextStatus = employee.status === 'active' ? 'inactive' : 'active'
    toggleEmployeeStatus(employee.id, nextStatus)
    setEmployees((current) => current.map((item) => (item.id === employee.id ? { ...item, status: nextStatus } : item)))
    toast.success(`${employee.name} marked ${nextStatus}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Setup"
        description="Admin-only control center for departments, categories, and employee directory management."
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-hero p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin workspace</p>
            <h2 className="text-2xl font-semibold">{currentUser?.name || 'AssetFlow Admin'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Keep the organization structure consistent from a single trusted interface.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Role access</p>
            <p>{ROLE_LABELS[currentUser?.role || 'admin']}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrganizationTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Department Management</TabsTrigger>
          <TabsTrigger value="categories">Asset Category Management</TabsTrigger>
          <TabsTrigger value="employees">Employee Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Departments</h3>
                <p className="text-sm text-muted-foreground">Create and maintain departments, assign department heads, and keep them active or inactive.</p>
              </div>
              <Button onClick={() => openDepartmentModal()}>
                <Plus className="mr-2 h-4 w-4" /> Add Department
              </Button>
            </div>
            <DataTable
              columns={[
                { accessorKey: 'name', header: 'Department', cell: ({ row }) => (
                  <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.code}</p>
                  </div>
                )},
                { accessorKey: 'head', header: 'Head', cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span> },
                { accessorKey: 'employees', header: 'Employees', cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span> },
                { accessorKey: 'assets', header: 'Assets', cell: ({ getValue }) => <span className="font-medium text-primary">{getValue<number>()}</span> },
                { accessorKey: 'budget', header: 'Budget', cell: ({ getValue }) => formatCurrency(getValue<number>()) },
                { accessorKey: 'location', header: 'Location' },
                { id: 'status', header: 'Status', cell: ({ row }) => <Badge variant={departmentStatus(row.original) === 'active' ? 'success' : 'secondary'}>{departmentStatus(row.original)}</Badge> },
                { id: 'actions', header: 'Actions', cell: ({ row }) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openDepartmentModal(row.original)}>
                      <PencilLine className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleDepartmentStatus(row.original)}>
                      {departmentStatus(row.original) === 'active' ? <Ban className="mr-1 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                      {departmentStatus(row.original) === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
                ) },
              ]}
              data={departments}
              searchKey="name"
              searchPlaceholder="Search departments..."
            />
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Asset categories</h3>
                <p className="text-sm text-muted-foreground">Maintain standard categories, deprecation settings, and lifecycle availability.</p>
              </div>
              <Button onClick={() => openCategoryModal()}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>
            <DataTable
              columns={[
                { accessorKey: 'name', header: 'Category', cell: ({ row }) => (
                  <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.code}</p>
                  </div>
                )},
                { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span> },
                { accessorKey: 'assets', header: 'Assets', cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span> },
                { accessorKey: 'depreciationRate', header: 'Depreciation', cell: ({ getValue }) => `${getValue<number>()}%/yr` },
                { accessorKey: 'warrantyPeriod', header: 'Warranty', cell: ({ getValue }) => `${getValue<number>()} mo` },
                { id: 'status', header: 'Status', cell: ({ row }) => <Badge variant={categoryStatus(row.original) === 'active' ? 'success' : 'secondary'}>{categoryStatus(row.original)}</Badge> },
                { id: 'actions', header: 'Actions', cell: ({ row }) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openCategoryModal(row.original)}>
                      <PencilLine className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleCategoryStatus(row.original)}>
                      {categoryStatus(row.original) === 'active' ? <Ban className="mr-1 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                      {categoryStatus(row.original) === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
                ) },
              ]}
              data={categories}
              searchKey="name"
              searchPlaceholder="Search categories..."
            />
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Employee directory</h3>
                <p className="text-sm text-muted-foreground">Assign roles, departments, and activation status without leaving the admin console.</p>
              </div>
              <Button onClick={() => openEmployeeModal()}>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </div>
            <DataTable
              columns={[
                { accessorKey: 'name', header: 'Employee', cell: ({ row }) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{row.original.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium">{row.original.name}</p>
                      <p className="text-xs text-muted-foreground">{row.original.email}</p>
                    </div>
                  </div>
                )},
                { accessorKey: 'department', header: 'Department' },
                { accessorKey: 'position', header: 'Position' },
                { accessorKey: 'role', header: 'Role', cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{ROLE_LABELS[getValue<UserRole>()] || getValue<string>()}</Badge> },
                { accessorKey: 'joinedAt', header: 'Joined', cell: ({ getValue }) => <span className="text-sm">{getValue<string>() ? formatDate(getValue<string>()) : '—'}</span> },
                { id: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'}>{row.original.status || 'active'}</Badge> },
                { id: 'actions', header: 'Actions', cell: ({ row }) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(row.original)}>
                      <UserCog className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleEmployeeDirectoryStatus(row.original)}>
                      {row.original.status === 'active' ? <Ban className="mr-1 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                      {row.original.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
                ) },
              ]}
              data={employees}
              searchKey="name"
              searchPlaceholder="Search employees..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={departmentModalOpen} onOpenChange={(open) => {
        setDepartmentModalOpen(open)
        if (!open) closeDepartmentModal()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit department' : 'Create department'}</DialogTitle>
            <DialogDescription>Configure department details and assign a department lead.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveDepartment} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department-name">Department name</Label>
                <Input id="department-name" value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-code">Code</Label>
                <Input id="department-code" value={departmentForm.code} onChange={(event) => setDepartmentForm((current) => ({ ...current, code: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-head">Head</Label>
              <Input id="department-head" value={departmentForm.head} onChange={(event) => setDepartmentForm((current) => ({ ...current, head: event.target.value }))} placeholder="Enter lead name" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department-location">Location</Label>
                <Input id="department-location" value={departmentForm.location} onChange={(event) => setDepartmentForm((current) => ({ ...current, location: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-budget">Budget</Label>
                <Input id="department-budget" type="number" value={departmentForm.budget} onChange={(event) => setDepartmentForm((current) => ({ ...current, budget: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save department</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryModalOpen} onOpenChange={(open) => {
        setCategoryModalOpen(open)
        if (!open) closeCategoryModal()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit category' : 'Create category'}</DialogTitle>
            <DialogDescription>Define a reusable asset category for the organization.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveCategory} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input id="category-name" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-code">Code</Label>
                <Input id="category-code" value={categoryForm.code} onChange={(event) => setCategoryForm((current) => ({ ...current, code: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Input id="category-description" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category-depreciation">Depreciation %</Label>
                <Input id="category-depreciation" type="number" value={categoryForm.depreciationRate} onChange={(event) => setCategoryForm((current) => ({ ...current, depreciationRate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-warranty">Warranty (mo)</Label>
                <Input id="category-warranty" type="number" value={categoryForm.warrantyPeriod} onChange={(event) => setCategoryForm((current) => ({ ...current, warrantyPeriod: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={employeeModalOpen} onOpenChange={(open) => {
        setEmployeeModalOpen(open)
        if (!open) closeEmployeeModal()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Manage employee' : 'Add employee'}</DialogTitle>
            <DialogDescription>Update role, department, title, and activation state.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEmployee} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-name">Name</Label>
                <Input id="employee-name" value={employeeForm.name} onChange={(event) => setEmployeeForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-email">Email</Label>
                <Input id="employee-email" type="email" value={employeeForm.email} onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-department">Department</Label>
                <Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.name}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-role">Role</Label>
                <Select
                  value={employeeForm.role}
                  onValueChange={(value) => setEmployeeForm((current) => ({
                    ...current,
                    role: value as UserRole,
                    position: ROLE_POSITION_DEFAULTS[value as UserRole],
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGEABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-position">Position</Label>
                <Input id="employee-position" value={employeeForm.position} onChange={(event) => setEmployeeForm((current) => ({ ...current, position: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-status">Status</Label>
                <Select value={employeeForm.status} onValueChange={(value) => setEmployeeForm((current) => ({ ...current, status: value as 'active' | 'inactive' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

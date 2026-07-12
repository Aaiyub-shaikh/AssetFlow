import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, UserCog, Shield, ShieldCheck, ShieldAlert, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useAuthStore } from '@/stores'
import { formatDate } from '@/lib/utils'
import type { User, UserRole } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { departments } from '@/data/mock'
import toast from 'react-hot-toast'

export function EmployeesPage() {
  const { user: currentUser, employees, promoteEmployee, createEmployee } = useAuthStore()

  // State for Add Employee Modal
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDept, setNewDept] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('employee')
  const [newPosition, setNewPosition] = useState('')
  const [newPassword, setNewPassword] = useState('password123')

  // State for Edit/Promote Modal
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<User | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('employee')
  const [editPosition, setEditPosition] = useState('')

  const isAdmin = currentUser?.role === 'admin'

  const handleOpenAddModal = () => {
    setNewName('')
    setNewEmail('')
    setNewDept('')
    setNewRole('employee')
    setNewPosition('Employee')
    setNewPassword('password123')
    setIsAddOpen(true)
  }

  const handleRoleChangeForNew = (val: string) => {
    const role = val as UserRole
    setNewRole(role)
    if (role === 'admin') setNewPosition('Asset Manager')
    else if (role === 'manager') setNewPosition('Department Head')
    else setNewPosition('Employee')
  }

  const handleRoleChangeForEdit = (val: string) => {
    const role = val as UserRole
    setEditRole(role)
    if (role === 'admin') setEditPosition('Asset Manager')
    else if (role === 'manager') setEditPosition('Department Head')
    else setEditPosition('Employee')
  }

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail || !newDept || !newPosition) {
      toast.error('All fields are required')
      return
    }

    createEmployee({
      name: newName,
      email: newEmail,
      department: newDept,
      role: newRole,
      position: newPosition,
      password: newPassword,
    })

    toast.success(`${newName} added successfully!`)
    setIsAddOpen(false)
  }

  const handleOpenEditModal = (emp: User) => {
    setSelectedEmp(emp)
    setEditRole(emp.role)
    setEditPosition(emp.position)
    setIsEditOpen(true)
  }

  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp || !editPosition) {
      toast.error('Position title is required')
      return
    }

    promoteEmployee(selectedEmp.id, editRole, editPosition)
    toast.success(`Role updated for ${selectedEmp.name}!`)
    setIsEditOpen(false)
  }

  // Define columns for employee directory
  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-1 ring-white/10">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback className="bg-white/5 text-xs text-white">
              {row.original.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'position', header: 'Position' },
    { accessorKey: 'department', header: 'Department' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue<string>()
        let variant: 'default' | 'warning' | 'secondary' = 'secondary'
        let Icon = Shield
        let style = 'gap-1'

        if (role === 'admin') {
          variant = 'default'
          Icon = ShieldAlert
        } else if (role === 'manager') {
          variant = 'warning'
          Icon = ShieldCheck
        }

        return (
          <Badge variant={variant} className={`${style} capitalize`}>
            <Icon className="h-3 w-3 shrink-0" />
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
  ]

  // Add the Action column if the logged-in user is an Admin
  if (isAdmin) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isSelf = row.original.id === currentUser?.id
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditModal(row.original)}
            className="h-8 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <UserCog className="h-3.5 w-3.5" />
            Manage
            {isSelf && <span className="text-[10px] text-muted-foreground/60">(You)</span>}
          </Button>
        )
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Browse and manage employee records, positions, and roles.">
        {isAdmin && (
          <Button onClick={handleOpenAddModal} className="gradient-accent border-0 text-white rounded-xl shadow-md cursor-pointer hover:-translate-y-0.5 transition-all">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={employees}
        searchKey="name"
        searchPlaceholder="Search employees by name..."
      />

      {/* Add Employee Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="glass-card max-w-md border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Create a new organizational record. The employee can immediately log in with their email and password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name" className="text-xs font-semibold">Full Name</Label>
              <Input
                id="add-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Liam Gallagher"
                className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-email" className="text-xs font-semibold">Work Email</Label>
              <Input
                id="add-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. l.gallagher@company.com"
                className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Select onValueChange={setNewDept} value={newDept}>
                  <SelectTrigger className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm text-left">
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">System Role</Label>
                <Select onValueChange={handleRoleChangeForNew} value={newRole}>
                  <SelectTrigger className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm text-left">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-position" className="text-xs font-semibold">Job Position Title</Label>
              <Input
                id="add-position"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g. Senior Network Architect"
                className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-pass" className="text-xs font-semibold">Initial Password</Label>
              <Input
                id="add-pass"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="mt-6 gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="rounded-xl h-10 border-white/5 hover:bg-white/5 hover:text-white cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="gradient-accent border-0 text-white rounded-xl h-10 shadow-lg cursor-pointer">
                Create Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit/Promote Employee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card max-w-sm border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" />
              Manage Employee Permissions
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Promote, demote, or change organizational titles for {selectedEmp?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedEmp && (
            <form onSubmit={handleSavePromotion} className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <Avatar className="h-10 w-10 ring-1 ring-white/10">
                  <AvatarImage src={selectedEmp.avatar} />
                  <AvatarFallback className="bg-white/5 text-xs text-white">
                    {selectedEmp.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm text-white">{selectedEmp.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{selectedEmp.email} · {selectedEmp.department}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">System Authorization Role</Label>
                <Select onValueChange={handleRoleChangeForEdit} value={editRole}>
                  <SelectTrigger className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm text-left">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee (Self-Service)</SelectItem>
                    <SelectItem value="manager">Manager (Department Head)</SelectItem>
                    <SelectItem value="admin">Admin (Asset Manager / Full Control)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-position" className="text-xs font-semibold">Job Title</Label>
                <Input
                  id="edit-position"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  placeholder="e.g. Department Head"
                  className="h-10 bg-white/[0.03] border-white/10 rounded-xl text-sm"
                />
              </div>

              <DialogFooter className="mt-6 gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="rounded-xl h-10 border-white/5 hover:bg-white/5 hover:text-white cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="gradient-accent border-0 text-white rounded-xl h-10 shadow-lg cursor-pointer">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

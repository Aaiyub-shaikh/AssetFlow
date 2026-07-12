import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { employees as mockEmployees } from '@/data/mock'

interface DemoCredential {
  email: string
  password: string
  user: User
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: 'admin@assetflow.io',
    password: 'admin123',
    user: {
      id: 'usr-admin-001',
      name: 'Sarah Chen',
      email: 'admin@assetflow.io',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'admin',
      department: 'IT Operations',
      position: 'System Administrator',
      joinedAt: '2023-01-15',
    },
  },
  {
    email: 'manager@assetflow.io',
    password: 'manager123',
    user: {
      id: 'emp-001', // Michael Torres
      name: 'Michael Torres',
      email: 'manager@assetflow.io',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      role: 'manager',
      department: 'IT Operations',
      position: 'Asset Manager',
      joinedAt: '2018-06-01',
    },
  },
  {
    email: 'head@assetflow.com',
    password: 'Head@123',
    user: {
      id: 'usr-head-001',
      name: 'Demo Department Head',
      email: 'head@assetflow.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DepartmentHead',
      role: 'department_head',
      department: 'IT',
      position: 'Department Head',
      joinedAt: '2024-01-15',
    },
  },
  {
    email: 'employee@assetflow.io',
    password: 'employee123',
    user: {
      id: 'emp-007', // Alex Johnson
      name: 'Alex Johnson',
      email: 'employee@assetflow.io',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Developer',
      joinedAt: '2020-02-15',
    },
  },
]

// Initialize dynamic employees list by merging Sarah Chen with the mock employees list
// (updating emails of Michael and Alex to match demo credentials)
const getInitialEmployees = (): User[] => {
  const initial: User[] = [
    DEMO_CREDENTIALS[0].user, // Sarah Chen (Admin)
    DEMO_CREDENTIALS[2].user, // Demo Department Head
  ]

  mockEmployees.forEach((emp) => {
    if (emp.name === 'Michael Torres') {
      initial.push({ ...emp, email: 'manager@assetflow.io', role: 'manager', position: 'Asset Manager' })
    } else if (emp.name === 'Alex Johnson') {
      initial.push({ ...emp, email: 'employee@assetflow.io', role: 'employee', position: 'Software Developer' })
    } else {
      initial.push(emp)
    }
  })

  return initial
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  employees: User[]
  passwords: Record<string, string> // email -> password map for dynamic logins
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: { name: string; email: string; password: string; department: string }) => Promise<boolean>
  forgotPassword: (email: string) => Promise<boolean>
  logout: () => void
  // Admin-only actions
  promoteEmployee: (employeeId: string, role: UserRole, position: string) => void
  createEmployee: (employeeData: Omit<User, 'id' | 'joinedAt'> & { password?: string }) => void
  updateEmployee: (employeeId: string, updates: Partial<User>) => void
  toggleEmployeeStatus: (employeeId: string, status: 'active' | 'inactive') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      employees: getInitialEmployees(),
      passwords: {
        'admin@assetflow.io': 'admin123',
        'manager@assetflow.io': 'manager123',
        'head@assetflow.com': 'Head@123',
        'employee@assetflow.io': 'employee123',
      },
      login: async (email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800))

        let success = false
        set((state) => {
          const demoCredential = DEMO_CREDENTIALS.find((cred) => cred.email === email)
          const storedPassword = state.passwords[email] || 'password123'

          if (demoCredential && demoCredential.password === password) {
            success = true
            const normalizedDemoUser = {
              ...demoCredential.user,
              position: demoCredential.user.position || (demoCredential.user.role === 'manager' ? 'Asset Manager' : demoCredential.user.role === 'department_head' ? 'Department Head' : 'Employee'),
            }

            const updatedEmployees = state.employees.some((emp) => emp.email === normalizedDemoUser.email)
              ? state.employees.map((emp) => (emp.email === normalizedDemoUser.email ? normalizedDemoUser : emp))
              : [...state.employees, normalizedDemoUser]

            return {
              user: normalizedDemoUser,
              isAuthenticated: true,
              employees: updatedEmployees,
            }
          }

          const employee = state.employees.find((emp) => emp.email === email)
          if (!employee) return {}

          if (storedPassword === password) {
            success = true
            return { user: employee, isAuthenticated: true }
          }

          return {}
        })
        return success
      },
      signup: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const firstName = data.name.split(' ')[0]
        const newUser: User = {
          id: `emp-${Date.now()}`,
          name: data.name,
          email: data.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
          role: 'employee' as UserRole,
          department: data.department,
          position: 'Employee',
          joinedAt: new Date().toISOString().split('T')[0],
        }

        set((state) => {
          const updatedEmployees = [...state.employees, newUser]
          const updatedPasswords = { ...state.passwords, [data.email]: data.password }
          return {
            employees: updatedEmployees,
            passwords: updatedPasswords,
            user: newUser,
            isAuthenticated: true,
          }
        })
        return true
      },
      forgotPassword: async (email: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        let exists = false
        set((state) => {
          exists = state.employees.some((emp) => emp.email === email)
          return {}
        })
        return exists
      },
      logout: () => set({ user: null, isAuthenticated: false }),

      // Admin-only actions
      promoteEmployee: (employeeId: string, role: UserRole, position: string) => {
        set((state) => {
          const updatedEmployees = state.employees.map((emp) => {
            if (emp.id === employeeId) {
              return { ...emp, role, position }
            }
            return emp
          })

          // Also update the current active user if they promoted themselves
          const updatedCurrentUser = state.user && state.user.id === employeeId
            ? { ...state.user, role, position }
            : state.user

          return {
            employees: updatedEmployees,
            user: updatedCurrentUser,
          }
        })
      },
      createEmployee: (employeeData) => {
        const id = `emp-${Date.now()}`
        const joinedAt = new Date().toISOString().split('T')[0]
        const firstName = employeeData.name.split(' ')[0]
        const newEmp: User = {
          ...employeeData,
          id,
          joinedAt,
          avatar: employeeData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
          status: employeeData.status || 'active',
        }

        set((state) => {
          const updatedEmployees = [...state.employees, newEmp]
          const updatedPasswords = {
            ...state.passwords,
            [employeeData.email]: employeeData.password || 'password123',
          }
          return {
            employees: updatedEmployees,
            passwords: updatedPasswords,
          }
        })
      },
      updateEmployee: (employeeId: string, updates: Partial<User>) => {
        set((state) => {
          const updatedEmployees = state.employees.map((emp) => (emp.id === employeeId ? { ...emp, ...updates } : emp))
          const updatedCurrentUser = state.user && state.user.id === employeeId ? { ...state.user, ...updates } : state.user
          return {
            employees: updatedEmployees,
            user: updatedCurrentUser,
          }
        })
      },
      toggleEmployeeStatus: (employeeId: string, status: 'active' | 'inactive') => {
        set((state) => {
          const updatedEmployees = state.employees.map((emp) => (emp.id === employeeId ? { ...emp, status } : emp))
          const updatedCurrentUser = state.user && state.user.id === employeeId ? { ...state.user, status } : state.user
          return {
            employees: updatedEmployees,
            user: updatedCurrentUser,
          }
        })
      },
    }),
    { name: 'assetflow-auth-v2' }
  )
)

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  commandPaletteOpen: boolean
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      commandPaletteOpen: false,
      theme: 'dark',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'assetflow-ui' }
  )
)

interface NotificationState {
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 3,
  markAsRead: (id: string) => {
    void id
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) }))
  },
  markAllAsRead: () => set({ unreadCount: 0 }),
}))

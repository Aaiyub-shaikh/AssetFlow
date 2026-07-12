import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { currentUser } from '@/data/mock'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: { name: string; email: string; password: string; department: string }) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, _password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (email) {
          set({ user: { ...currentUser, email }, isAuthenticated: true })
          return true
        }
        return false
      },
      signup: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newUser: User = {
          id: `emp-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: 'employee',
          department: data.department,
          position: 'Employee',
          joinedAt: new Date().toISOString().split('T')[0],
        }
        set({ user: newUser, isAuthenticated: true })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'assetflow-auth' }
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

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute, PublicRoute, RoleProtectedRoute, RouteGuard } from '@/components/auth/protected-route'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { DashboardPage } from '@/pages/dashboard'
import { OrganizationPage } from '@/pages/organization'
import { DepartmentsPage } from '@/pages/departments'
import { CategoriesPage } from '@/pages/categories'
import { EmployeesPage } from '@/pages/employees'
import { AssetsPage } from '@/pages/assets/index'
import { RegisterAssetPage } from '@/pages/assets/register'
import { AssetDetailsPage } from '@/pages/assets/details'
import { AllocationPage } from '@/pages/allocation'
import { TransfersPage } from '@/pages/transfers'
import { BookingsPage } from '@/pages/bookings'
import { MaintenancePage } from '@/pages/maintenance'
import { AuditsPage } from '@/pages/audits'
import { ReportsPage } from '@/pages/reports'
import { NotificationsPage } from '@/pages/notifications'
import { SettingsPage } from '@/pages/settings'
import { useAuthStore } from '@/stores'
import { getDefaultRouteForRole } from '@/lib/rbac'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

function AppRedirect() {
  const user = useAuthStore((s) => s.user)
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route element={<RouteGuard><Outlet /></RouteGuard>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin-dashboard" element={<DashboardPage />} />
              <Route path="/asset-manager-dashboard" element={<DashboardPage />} />
              <Route path="/department-dashboard" element={<DashboardPage />} />
              <Route path="/employee-dashboard" element={<DashboardPage />} />
              <Route path="/organization" element={<RoleProtectedRoute allowedRoles={['admin']}><OrganizationPage /></RoleProtectedRoute>} />
              <Route path="/departments" element={<RoleProtectedRoute allowedRoles={['admin']}><DepartmentsPage /></RoleProtectedRoute>} />
              <Route path="/categories" element={<RoleProtectedRoute allowedRoles={['admin']}><CategoriesPage /></RoleProtectedRoute>} />
              <Route path="/employees" element={<RoleProtectedRoute allowedRoles={['admin']}><EmployeesPage /></RoleProtectedRoute>} />
              <Route path="/assets" element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'department_head']}><AssetsPage /></RoleProtectedRoute>} />
              <Route path="/assets/register" element={<RoleProtectedRoute allowedRoles={['manager']}><RegisterAssetPage /></RoleProtectedRoute>} />
              <Route path="/assets/details/:id" element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'department_head']}><AssetDetailsPage /></RoleProtectedRoute>} />
              <Route path="/allocation" element={<RoleProtectedRoute allowedRoles={['manager', 'department_head']}><AllocationPage /></RoleProtectedRoute>} />
              <Route path="/transfers" element={<RoleProtectedRoute allowedRoles={['manager', 'department_head', 'employee']}><TransfersPage /></RoleProtectedRoute>} />
              <Route path="/bookings" element={<RoleProtectedRoute allowedRoles={['manager', 'department_head', 'employee']}><BookingsPage /></RoleProtectedRoute>} />
              <Route path="/maintenance" element={<RoleProtectedRoute allowedRoles={['manager', 'employee']}><MaintenancePage /></RoleProtectedRoute>} />
              <Route path="/audits" element={<RoleProtectedRoute allowedRoles={['admin', 'manager']}><AuditsPage /></RoleProtectedRoute>} />
              <Route path="/reports" element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'department_head']}><ReportsPage /></RoleProtectedRoute>} />
              <Route path="/notifications" element={<RoleProtectedRoute allowedRoles={['employee']}><NotificationsPage /></RoleProtectedRoute>} />
              <Route path="/settings" element={<RoleProtectedRoute allowedRoles={['admin']}><SettingsPage /></RoleProtectedRoute>} />
            </Route>
          </Route>

          <Route path="*" element={<AppRedirect />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'glass-card !bg-popover !text-popover-foreground !border-border',
          duration: 3000,
          style: { borderRadius: '12px', padding: '12px 16px' },
        }}
      />
    </QueryClientProvider>
  )
}

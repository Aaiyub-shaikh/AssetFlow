import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute, PublicRoute } from '@/components/auth/protected-route'
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/organization" element={<OrganizationPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/register" element={<RegisterAssetPage />} />
            <Route path="/assets/details/:id" element={<AssetDetailsPage />} />
            <Route path="/allocation" element={<AllocationPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

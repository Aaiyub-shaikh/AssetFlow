import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { canAccessRoute, getDefaultRouteForRole } from '@/lib/rbac'
import type { UserRole } from '@/types'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user?.role as UserRole | undefined)} replace />
  }

  return <>{children}</>
}

export function RoleProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <>{children}</>
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!canAccessRoute(location.pathname, user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <>{children}</>
}

import type { UserRole } from '@/types'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Asset Manager',
  department_head: 'Department Head',
  employee: 'Employee',
}

export const ROLE_POSITION_DEFAULTS: Record<UserRole, string> = {
  admin: 'System Administrator',
  manager: 'Asset Manager',
  department_head: 'Department Head',
  employee: 'Employee',
}

export const MANAGEABLE_ROLES: UserRole[] = ['employee', 'manager', 'department_head', 'admin']

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin-dashboard',
  manager: '/asset-manager-dashboard',
  department_head: '/department-dashboard',
  employee: '/employee-dashboard',
}

const ROLE_ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'manager', 'department_head', 'employee'],
  '/admin-dashboard': ['admin'],
  '/asset-manager-dashboard': ['manager'],
  '/department-dashboard': ['department_head'],
  '/employee-dashboard': ['employee'],
  '/organization': ['admin'],
  '/departments': ['admin'],
  '/categories': ['admin'],
  '/employees': ['admin'],
  '/assets': ['admin', 'manager', 'department_head'],
  '/assets/register': ['manager'],
  '/assets/details': ['admin', 'manager', 'department_head'],
  '/allocation': ['manager', 'department_head'],
  '/transfers': ['manager', 'department_head', 'employee'],
  '/bookings': ['manager', 'department_head', 'employee'],
  '/maintenance': ['manager', 'employee'],
  '/audits': ['admin', 'manager'],
  '/reports': ['admin', 'manager', 'department_head'],
  '/notifications': ['employee'],
  '/settings': ['admin'],
}

export function isAdmin(role?: UserRole) {
  return role === 'admin'
}

export function isAssetManager(role?: UserRole) {
  return role === 'manager'
}

export function isDepartmentHead(role?: UserRole) {
  return role === 'department_head'
}

export function canRegisterAssets(role?: UserRole) {
  return isAssetManager(role)
}

export function canManageDepartments(role?: UserRole) {
  return isAdmin(role)
}

export function canManageEmployees(role?: UserRole) {
  return isAdmin(role)
}

export function canApproveTransfers(role?: UserRole) {
  return isAssetManager(role) || isDepartmentHead(role)
}

export function canViewOrganizationData(role?: UserRole) {
  return isAdmin(role) || role === 'manager'
}

export function getDefaultRouteForRole(role?: UserRole) {
  if (!role) return '/login'
  return ROLE_REDIRECTS[role] || '/dashboard'
}

export function canAccessRoute(pathname: string, role?: UserRole) {
  if (!role) return false

  const normalizedPath = pathname.startsWith('/assets/details') ? '/assets/details' : pathname
  const directMatch = ROLE_ROUTE_ACCESS[normalizedPath]
  if (directMatch) {
    return directMatch.includes(role)
  }

  return ['admin', 'manager', 'department_head', 'employee'].includes(role)
}

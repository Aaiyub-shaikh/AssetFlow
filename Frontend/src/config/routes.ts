export interface RouteMeta {
  title: string
  section?: string
  description?: string
}

const routeMeta: Record<string, RouteMeta> = {
  dashboard: { title: 'Dashboard', section: 'Overview', description: 'Overview of your asset management' },
  organization: { title: 'Company Profile', section: 'Organization', description: 'Company profile and organizational overview' },
  departments: { title: 'Departments', section: 'Organization', description: 'Manage organizational departments' },
  employees: { title: 'Employees', section: 'Organization', description: 'Employee directory and roles' },
  categories: { title: 'Categories', section: 'Organization', description: 'Asset category definitions' },
  assets: { title: 'All Assets', section: 'Assets', description: 'Browse and manage organizational assets' },
  register: { title: 'Register Asset', section: 'Assets', description: 'Add a new asset to inventory' },
  details: { title: 'Asset Details', section: 'Assets', description: 'Asset information and history' },
  allocation: { title: 'Allocation', section: 'Assets', description: 'Asset assignments and returns' },
  transfers: { title: 'Transfers', section: 'Assets', description: 'Inter-department asset transfers' },
  bookings: { title: 'Bookings', section: 'Assets', description: 'Asset reservations and scheduling' },
  maintenance: { title: 'Maintenance', section: 'Operations', description: 'Maintenance schedules and records' },
  audits: { title: 'Audits', section: 'Operations', description: 'Asset audit tracking and compliance' },
  reports: { title: 'Reports', section: 'Insights', description: 'Generate and export reports' },
  notifications: { title: 'Notifications', section: 'System', description: 'Alerts and activity updates' },
  settings: { title: 'Settings', section: 'System', description: 'Account and application preferences' },
}

export function getRouteMeta(pathname: string): RouteMeta {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || 'dashboard'

  if (lastSegment.match(/^[a-z]+-\d+$/i) || lastSegment.match(/^ast-/)) {
    return routeMeta.details
  }

  return routeMeta[lastSegment] ?? {
    title: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
    section: 'AssetFlow',
  }
}

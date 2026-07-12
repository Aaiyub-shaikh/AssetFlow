import type { UserRole } from '@/types'

export interface NavItem {
  title: string
  href: string
  icon: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const baseNavigationGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { title: 'Company Profile', href: '/organization', icon: 'Building2' },
      { title: 'Departments', href: '/departments', icon: 'Network' },
      { title: 'Employees', href: '/employees', icon: 'Users' },
      { title: 'Categories', href: '/categories', icon: 'Tags' },
    ],
  },
  {
    label: 'Assets',
    items: [
      { title: 'All Assets', href: '/assets', icon: 'Package' },
      { title: 'Register Asset', href: '/assets/register', icon: 'PlusCircle' },
      { title: 'Allocation', href: '/allocation', icon: 'UserCheck' },
      { title: 'Transfers', href: '/transfers', icon: 'ArrowLeftRight' },
      { title: 'Bookings', href: '/bookings', icon: 'Calendar' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Maintenance', href: '/maintenance', icon: 'Wrench' },
      { title: 'Audits', href: '/audits', icon: 'ClipboardCheck' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { title: 'Reports', href: '/reports', icon: 'BarChart3' },
    ],
  },
]

export function getNavigationGroups(role?: UserRole): NavGroup[] {
  if (role === 'admin') {
    return [
      baseNavigationGroups[0],
      baseNavigationGroups[1],
      { label: 'Operations', items: [{ title: 'Audit', href: '/audits', icon: 'ClipboardCheck' }] },
      { label: 'Insights', items: [{ title: 'Reports', href: '/reports', icon: 'BarChart3' }] },
    ]
  }

  if (role === 'manager') {
    return [
      baseNavigationGroups[0],
      { label: 'Assets', items: [
        { title: 'Assets', href: '/assets', icon: 'Package' },
        { title: 'Register Asset', href: '/assets/register', icon: 'PlusCircle' },
        { title: 'Allocation', href: '/allocation', icon: 'UserCheck' },
        { title: 'Transfers', href: '/transfers', icon: 'ArrowLeftRight' },
      ] },
      { label: 'Operations', items: [
        { title: 'Maintenance', href: '/maintenance', icon: 'Wrench' },
        { title: 'Audit', href: '/audits', icon: 'ClipboardCheck' },
      ] },
      { label: 'Insights', items: [{ title: 'Reports', href: '/reports', icon: 'BarChart3' }] },
    ]
  }

  if (role === 'department_head') {
    return [
      baseNavigationGroups[0],
      { label: 'Department', items: [
        { title: 'Department Assets', href: '/assets', icon: 'Package' },
        { title: 'Allocation Requests', href: '/allocation', icon: 'UserCheck' },
        { title: 'Transfer Requests', href: '/transfers', icon: 'ArrowLeftRight' },
        { title: 'Bookings', href: '/bookings', icon: 'Calendar' },
      ] },
      { label: 'Insights', items: [{ title: 'Reports', href: '/reports', icon: 'BarChart3' }] },
    ]
  }

  return [
    baseNavigationGroups[0],
    { label: 'Personal', items: [
      { title: 'My Assets', href: '/assets', icon: 'Package' },
      { title: 'Bookings', href: '/bookings', icon: 'Calendar' },
      { title: 'Maintenance', href: '/maintenance', icon: 'Wrench' },
      { title: 'Notifications', href: '/notifications', icon: 'Bell' },
    ] },
  ]
}

export function getFooterNavItems(role?: UserRole): NavItem[] {
  return role === 'admin' ? [{ title: 'Settings', href: '/settings', icon: 'Settings' }] : []
}

export function getAllNavItems(role?: UserRole): NavItem[] {
  return [
    ...getNavigationGroups(role).flatMap((group) => group.items),
    ...getFooterNavItems(role),
  ]
}

export const navigationGroups = baseNavigationGroups
export const footerNavItems = [{ title: 'Settings', href: '/settings', icon: 'Settings' }]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/assets') return pathname === '/assets'
  return pathname === href || pathname.startsWith(`${href}/`)
}

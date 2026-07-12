export interface NavItem {
  title: string
  href: string
  icon: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigationGroups: NavGroup[] = [
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

export const footerNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: 'Settings' },
]

export function getAllNavItems(): NavItem[] {
  return [
    ...navigationGroups.flatMap((group) => group.items),
    ...footerNavItems,
  ]
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/assets') return pathname === '/assets'
  return pathname === href || pathname.startsWith(`${href}/`)
}

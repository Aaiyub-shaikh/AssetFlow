import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores'
import { footerNavItems, isNavItemActive, navigationGroups } from '@/config/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'

function NavLink({
  title,
  href,
  icon,
  collapsed,
  onNavigate,
}: {
  title: string
  href: string
  icon: string
  collapsed: boolean
  onNavigate: () => void
}) {
  const location = useLocation()
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Circle
  const isActive = isNavItemActive(location.pathname, href)

  return (
    <Link
      to={href}
      onClick={onNavigate}
      title={collapsed ? title : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
      {!collapsed && <span className="truncate">{title}</span>}
      {isActive && !collapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  )
}

function SidebarPanel({
  collapsed,
  onNavigate,
  onToggle,
}: {
  collapsed: boolean
  onNavigate: () => void
  onToggle: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-14 items-center gap-3 border-b border-border px-4',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Layers className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">AssetFlow</p>
            <p className="truncate text-[11px] text-muted-foreground">Asset Management</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-6 px-3 py-4">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="space-y-1 border-t border-border px-3 py-3">
        {footerNavItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen, toggleSidebar } = useUIStore()
  const closeMobile = () => setSidebarMobileOpen(false)

  return (
    <>
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'sidebar hidden shrink-0 border-r border-border bg-card/40 lg:block',
          sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
        )}
      >
        <SidebarPanel collapsed={sidebarCollapsed} onNavigate={closeMobile} onToggle={toggleSidebar} />
      </aside>

      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="sidebar sidebar-expanded fixed left-0 top-0 z-50 h-screen border-r border-border bg-background lg:hidden"
          >
            <SidebarPanel collapsed={false} onNavigate={closeMobile} onToggle={toggleSidebar} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

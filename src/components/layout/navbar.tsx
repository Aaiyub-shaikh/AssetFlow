import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Bell, Menu, Sun, Moon, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, useUIStore, useNotificationStore } from '@/stores'
import { getRouteMeta } from '@/config/routes'

export function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { setSidebarMobileOpen, setCommandPaletteOpen, theme, toggleTheme } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const routeMeta = getRouteMeta(location.pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        {routeMeta.section && (
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {routeMeta.section}
          </p>
        )}
        <h2 className="truncate text-sm font-semibold sm:text-base">{routeMeta.title}</h2>
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground md:flex lg:w-56"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search...</span>
        <kbd className="ml-auto hidden select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
          Ctrl+K
        </kbd>
      </button>

      <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Link to="/notifications" className="relative">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white"
          >
            {unreadCount}
          </motion.span>
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{user?.position}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex cursor-pointer items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex cursor-pointer items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-danger focus:text-danger">
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

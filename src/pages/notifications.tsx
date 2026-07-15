import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCheck, Bell, History, Search,
  Clock, Info, CheckCircle2, AlertTriangle, XCircle, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageShell } from '@/components/layout/page-shell'
import { useNotificationStore } from '@/stores/notificationStore'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type ActiveTab = 'notifications' | 'activities'

const NOTIF_ICONS = {
  info:    <Info className="h-4 w-4 text-blue-400" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  error:   <XCircle className="h-4 w-4 text-rose-400" />,
}

const NOTIF_COLORS = {
  info:    'border-blue-500/20 bg-blue-500/5',
  success: 'border-emerald-500/20 bg-emerald-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  error:   'border-rose-500/20 bg-rose-500/5',
}

const ACTIVITY_BG = {
  allocation:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  transfer:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  audit:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  booking:     'bg-pink-500/10 text-pink-400 border-pink-500/20',
  asset:       'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

export function NotificationsPage() {
  const { notifications, activities, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()

  const [activeTab, setActiveTab] = useState<ActiveTab>('notifications')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    const q = search.toLowerCase()
    return notifications.filter((n) => {
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      const matchesType = filterType === 'all' || n.type === filterType
      return matchesSearch && matchesType
    })
  }, [notifications, search, filterType])

  // Filtered Activities (Audit Log)
  const filteredActivities = useMemo(() => {
    const q = search.toLowerCase()
    return activities.filter((act) => {
      const matchesSearch = !q || 
        act.action.toLowerCase().includes(q) || 
        act.description.toLowerCase().includes(q) ||
        act.user.toLowerCase().includes(q)
      const matchesType = filterType === 'all' || act.type === filterType
      return matchesSearch && matchesType
    })
  }, [activities, search, filterType])

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Updates & Audit Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay informed on asset assignments, bookings, maintenance pipelines, and organization audits.
            </p>
          </div>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <Button variant="outline" className="gap-2 shrink-0 border-white/10 hover:bg-white/5" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 text-emerald-400" /> Mark all as read
            </Button>
          )}
        </div>

        {/* Tab & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 shrink-0 self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('notifications'); setFilterType('all'); setSearch('') }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'notifications' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('activities'); setFilterType('all'); setSearch('') }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'activities' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <History className="h-4 w-4" />
              Audit Trail
            </button>
          </div>

          {/* Search + Filter controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl justify-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={activeTab === 'notifications' ? 'Search notifications...' : 'Search activity logs...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/[0.04] border-white/[0.08] w-full"
              />
            </div>
            <div className="w-full sm:w-44">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activeTab === 'notifications' ? (
                    <>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="asset">Assets</SelectItem>
                      <SelectItem value="allocation">Allocations</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                      <SelectItem value="booking">Bookings</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="audit">Audits</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dynamic Display Grid */}
        <AnimatePresence mode="wait">
          {activeTab === 'notifications' ? (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  </div>
                  <p className="text-muted-foreground font-medium">No notifications match your filters</p>
                </div>
              ) : (
                filteredNotifications.map((notif, index) => {
                  const borderCls = NOTIF_COLORS[notif.type] || 'border-white/10 bg-white/5'
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-white/[0.02]',
                        borderCls,
                        !notif.read && 'ring-1 ring-primary/30'
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5 shrink-0 mt-0.5">
                        {NOTIF_ICONS[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className={cn("text-sm font-semibold", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                            {notif.title}
                          </p>
                          <span className="text-xs text-muted-foreground font-medium shrink-0">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">{notif.message}</p>
                        {notif.link && (
                          <Link
                            to={notif.link}
                            className="inline-flex items-center text-xs font-semibold text-primary hover:underline mt-2"
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
                    <History className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  </div>
                  <p className="text-muted-foreground font-medium">No audit logs found</p>
                </div>
              ) : (
                <div className="relative border-l border-white/[0.06] ml-4 md:ml-6 pl-6 space-y-6 py-2">
                  {filteredActivities.map((act, index) => {
                    const tagCls = ACTIVITY_BG[act.type] || 'bg-muted/10 text-muted border-border'
                    return (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-all"
                      >
                        {/* Timeline node */}
                        <div className="absolute -left-[31px] md:-left-[33px] top-1/2 -translate-y-1/2 h-4.5 w-4.5 rounded-full border border-border bg-background flex items-center justify-center z-10">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>

                        {/* Actor & Action */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarImage src={act.userAvatar} />
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-sm font-semibold">{act.user}</span>
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", tagCls)}>
                                {act.type}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-primary mt-0.5">{act.action}</p>
                            <p className="text-sm text-muted-foreground mt-1">{act.description}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium md:self-center shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(act.timestamp)} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}

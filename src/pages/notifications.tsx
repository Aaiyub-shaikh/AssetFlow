import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BellRing, CheckCheck, Eye, Search, Trash2, Filter, Clock3, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { formatRelativeTime } from '@/lib/utils'
import { useNotificationStore } from '@/stores'
import { cn } from '@/lib/utils'
import { deleteNotification, getActivityLogs, getNotifications, markAllNotificationsAsRead, markNotificationAsRead, type ActivityLogItem, type NotificationItem, type NotificationType } from '@/services/notifications-service'

const notificationTypes: NotificationType[] = ['Asset Assigned', 'Maintenance Approved', 'Maintenance Rejected', 'Booking Confirmed', 'Booking Cancelled', 'Booking Reminder', 'Transfer Approved', 'Overdue Return', 'Audit Discrepancy']
const typeStyles: Record<NotificationType, string> = {
  'Asset Assigned': 'bg-blue-500/15 text-blue-500',
  'Maintenance Approved': 'bg-emerald-500/15 text-emerald-500',
  'Maintenance Rejected': 'bg-rose-500/15 text-rose-500',
  'Booking Confirmed': 'bg-violet-500/15 text-violet-500',
  'Booking Cancelled': 'bg-amber-500/15 text-amber-500',
  'Booking Reminder': 'bg-sky-500/15 text-sky-500',
  'Transfer Approved': 'bg-indigo-500/15 text-indigo-500',
  'Overdue Return': 'bg-orange-500/15 text-orange-500',
  'Audit Discrepancy': 'bg-fuchsia-500/15 text-fuchsia-500',
}

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  'Asset Assigned': BellRing,
  'Maintenance Approved': ShieldCheck,
  'Maintenance Rejected': Trash2,
  'Booking Confirmed': CheckCheck,
  'Booking Cancelled': BellRing,
  'Booking Reminder': Clock3,
  'Transfer Approved': ShieldCheck,
  'Overdue Return': Clock3,
  'Audit Discrepancy': Eye,
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

export function NotificationsPage() {
  const { markAllAsRead, markAsRead } = useNotificationStore()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activitySearch, setActivitySearch] = useState('')
  const [activityUser] = useState('all')
  const [activityModule, setActivityModule] = useState('all')
  const [activityAction, setActivityAction] = useState('all')
  const [activityStart, setActivityStart] = useState('')
  const [activityEnd, setActivityEnd] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogItem | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    const [notificationData, activityData] = await Promise.all([getNotifications(), getActivityLogs()])
    setNotifications(notificationData)
    setActivityLogs(activityData)
  }

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.toLowerCase()
    return notifications.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesSearch = !query || [item.title, item.message, item.type].join(' ').toLowerCase().includes(query)
      return matchesType && matchesSearch
    })
  }, [notifications, searchTerm, typeFilter])

  const pagedNotifications = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredNotifications.slice(start, start + pageSize)
  }, [filteredNotifications, page])

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize))

  const filteredActivity = useMemo(() => {
    const query = activitySearch.toLowerCase()
    return activityLogs
      .filter((item) => {
        const matchesUser = activityUser === 'all' || item.user === activityUser
        const matchesModule = activityModule === 'all' || item.module === activityModule
        const matchesAction = activityAction === 'all' || item.action === activityAction
        const matchesStart = !activityStart || new Date(item.createdAt) >= new Date(activityStart)
        const matchesEnd = !activityEnd || new Date(item.createdAt) <= new Date(activityEnd)
        const matchesSearch = !query || [item.user, item.action, item.description].join(' ').toLowerCase().includes(query)
        return matchesUser && matchesModule && matchesAction && matchesStart && matchesEnd && matchesSearch
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [activityLogs, activitySearch, activityUser, activityModule, activityAction, activityStart, activityEnd])

  const summaryCards = useMemo(() => {
    const unread = notifications.filter((item) => !item.isRead).length
    const highPriority = notifications.filter((item) => item.priority === 'High').length
    const today = notifications.filter((item) => new Date(item.createdAt).toDateString() === new Date().toDateString()).length
    return [
      { title: 'Total Notifications', value: notifications.length, subtitle: 'All active alerts' },
      { title: 'Unread Notifications', value: unread, subtitle: 'Awaiting review' },
      { title: 'High Priority Notifications', value: highPriority, subtitle: 'Requires action' },
      { title: "Today's Notifications", value: today, subtitle: 'Created today' },
    ]
  }, [notifications])

  async function handleMarkAsRead(id: string) {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item))
    markAsRead(id)
    await markNotificationAsRead(id)
  }

  async function handleMarkAllAsRead() {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    markAllAsRead()
    await markAllNotificationsAsRead()
    toast.success('All notifications marked as read')
  }

  async function handleDelete(id: string) {
    setNotifications((current) => current.filter((item) => item.id !== id))
    await deleteNotification(id)
    toast.success('Notification removed')
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Notifications & Activity" description="Track alerts, activity, and recent system actions">
        <Button variant="outline" onClick={() => void handleMarkAllAsRead()}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" /> Filter notifications</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search notifications" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1) }} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value as 'all' | NotificationType); setPage(1) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {notificationTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {pagedNotifications.map((notification) => {
              const Icon = iconMap[notification.type]
              return (
                <motion.div key={notification.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('glass-card p-4', !notification.isRead && 'border-primary/20')}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', typeStyles[notification.type])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs', typeStyles[notification.type])}>{notification.type}</span>
                          {!notification.isRead && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Unread</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!notification.isRead && (
                        <Button size="sm" variant="outline" onClick={() => void handleMarkAsRead(notification.id)}>
                          Mark read
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedNotification(notification)}>
                        <Eye className="mr-2 h-4 w-4" /> Details
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void handleDelete(notification.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {filteredNotifications.length} notifications</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" /> Activity Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>User</Label>
                <Input placeholder="Search user" value={activitySearch} onChange={(event) => setActivitySearch(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Input placeholder="Module" value={activityModule === 'all' ? '' : activityModule} onChange={(event) => setActivityModule(event.target.value || 'all')} />
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Input placeholder="Action" value={activityAction === 'all' ? '' : activityAction} onChange={(event) => setActivityAction(event.target.value || 'all')} />
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Input type="date" value={activityStart} onChange={(event) => setActivityStart(event.target.value)} />
                  <Input type="date" value={activityEnd} onChange={(event) => setActivityEnd(event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivity.map((item) => {
                    const created = new Date(item.createdAt)
                    return (
                      <tr key={item.id} className="border-t border-border/50">
                        <td className="px-4 py-3">{item.user}</td>
                        <td className="px-4 py-3">{item.role}</td>
                        <td className="px-4 py-3">{item.module}</td>
                        <td className="px-4 py-3">{item.action}</td>
                        <td className="px-4 py-3 max-w-xs">{item.description}</td>
                        <td className="px-4 py-3">{created.toLocaleDateString()}</td>
                        <td className="px-4 py-3">{created.toLocaleTimeString()}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedActivity(item)}><Eye className="mr-2 h-4 w-4" /> View</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedNotification)} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>{selectedNotification?.message}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Type:</span> {selectedNotification?.type}</p>
            <p><span className="font-medium text-foreground">Priority:</span> {selectedNotification?.priority}</p>
            <p><span className="font-medium text-foreground">Created:</span> {selectedNotification ? formatRelativeTime(selectedNotification.createdAt) : ''}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedActivity)} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedActivity?.action}</DialogTitle>
            <DialogDescription>{selectedActivity?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">User:</span> {selectedActivity?.user}</p>
            <p><span className="font-medium text-foreground">Role:</span> {selectedActivity?.role}</p>
            <p><span className="font-medium text-foreground">Module:</span> {selectedActivity?.module}</p>
            <p><span className="font-medium text-foreground">IP Address:</span> {selectedActivity?.ipAddress ?? 'N/A'}</p>
            <p><span className="font-medium text-foreground">Time:</span> {selectedActivity ? new Date(selectedActivity.createdAt).toLocaleString() : ''}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

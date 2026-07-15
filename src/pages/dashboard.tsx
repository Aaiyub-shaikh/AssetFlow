import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, CalendarClock, Plus, RotateCcw, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { UtilizationChart, DepartmentChart, BookingHeatmapChart, MaintenanceTrendChart } from '@/components/shared/charts'
import { ActivityFeed } from '@/components/shared/activity-feed'
import { PageShell } from '@/components/layout/page-shell'
import {
  utilizationData, departmentAllocationData,
  bookingHeatmapData, maintenanceTrendData, activities, notifications,
  assets, allocations, bookings, transfers, maintenanceRecords, currentUser
} from '@/data/mock'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const today = new Date()
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const availableAssets = assets.filter((asset) => asset.status === 'available').length
  const allocatedAssets = assets.filter((asset) => asset.status === 'allocated').length
  const maintenanceToday = maintenanceRecords.filter((record) => {
    const scheduled = new Date(record.scheduledDate)
    return record.status !== 'completed' && scheduled.getFullYear() === today.getFullYear() && scheduled.getMonth() === today.getMonth() && scheduled.getDate() === today.getDate()
  }).length
  const activeBookings = bookings.filter((booking) => ['upcoming', 'ongoing'].includes(booking.status)).length
  const pendingTransfers = transfers.filter((transfer) => transfer.status === 'pending').length

  const returnItems = allocations
    .filter((allocation) => allocation.status === 'active' && allocation.returnDate)
    .map((allocation) => ({ ...allocation, returnDateValue: new Date(allocation.returnDate as string) }))

  const overdueReturns = returnItems.filter((item) => item.returnDateValue < todayKey)
  const upcomingReturns = returnItems.filter((item) => item.returnDateValue >= todayKey)

  const kpis = [
    { label: 'Assets Available', value: availableAssets, change: 12, trend: 'up' as const, icon: 'Package' },
    { label: 'Assets Allocated', value: allocatedAssets, change: 8, trend: 'up' as const, icon: 'UserCheck' },
    { label: 'Maintenance Today', value: maintenanceToday, change: 2, trend: 'up' as const, icon: 'Wrench' },
    { label: 'Active Bookings', value: activeBookings, change: 15, trend: 'up' as const, icon: 'Calendar' },
    { label: 'Pending Transfers', value: pendingTransfers, change: -5, trend: 'down' as const, icon: 'ArrowLeftRight' },
    { label: 'Upcoming Returns', value: upcomingReturns.length, change: 0, trend: 'neutral' as const, icon: 'RotateCcw' },
  ]

  const canRegisterAsset = user?.role === 'manager'
  const canBookResource = ['manager', 'department_head', 'employee'].includes(user?.role ?? '')
  const canRaiseMaintenance = ['manager', 'employee'].includes(user?.role ?? '')

  const quickActions = [
    ...(canRegisterAsset ? [{ label: 'Register Asset', icon: Plus, href: '/assets/register', color: 'bg-primary/10 text-primary' }] : []),
    ...(canBookResource ? [{ label: 'Book Resource', icon: Calendar, href: '/bookings', color: 'bg-success/10 text-success' }] : []),
    ...(canRaiseMaintenance ? [{ label: 'Raise Maintenance Request', icon: Wrench, href: '/maintenance', color: 'bg-warning/10 text-warning' }] : []),
  ]

  return (
    <PageShell
      description={`Welcome back, ${currentUser.name.split(' ')[0]}! Here’s a real-time view of your operations.`}
      actions={
        canRegisterAsset ? (
          <Link to="/assets/register">
            <Button><Plus className="h-4 w-4" /> Register Asset</Button>
          </Link>
        ) : null
      }
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Returns Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-danger">
                <AlertTriangle className="h-4 w-4" />
                Overdue returns
              </div>
              {overdueReturns.length > 0 ? (
                <div className="space-y-2">
                  {overdueReturns.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-danger/20 bg-background/60 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{item.assetName}</p>
                        <p className="text-xs text-muted-foreground">{item.employeeName} • Due {formatDate(item.returnDateValue)}</p>
                      </div>
                      <span className="text-xs font-semibold text-danger">Overdue</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No overdue returns right now.</p>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock className="h-4 w-4" />
                Upcoming returns
              </div>
              {upcomingReturns.length > 0 ? (
                <div className="space-y-2">
                  {upcomingReturns.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{item.assetName}</p>
                        <p className="text-xs text-muted-foreground">{item.employeeName} • Due {formatDate(item.returnDateValue)}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Scheduled</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming returns scheduled.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action, i) => (
              <Link key={action.label} to={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 transition-all hover:-translate-y-0.5 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtilizationChart data={utilizationData} />
        <DepartmentChart data={departmentAllocationData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingHeatmapChart data={bookingHeatmapData} />
        <MaintenanceTrendChart data={maintenanceTrendData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} limit={6} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 4).map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <Link key={action.label} to={action.href}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-white/5 transition-all hover:-translate-y-0.5"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

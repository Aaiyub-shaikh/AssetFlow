import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, UserCheck, Wrench, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { UtilizationChart, DepartmentChart, BookingHeatmapChart, MaintenanceTrendChart } from '@/components/shared/charts'
import { ActivityFeed } from '@/components/shared/activity-feed'
import { PageShell } from '@/components/layout/page-shell'
import {
  dashboardKPIs, utilizationData, departmentAllocationData,
  bookingHeatmapData, maintenanceTrendData, activities, notifications
} from '@/data/mock'
import { formatRelativeTime } from '@/lib/utils'

export function DashboardPage() {
  const quickActions = [
    { label: 'Register Asset', icon: Plus, href: '/assets/register', color: 'bg-primary/10 text-primary' },
    { label: 'New Allocation', icon: UserCheck, href: '/allocation', color: 'bg-success/10 text-success' },
    { label: 'Schedule Maintenance', icon: Wrench, href: '/maintenance', color: 'bg-warning/10 text-warning' },
    { label: 'Book Asset', icon: Calendar, href: '/bookings', color: 'bg-primary/10 text-primary' },
  ]

  return (
    <PageShell
      description="Welcome back! Here's an overview of your asset management."
      actions={
        <Link to="/assets/register">
          <Button><Plus className="h-4 w-4" /> Register Asset</Button>
        </Link>
      }
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardKPIs.map((kpi, i) => (
          <StatCard key={kpi.label} kpi={kpi} index={i} />
        ))}
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

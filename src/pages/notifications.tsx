import { motion } from 'framer-motion'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { notifications } from '@/data/mock'
import { formatRelativeTime } from '@/lib/utils'
import { useNotificationStore } from '@/stores'
import { cn } from '@/lib/utils'

const typeColors = {
  info: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-danger',
}

export function NotificationsPage() {
  const { markAllAsRead } = useNotificationStore()

  return (
    <div className="space-y-6">
      <PageHeader description="Stay updated on asset management activities">
        <Button variant="outline" onClick={markAllAsRead}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </PageHeader>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'glass-card p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer',
              !n.read && 'border-primary/20'
            )}
          >
            <div className={cn('h-2 w-2 rounded-full mt-2 shrink-0', typeColors[n.type])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-sm font-medium', !n.read && 'text-foreground')}>{n.title}</p>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(n.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
            </div>
            {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

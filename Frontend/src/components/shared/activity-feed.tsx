import { motion } from 'framer-motion'
import { formatRelativeTime } from '@/lib/utils'
import type { Activity } from '@/types'
import * as Icons from 'lucide-react'

const activityIcons: Record<string, keyof typeof Icons> = {
  allocation: 'UserCheck',
  transfer: 'ArrowLeftRight',
  maintenance: 'Wrench',
  audit: 'ClipboardCheck',
  booking: 'Calendar',
  asset: 'Package',
}

interface ActivityFeedProps {
  activities: Activity[]
  limit?: number
}

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const items = limit ? activities.slice(0, limit) : activities

  return (
    <div className="space-y-1">
      {items.map((activity, i) => {
        const iconName = activityIcons[activity.type] || 'Activity'
        const Icon = Icons[iconName] as React.ComponentType<{ className?: string }>

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.user}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

interface TimelineProps {
  events: Array<{
    id: string
    title: string
    description: string
    timestamp: string
    type: string
    user: string
  }>
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative space-y-0">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-background">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium">{event.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">{event.user}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(event.timestamp)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

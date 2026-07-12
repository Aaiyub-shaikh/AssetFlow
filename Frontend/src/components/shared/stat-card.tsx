import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardKPI } from '@/types'

interface AnimatedCounterProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, className, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (v) => {
    if (value >= 1000000) return `${prefix}${(v / 1000000).toFixed(1)}M${suffix}`
    if (value >= 1000) return `${prefix}${Math.round(v).toLocaleString()}${suffix}`
    return `${prefix}${Math.round(v)}${suffix}`
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}

interface StatCardProps {
  kpi: DashboardKPI
  index?: number
}

export function StatCard({ kpi, index = 0 }: StatCardProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[kpi.icon] || Icons.Activity

  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-muted-foreground',
  }

  const trendIcons = {
    up: Icons.TrendingUp,
    down: Icons.TrendingDown,
    neutral: Icons.Minus,
  }

  const TrendIcon = trendIcons[kpi.trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass-card glass-card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
          <AnimatedCounter
            value={kpi.value}
            className="text-2xl font-bold tracking-tight"
            prefix={kpi.label === 'Total Value' ? '$' : ''}
          />
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColors[kpi.trend])}>
            <TrendIcon className="h-3 w-3" />
            <span>{kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.label === 'Total Value' ? '%' : ''}</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  )
}

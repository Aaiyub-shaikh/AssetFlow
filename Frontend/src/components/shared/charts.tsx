import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ChartDataPoint } from '@/types'

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}

export function UtilizationChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Asset Utilization" description="Monthly utilization rate over the past year">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="url(#utilGrad)" strokeWidth={2} name="Utilization %" animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function DepartmentChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Department Allocation" description="Assets distributed across departments">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.fill as string || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function BookingHeatmapChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Booking Heatmap" description="Weekly booking activity patterns">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="week1" fill="#4F46E5" name="Week 1" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Bar dataKey="week2" fill="#6366F1" name="Week 2" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Bar dataKey="week3" fill="#818CF8" name="Week 3" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Bar dataKey="week4" fill="#A5B4FC" name="Week 4" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function MaintenanceTrendChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Maintenance Trend" description="Preventive vs corrective maintenance over time">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="preventive" stackId="a" fill="#22C55E" name="Preventive" radius={[0, 0, 0, 0]} animationDuration={1500} />
          <Bar dataKey="corrective" stackId="a" fill="#F59E0B" name="Corrective" animationDuration={1500} />
          <Bar dataKey="emergency" stackId="a" fill="#EF4444" name="Emergency" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

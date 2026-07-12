import { useState } from 'react'
import { motion } from 'framer-motion'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Calendar, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { bookings } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import type { Booking } from '@/types'

const columns: ColumnDef<Booking, unknown>[] = [
  { accessorKey: 'assetName', header: 'Asset', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.assetName}</p>
      <p className="text-xs text-muted-foreground font-mono">{row.original.assetTag}</p>
    </div>
  )},
  { accessorKey: 'bookedBy', header: 'Booked By' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'startDate', header: 'Start', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'endDate', header: 'End', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'purpose', header: 'Purpose' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function BookingsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list')

  return (
    <div className="space-y-6">
      <PageHeader description="Reserve and manage asset bookings">
        <div className="flex gap-2">
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>
            <List className="h-4 w-4" /> List
          </Button>
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')}>
            <Calendar className="h-4 w-4" /> Calendar
          </Button>
          <Button><Plus className="h-4 w-4" /> New Booking</Button>
        </div>
      </PageHeader>

      {view === 'list' ? (
        <DataTable columns={columns} data={bookings} searchKey="assetName" searchPlaceholder="Search bookings..." />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayBookings = bookings.filter((_, bi) => bi % 7 === i % 7)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="min-h-[80px] p-2 rounded-xl border border-border hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">{(i % 31) + 1}</span>
                    {dayBookings.slice(0, 2).map((b) => (
                      <div key={b.id} className="mt-1 px-1.5 py-0.5 rounded text-[10px] bg-primary/15 text-primary truncate">
                        {b.assetTag}
                      </div>
                    ))}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

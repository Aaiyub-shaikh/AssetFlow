import { motion } from 'framer-motion'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { audits } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import type { Audit } from '@/types'

const columns: ColumnDef<Audit, unknown>[] = [
  { accessorKey: 'title', header: 'Audit', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.title}</p>
      <p className="text-xs text-muted-foreground">{row.original.department}</p>
    </div>
  )},
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'auditor', header: 'Auditor' },
  { accessorKey: 'startDate', header: 'Start', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'endDate', header: 'End', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'totalAssets', header: 'Total', cell: ({ getValue }) => getValue<number>() },
  { accessorKey: 'verifiedAssets', header: 'Verified', cell: ({ row }) => {
    const pct = Math.round((row.original.verifiedAssets / row.original.totalAssets) * 100)
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-[60px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <span className="text-xs">{pct}%</span>
      </div>
    )
  }},
  { accessorKey: 'discrepancies', header: 'Issues', cell: ({ getValue }) => {
    const v = getValue<number>()
    return <span className={v > 0 ? 'text-danger font-medium' : 'text-success'}>{v}</span>
  }},
]

export function AuditsPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Plan and execute asset audit cycles">
        <Button><Plus className="h-4 w-4" /> New Audit</Button>
      </PageHeader>
      <DataTable columns={columns} data={audits} searchKey="title" searchPlaceholder="Search audits..." />
    </div>
  )
}

import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { maintenanceRecords } from '@/data/mock'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { MaintenanceRecord } from '@/types'

const columns: ColumnDef<MaintenanceRecord, unknown>[] = [
  { accessorKey: 'assetName', header: 'Asset', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.assetName}</p>
      <p className="text-xs text-muted-foreground font-mono">{row.original.assetTag}</p>
    </div>
  )},
  { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'scheduledDate', header: 'Scheduled', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'assignedTo', header: 'Assigned To' },
  { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'cost', header: 'Cost', cell: ({ getValue }) => formatCurrency(getValue<number>()) },
  { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-muted-foreground truncate max-w-[200px] block">{getValue<string>()}</span> },
]

export function MaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Schedule and track asset maintenance workflows">
        <Button><Plus className="h-4 w-4" /> Schedule Maintenance</Button>
      </PageHeader>
      <DataTable columns={columns} data={maintenanceRecords} searchKey="assetName" searchPlaceholder="Search maintenance records..." />
    </div>
  )
}

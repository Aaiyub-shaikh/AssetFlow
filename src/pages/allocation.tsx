import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { allocations } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import type { Allocation } from '@/types'

const columns: ColumnDef<Allocation, unknown>[] = [
  { accessorKey: 'assetName', header: 'Asset', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.assetName}</p>
      <p className="text-xs text-muted-foreground font-mono">{row.original.assetTag}</p>
    </div>
  )},
  { accessorKey: 'employeeName', header: 'Employee' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'allocatedAt', header: 'Allocated', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'returnDate', header: 'Return Date', cell: ({ getValue }) => getValue<string>() ? formatDate(getValue<string>()!) : '—' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
]

export function AllocationPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Manage asset allocations to employees">
        <Button><Plus className="h-4 w-4" /> New Allocation</Button>
      </PageHeader>
      <DataTable columns={columns} data={allocations} searchKey="assetName" searchPlaceholder="Search allocations..." />
    </div>
  )
}

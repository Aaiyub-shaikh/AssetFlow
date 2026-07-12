import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { transfers } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import type { Transfer } from '@/types'
import toast from 'react-hot-toast'

const columns: ColumnDef<Transfer, unknown>[] = [
  { accessorKey: 'assetName', header: 'Asset', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.assetName}</p>
      <p className="text-xs text-muted-foreground font-mono">{row.original.assetTag}</p>
    </div>
  )},
  { accessorKey: 'fromDepartment', header: 'From' },
  { accessorKey: 'toDepartment', header: 'To' },
  { accessorKey: 'requestedBy', header: 'Requested By' },
  { accessorKey: 'requestedAt', header: 'Date', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { id: 'actions', header: '', cell: ({ row }) => row.original.status === 'pending' ? (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => toast.success('Transfer approved')}>
        <Check className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => toast.error('Transfer rejected')}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  ) : null },
]

export function TransfersPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Manage inter-department asset transfers">
        <Button><Plus className="h-4 w-4" /> Request Transfer</Button>
      </PageHeader>
      <DataTable columns={columns} data={transfers} searchKey="assetName" searchPlaceholder="Search transfers..." />
    </div>
  )
}

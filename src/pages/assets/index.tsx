import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { assets } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/stores'
import type { Asset } from '@/types'

const columns: ColumnDef<Asset, unknown>[] = [
  { accessorKey: 'name', header: 'Asset', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.name}</p>
      <p className="text-xs text-muted-foreground font-mono">{row.original.tag}</p>
    </div>
  )},
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { accessorKey: 'assignedTo', header: 'Assigned To', cell: ({ getValue }) => getValue<string>() || '—' },
  { accessorKey: 'currentValue', header: 'Value', cell: ({ getValue }) => formatCurrency(getValue<number>()) },
  { accessorKey: 'condition', header: 'Condition', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
  { id: 'actions', header: '', cell: ({ row }) => (
    <Link to={`/assets/details/${row.original.id}`}>
      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
    </Link>
  )},
]

export function AssetsPage() {
  const user = useAuthStore((s) => s.user)
  const canRegisterAsset = user?.role === 'manager'

  return (
    <div className="space-y-6">
      <PageHeader description="Browse and manage all organizational assets">
        {canRegisterAsset ? (
          <Link to="/assets/register">
            <Button><Plus className="h-4 w-4" /> Register Asset</Button>
          </Link>
        ) : null}
      </PageHeader>
      <DataTable columns={columns} data={assets} searchKey="name" searchPlaceholder="Search assets..." />
    </div>
  )
}

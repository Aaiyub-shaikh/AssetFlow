import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Asset } from '@/types'
import { useQuery } from '@tanstack/react-query'

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
    <Link to={`/assets/details/${row.original.tag}`}>
      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
    </Link>
  )},
]

export function AssetsPage() {
  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.getAssets(),
  })

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading asset directory...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-danger">
        <p>Error: {(error as Error).message || 'Failed to load assets'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Browse and manage all organizational assets">
        <Link to="/assets/register">
          <Button><Plus className="h-4 w-4" /> Register Asset</Button>
        </Link>
      </PageHeader>
      <DataTable columns={columns} data={assets} searchKey="name" searchPlaceholder="Search assets..." />
    </div>
  )
}


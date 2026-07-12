import { type ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { departments } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'
import type { Department } from '@/types'

const columns: ColumnDef<Department, unknown>[] = [
  { accessorKey: 'name', header: 'Department', cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.name}</p>
      <p className="text-xs text-muted-foreground">{row.original.code}</p>
    </div>
  )},
  { accessorKey: 'head', header: 'Head' },
  { accessorKey: 'employees', header: 'Employees', cell: ({ getValue }) => getValue<number>().toLocaleString() },
  { accessorKey: 'assets', header: 'Assets', cell: ({ getValue }) => <span className="font-medium text-primary">{getValue<number>()}</span> },
  { accessorKey: 'budget', header: 'Budget', cell: ({ getValue }) => formatCurrency(getValue<number>()) },
  { accessorKey: 'location', header: 'Location' },
  { id: 'actions', header: '', cell: () => (
    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
  )},
]

export function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Manage organizational departments and their assets">
        <Button><Plus className="h-4 w-4" /> Add Department</Button>
      </PageHeader>
      <DataTable columns={columns} data={departments} searchKey="name" searchPlaceholder="Search departments..." />
    </div>
  )
}

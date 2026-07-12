import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Laptop, Monitor, Smartphone, Wifi, Armchair, Car, Code, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { categories } from '@/data/mock'
import type { Category } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Monitor, Smartphone, Wifi, Armchair, Car, Code, Printer,
}

const columns: ColumnDef<Category, unknown>[] = [
  { accessorKey: 'name', header: 'Category', cell: ({ row }) => {
    const Icon = iconMap[row.original.icon] || Laptop
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      </div>
    )
  }},
  { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> },
  { accessorKey: 'assets', header: 'Assets', cell: ({ getValue }) => <span className="font-medium">{getValue<number>()}</span> },
  { accessorKey: 'depreciationRate', header: 'Depreciation', cell: ({ getValue }) => `${getValue<number>()}%/yr` },
  { accessorKey: 'warrantyPeriod', header: 'Warranty', cell: ({ getValue }) => `${getValue<number>()} months` },
]

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Define and manage asset classification categories">
        <Button><Plus className="h-4 w-4" /> Add Category</Button>
      </PageHeader>
      <DataTable columns={columns} data={categories} searchKey="name" searchPlaceholder="Search categories..." />
    </div>
  )
}

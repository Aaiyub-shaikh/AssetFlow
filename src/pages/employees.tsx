import { type ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { employees } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

const columns: ColumnDef<User, unknown>[] = [
  { accessorKey: 'name', header: 'Employee', cell: ({ row }) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={row.original.avatar} />
        <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    </div>
  )},
  { accessorKey: 'position', header: 'Position' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'role', header: 'Role', cell: ({ getValue }) => {
    const role = getValue<string>()
    return <Badge variant={role === 'admin' ? 'default' : role === 'manager' ? 'warning' : 'secondary'}>{role}</Badge>
  }},
  { accessorKey: 'joinedAt', header: 'Joined', cell: ({ getValue }) => formatDate(getValue<string>()) },
]

export function EmployeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader description="Browse and manage employee records">
        <Button><Plus className="h-4 w-4" /> Add Employee</Button>
      </PageHeader>
      <DataTable columns={columns} data={employees} searchKey="name" searchPlaceholder="Search employees..." />
    </div>
  )
}

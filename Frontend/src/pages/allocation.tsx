import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Allocation } from '@/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

export function AllocationPage() {
  const queryClient = useQueryClient()

  // Queries
  const { data: allocations = [], isLoading, error } = useQuery({
    queryKey: ['allocations'],
    queryFn: () => api.getAllAllocations(),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.getAssets(),
  })

  // Filter available assets for checkout dropdown
  const availableAssets = assets.filter((a) => a.status === 'available')

  // Modals visibility state
  const [isAllocOpen, setIsAllocOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [isConflictOpen, setIsConflictOpen] = useState(false)

  // Allocation Form State
  const [allocAssetId, setAllocAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [department, setDepartment] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [allocNotes, setAllocNotes] = useState('')

  // Return Form State
  const [selectedAlloc, setSelectedAlloc] = useState<Allocation | null>(null)
  const [returnCondition, setReturnCondition] = useState('good')
  const [returnNotes, setReturnNotes] = useState('')

  // Conflict / suggested Transfer State
  const [conflictData, setConflictData] = useState<any>(null)

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: (data: { assetId: string; payload: any }) =>
      api.allocateAsset(data.assetId, data.payload),
    onSuccess: () => {
      toast.success('Asset allocated successfully!')
      setIsAllocOpen(false)
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      resetAllocForm()
    },
    onError: (err: any) => {
      if (err.statusCode === 409 && err.data?.suggestTransfer) {
        setConflictData(err.data)
        setIsConflictOpen(true)
      } else {
        toast.error(err.message || 'Failed to allocate asset')
      }
    },
  })

  const returnMutation = useMutation({
    mutationFn: (data: { assetTag: string; payload: any }) =>
      api.returnAsset(data.assetTag, data.payload),
    onSuccess: () => {
      toast.success('Asset returned successfully!')
      setIsReturnOpen(false)
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSelectedAlloc(null)
      setReturnNotes('')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to return asset')
    },
  })

  const createTransferMutation = useMutation({
    mutationFn: (payload: any) => api.createTransferRequest(payload),
    onSuccess: () => {
      toast.success('Transfer request created successfully!')
      setIsConflictOpen(false)
      setIsAllocOpen(false)
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to request transfer')
    },
  })

  const resetAllocForm = () => {
    setAllocAssetId('')
    setEmployeeId('')
    setEmployeeName('')
    setDepartment('')
    setReturnDate('')
    setAllocNotes('')
  }

  const handleOpenAlloc = () => {
    resetAllocForm()
    setIsAllocOpen(true)
  }

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allocAssetId || !employeeId || !employeeName || !department) {
      toast.error('Please fill in all required fields')
      return
    }

    allocateMutation.mutate({
      assetId: allocAssetId,
      payload: {
        employeeId,
        employeeName,
        department,
        returnDate: returnDate || undefined,
        notes: allocNotes || undefined,
        conditionOnAllocation: 'good',
      },
    })
  }

  const handleOpenReturn = (alloc: Allocation) => {
    setSelectedAlloc(alloc)
    setReturnCondition('good')
    setReturnNotes('')
    setIsReturnOpen(true)
  }

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlloc) return

    returnMutation.mutate({
      assetTag: selectedAlloc.assetTag,
      payload: {
        conditionOnReturn: returnCondition,
        notes: returnNotes || undefined,
      },
    })
  }

  const handleCreateSuggestedTransfer = () => {
    if (!conflictData || !allocAssetId) return

    createTransferMutation.mutate({
      assetId: allocAssetId,
      toDepartment: department,
      requestedBy: 'Sarah Chen', // default placeholder/requester
      priority: 'medium',
      reason: `Automated request due to allocation conflict. Current holder: ${conflictData.currentHolder?.name} in ${conflictData.currentHolder?.department}.`,
    })
  }

  const columns: ColumnDef<Allocation, unknown>[] = [
    {
      accessorKey: 'assetName',
      header: 'Asset',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.assetName}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.assetTag}</p>
        </div>
      ),
    },
    { accessorKey: 'employeeName', header: 'Employee' },
    { accessorKey: 'department', header: 'Department' },
    { accessorKey: 'allocatedAt', header: 'Allocated', cell: ({ getValue }) => formatDate(getValue<string>()) },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ getValue }) => (getValue<string>() ? formatDate(getValue<string>()!) : '—'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusChip status={getValue<string>()} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status === 'active' || row.original.status === 'overdue' ? (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-primary border-primary/20 hover:bg-primary/10"
            onClick={() => handleOpenReturn(row.original)}
          >
            <RotateCcw className="h-3 w-3" /> Return
          </Button>
        ) : null,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading allocations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-danger">
        <p>Error: {(error as Error).message || 'Failed to load allocations'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Manage asset allocations to employees">
        <Button onClick={handleOpenAlloc}>
          <Plus className="h-4 w-4" /> New Allocation
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={allocations}
        searchKey="assetName"
        searchPlaceholder="Search allocations..."
      />

      {/* NEW ALLOCATION DIALOG */}
      <Dialog open={isAllocOpen} onOpenChange={setIsAllocOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Asset</DialogTitle>
            <DialogDescription>Assign an available asset to an employee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Asset *</Label>
              <Select onValueChange={setAllocAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select available asset" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableAssets.map((asset) => (
                    <SelectItem key={asset.tag} value={asset.tag}>
                      {asset.name} ({asset.tag})
                    </SelectItem>
                  ))}
                  {availableAssets.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center p-2">
                      No assets currently available for allocation.
                    </p>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID *</Label>
                <Input
                  placeholder="e.g. emp-007"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Employee Name *</Label>
                <Input
                  placeholder="e.g. Alex Johnson"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department *</Label>
              <Input
                placeholder="e.g. Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Return Date (Optional)</Label>
              <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Details of allocation..."
                value={allocNotes}
                onChange={(e) => setAllocNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={allocateMutation.isPending}>
                {allocateMutation.isPending ? 'Allocating...' : 'Allocate Asset'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RETURN ASSET DIALOG */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Process asset check-in for "{selectedAlloc?.assetName}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Condition on Return *</Label>
              <Select defaultValue="good" onValueChange={setReturnCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Return Notes (Optional)</Label>
              <Textarea
                placeholder="Returned condition remarks..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending ? 'Returning...' : 'Process Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFLICT SUGGESTION DIALOG */}
      <Dialog open={isConflictOpen} onOpenChange={setIsConflictOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warning">Allocation Conflict</DialogTitle>
            <DialogDescription>
              This asset is already checked out to another user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm">
              The asset you selected is currently allocated to{' '}
              <strong className="text-foreground">{conflictData?.currentHolder?.name}</strong> in the{' '}
              <strong className="text-foreground">{conflictData?.currentHolder?.department}</strong>{' '}
              department.
            </p>
            <p className="text-sm text-muted-foreground">
              To proceed, the system suggests raising a **Transfer Request** to request ownership movement
              between departments.
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={createTransferMutation.isPending}
              onClick={handleCreateSuggestedTransfer}
            >
              {createTransferMutation.isPending ? 'Requesting...' : 'Create Transfer Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

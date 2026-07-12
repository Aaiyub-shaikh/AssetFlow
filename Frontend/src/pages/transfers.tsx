import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Transfer } from '@/types'
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

export function TransfersPage() {
  const queryClient = useQueryClient()

  // Queries
  const { data: transfers = [], isLoading, error } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => api.getTransfers(),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.getAssets(),
  })

  // State
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [toDepartment, setToDepartment] = useState('')
  const [requestedBy, setRequestedBy] = useState('')
  const [priority, setPriority] = useState('medium')
  const [reason, setReason] = useState('')

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createTransferRequest(payload),
    onSuccess: () => {
      toast.success('Transfer request submitted!')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit transfer request')
    },
  })

  const actionMutation = useMutation({
    mutationFn: (data: { transferId: string; action: 'approve' | 'reject' | 'transit' | 'complete'; approvedBy?: string }) =>
      api.processTransferAction(data.transferId, data.action, data.approvedBy),
    onSuccess: (_, variables) => {
      toast.success(`Transfer request marked as '${variables.action}'!`)
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to process action')
    },
  })

  const resetForm = () => {
    setSelectedAssetId('')
    setToDepartment('')
    setRequestedBy('')
    setPriority('medium')
    setReason('')
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !toDepartment || !requestedBy || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    createMutation.mutate({
      assetId: selectedAssetId,
      toDepartment,
      requestedBy,
      priority,
      reason,
    })
  }

  const handleProcessAction = (transferId: string, action: 'approve' | 'reject' | 'transit' | 'complete') => {
    actionMutation.mutate({
      transferId,
      action,
      approvedBy: 'Sarah Chen', // default approver
    })
  }

  const columns: ColumnDef<Transfer, unknown>[] = [
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
    { accessorKey: 'fromDepartment', header: 'From' },
    { accessorKey: 'toDepartment', header: 'To' },
    { accessorKey: 'requestedBy', header: 'Requested By' },
    { accessorKey: 'requestedAt', header: 'Date', cell: ({ getValue }) => formatDate(getValue<string>()) },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ getValue }) => <StatusChip status={getValue<string>()} />,
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
        row.original.status === 'pending' ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-success hover:bg-success/10"
              onClick={() => handleProcessAction(row.original.id || (row.original as any)._id, 'complete')}
              disabled={actionMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-danger hover:bg-danger/10"
              onClick={() => handleProcessAction(row.original.id || (row.original as any)._id, 'reject')}
              disabled={actionMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading transfers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-danger">
        <p>Error: {(error as Error).message || 'Failed to load transfers'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Manage inter-department asset transfers">
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4" /> Request Transfer
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={transfers}
        searchKey="assetName"
        searchPlaceholder="Search transfers..."
      />

      {/* NEW TRANSFER REQUEST DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Request Asset Transfer</DialogTitle>
            <DialogDescription>Initiate a transfer workflow to move an asset to a new department.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Asset *</Label>
              <Select onValueChange={setSelectedAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target asset" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {assets.map((asset) => (
                    <SelectItem key={asset.tag} value={asset.tag}>
                      {asset.name} ({asset.tag} - {asset.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destination Department *</Label>
              <Input
                placeholder="e.g. Marketing"
                value={toDepartment}
                onChange={(e) => setToDepartment(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Requested By *</Label>
                <Input
                  placeholder="e.g. Priya Sharma"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue="medium" onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Transfer *</Label>
              <Textarea
                placeholder="Explain why the asset needs to be transferred..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

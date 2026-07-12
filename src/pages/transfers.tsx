import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Check, X, ArrowRightLeft, Clock, CheckCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageShell } from '@/components/layout/page-shell'
import { StatusChip } from '@/components/shared/status-chip'
import { useAssetStore } from '@/stores/assetStore'
import { useAuthStore } from '@/stores'
import { formatDate } from '@/lib/utils'
import type { Transfer, Priority } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { departments } from '@/data/mock'

type TrfTab = 'all' | 'pending' | 'approved' | 'completed' | 'rejected'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-400/15 text-amber-400 border-amber-400/30',
  approved:   'bg-blue-400/15 text-blue-400 border-blue-400/30',
  in_transit: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30',
  completed:  'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  rejected:   'bg-red-400/15 text-red-400 border-red-400/30',
}
const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-red-500', high: 'border-l-orange-500', medium: 'border-l-amber-500', low: 'border-l-slate-500',
}

// ── Request Transfer Dialog ──────────────────────────────────────────────────
function RequestTransferDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { assets, requestTransfer } = useAssetStore()
  const user = useAuthStore((s) => s.user)

  const [assetId, setAssetId] = useState('')
  const [toDept, setToDept] = useState('')
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleSubmit = () => {
    if (!assetId || !toDept || !reason) { toast.error('Please fill all required fields'); return }
    const asset = assets.find((a) => a.id === assetId)!
    requestTransfer({
      assetId,
      assetName: asset.name,
      assetTag: asset.tag,
      toDepartment: toDept,
      requestedBy: user?.name ?? 'Unknown',
      reason,
      priority,
    })
    toast.success('Transfer request submitted for approval')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Asset Transfer</DialogTitle>
          <DialogDescription>Submit a transfer request for manager approval</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.tag}) — {a.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transfer To Department *</Label>
            <Select value={toDept} onValueChange={setToDept}>
              <SelectTrigger><SelectValue placeholder="Select destination dept" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority *</Label>
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Textarea placeholder="Why is this transfer needed?" value={reason} onChange={(e) => setReason(e.target.value)} className="resize-none h-20" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <ArrowRightLeft className="h-4 w-4" /> Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Transfer Card ─────────────────────────────────────────────────────────────
function TransferCard({ transfer, index, canApprove }: { transfer: Transfer; index: number; canApprove: boolean }) {
  const { approveTransfer, rejectTransfer, completeTransfer } = useAssetStore()
  const user = useAuthStore((s) => s.user)
  const border = PRIORITY_BORDER[transfer.priority] ?? 'border-l-slate-500'
  const statusCls = STATUS_COLORS[transfer.status] ?? 'bg-muted/30 text-muted-foreground border-border'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] p-4 flex flex-col gap-3 border-l-4 ${border} transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{transfer.assetName}</p>
          <p className="text-xs font-mono text-muted-foreground/70 mt-0.5">{transfer.assetTag}</p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusCls}`}>
          {transfer.status.replace('_', ' ')}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground truncate">{transfer.fromDepartment}</span>
        <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        <span className="font-medium truncate">{transfer.toDepartment}</span>
      </div>

      {/* Meta */}
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>Requested by: <span className="text-foreground/80">{transfer.requestedBy}</span> · {formatDate(transfer.requestedAt)}</p>
        <p className="italic line-clamp-1">{transfer.reason}</p>
        {transfer.approvedBy && <p>Approved by: <span className="text-emerald-400">{transfer.approvedBy}</span></p>}
        {transfer.completedAt && <p>Completed: {formatDate(transfer.completedAt)}</p>}
      </div>

      {/* Priority chip */}
      <div className="flex items-center gap-2">
        <StatusChip status={transfer.priority} />
      </div>

      {/* Actions */}
      {transfer.status === 'pending' && canApprove && (
        <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
          <button onClick={() => { approveTransfer(transfer.id, user?.name ?? 'Manager'); toast.success('Transfer approved') }}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-colors flex items-center justify-center gap-1">
            <Check className="h-3 w-3" /> Approve
          </button>
          <button onClick={() => { rejectTransfer(transfer.id); toast.error('Transfer rejected') }}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-colors flex items-center justify-center gap-1">
            <X className="h-3 w-3" /> Reject
          </button>
        </div>
      )}
      {transfer.status === 'approved' && canApprove && (
        <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
          <button onClick={() => { completeTransfer(transfer.id); toast.success('Transfer completed — asset re-allocated') }}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 transition-colors flex items-center justify-center gap-1">
            <Truck className="h-3 w-3" /> Mark Completed
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── TransfersPage ─────────────────────────────────────────────────────────────
export function TransfersPage() {
  const { transfers } = useAssetStore()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState<TrfTab>('all')
  const [search, setSearch] = useState('')
  const [reqOpen, setReqOpen] = useState(false)

  const canApprove = ['admin', 'manager', 'department_head'].includes(user?.role ?? '')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return transfers.filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false
      return !q || [t.assetName, t.assetTag, t.fromDepartment, t.toDepartment, t.requestedBy].some((v) => v.toLowerCase().includes(q))
    })
  }, [transfers, tab, search])

  const TABS: { key: TrfTab; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: ArrowRightLeft },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'completed', label: 'Completed', icon: Truck },
    { key: 'rejected', label: 'Rejected', icon: X },
  ]

  const countFor = (k: TrfTab) => k === 'all' ? transfers.length : transfers.filter((t) => t.status === k).length

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset Transfers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Inter-department transfers with Requested → Approved → Re-allocated workflow
            </p>
          </div>
          <Button className="gap-2 shrink-0" onClick={() => setReqOpen(true)}>
            <Plus className="h-4 w-4" /> Request Transfer
          </Button>
        </div>

        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search transfers…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white/[0.04] border-white/[0.08]" />
          </div>
          <div className="flex flex-wrap gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {label} <span className="ml-1 opacity-60">{countFor(key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
                <ArrowRightLeft className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              </div>
              <p className="text-muted-foreground font-medium">No {tab === 'all' ? '' : tab} transfers</p>
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((t, i) => <TransferCard key={t.id} transfer={t} index={i} canApprove={canApprove} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {reqOpen && <RequestTransferDialog open={reqOpen} onClose={() => setReqOpen(false)} />}
    </PageShell>
  )
}

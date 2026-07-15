import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, AlertTriangle, User, Calendar, RotateCcw, ArrowRightLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageShell } from '@/components/layout/page-shell'
import { StatusChip } from '@/components/shared/status-chip'
import { useAssetStore } from '@/stores/assetStore'
import { useAuthStore } from '@/stores'
import type { Allocation } from '@/types'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

type AllocTab = 'active' | 'returned' | 'overdue'

// ── Allocate Dialog ───────────────────────────────────────────────────────────
function AllocateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { assets, allocateAsset } = useAssetStore()
  const { employees } = useAuthStore()
  const navigate = useNavigate()

  const [assetId, setAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [notes, setNotes] = useState('')
  const [conflictInfo, setConflictInfo] = useState<Allocation | null>(null)

  const availableAssets = assets.filter((a) => ['available', 'reserved'].includes(a.status))

  const handleSubmit = () => {
    if (!assetId || !employeeId) { toast.error('Select an asset and employee'); return }
    const emp = employees.find((e) => e.id === employeeId)!
    const result = allocateAsset({
      assetId,
      employeeId,
      employeeName: emp.name,
      department: emp.department,
      returnDate: returnDate || undefined,
      notes,
    })
    if (!result.success && result.conflict) {
      setConflictInfo(result.conflict)
      return
    }
    toast.success('Asset allocated successfully!')
    onClose()
  }

  const handleRequestTransfer = () => {
    onClose()
    navigate('/transfers')
  }

  if (conflictInfo) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Allocation Conflict
            </DialogTitle>
            <DialogDescription>
              This asset is currently held by another employee.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-2">
            <p className="text-sm font-medium">Currently held by:</p>
            <p className="font-semibold">{conflictInfo.employeeName}</p>
            <p className="text-xs text-muted-foreground">{conflictInfo.department} • Allocated {formatDate(conflictInfo.allocatedAt)}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can request a transfer instead. The current holder's manager will need to approve it.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictInfo(null)}>Back</Button>
            <Button onClick={handleRequestTransfer} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Request Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Asset</DialogTitle>
          <DialogDescription>Assign a free asset to an employee</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue placeholder="Select an available asset" /></SelectTrigger>
              <SelectContent>
                {availableAssets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} — {a.tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.filter((e) => e.status !== 'inactive').map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Expected Return Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Any special conditions or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none h-16" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Allocate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Return Dialog ─────────────────────────────────────────────────────────────
function ReturnDialog({ allocation, onClose }: { allocation: Allocation; onClose: () => void }) {
  const { returnAsset } = useAssetStore()
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')
  const [notes, setNotes] = useState('')

  const handleReturn = () => {
    returnAsset({ allocationId: allocation.id, condition, conditionNotes: notes })
    toast.success(`${allocation.assetName} returned successfully. Status set to Available.`)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>{allocation.assetName} — {allocation.assetTag}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Condition at Return *</Label>
            <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Check-in Notes</Label>
            <Textarea placeholder="Condition observations..." value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none h-16" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReturn} className="gap-2">
            <CheckCircle className="h-4 w-4" /> Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Allocation Card ───────────────────────────────────────────────────────────
function AllocationCard({ alloc, index, canReturn }: { alloc: Allocation; index: number; canReturn: boolean }) {
  const [returnOpen, setReturnOpen] = useState(false)
  const isOverdue = alloc.status === 'active' && alloc.returnDate && new Date(alloc.returnDate) < new Date()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${isOverdue ? 'border-red-500/30 bg-red-500/5' : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{alloc.assetName}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{alloc.assetTag}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isOverdue ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                <AlertTriangle className="h-3 w-3" /> Overdue
              </span>
            ) : (
              <StatusChip status={alloc.status} />
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3" /> {alloc.employeeName} · {alloc.department}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Allocated: {formatDate(alloc.allocatedAt)}
            {alloc.returnDate && <span className={`ml-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}>· Due: {formatDate(alloc.returnDate)}</span>}
          </div>
          {alloc.notes && <p className="italic opacity-70">{alloc.notes}</p>}
        </div>

        {/* Actions */}
        {alloc.status === 'active' && canReturn && (
          <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
            <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => setReturnOpen(true)}>
              <RotateCcw className="h-3 w-3" /> Mark Returned
            </Button>
          </div>
        )}
      </motion.div>
      {returnOpen && <ReturnDialog allocation={alloc} onClose={() => setReturnOpen(false)} />}
    </>
  )
}

// ── AllocationPage ────────────────────────────────────────────────────────────
export function AllocationPage() {
  const { allocations, getOverdueAllocations } = useAssetStore()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState<AllocTab>('active')
  const [search, setSearch] = useState('')
  const [allocOpen, setAllocOpen] = useState(false)

  const canAllocate = ['admin', 'manager', 'department_head'].includes(user?.role ?? '')
  const overdueCount = getOverdueAllocations().length

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allocations.filter((a) => {
      const isOverdue = a.status === 'active' && a.returnDate && new Date(a.returnDate) < new Date()
      if (tab === 'active') {
        if (isOverdue) return false
        if (a.status !== 'active') return false
      } else if (tab === 'overdue') {
        if (!isOverdue) return false
      } else if (tab === 'returned') {
        if (a.status !== 'returned') return false
      }
      return !q || [a.assetName, a.assetTag, a.employeeName, a.department].some((v) => v.toLowerCase().includes(q))
    })
  }, [allocations, tab, search])

  const TABS: { key: AllocTab; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'overdue', label: `Overdue${overdueCount > 0 ? ` (${overdueCount})` : ''}` },
    { key: 'returned', label: 'Returned' },
  ]

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset Allocation</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage who holds what asset, with conflict protection</p>
          </div>
          {canAllocate && (
            <Button className="gap-2 shrink-0" onClick={() => setAllocOpen(true)}>
              <Plus className="h-4 w-4" /> Allocate Asset
            </Button>
          )}
        </div>

        {/* Overdue banner */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm font-medium text-red-400">
              {overdueCount} allocation{overdueCount > 1 ? 's are' : ' is'} past the expected return date
            </p>
            <Button size="sm" variant="ghost" className="ml-auto text-red-400 hover:text-red-300" onClick={() => setTab('overdue')}>
              View →
            </Button>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search allocations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white/[0.04] border-white/[0.08]" />
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${t.key === 'overdue' && overdueCount > 0 ? 'text-red-400' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
                <User className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              </div>
              <p className="text-muted-foreground font-medium">No {tab} allocations</p>
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((alloc, i) => (
                <AllocationCard key={alloc.id} alloc={alloc} index={i} canReturn={canAllocate} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {allocOpen && <AllocateDialog open={allocOpen} onClose={() => setAllocOpen(false)} />}
    </PageShell>
  )
}

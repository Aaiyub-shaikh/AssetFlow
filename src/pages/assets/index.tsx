import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, SlidersHorizontal, Eye,
  Package, Filter, X, QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/components/layout/page-shell'
import { StatusChip } from '@/components/shared/status-chip'
import { useAuthStore } from '@/stores'
import { useAssetStore } from '@/stores/assetStore'
import { categories, departments } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'
import type { Asset, AssetStatus } from '@/types'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { QRScannerDialog } from '@/components/shared/qr-scanner'

const ALL_STATUSES: AssetStatus[] = ['available', 'allocated', 'reserved', 'maintenance', 'retired', 'lost']
const STATUS_COLORS: Record<string, string> = {
  available:   'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  allocated:   'bg-blue-400/15 text-blue-400 border-blue-400/30',
  reserved:    'bg-purple-400/15 text-purple-400 border-purple-400/30',
  maintenance: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  retired:     'bg-slate-400/15 text-slate-400 border-slate-400/30',
  lost:        'bg-red-400/15 text-red-400 border-red-400/30',
  disposed:    'bg-slate-400/15 text-slate-400 border-slate-400/30',
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-muted/30 text-muted-foreground border-border'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function AssetCard({ asset, index }: { asset: Asset; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm p-4 flex flex-col gap-3 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Image / Icon */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          {asset.image ? (
            <img src={asset.image} alt={asset.name} className="h-10 w-10 object-contain rounded-lg" />
          ) : (
            <Package className="h-6 w-6 text-primary/70" />
          )}
        </div>
        <StatusPill status={asset.status} />
      </div>

      {/* Name & Tag */}
      <div>
        <p className="font-semibold text-sm leading-tight">{asset.name}</p>
        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">{asset.tag}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground/80">
        <span className="truncate">{asset.category}</span>
        <span className="truncate text-right">{asset.department}</span>
        <span className="truncate">{asset.location}</span>
        <span className="truncate text-right font-medium text-foreground/80">{formatCurrency(asset.currentValue)}</span>
      </div>

      {/* Assigned to */}
      {asset.assignedTo && (
        <p className="text-xs text-muted-foreground truncate">
          <span className="text-muted-foreground/50">Held by </span>{asset.assignedTo}
        </p>
      )}

      {/* Condition + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-auto">
        <StatusChip status={asset.condition} />
        <Link to={`/assets/details/${asset.id}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export function AssetsPage() {
  const user = useAuthStore((s) => s.user)
  const { assets } = useAssetStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [scannerOpen, setScannerOpen] = useState(false)

  const canRegister = ['admin', 'manager'].includes(user?.role ?? '')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return assets.filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false
      if (filterCategory !== 'all' && a.categoryId !== filterCategory) return false
      if (filterDept !== 'all' && a.departmentId !== filterDept) return false
      if (q && ![a.name, a.tag, a.serialNumber, a.category, a.department, a.location, a.assignedTo ?? '']
        .some((v) => v.toLowerCase().includes(q))) return false
      return true
    })
  }, [assets, search, filterStatus, filterCategory, filterDept])

  const statusCounts = useMemo(() =>
    ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: assets.filter((a) => a.status === s).length }), {} as Record<string, number>),
    [assets]
  )

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterDept !== 'all'

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Register, search, and track all organisational assets centrally
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="gap-2 border-white/10 hover:bg-white/5"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="h-4 w-4 text-primary" /> Scan QR
            </Button>
            {canRegister && (
              <Link to="/assets/register">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Register Asset
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${filterStatus === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground'}`}
          >
            All <span className="ml-1 opacity-70">{assets.length}</span>
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? 'all' : s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-all capitalize ${filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground'}`}
            >
              {s.replace('_', ' ')} <span className="ml-1 opacity-70">{statusCounts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, tag, serial no., location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.04] border-white/[0.08]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${hasActiveFilters ? 'border-primary/50 text-primary' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && <Badge className="h-4 w-4 p-0 text-[10px] flex items-center justify-center">!</Badge>}
          </Button>
          <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-2.5 py-1.5 text-xs transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Grid
            </button>
            <button onClick={() => setView('table')} className={`px-2.5 py-1.5 text-xs transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Table
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by:</span>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-44 h-8 text-xs bg-white/[0.04] border-white/[0.08]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="w-44 h-8 text-xs bg-white/[0.04] border-white/[0.08]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setFilterDept('all') }}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {assets.length} assets
        </p>

        {/* Grid / Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 mb-4">
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            </div>
            <p className="text-muted-foreground font-medium">No assets found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((asset, i) => <AssetCard key={asset.id} asset={asset} index={i} />)}
          </div>
        ) : (
          /* Table view */
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] border-b border-white/[0.07]">
                <tr>
                  {['Asset', 'Category', 'Department', 'Status', 'Condition', 'Assigned To', 'Value', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.tag}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
                    <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                    <td className="px-4 py-3"><StatusChip status={a.condition} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.assignedTo ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(a.currentValue)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/assets/details/${a.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </PageShell>
  )
}

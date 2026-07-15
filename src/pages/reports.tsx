import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, FileText, BarChart3, PieChart, Info,
  TrendingUp, Wrench, AlertTriangle, Calendar, Building, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageShell } from '@/components/layout/page-shell'
import {
  UtilizationChart, DepartmentChart, BookingHeatmapChart, MaintenanceTrendChart
} from '@/components/shared/charts'
import {
  utilizationData, departmentAllocationData, maintenanceTrendData, bookingHeatmapData
} from '@/data/mock'
import { useAssetStore } from '@/stores/assetStore'
import { useAssetMaintenanceStore } from '@/stores/assetMaintenanceStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

type ActiveSection = 'charts' | 'utilization' | 'maintenance' | 'exports'

const REPORT_TEMPLATES = [
  { title: 'Asset Inventory Report', description: 'Complete inventory listing with acquisition values, condition, and status', icon: FileText, type: 'PDF' },
  { title: 'Utilization Analysis', description: 'Asset utilization rates, total checkout cycles, and idle time metrics', icon: BarChart3, type: 'Excel' },
  { title: 'Depreciation & Value Report', description: 'Asset depreciation calculations, current valuations, and asset rankings', icon: PieChart, type: 'PDF' },
  { title: 'Maintenance Pipeline', description: 'Maintenance frequency summaries, breakdown costs, and repair schedules', icon: Wrench, type: 'Excel' },
  { title: 'Allocation History Log', description: 'Complete history of asset assignments, transfers, and return condition notes', icon: BarChart3, type: 'PDF' },
  { title: 'Compliance & Audit Log', description: 'Active and closed audit cycles with recorded discrepancies and resolutions', icon: FileText, type: 'PDF' },
]

export function ReportsPage() {
  const { assets, allocations } = useAssetStore()
  const { maintenanceRecords } = useAssetMaintenanceStore()

  const [activeSection, setActiveSection] = useState<ActiveSection>('charts')
  const [exportingId, setExportingId] = useState<string | null>(null)

  // ── Computations from Live Store Data ──
  const assetStats = useMemo(() => {
    const totalCount = assets.length
    const availableCount = assets.filter(a => a.status === 'available').length
    const allocatedCount = assets.filter(a => a.status === 'allocated').length
    const maintenanceCount = assets.filter(a => a.status === 'maintenance').length
    const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0)
    
    // Utilization Rate
    const utilizationRate = totalCount > 0 ? Math.round((allocatedCount / totalCount) * 100) : 0

    // Checkout counts per asset
    const checkoutCounts: Record<string, number> = {}
    allocations.forEach((alloc) => {
      checkoutCounts[alloc.assetId] = (checkoutCounts[alloc.assetId] || 0) + 1
    })

    // Sort assets by checkout count
    const sortedByUsage = [...assets].map(a => ({
      ...a,
      checkouts: checkoutCounts[a.id] || 0
    })).sort((a, b) => b.checkouts - a.checkouts)

    const mostUsed = sortedByUsage.slice(0, 5)
    const idle = sortedByUsage.filter(a => a.checkouts === 0).slice(0, 5)

    // Maintenance logs grouped by asset
    const maintenanceCounts: Record<string, number> = {}
    maintenanceRecords.forEach((rec) => {
      maintenanceCounts[rec.assetId] = (maintenanceCounts[rec.assetId] || 0) + 1
    })

    const maintenanceRisk = assets.map(a => {
      // Risk factor computed from condition and age
      let score = 0
      if (a.condition === 'poor') score += 50
      if (a.condition === 'fair') score += 25
      
      const maintenanceCount = maintenanceCounts[a.id] || 0
      score += Math.min(maintenanceCount * 10, 30) // cap frequency contribution
      
      if (a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date()) {
        score += 20
      }

      return {
        ...a,
        maintenanceCount,
        riskScore: score
      }
    }).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)

    // Nearing Retirement (condition: poor or age/warranty expired)
    const nearingRetirement = assets.filter(a => 
      a.condition === 'poor' || 
      (a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date())
    ).slice(0, 5)

    return {
      totalCount,
      availableCount,
      allocatedCount,
      maintenanceCount,
      totalValue,
      utilizationRate,
      mostUsed,
      idle,
      maintenanceRisk,
      nearingRetirement
    }
  }, [assets, allocations, maintenanceRecords])

  const handleExport = (title: string, format: 'PDF' | 'Excel') => {
    const key = `${title}-${format}`
    setExportingId(key)
    const toastId = toast.loading(`Compiling live data for ${title} (${format})...`)
    
    setTimeout(() => {
      let content = ''
      let filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format === 'PDF' ? 'pdf' : 'csv'}`
      const timestamp = new Date().toLocaleString()

      if (format === 'PDF') {
        const lines: string[] = []
        lines.push(`Generated: ${timestamp}`)
        lines.push(`--------------------------------------------------------------------------------`)

        if (title === 'Asset Inventory Report') {
          lines.push(`Total Registered Assets: ${assets.length}`)
          const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0)
          lines.push(`Total Inventory Valuation: $${totalValue.toLocaleString()}`)
          lines.push(`--------------------------------------------------------------------------------`)
          assets.forEach(a => {
            lines.push(`${a.tag} - ${a.name} (${a.department})`)
            lines.push(`  Status: ${a.status} | Condition: ${a.condition} | Price: $${(a.purchasePrice || 0).toLocaleString()}`)
          })
        } else if (title === 'Utilization Analysis') {
          const checkedOut = assets.filter(a => a.status === 'allocated').length
          const rate = assets.length > 0 ? Math.round((checkedOut / assets.length) * 100) : 0
          lines.push(`Overall Utilization Rate: ${rate}%`)
          lines.push(`Active Allocations: ${checkedOut} / ${assets.length}`)
          lines.push(`--------------------------------------------------------------------------------`)
          assetStats.mostUsed.forEach(a => {
            lines.push(`Top Performing: ${a.name} (${a.tag})`)
            lines.push(`  Checkout Cycles: ${a.checkouts} times`)
          })
        } else if (title === 'Depreciation & Value Report') {
          const totalCost = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0)
          lines.push(`Total Purchase Valuation: $${totalCost.toLocaleString()}`)
          lines.push(`Estimated Depreciation (Straight Line 5-Year Model):`)
          lines.push(`--------------------------------------------------------------------------------`)
          assets.forEach(a => {
            const cost = a.purchasePrice || 0
            const yearlyDep = cost / 5
            const salvage = cost * 0.1
            lines.push(`${a.name} (${a.tag})`)
            lines.push(`  Initial: $${cost.toLocaleString()} | Yearly Dep: $${yearlyDep.toLocaleString()} | Book Value: $${salvage.toLocaleString()}`)
          })
        } else if (title === 'Maintenance Pipeline') {
          const activeMnt = maintenanceRecords.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length
          const resolvedMnt = maintenanceRecords.filter(r => r.status === 'resolved').length
          const totalCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0)
          lines.push(`Active Maintenance Tasks: ${activeMnt}`)
          lines.push(`Completed Maintenance: ${resolvedMnt}`)
          lines.push(`Total Maintenance Expenditures: $${totalCost.toLocaleString()}`)
          lines.push(`--------------------------------------------------------------------------------`)
          maintenanceRecords.forEach(r => {
            lines.push(`${r.assetTag} - ${r.assetName} [${r.type.toUpperCase()}]`)
            lines.push(`  Status: ${r.status} | Priority: ${r.priority} | Cost: $${r.cost}`)
          })
        } else if (title === 'Allocation History Log') {
          lines.push(`Total Historical Allocations: ${allocations.length}`)
          lines.push(`--------------------------------------------------------------------------------`)
          allocations.forEach(a => {
            lines.push(`${a.assetTag} - ${a.assetName}`)
            lines.push(`  Holder: ${a.employeeName} (${a.department})`)
            lines.push(`  Allocated: ${a.allocatedAt} | Status: ${a.status}`)
          })
        } else if (title === 'Compliance & Audit Log') {
          lines.push(`Compliance Review History`)
          lines.push(`--------------------------------------------------------------------------------`)
          lines.push(`Q1 2026 IT Assets Audit: Compliance Score 94%`)
          lines.push(`  Verified: 12 Assets | Missing: 1 | Damaged: 1`)
          lines.push(`Annual Facilities Audit: Compliance Score 100%`)
          lines.push(`  Verified: 10 Assets | Discrepancies: 0`)
        } else {
          lines.push(`No template mapping found.`)
        }

        const textStream = [
          'BT',
          '/F1 14 Tf',
          '70 730 Td',
          `(${title}) Tj`,
          '0 -25 Td',
          '/F1 10 Tf',
          ...lines.map(line => `(${line.replace(/[()]/g, '')}) Tj 0 -15 Td`),
          'ET'
        ].join('\n')

        content = [
          '%PDF-1.4',
          '1 0 obj',
          '<< /Type /Catalog /Pages 2 0 R >>',
          'endobj',
          '2 0 obj',
          '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
          'endobj',
          '3 0 obj',
          '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>',
          'endobj',
          '4 0 obj',
          `<< /Length ${textStream.length} >>`,
          'stream',
          textStream,
          'endstream',
          'endobj',
          'xref',
          '0 5',
          '0000000000 65535 f',
          'trailer',
          '<< /Size 5 /Root 1 0 R >>',
          '%%EOF'
        ].join('\n')
      } else {
        content = `Report: ${title}\nGenerated At: ${timestamp}\n\n`

        if (title === 'Asset Inventory Report') {
          content += `Asset Tag,Name,Category,Department,Location,Condition,Status,Purchase Price\n`
          assets.forEach(a => {
            content += `"${a.tag}","${a.name}","${a.category}","${a.department}","${a.location}","${a.condition}","${a.status}",${a.purchasePrice}\n`
          })
        } else if (title === 'Utilization Analysis') {
          content += `Asset Tag,Name,Department,Total Checkout Cycles,Current Status,Assigned To\n`
          assets.forEach(a => {
            const checkouts = assetStats.mostUsed.find(x => x.id === a.id)?.checkouts || 0
            content += `"${a.tag}","${a.name}","${a.department}",${checkouts},"${a.status}","${a.assignedTo || 'N/A'}"\n`
          })
        } else if (title === 'Depreciation & Value Report') {
          content += `Asset Tag,Name,Purchase Date,Purchase Price,Yearly Depreciation,Salvage Book Value\n`
          assets.forEach(a => {
            const cost = a.purchasePrice || 0
            const yearlyDep = cost / 5
            const salvage = cost * 0.1
            content += `"${a.tag}","${a.name}","${a.purchaseDate}",${cost},${yearlyDep},${salvage}\n`
          })
        } else if (title === 'Maintenance Pipeline') {
          content += `Maintenance ID,Asset Tag,Asset Name,Type,Priority,Status,Cost,Assigned To,Scheduled Date\n`
          maintenanceRecords.forEach(r => {
            content += `"${r.id}","${r.assetTag}","${r.assetName}","${r.type}","${r.priority}","${r.status}",${r.cost},"${r.assignedTo}","${r.scheduledDate}"\n`
          })
        } else if (title === 'Allocation History Log') {
          content += `Allocation ID,Asset Tag,Asset Name,Employee Name,Department,Allocated At,Expected Return,Status,Notes\n`
          allocations.forEach(a => {
            content += `"${a.id}","${a.assetTag}","${a.assetName}","${a.employeeName}","${a.department}","${a.allocatedAt}","${a.returnDate || ''}","${a.status}","${a.notes || ''}"\n`
          })
        } else if (title === 'Compliance & Audit Log') {
          content += `Audit Cycle ID,Cycle Name,Department,Location,Status,Compliance Score,Verified Assets,Missing,Damaged\n`
          content += `"aud-cycle-1","Q1 2026 IT Assets Audit","IT Operations","HQ - Floor 3","Active","94%",12,1,1\n`
          content += `"aud-cycle-2","Annual Facilities Audit","Facilities","HQ - Ground","Closed","100%",10,0,0\n`
        } else {
          content += `No template matched.`
        }
      }
      
      const blob = new Blob([content], { type: format === 'PDF' ? 'application/pdf' : 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${title} successfully exported as ${format}!`, { id: toastId })
      setExportingId(null)
    }, 1500)
  }

  const SECTIONS = [
    { id: 'charts' as const, label: 'Analytics Dashboard', icon: TrendingUp },
    { id: 'utilization' as const, label: 'Asset Performance', icon: BarChart3 },
    { id: 'maintenance' as const, label: 'Maintenance & Risk', icon: Wrench },
    { id: 'exports' as const, label: 'Report Export Center', icon: Download },
  ]

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time utilization tracking, maintenance frequency, retirement risk indicators, and exportable reports.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Asset Value</p>
                  <p className="text-2xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    {formatCurrency(assetStats.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Building className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Utilization Rate</p>
                  <p className="text-2xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    {assetStats.utilizationRate}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Under Maintenance</p>
                  <p className="text-2xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                    {assetStats.maintenanceCount}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                  <Wrench className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Audited Assets</p>
                  <p className="text-2xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                    {assetStats.totalCount}
                  </p>
                </div>
                <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 self-start">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                activeSection === sec.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <sec.icon className="h-4 w-4" />
              {sec.label}
            </button>
          ))}
        </div>

        {/* Dynamic Analytics Content */}
        <AnimatePresence mode="wait">
          {activeSection === 'charts' && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Upper Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UtilizationChart data={utilizationData} />
                <DepartmentChart data={departmentAllocationData} />
              </div>
              {/* Lower Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MaintenanceTrendChart data={maintenanceTrendData} />
                <BookingHeatmapChart data={bookingHeatmapData} />
              </div>
            </motion.div>
          )}

          {activeSection === 'utilization' && (
            <motion.div
              key="utilization"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Most-Used Assets */}
              <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Top Performing Assets
                  </CardTitle>
                  <CardDescription>Most frequently assigned assets in current cycles</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {assetStats.mostUsed.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.tag} · {a.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          {a.checkouts} checkouts
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Idle Assets */}
              <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-400" />
                    Underutilized / Idle Assets
                  </CardTitle>
                  <CardDescription>Assets registered but never checkout or allocated</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {assetStats.idle.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground">All assets have active checkout logs.</p>
                    </div>
                  ) : (
                    assetStats.idle.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div>
                          <p className="text-sm font-semibold">{a.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.tag} · {a.department}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                            Idle
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Risks & Frequencies */}
              <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    Critical Reliability Risks
                  </CardTitle>
                  <CardDescription>Assets grouped by condition score and repair frequency</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {assetStats.maintenanceRisk.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.tag} · Condition: <span className="capitalize text-foreground font-semibold">{a.condition}</span></p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                          Risk Index: {a.riskScore}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{a.maintenanceCount} breakdowns</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Nearing Retirement */}
              <Card className="bg-white/[0.03] border-white/[0.07] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Nearing Retirement / End of Life
                  </CardTitle>
                  <CardDescription>Assets with poor condition or expired warranties</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {assetStats.nearingRetirement.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.tag} · Warranty: {a.warrantyExpiry ? formatDate(a.warrantyExpiry) : 'None'}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 capitalize">
                          {a.condition === 'poor' ? 'Poor Condition' : 'Expired Warranty'}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'exports' && (
            <motion.div
              key="exports"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {REPORT_TEMPLATES.map((report) => (
                <Card key={report.title} className="bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05] transition-all rounded-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <report.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{report.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{report.description}</p>
                        <div className="flex gap-2 mt-5 pt-3 border-t border-white/[0.05]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 border-white/10 hover:bg-white/5 gap-1 text-xs"
                            onClick={() => handleExport(report.title, 'PDF')}
                            disabled={exportingId !== null}
                          >
                            {exportingId === `${report.title}-PDF` ? (
                              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-red-400" />
                            )}
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 border-white/10 hover:bg-white/5 gap-1 text-xs"
                            onClick={() => handleExport(report.title, 'Excel')}
                            disabled={exportingId !== null}
                          >
                            {exportingId === `${report.title}-Excel` ? (
                              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                            Excel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}

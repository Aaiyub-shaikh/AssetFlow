import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { UtilizationChart, DepartmentChart, BookingHeatmapChart, MaintenanceTrendChart } from '@/components/shared/charts'
import { getReportsData, type ReportFilters } from '@/services/report-service'
import { buildExportCsv, buildExportPdf } from '@/services/report-service'
import { departments } from '@/data/mock'

function SummaryCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({})
  const [data, setData] = useState<Awaited<ReturnType<typeof getReportsData>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadData()
  }, [filters])

  async function loadData() {
    setLoading(true)
    try {
      const result = await getReportsData(filters)
      setData(result)
    } catch {
      toast.error('Unable to load report data')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(format: 'csv' | 'pdf') {
    if (!data) return

    const fileName = `asset-report.${format}`
    const content = format === 'csv'
      ? buildExportCsv(data.mostUsedAssets.map((row) => ({ asset: row.asset, department: row.department, totalBookings: row.totalBookings, utilizationPct: row.utilizationPct, lastUsed: row.lastUsed })))
      : buildExportPdf(data.mostUsedAssets.map((row) => ({ asset: row.asset, department: row.department, totalBookings: row.totalBookings, utilizationPct: row.utilizationPct, lastUsed: row.lastUsed })), 'Asset Report')

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  const summaryCards = useMemo(() => {
    if (!data) return []
    return [
      { title: 'Total Assets', value: data.overview.totalAssets, subtitle: 'Assets matching current filters' },
      { title: 'Active Assets', value: data.overview.activeAssets, subtitle: 'Allocated or reserved assets' },
      { title: 'Assets Under Maintenance', value: data.overview.maintenanceAssets, subtitle: 'Currently in maintenance' },
      { title: 'Assets Near Retirement', value: data.overview.retirementAssets, subtitle: 'Approaching end of lifecycle' },
    ]
  }, [data])

  return (
    <div className="space-y-8">
      <PageHeader title="Reports & Analytics" description="Track utilization, maintenance health, and asset lifecycle trends" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Filter className="h-4 w-4" /> Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={filters.department ?? 'all'} onValueChange={(value) => setFilters((current) => ({ ...current, department: value === 'all' ? undefined : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input placeholder="Any category" value={filters.category ?? ''} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value || undefined }))} />
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input type="date" value={filters.startDate ?? ''} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value || undefined }))} />
              <Input type="date" value={filters.endDate ?? ''} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value || undefined }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status ?? 'all'} onValueChange={(value) => setFilters((current) => ({ ...current, status: value === 'all' ? undefined : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void handleExport('csv')}><Download className="h-4 w-4" /> Export CSV</Button>
        <Button variant="outline" onClick={() => void handleExport('pdf')}><FileText className="h-4 w-4" /> Export PDF</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <SummaryCard {...card} />
          </motion.div>
        ))}
      </div>

      {!loading && data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <UtilizationChart data={data.utilizationData} />
            <DepartmentChart data={data.departmentData} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <MaintenanceTrendChart data={data.maintenanceData} />
            <BookingHeatmapChart data={data.bookingHeatmapData} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Used Assets</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Bookings</th>
                      <th className="pb-3">Utilization %</th>
                      <th className="pb-3">Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mostUsedAssets.map((row) => (
                      <tr key={row.asset} className="border-t border-border/50">
                        <td className="py-3">{row.asset}</td>
                        <td className="py-3">{row.department}</td>
                        <td className="py-3">{row.totalBookings}</td>
                        <td className="py-3">{row.utilizationPct}%</td>
                        <td className="py-3">{row.lastUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Idle Assets</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Last Used</th>
                      <th className="pb-3">Idle Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.idleAssets.map((row) => (
                      <tr key={row.asset} className="border-t border-border/50">
                        <td className="py-3">{row.asset}</td>
                        <td className="py-3">{row.department}</td>
                        <td className="py-3">{row.lastUsed}</td>
                        <td className="py-3">{row.idleDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assets Due for Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.maintenanceDue.map((row) => (
                      <tr key={row.asset} className="border-t border-border/50">
                        <td className="py-3">{row.asset}</td>
                        <td className="py-3">{row.category}</td>
                        <td className="py-3">{row.dueDate}</td>
                        <td className="py-3">{row.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assets Near Retirement</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Purchase Date</th>
                      <th className="pb-3">Age</th>
                      <th className="pb-3">Retirement Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.retirementRows.map((row) => (
                      <tr key={row.asset} className="border-t border-border/50">
                        <td className="py-3">{row.asset}</td>
                        <td className="py-3">{row.purchaseDate}</td>
                        <td className="py-3">{row.age}</td>
                        <td className="py-3">{row.retirementDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

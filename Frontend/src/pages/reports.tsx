import { motion } from 'framer-motion'
import { Download, FileText, BarChart3, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { UtilizationChart, DepartmentChart, MaintenanceTrendChart } from '@/components/shared/charts'
import { utilizationData, departmentAllocationData, maintenanceTrendData } from '@/data/mock'

const reports = [
  { title: 'Asset Inventory Report', description: 'Complete inventory listing with values and status', icon: FileText, type: 'PDF' },
  { title: 'Utilization Analysis', description: 'Asset utilization rates across departments', icon: BarChart3, type: 'Excel' },
  { title: 'Depreciation Report', description: 'Asset depreciation calculations and projections', icon: PieChart, type: 'PDF' },
  { title: 'Maintenance Summary', description: 'Maintenance costs and schedules overview', icon: FileText, type: 'Excel' },
  { title: 'Allocation Report', description: 'Current allocations and assignment history', icon: BarChart3, type: 'PDF' },
  { title: 'Audit Compliance', description: 'Audit results and compliance status', icon: FileText, type: 'PDF' },
]

export function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader description="Generate and download asset management reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card-hover h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{report.type}</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" /> Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtilizationChart data={utilizationData} />
        <DepartmentChart data={departmentAllocationData} />
      </div>
      <MaintenanceTrendChart data={maintenanceTrendData} />
    </div>
  )
}

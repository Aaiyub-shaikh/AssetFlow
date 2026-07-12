import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusChip } from '@/components/shared/status-chip'
import { QRDisplay } from '@/components/shared/qr-display'
import { Timeline } from '@/components/shared/activity-feed'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import type { TimelineEvent } from '@/types'

export function AssetDetailsPage() {
  const { id } = useParams()
  
  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => api.getAssetDetails(id || ''),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading asset details...</p>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="flex h-[400px] items-center justify-center text-danger">
        <p>Error: {error ? (error as Error).message : 'Asset not found'}</p>
      </div>
    )
  }

  // Construct dynamic timeline events based on real allocation and transfer history
  const historyEvents: TimelineEvent[] = []
  if (asset.history) {
    asset.history.allocations.forEach((alloc: any) => {
      historyEvents.push({
        id: alloc._id || alloc.id,
        title: alloc.status === 'returned' ? 'Asset Returned' : 'Asset Allocated',
        description: alloc.status === 'returned'
          ? `Returned in ${alloc.conditionOnReturn || 'good'} condition`
          : `Assigned to ${alloc.employeeName} (${alloc.department})`,
        timestamp: alloc.allocatedAt,
        type: 'allocation',
        user: alloc.employeeName,
      })
    })

    asset.history.transfers.forEach((trf: any) => {
      historyEvents.push({
        id: trf._id || trf.id,
        title: `Transfer Request ${trf.status.toUpperCase()}`,
        description: `Transfer from ${trf.fromDepartment} to ${trf.toDepartment}`,
        timestamp: trf.requestedAt,
        type: 'transfer',
        user: trf.requestedBy,
      })
    })
  }

  // Sort events by timestamp descending (newest first)
  historyEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const details = [
    { label: 'Serial Number', value: asset.serialNumber },
    { label: 'Category', value: asset.category },
    { label: 'Department', value: asset.department },
    { label: 'Location', value: asset.location },
    { label: 'Purchase Date', value: formatDate(asset.purchaseDate) },
    { label: 'Purchase Price', value: formatCurrency(asset.purchasePrice) },
    { label: 'Current Value', value: formatCurrency(asset.currentValue) },
    { label: 'Warranty Expiry', value: asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'N/A' },
    { label: 'Assigned To', value: asset.assignedTo || 'Unassigned' },
    { label: 'Last Maintenance', value: asset.lastMaintenance ? formatDate(asset.lastMaintenance) : 'N/A' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/assets">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <StatusChip status={asset.status} />
            <StatusChip status={asset.condition} />
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">{asset.tag}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button>
          <Button variant="outline" size="sm" className="text-danger hover:text-danger"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {details.map((d, i) => (
                      <motion.div
                        key={d.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-3 rounded-xl bg-white/5"
                      >
                        <p className="text-xs text-muted-foreground">{d.label}</p>
                        <p className="text-sm font-medium mt-1">{d.value}</p>
                      </motion.div>
                    ))}
                  </div>
                  {asset.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm mt-1">{asset.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeline">
              <Card>
                <CardHeader><CardTitle>Asset Timeline</CardTitle></CardHeader>
                <CardContent><Timeline events={historyEvents} /></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="maintenance">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">Next maintenance: {asset.nextMaintenance ? formatDate(asset.nextMaintenance) : 'Not scheduled'}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <QRDisplay code={asset.qrCode} label={asset.tag} />
          </Card>
        </div>
      </div>
    </div>
  )
}

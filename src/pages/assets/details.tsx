import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Tag, Calendar, DollarSign, MapPin, User, Wrench, Clock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StatusChip } from '@/components/shared/status-chip'
import { QRDisplay } from '@/components/shared/qr-display'
import { useAssetStore } from '@/stores/assetStore'
import { useAssetMaintenanceStore } from '@/stores/assetMaintenanceStore'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  available:   'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  allocated:   'bg-blue-400/15 text-blue-400 border-blue-400/30',
  reserved:    'bg-purple-400/15 text-purple-400 border-purple-400/30',
  maintenance: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  retired:     'bg-slate-400/15 text-slate-400 border-slate-400/30',
  lost:        'bg-red-400/15 text-red-400 border-red-400/30',
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-muted/30 text-muted-foreground border-border'
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export function AssetDetailsPage() {
  const { id } = useParams()
  const { assets, getAllocationsForAsset, getTransfersForAsset } = useAssetStore()
  const { maintenanceRecords } = useAssetMaintenanceStore()

  const asset = assets.find((a) => a.id === id) ?? assets[0]
  const allocHistory = getAllocationsForAsset(asset.id)
  const transferHistory = getTransfersForAsset(asset.id)
  const maintenanceHistory = maintenanceRecords.filter((m) => m.assetId === asset.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/assets">
          <Button variant="ghost" size="icon" className="shrink-0 mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{asset.name}</h1>
            <StatusPill status={asset.status} />
            <StatusChip status={asset.condition} />
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">{asset.tag}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="allocation">
                Allocation History
                {allocHistory.length > 0 && <Badge className="ml-1.5 h-4 min-w-[16px] px-1 text-[10px]">{allocHistory.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                Maintenance
                {maintenanceHistory.length > 0 && <Badge className="ml-1.5 h-4 min-w-[16px] px-1 text-[10px]">{maintenanceHistory.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="transfers">
                Transfers
                {transferHistory.length > 0 && <Badge className="ml-1.5 h-4 min-w-[16px] px-1 text-[10px]">{transferHistory.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Details tab */}
            <TabsContent value="details">
              <Card className="border-white/[0.07] bg-white/[0.02]">
                <CardContent className="pt-5">
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Tag, label: 'Serial Number', value: asset.serialNumber },
                      { icon: Package, label: 'Category', value: asset.category },
                      { icon: User, label: 'Department', value: asset.department },
                      { icon: MapPin, label: 'Location', value: asset.location },
                      { icon: Calendar, label: 'Acquisition Date', value: formatDate(asset.purchaseDate) },
                      { icon: DollarSign, label: 'Acquisition Cost', value: formatCurrency(asset.purchasePrice) },
                      { icon: DollarSign, label: 'Current Value', value: formatCurrency(asset.currentValue) },
                      { icon: Calendar, label: 'Warranty Expiry', value: formatDate(asset.warrantyExpiry) },
                      { icon: User, label: 'Assigned To', value: asset.assignedTo ?? 'Unassigned' },
                      { icon: Wrench, label: 'Last Maintenance', value: asset.lastMaintenance ? formatDate(asset.lastMaintenance) : 'N/A' },
                      { icon: Clock, label: 'Next Maintenance', value: asset.nextMaintenance ? formatDate(asset.nextMaintenance) : 'Not scheduled' },
                    ].map(({ icon, label, value }, i) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <InfoRow icon={icon} label={label} value={value} />
                      </motion.div>
                    ))}
                  </motion.div>
                  {asset.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wide">Notes</p>
                      <p className="text-sm mt-1">{asset.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Allocation history */}
            <TabsContent value="allocation">
              <Card className="border-white/[0.07] bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Allocation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allocHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No allocation records</p>
                  ) : (
                    <div className="space-y-3">
                      {allocHistory.map((a, i) => (
                        <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-400/10">
                            <User className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm">{a.employeeName}</p>
                              <span className={`text-xs rounded-full px-2 py-0.5 ${a.status === 'active' ? 'bg-emerald-400/15 text-emerald-400' : a.status === 'returned' ? 'bg-slate-400/15 text-slate-400' : 'bg-red-400/15 text-red-400'}`}>
                                {a.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.department}</p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground/70">
                              <span>Allocated: {formatDate(a.allocatedAt)}</span>
                              {a.returnDate && <span>Due: {formatDate(a.returnDate)}</span>}
                            </div>
                            {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">{a.notes}</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance history */}
            <TabsContent value="maintenance">
              <Card className="border-white/[0.07] bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" /> Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No maintenance records</p>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceHistory.map((m, i) => (
                        <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/10">
                            <Wrench className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm capitalize">{m.type} Maintenance</p>
                              <StatusChip status={m.status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground/70">
                              <span>Scheduled: {formatDate(m.scheduledDate)}</span>
                              {m.completedDate && <span>Completed: {formatDate(m.completedDate)}</span>}
                              {m.cost > 0 && <span>Cost: {formatCurrency(m.cost)}</span>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transfer history */}
            <TabsContent value="transfers">
              <Card className="border-white/[0.07] bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Transfer History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transferHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">No transfer records</p>
                  ) : (
                    <div className="space-y-3">
                      {transferHistory.map((t, i) => (
                        <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">{t.fromDepartment} → {t.toDepartment}</p>
                            <StatusChip status={t.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground/70">
                            <span>By: {t.requestedBy}</span>
                            <span>Requested: {formatDate(t.requestedAt)}</span>
                            {t.completedAt && <span>Completed: {formatDate(t.completedAt)}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="border-white/[0.07] bg-white/[0.03] p-5 flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              {asset.image ? (
                <img src={asset.image} alt={asset.name} className="h-24 w-24 object-contain rounded-xl" />
              ) : (
                <Package className="h-14 w-14 text-primary/60" />
              )}
            </div>
            <QRDisplay code={`${window.location.origin}/assets/details/${asset.id}`} label={asset.tag} />
          </Card>

          <Card className="border-white/[0.07] bg-white/[0.03]">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lifecycle Status</span>
                <StatusPill status={asset.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Condition</span>
                <StatusChip status={asset.condition} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-semibold">{formatCurrency(asset.currentValue)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Allocations</span>
                <span className="font-semibold">{allocHistory.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maintenance Records</span>
                <span className="font-semibold">{maintenanceHistory.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

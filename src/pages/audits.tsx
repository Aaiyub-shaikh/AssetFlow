import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, CheckCircle2, Trash2, ClipboardList, ShieldAlert, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { StatusChip } from '@/components/shared/status-chip'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import {
  createAuditCycle,
  getAuditCycles,
  getAuditCycleById,
  updateAuditEntry,
  closeAuditCycle,
  getAuditAuditorOptions,
  getAuditDepartmentOptions,
  generateDiscrepancyReport,
  deleteAuditCycle,
  type AuditCycle,
  type AuditEntry,
  type CreateAuditCycleInput,
} from '@/services/audit-service'

interface AuditFormState {
  name: string
  department: string
  location: string
  startDate: string
  endDate: string
  assignedAuditors: string[]
}

const initialFormState: AuditFormState = {
  name: '',
  department: '',
  location: '',
  startDate: '',
  endDate: '',
  assignedAuditors: [],
}

function AuditSummaryCard({ title, value, subtitle, icon: Icon }: { title: string; value: string | number; subtitle: string; icon: typeof ClipboardList }) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AuditsPage() {
  const [cycles, setCycles] = useState<AuditCycle[]>([])
  const [selectedCycle, setSelectedCycle] = useState<AuditCycle | null>(null)
  const [formState, setFormState] = useState<AuditFormState>(initialFormState)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [cyclePendingClosure, setCyclePendingClosure] = useState<AuditCycle | null>(null)
  const [reportEntries, setReportEntries] = useState<AuditEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void loadCycles()
  }, [])

  async function loadCycles() {
    try {
      const data = await getAuditCycles()
      setCycles(data)
    } catch {
      toast.error('Unable to load audit cycles')
    }
  }

  async function handleCreateCycle() {
    if (!formState.name || !formState.department || !formState.location || !formState.startDate || !formState.endDate || formState.assignedAuditors.length === 0) {
      toast.error('Please complete all fields and select at least one auditor')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateAuditCycleInput = {
        name: formState.name,
        department: formState.department,
        location: formState.location,
        startDate: formState.startDate,
        endDate: formState.endDate,
        assignedAuditors: formState.assignedAuditors,
        createdBy: 'System User',
      }

      const createdCycle = await createAuditCycle(payload)
      setCycles((current) => [createdCycle, ...current])
      setFormState(initialFormState)
      setDialogOpen(false)
      toast.success('Audit cycle created')
    } catch {
      toast.error('Unable to create audit cycle')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleViewCycle(cycle: AuditCycle) {
    const freshCycle = await getAuditCycleById(cycle.id)
    setSelectedCycle(freshCycle ?? cycle)
    setDetailsOpen(true)
  }

  async function handleEntryChange(cycleId: string, entryId: string, status: AuditEntry['verificationStatus'], remarks: string) {
    if (!selectedCycle || selectedCycle.status === 'Closed') return
    try {
      const updatedCycle = await updateAuditEntry(cycleId, entryId, { assetId: '', verificationStatus: status, remarks })
      if (!updatedCycle) return
      setSelectedCycle(updatedCycle)
      setCycles((current) => current.map((cycle) => (cycle.id === cycleId ? updatedCycle : cycle)))
    } catch {
      toast.error('Unable to update this audit entry')
    }
  }

  async function handleCloseCycle(cycle: AuditCycle) {
    setCyclePendingClosure(cycle)
    setCloseConfirmOpen(true)
  }

  async function confirmCloseCycle() {
    if (!cyclePendingClosure) return

    try {
      const updatedCycle = await closeAuditCycle(cyclePendingClosure.id)
      if (!updatedCycle) return
      setSelectedCycle(updatedCycle)
      setCycles((current) => current.map((item) => (item.id === cyclePendingClosure.id ? updatedCycle : item)))
      setDetailsOpen(false)
      setCloseConfirmOpen(false)
      setCyclePendingClosure(null)
      toast.success('Audit cycle closed')
    } catch {
      toast.error('Unable to close this audit cycle')
    }
  }

  async function handleGenerateReport(cycle: AuditCycle) {
    try {
      const entries = await generateDiscrepancyReport(cycle.id)
      setReportEntries(entries)
      setReportOpen(true)
    } catch {
      toast.error('Unable to generate discrepancy report')
    }
  }

  async function handleDeleteCycle(cycleId: string) {
    try {
      const deleted = await deleteAuditCycle(cycleId)
      if (deleted) {
        setCycles((current) => current.filter((cycle) => cycle.id !== cycleId))
        toast.success('Audit cycle deleted')
      }
    } catch {
      toast.error('Unable to delete audit cycle')
    }
  }

  const summaryCards = useMemo(() => {
    const total = cycles.length
    const active = cycles.filter((cycle) => cycle.status === 'Active').length
    const closed = cycles.filter((cycle) => cycle.status === 'Closed').length
    const missing = cycles.reduce((count, cycle) => count + cycle.entries.filter((entry) => entry.verificationStatus === 'Missing').length, 0)

    return [
      { title: 'Total Audit Cycles', value: total, subtitle: 'All scheduled and completed audits', icon: ClipboardList },
      { title: 'Active Audits', value: active, subtitle: 'Currently in progress', icon: ShieldAlert },
      { title: 'Closed Audits', value: closed, subtitle: 'Completed audit cycles', icon: CheckCircle2 },
      { title: 'Total Missing Assets', value: missing, subtitle: 'Assets flagged as missing', icon: FileText },
    ]
  }, [cycles])

  const historyCycles = useMemo(() => cycles.filter((cycle) => cycle.status === 'Closed'), [cycles])

  const columns: ColumnDef<AuditCycle, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Cycle Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.department}</p>
        </div>
      ),
    },
    { accessorKey: 'department', header: 'Department' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ getValue }) => formatDate(getValue<string>()) },
    { accessorKey: 'endDate', header: 'End Date', cell: ({ getValue }) => formatDate(getValue<string>()) },
    {
      accessorKey: 'assignedAuditors',
      header: 'Assigned Auditors',
      cell: ({ getValue }) => <span className="text-sm">{(getValue<string[]>() ?? []).join(', ')}</span>,
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue<string>()} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => void handleViewCycle(row.original)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => void handleGenerateReport(row.original)}><FileText className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => void handleCloseCycle(row.original)} disabled={row.original.status === 'Closed'}><CheckCircle2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => void handleDeleteCycle(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Asset Audit" description="Coordinate audit cycles, record findings, and track discrepancies">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Create Audit Cycle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Audit Cycle</DialogTitle>
              <DialogDescription>Capture the audit window, team, and scope before field verification.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cycle Name</Label>
                <Input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formState.department} onValueChange={(value) => setFormState((current) => ({ ...current, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAuditDepartmentOptions().map((department) => (<SelectItem key={department} value={department}>{department}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formState.location} onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formState.startDate} onChange={(event) => setFormState((current) => ({ ...current, startDate: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formState.endDate} onChange={(event) => setFormState((current) => ({ ...current, endDate: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Assigned Auditors</Label>
                <div className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-2">
                  {getAuditAuditorOptions().map((auditor) => (
                    <label key={auditor} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={formState.assignedAuditors.includes(auditor)} onCheckedChange={(checked) => {
                        setFormState((current) => ({
                          ...current,
                          assignedAuditors: checked ? [...current.assignedAuditors, auditor] : current.assignedAuditors.filter((item) => item !== auditor),
                        }))
                      }} />
                      {auditor}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => void handleCreateCycle()} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Cycle'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <AuditSummaryCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Audit Cycle Table</h2>
            <p className="text-sm text-muted-foreground">Manage active and historical audit cycles.</p>
          </div>
          <Button variant="outline" onClick={() => setReportOpen(true)} disabled={cycles.length === 0}><FileText className="h-4 w-4" /> Open Report</Button>
        </div>
        <DataTable columns={columns} data={cycles} searchKey="name" searchPlaceholder="Search audit cycles..." />
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Audit History</h2>
            <p className="text-sm text-muted-foreground">Previous completed audit cycles.</p>
          </div>
          <div className="rounded-full bg-success/10 px-3 py-1 text-sm text-success">{historyCycles.length} completed</div>
        </div>
        <div className="space-y-3">
          {historyCycles.map((cycle) => (
            <div key={cycle.id} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium">{cycle.name}</p>
                <p className="text-sm text-muted-foreground">{cycle.department} • Closed {formatDate(cycle.closedAt ?? cycle.endDate)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void handleViewCycle(cycle)}>Review</Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl">
          {selectedCycle ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCycle.name}</DialogTitle>
                <DialogDescription>{selectedCycle.department} • {selectedCycle.location}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Window</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{formatDate(selectedCycle.startDate)} – {formatDate(selectedCycle.endDate)}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Auditors</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{selectedCycle.assignedAuditors.join(', ')}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
                  <CardContent><StatusChip status={selectedCycle.status} /></CardContent>
                </Card>
              </div>
              <div className="rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div>
                    <h3 className="font-semibold">Audit Assets</h3>
                    <p className="text-sm text-muted-foreground">Update each asset record and capture remarks.</p>
                  </div>
                  {selectedCycle.status !== 'Closed' && (
                    <Button variant="success" onClick={() => void handleCloseCycle(selectedCycle)}><CheckCircle2 className="h-4 w-4" /> Close Cycle</Button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="p-3">Asset Name</th>
                        <th className="p-3">Tag</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCycle.entries.map((entry) => (
                        <tr key={entry.id} className="border-b border-border/50">
                          <td className="p-3">{entry.assetName}</td>
                          <td className="p-3">{entry.assetTag}</td>
                          <td className="p-3">{entry.department}</td>
                          <td className="p-3">
                            <Select value={entry.verificationStatus} disabled={selectedCycle.status === 'Closed'} onValueChange={(value) => void handleEntryChange(selectedCycle.id, entry.id, value as AuditEntry['verificationStatus'], entry.remarks)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Verified">Verified</SelectItem>
                                <SelectItem value="Missing">Missing</SelectItem>
                                <SelectItem value="Damaged">Damaged</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Textarea value={entry.remarks} disabled={selectedCycle.status === 'Closed'} onChange={(event) => {
                              const nextRemarks = event.target.value
                              setSelectedCycle((current) => current ? ({ ...current, entries: current.entries.map((item) => item.id === entry.id ? { ...item, remarks: nextRemarks } : item) }) : current)
                            }} onBlur={() => void handleEntryChange(selectedCycle.id, entry.id, entry.verificationStatus, entry.remarks)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Close audit cycle?</DialogTitle>
            <DialogDescription>This will mark the cycle as closed and disable further editing.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseConfirmOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={() => void confirmCloseCycle()}>Confirm Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Discrepancy Report</DialogTitle>
            <DialogDescription>Every missing or damaged asset is listed automatically for escalation.</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Issue</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportEntries.length === 0 ? (
                  <tr><td className="p-3 text-muted-foreground" colSpan={5}>No discrepancies found.</td></tr>
                ) : reportEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="p-3">{entry.assetName}</td>
                    <td className="p-3">{entry.assetTag}</td>
                    <td className="p-3">{entry.department}</td>
                    <td className="p-3"><StatusChip status={entry.verificationStatus} /></td>
                    <td className="p-3">{entry.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

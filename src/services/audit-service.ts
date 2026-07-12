import { assets, departments, employees } from '@/data/mock'

export type AuditCycleStatus = 'Active' | 'Closed'
export type VerificationStatus = 'Verified' | 'Missing' | 'Damaged'

export interface AuditCycle {
  id: string
  name: string
  department: string
  location: string
  startDate: string
  endDate: string
  assignedAuditors: string[]
  status: AuditCycleStatus
  createdBy: string
  closedBy?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  entries: AuditEntry[]
}

export interface AuditEntry {
  id: string
  auditCycle: string
  assetId: string
  assetName: string
  assetTag: string
  department: string
  verificationStatus: VerificationStatus
  remarks: string
  verifiedAt?: string
}

export interface CreateAuditCycleInput {
  name: string
  department: string
  location: string
  startDate: string
  endDate: string
  assignedAuditors: string[]
  createdBy?: string
}

export interface UpdateAuditEntryInput {
  assetId: string
  verificationStatus: VerificationStatus
  remarks: string
}

const delay = (ms = 220) => new Promise((resolve) => window.setTimeout(resolve, ms))

const seedCycles: AuditCycle[] = [
  {
    id: 'aud-cycle-1',
    name: 'Q1 2026 IT Assets Audit',
    department: 'IT Operations',
    location: 'HQ - Floor 3',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    assignedAuditors: ['Sarah Chen', 'Michael Torres'],
    status: 'Active',
    createdBy: 'Sarah Chen',
    createdAt: '2026-02-26T09:00:00.000Z',
    updatedAt: '2026-02-26T09:00:00.000Z',
    entries: [
      {
        id: 'entry-1',
        auditCycle: 'aud-cycle-1',
        assetId: 'ast-005',
        assetName: 'ThinkPad X1 Carbon',
        assetTag: 'AF-LPT-003',
        department: 'IT Operations',
        verificationStatus: 'Verified',
        remarks: 'Available in storage',
        verifiedAt: '2026-03-05T10:30:00.000Z',
      },
      {
        id: 'entry-2',
        auditCycle: 'aud-cycle-1',
        assetId: 'ast-006',
        assetName: 'Cisco Catalyst 9300',
        assetTag: 'AF-NET-001',
        department: 'IT Operations',
        verificationStatus: 'Missing',
        remarks: 'Switch rack missing from assigned location',
        verifiedAt: '2026-03-05T11:15:00.000Z',
      },
      {
        id: 'entry-3',
        auditCycle: 'aud-cycle-1',
        assetId: 'ast-008',
        assetName: 'HP LaserJet Pro',
        assetTag: 'AF-PRT-001',
        department: 'Facilities',
        verificationStatus: 'Damaged',
        remarks: 'Paper feeder jammed and needs replacement',
        verifiedAt: '2026-03-05T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'aud-cycle-2',
    name: 'Annual Facilities Audit',
    department: 'Facilities',
    location: 'HQ - Ground',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    assignedAuditors: ['Michael Torres', 'Robert Chen'],
    status: 'Closed',
    createdBy: 'Michael Torres',
    closedBy: 'Sarah Chen',
    closedAt: '2026-02-16T08:00:00.000Z',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-02-16T08:00:00.000Z',
    entries: [
      {
        id: 'entry-4',
        auditCycle: 'aud-cycle-2',
        assetId: 'ast-008',
        assetName: 'HP LaserJet Pro',
        assetTag: 'AF-PRT-001',
        department: 'Facilities',
        verificationStatus: 'Verified',
        remarks: 'Printer inspected and functional',
        verifiedAt: '2026-02-10T15:00:00.000Z',
      },
      {
        id: 'entry-5',
        auditCycle: 'aud-cycle-2',
        assetId: 'ast-007',
        assetName: 'Herman Miller Aeron',
        assetTag: 'AF-FUR-001',
        department: 'Engineering',
        verificationStatus: 'Damaged',
        remarks: 'Chair caster replaced',
        verifiedAt: '2026-02-12T16:15:00.000Z',
      },
    ],
  },
]

let auditCycles: AuditCycle[] = seedCycles.map((cycle) => ({ ...cycle, entries: cycle.entries.map((entry) => ({ ...entry })) }))

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildEntriesForCycle(cycle: CreateAuditCycleInput): AuditEntry[] {
  const departmentAssets = assets.filter((asset) => asset.department === cycle.department)
  const selectedAssets = departmentAssets.slice(0, 4)

  return selectedAssets.map((asset, index) => ({
    id: `entry-${Date.now()}-${index}`,
    auditCycle: '',
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.tag,
    department: asset.department,
    verificationStatus: index === 0 ? 'Verified' : 'Verified',
    remarks: 'Pending review',
  }))
}

export async function getAuditCycles(): Promise<AuditCycle[]> {
  await delay()
  return clone(auditCycles)
}

export async function getAuditCycleById(id: string): Promise<AuditCycle | undefined> {
  await delay()
  return clone(auditCycles.find((cycle) => cycle.id === id))
}

export async function createAuditCycle(input: CreateAuditCycleInput): Promise<AuditCycle> {
  await delay()
  const cycle: AuditCycle = {
    id: `aud-cycle-${Date.now()}`,
    name: input.name,
    department: input.department,
    location: input.location,
    startDate: input.startDate,
    endDate: input.endDate,
    assignedAuditors: input.assignedAuditors,
    status: 'Active',
    createdBy: input.createdBy ?? 'System User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entries: buildEntriesForCycle(input).map((entry) => ({ ...entry, auditCycle: `aud-cycle-${Date.now()}` })),
  }

  auditCycles = [cycle, ...auditCycles]
  return clone(cycle)
}

export async function updateAuditCycle(id: string, input: Partial<CreateAuditCycleInput>): Promise<AuditCycle | undefined> {
  await delay()
  const cycleIndex = auditCycles.findIndex((cycle) => cycle.id === id)
  if (cycleIndex === -1) return undefined

  auditCycles[cycleIndex] = {
    ...auditCycles[cycleIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  }

  return clone(auditCycles[cycleIndex])
}

export async function updateAuditEntry(id: string, entryId: string, input: UpdateAuditEntryInput): Promise<AuditCycle | undefined> {
  await delay()
  const cycleIndex = auditCycles.findIndex((cycle) => cycle.id === id)
  if (cycleIndex === -1) return undefined

  const cycle = auditCycles[cycleIndex]
  const entryIndex = cycle.entries.findIndex((entry) => entry.id === entryId)
  if (entryIndex === -1) return undefined

  const entry = cycle.entries[entryIndex]

  auditCycles[cycleIndex] = {
    ...auditCycles[cycleIndex],
    entries: auditCycles[cycleIndex].entries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            verificationStatus: input.verificationStatus,
            remarks: input.remarks,
            verifiedAt: new Date().toISOString(),
          }
        : entry
    ),
    updatedAt: new Date().toISOString(),
  }

  // Flag discrepancy if status is Missing or Damaged
  if (input.verificationStatus === 'Missing' || input.verificationStatus === 'Damaged') {
    const { useNotificationStore } = await import('@/stores/notificationStore')
    useNotificationStore.getState().addNotification({
      title: 'Audit Discrepancy Flagged',
      message: `Audit cycle "${cycle.name}" flagged a discrepancy for "${entry.assetName}" (${entry.assetTag}) as ${input.verificationStatus}.`,
      type: 'warning',
      link: `/audits`
    })
    useNotificationStore.getState().addActivity({
      action: 'Audit Discrepancy Flagged',
      description: `Asset "${entry.assetName}" marked as ${input.verificationStatus} in "${cycle.name}"`,
      user: 'System User',
      type: 'audit'
    })
  }

  return clone(auditCycles[cycleIndex])
}

export async function deleteAuditCycle(id: string): Promise<boolean> {
  await delay()
  const initialLength = auditCycles.length
  auditCycles = auditCycles.filter((cycle) => cycle.id !== id)
  return auditCycles.length < initialLength
}

export async function closeAuditCycle(id: string): Promise<AuditCycle | undefined> {
  await delay()
  const cycleIndex = auditCycles.findIndex((cycle) => cycle.id === id)
  if (cycleIndex === -1) return undefined

  auditCycles[cycleIndex] = {
    ...auditCycles[cycleIndex],
    status: 'Closed',
    closedBy: 'System User',
    closedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return clone(auditCycles[cycleIndex])
}

export async function generateDiscrepancyReport(id: string): Promise<AuditEntry[]> {
  await delay()
  const cycle = auditCycles.find((item) => item.id === id)
  if (!cycle) return []

  return clone(cycle.entries.filter((entry) => entry.verificationStatus === 'Missing' || entry.verificationStatus === 'Damaged'))
}

export function getAuditAuditorOptions(): string[] {
  return employees.map((employee) => employee.name)
}

export function getAuditDepartmentOptions(): string[] {
  return departments.map((department) => department.name)
}

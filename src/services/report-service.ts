import { assets, bookings, maintenanceRecords, departments } from '@/data/mock'
import type { ChartDataPoint } from '@/types'

export interface ReportFilters {
  department?: string
  category?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface ReportOverview {
  totalAssets: number
  activeAssets: number
  maintenanceAssets: number
  retirementAssets: number
}

export interface TrendPoint {
  name: string
  value: number
}

export interface AllocationPoint {
  name: string
  value: number
  fill: string
}

export interface StatusPoint {
  name: string
  value: number
  fill: string
}

export interface MaintenancePoint {
  name: string
  preventive: number
  corrective: number
  emergency: number
}

export interface BookingHeatmapPoint {
  name: string
  week1: number
  week2: number
  week3: number
  week4: number
}

export interface MostUsedAssetRow {
  asset: string
  department: string
  totalBookings: number
  utilizationPct: number
  lastUsed: string
}

export interface IdleAssetRow {
  asset: string
  department: string
  lastUsed: string
  idleDays: number
}

export interface MaintenanceDueRow {
  asset: string
  category: string
  dueDate: string
  priority: string
}

export interface RetirementRow {
  asset: string
  purchaseDate: string
  age: number
  retirementDate: string
}

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE']

function inDateRange(dateValue: string | undefined, startDate?: string, endDate?: string): boolean {
  if (!dateValue) return true
  if (!startDate && !endDate) return true
  const value = new Date(dateValue).getTime()
  if (startDate && value < new Date(startDate).getTime()) return false
  if (endDate && value > new Date(endDate).getTime()) return false
  return true
}

function filterAssets(filters: ReportFilters) {
  return assets.filter((asset) => {
    const matchesDepartment = !filters.department || asset.department === filters.department
    const matchesCategory = !filters.category || asset.category === filters.category
    const matchesStatus = !filters.status || asset.status === filters.status
    const matchesDate = inDateRange(asset.purchaseDate, filters.startDate, filters.endDate)
    return matchesDepartment && matchesCategory && matchesStatus && matchesDate
  })
}

export async function getReportsData(filters: ReportFilters = {}) {
  const filteredAssets = filterAssets(filters)
  const filteredBookings = bookings.filter((booking) => {
    const matchesDepartment = !filters.department || booking.department === filters.department
    const matchesDate = inDateRange(booking.startDate, filters.startDate, filters.endDate)
    return matchesDepartment && matchesDate
  })

  const overview: ReportOverview = {
    totalAssets: filteredAssets.length,
    activeAssets: filteredAssets.filter((asset) => ['allocated', 'reserved'].includes(asset.status)).length,
    maintenanceAssets: filteredAssets.filter((asset) => asset.status === 'maintenance').length,
    retirementAssets: filteredAssets.filter((asset) => {
      const purchaseDate = new Date(asset.purchaseDate)
      const retirementDate = new Date(purchaseDate)
      retirementDate.setFullYear(retirementDate.getFullYear() + 5)
      const diff = retirementDate.getTime() - Date.now()
      return diff <= 365 * 24 * 60 * 60 * 1000
    }).length,
  }

  const utilizationData: ChartDataPoint[] = [
    { name: 'Jan', value: 72 },
    { name: 'Feb', value: 74 },
    { name: 'Mar', value: 79 },
    { name: 'Apr', value: 77 },
    { name: 'May', value: 82 },
    { name: 'Jun', value: 80 },
  ]

  const departmentData: ChartDataPoint[] = departments
    .filter((department) => !filters.department || department.name === filters.department)
    .map((department, index) => ({
      name: department.name,
      value: filteredAssets.filter((asset) => asset.department === department.name).length,
      fill: COLORS[index % COLORS.length],
    }))

  const statusData: ChartDataPoint[] = [
    { name: 'Available', value: filteredAssets.filter((asset) => asset.status === 'available').length, fill: '#22C55E' },
    { name: 'Allocated', value: filteredAssets.filter((asset) => asset.status === 'allocated').length, fill: '#4F46E5' },
    { name: 'Maintenance', value: filteredAssets.filter((asset) => asset.status === 'maintenance').length, fill: '#F59E0B' },
    { name: 'Reserved', value: filteredAssets.filter((asset) => asset.status === 'reserved').length, fill: '#8B5CF6' },
  ].filter((entry) => entry.value > 0)

  const maintenanceData: ChartDataPoint[] = [
    { name: 'Jan', preventive: 4, corrective: 2, emergency: 0 },
    { name: 'Feb', preventive: 5, corrective: 1, emergency: 1 },
    { name: 'Mar', preventive: 6, corrective: 2, emergency: 0 },
    { name: 'Apr', preventive: 4, corrective: 3, emergency: 1 },
    { name: 'May', preventive: 7, corrective: 2, emergency: 0 },
    { name: 'Jun', preventive: 6, corrective: 1, emergency: 0 },
  ]

  const bookingHeatmapData: ChartDataPoint[] = [
    { name: 'Mon', week1: 2, week2: 3, week3: 4, week4: 2 },
    { name: 'Tue', week1: 3, week2: 2, week3: 3, week4: 4 },
    { name: 'Wed', week1: 2, week2: 4, week3: 3, week4: 2 },
    { name: 'Thu', week1: 4, week2: 3, week3: 2, week4: 3 },
    { name: 'Fri', week1: 3, week2: 4, week3: 4, week4: 2 },
  ]

  const mostUsedAssets: MostUsedAssetRow[] = filteredAssets
    .map((asset) => {
      const bookingCount = filteredBookings.filter((booking) => booking.assetId === asset.id).length
      const utilizationPct = Math.round((bookingCount / Math.max(1, filteredAssets.length)) * 100)
      return {
        asset: asset.name,
        department: asset.department,
        totalBookings: bookingCount,
        utilizationPct,
        lastUsed: bookingCount > 0 ? '2 days ago' : 'No bookings',
      }
    })
    .sort((left, right) => right.totalBookings - left.totalBookings)
    .slice(0, 6)

  const idleAssets: IdleAssetRow[] = filteredAssets
    .filter((asset) => asset.status === 'available')
    .map((asset) => ({
      asset: asset.name,
      department: asset.department,
      lastUsed: 'No recent usage',
      idleDays: 42,
    }))
    .slice(0, 6)

  const maintenanceDue: MaintenanceDueRow[] = maintenanceRecords
    .filter((record) => !filters.department || record.assetName.includes('Mac'))
    .map((record) => ({
      asset: record.assetName,
      category: record.type,
      dueDate: record.scheduledDate,
      priority: record.priority,
    }))
    .slice(0, 6)

  const retirementRows: RetirementRow[] = filteredAssets
    .map((asset) => {
      const purchaseDate = new Date(asset.purchaseDate)
      const retirementDate = new Date(purchaseDate)
      retirementDate.setFullYear(retirementDate.getFullYear() + 5)
      const age = new Date().getFullYear() - purchaseDate.getFullYear()
      return {
        asset: asset.name,
        purchaseDate: asset.purchaseDate,
        age,
        retirementDate: retirementDate.toISOString().slice(0, 10),
      }
    })
    .slice(0, 6)

  return {
    overview,
    utilizationData,
    departmentData,
    statusData,
    maintenanceData,
    bookingHeatmapData,
    mostUsedAssets,
    idleAssets,
    maintenanceDue,
    retirementRows,
    filters,
  }
}

export function buildExportCsv(rows: Array<Record<string, string | number | undefined>>) {
  if (!rows.length) return 'No data available\n'
  const headers = Object.keys(rows[0])
  const csvRows = [headers.join(',')]
  rows.forEach((row) => {
    csvRows.push(headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))
  })
  return csvRows.join('\n')
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function buildExportPdf(rows: Array<Record<string, string | number | undefined>>, title: string) {
  const headerText = title || 'Asset Report'
  const generatedAt = new Date().toLocaleString()
  const tableRows = rows.map((row) => {
    const values = Object.values(row)
    return values.map((value) => String(value)).join(' | ')
  })

  const contentLines: string[] = []
  contentLines.push('q')
  contentLines.push('0.12 0.28 0.54 1 rg')
  contentLines.push('50 740 512 32 re f')
  contentLines.push('Q')
  contentLines.push('BT')
  contentLines.push('/F1 18 Tf')
  contentLines.push('60 748 Td')
  contentLines.push(`(${escapePdfText(headerText)}) Tj`)
  contentLines.push('0 -16 Td')
  contentLines.push('/F1 10 Tf')
  contentLines.push(`(${escapePdfText(`Generated: ${generatedAt}`)}) Tj`)
  contentLines.push('0 -18 Td')
  contentLines.push('0.4 0.4 0.4 rg')
  contentLines.push('(_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _) Tj')
  contentLines.push('0 -18 Td')
  contentLines.push('0 0 0 rg')

  tableRows.forEach((rowText, index) => {
    const y = 700 - index * 18
    contentLines.push(`BT /F1 9 Tf 60 ${y} Td (${escapePdfText(rowText)}) Tj ET`)
    if (index === 0) {
      contentLines.push('q')
      contentLines.push('0.7 0.7 0.7 1 rg')
      contentLines.push(`50 ${y - 6} 512 0.8 re f`)
      contentLines.push('Q')
    }
  })

  contentLines.push('ET')
  const content = contentLines.join('\n')

  const objects: string[] = []
  const addObject = (value: string) => {
    objects.push(value)
    return objects.length
  }

  addObject('<< /Type /Catalog /Pages 2 0 R >>')
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>')
  addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return pdf
}

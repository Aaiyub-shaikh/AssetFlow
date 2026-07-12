export type AssetStatus = 'available' | 'allocated' | 'reserved' | 'maintenance' | 'retired' | 'lost'
export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue'
export type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'overdue'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'admin' | 'manager' | 'employee'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  department: string
  position: string
  phone?: string
  joinedAt: string
}

export interface Organization {
  id: string
  name: string
  logo?: string
  industry: string
  employees: number
  locations: number
  founded: string
  website: string
  address: string
}

export interface Department {
  id: string
  name: string
  code: string
  head: string
  headEmail: string
  employees: number
  assets: number
  budget: number
  location: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  code: string
  description: string
  assets: number
  depreciationRate: number
  warrantyPeriod: number
  icon: string
}

export interface Asset {
  id: string
  name: string
  tag: string
  serialNumber: string
  category: string
  categoryId: string
  department: string
  departmentId: string
  status: AssetStatus
  assignedTo?: string
  assignedToId?: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  warrantyExpiry: string
  location: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  lastMaintenance?: string
  nextMaintenance?: string
  image?: string
  qrCode: string
  notes?: string
}

export interface Allocation {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  employeeId: string
  employeeName: string
  department: string
  allocatedAt: string
  returnDate?: string
  status: 'active' | 'returned' | 'overdue'
  notes?: string
}

export interface Transfer {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  fromDepartment: string
  toDepartment: string
  requestedBy: string
  requestedAt: string
  status: TransferStatus
  priority: Priority
  reason: string
  approvedBy?: string
  completedAt?: string
}

export interface Booking {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  bookedBy: string
  bookedById: string
  department: string
  startDate: string
  endDate: string
  status: BookingStatus
  purpose: string
  location: string
}

export interface MaintenanceRecord {
  id: string
  assetId: string
  assetName: string
  assetTag: string
  type: 'preventive' | 'corrective' | 'emergency'
  status: MaintenanceStatus
  scheduledDate: string
  completedDate?: string
  assignedTo: string
  cost: number
  description: string
  priority: Priority
}

export interface Audit {
  id: string
  title: string
  department: string
  status: AuditStatus
  startDate: string
  endDate: string
  auditor: string
  totalAssets: number
  verifiedAssets: number
  discrepancies: number
  notes?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

export interface Activity {
  id: string
  action: string
  description: string
  user: string
  userAvatar?: string
  timestamp: string
  type: 'allocation' | 'transfer' | 'maintenance' | 'audit' | 'booking' | 'asset'
}

export interface DashboardKPI {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

export interface ChartDataPoint {
  name: string
  value?: number
  [key: string]: string | number | undefined
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'allocation' | 'maintenance' | 'transfer' | 'audit' | 'update'
  user: string
}

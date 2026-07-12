import type {
  User, Organization, Department, Category, Asset, Allocation,
  Transfer, MaintenanceRecord, Audit, Notification, Activity,
  DashboardKPI, ChartDataPoint, TimelineEvent,
} from '@/types'
import type { Resource } from '@/types/booking'

export const currentUser: User = {
  id: 'usr-001',
  name: 'Sarah Chen',
  email: 'sarah.chen@assetflow.io',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  role: 'admin',
  department: 'IT Operations',
  position: 'Asset Manager',
  phone: '+1 (555) 123-4567',
  joinedAt: '2022-03-15',
}

export const resources: Resource[] = [
  { _id: 'res-001', name: 'Boardroom Alpha', type: 'conference_hall', location: 'HQ - Floor 5', capacity: 20, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { _id: 'res-002', name: 'Meeting Room Beta', type: 'meeting_room', location: 'HQ - Floor 4', capacity: 8, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { _id: 'res-003', name: 'Creative Workspace', type: 'workspace', location: 'HQ - Floor 3', capacity: 15, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { _id: 'res-004', name: 'Projector Pro', type: 'equipment', location: 'IT Storage', capacity: 1, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const organization: Organization = {
  id: 'org-001',
  name: 'AssetFlow Technologies',
  industry: 'Technology & Software',
  employees: 1247,
  locations: 8,
  founded: '2018',
  website: 'https://assetflow.io',
  address: '100 Innovation Drive, San Francisco, CA 94105',
}

export const departments: Department[] = [
  { id: 'dept-001', name: 'IT Operations', code: 'ITO', head: 'Michael Torres', headEmail: 'm.torres@assetflow.io', employees: 45, assets: 312, budget: 850000, location: 'HQ - Floor 3', createdAt: '2018-06-01' },
  { id: 'dept-002', name: 'Engineering', code: 'ENG', head: 'Priya Sharma', headEmail: 'p.sharma@assetflow.io', employees: 128, assets: 456, budget: 1200000, location: 'HQ - Floor 4', createdAt: '2018-06-01' },
  { id: 'dept-003', name: 'Human Resources', code: 'HR', head: 'James Wilson', headEmail: 'j.wilson@assetflow.io', employees: 22, assets: 89, budget: 320000, location: 'HQ - Floor 2', createdAt: '2018-08-15' },
  { id: 'dept-004', name: 'Finance', code: 'FIN', head: 'Emily Rodriguez', headEmail: 'e.rodriguez@assetflow.io', employees: 35, assets: 156, budget: 540000, location: 'HQ - Floor 2', createdAt: '2018-06-01' },
  { id: 'dept-005', name: 'Marketing', code: 'MKT', head: 'David Kim', headEmail: 'd.kim@assetflow.io', employees: 48, assets: 198, budget: 680000, location: 'HQ - Floor 5', createdAt: '2019-01-10' },
  { id: 'dept-006', name: 'Sales', code: 'SLS', head: 'Lisa Anderson', headEmail: 'l.anderson@assetflow.io', employees: 67, assets: 234, budget: 920000, location: 'HQ - Floor 5', createdAt: '2018-09-01' },
  { id: 'dept-007', name: 'Facilities', code: 'FAC', head: 'Robert Chen', headEmail: 'r.chen@assetflow.io', employees: 18, assets: 567, budget: 1100000, location: 'HQ - Ground', createdAt: '2018-06-01' },
  { id: 'dept-008', name: 'Legal', code: 'LGL', head: 'Amanda Foster', headEmail: 'a.foster@assetflow.io', employees: 12, assets: 45, budget: 280000, location: 'HQ - Floor 2', createdAt: '2019-03-20' },
]

export const categories: Category[] = [
  { id: 'cat-001', name: 'Laptops & Computers', code: 'LPT', description: 'Portable and desktop computing devices', assets: 342, depreciationRate: 25, warrantyPeriod: 36, icon: 'Laptop' },
  { id: 'cat-002', name: 'Monitors & Displays', code: 'MON', description: 'External displays and projectors', assets: 289, depreciationRate: 20, warrantyPeriod: 24, icon: 'Monitor' },
  { id: 'cat-003', name: 'Mobile Devices', code: 'MOB', description: 'Smartphones and tablets', assets: 156, depreciationRate: 30, warrantyPeriod: 12, icon: 'Smartphone' },
  { id: 'cat-004', name: 'Network Equipment', code: 'NET', description: 'Routers, switches, and access points', assets: 89, depreciationRate: 15, warrantyPeriod: 60, icon: 'Wifi' },
  { id: 'cat-005', name: 'Office Furniture', code: 'FUR', description: 'Desks, chairs, and storage units', assets: 445, depreciationRate: 10, warrantyPeriod: 120, icon: 'Armchair' },
  { id: 'cat-006', name: 'Vehicles', code: 'VEH', description: 'Company cars and fleet vehicles', assets: 24, depreciationRate: 20, warrantyPeriod: 36, icon: 'Car' },
  { id: 'cat-007', name: 'Software Licenses', code: 'SFT', description: 'Software subscriptions and licenses', assets: 178, depreciationRate: 100, warrantyPeriod: 12, icon: 'Code' },
  { id: 'cat-008', name: 'Printers & Scanners', code: 'PRT', description: 'Printing and scanning equipment', assets: 67, depreciationRate: 20, warrantyPeriod: 24, icon: 'Printer' },
]

export const employees: User[] = [
  { id: 'emp-001', name: 'Michael Torres', email: 'm.torres@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', role: 'manager', department: 'IT Operations', position: 'IT Director', joinedAt: '2018-06-01' },
  { id: 'emp-002', name: 'Priya Sharma', email: 'p.sharma@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', role: 'manager', department: 'Engineering', position: 'VP Engineering', joinedAt: '2018-06-01' },
  { id: 'emp-003', name: 'James Wilson', email: 'j.wilson@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', role: 'manager', department: 'Human Resources', position: 'HR Director', joinedAt: '2018-08-15' },
  { id: 'emp-004', name: 'Emily Rodriguez', email: 'e.rodriguez@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', role: 'manager', department: 'Finance', position: 'CFO', joinedAt: '2018-06-01' },
  { id: 'emp-005', name: 'David Kim', email: 'd.kim@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', role: 'manager', department: 'Marketing', position: 'CMO', joinedAt: '2019-01-10' },
  { id: 'emp-006', name: 'Lisa Anderson', email: 'l.anderson@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', role: 'manager', department: 'Sales', position: 'Sales Director', joinedAt: '2018-09-01' },
  { id: 'emp-007', name: 'Alex Johnson', email: 'a.johnson@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', role: 'employee', department: 'Engineering', position: 'Senior Developer', joinedAt: '2020-02-15' },
  { id: 'emp-008', name: 'Maria Garcia', email: 'm.garcia@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', role: 'employee', department: 'Engineering', position: 'Frontend Developer', joinedAt: '2021-06-01' },
  { id: 'emp-009', name: 'Tom Bradley', email: 't.bradley@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', role: 'employee', department: 'IT Operations', position: 'Systems Admin', joinedAt: '2019-11-20' },
  { id: 'emp-010', name: 'Nina Patel', email: 'n.patel@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina', role: 'employee', department: 'Marketing', position: 'Content Strategist', joinedAt: '2022-01-10' },
  { id: 'emp-011', name: 'Chris Lee', email: 'c.lee@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris', role: 'employee', department: 'Sales', position: 'Account Executive', joinedAt: '2021-03-15' },
  { id: 'emp-012', name: 'Rachel Green', email: 'r.green@assetflow.io', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', role: 'employee', department: 'Finance', position: 'Financial Analyst', joinedAt: '2020-08-01' },
]

export const assets: Asset[] = [
  { id: 'ast-001', name: 'MacBook Pro 16" M3', tag: 'AF-LPT-001', serialNumber: 'C02XL0ABCDEF', category: 'Laptops & Computers', categoryId: 'cat-001', department: 'Engineering', departmentId: 'dept-002', status: 'allocated', assignedTo: 'Alex Johnson', assignedToId: 'emp-007', purchaseDate: '2024-01-15', purchasePrice: 3499, currentValue: 2800, warrantyExpiry: '2027-01-15', location: 'HQ - Floor 4', condition: 'excellent', lastMaintenance: '2025-06-01', nextMaintenance: '2026-06-01', qrCode: 'AF-LPT-001', notes: 'Primary dev machine' },
  { id: 'ast-002', name: 'Dell UltraSharp 27" 4K', tag: 'AF-MON-001', serialNumber: 'DELL-US27-001', category: 'Monitors & Displays', categoryId: 'cat-002', department: 'Engineering', departmentId: 'dept-002', status: 'allocated', assignedTo: 'Alex Johnson', assignedToId: 'emp-007', purchaseDate: '2024-01-15', purchasePrice: 699, currentValue: 550, warrantyExpiry: '2026-01-15', location: 'HQ - Floor 4', condition: 'excellent', qrCode: 'AF-MON-001' },
  { id: 'ast-003', name: 'MacBook Air M2', tag: 'AF-LPT-002', serialNumber: 'C02YL0GHIJKL', category: 'Laptops & Computers', categoryId: 'cat-001', department: 'Marketing', departmentId: 'dept-005', status: 'allocated', assignedTo: 'Nina Patel', assignedToId: 'emp-010', purchaseDate: '2023-08-20', purchasePrice: 1299, currentValue: 900, warrantyExpiry: '2026-08-20', location: 'HQ - Floor 5', condition: 'good', qrCode: 'AF-LPT-002' },
  { id: 'ast-004', name: 'iPhone 15 Pro', tag: 'AF-MOB-001', serialNumber: 'IPH15P-001', category: 'Mobile Devices', categoryId: 'cat-003', department: 'Sales', departmentId: 'dept-006', status: 'allocated', assignedTo: 'Chris Lee', assignedToId: 'emp-011', purchaseDate: '2024-03-01', purchasePrice: 1199, currentValue: 850, warrantyExpiry: '2025-03-01', location: 'HQ - Floor 5', condition: 'excellent', qrCode: 'AF-MOB-001' },
  { id: 'ast-005', name: 'ThinkPad X1 Carbon', tag: 'AF-LPT-003', serialNumber: 'TPX1C-2024-001', category: 'Laptops & Computers', categoryId: 'cat-001', department: 'IT Operations', departmentId: 'dept-001', status: 'available', purchaseDate: '2024-06-10', purchasePrice: 1899, currentValue: 1600, warrantyExpiry: '2027-06-10', location: 'HQ - Floor 3', condition: 'excellent', qrCode: 'AF-LPT-003' },
  { id: 'ast-006', name: 'Cisco Catalyst 9300', tag: 'AF-NET-001', serialNumber: 'CAT9300-001', category: 'Network Equipment', categoryId: 'cat-004', department: 'IT Operations', departmentId: 'dept-001', status: 'maintenance', purchaseDate: '2022-01-01', purchasePrice: 8500, currentValue: 6000, warrantyExpiry: '2027-01-01', location: 'HQ - Server Room', condition: 'good', lastMaintenance: '2025-12-01', nextMaintenance: '2026-03-01', qrCode: 'AF-NET-001' },
  { id: 'ast-007', name: 'Herman Miller Aeron', tag: 'AF-FUR-001', serialNumber: 'HM-AERON-001', category: 'Office Furniture', categoryId: 'cat-005', department: 'Engineering', departmentId: 'dept-002', status: 'allocated', assignedTo: 'Maria Garcia', assignedToId: 'emp-008', purchaseDate: '2023-03-15', purchasePrice: 1395, currentValue: 1100, warrantyExpiry: '2033-03-15', location: 'HQ - Floor 4', condition: 'excellent', qrCode: 'AF-FUR-001' },
  { id: 'ast-008', name: 'HP LaserJet Pro', tag: 'AF-PRT-001', serialNumber: 'HPLJ-2023-001', category: 'Printers & Scanners', categoryId: 'cat-008', department: 'Facilities', departmentId: 'dept-007', status: 'available', purchaseDate: '2023-05-01', purchasePrice: 449, currentValue: 300, warrantyExpiry: '2025-05-01', location: 'HQ - Floor 2', condition: 'good', qrCode: 'AF-PRT-001' },
  { id: 'ast-009', name: 'Tesla Model 3', tag: 'AF-VEH-001', serialNumber: 'TSL-M3-2024', category: 'Vehicles', categoryId: 'cat-006', department: 'Sales', departmentId: 'dept-006', status: 'allocated', assignedTo: 'Lisa Anderson', assignedToId: 'emp-006', purchaseDate: '2024-02-01', purchasePrice: 45000, currentValue: 38000, warrantyExpiry: '2027-02-01', location: 'HQ Parking', condition: 'excellent', qrCode: 'AF-VEH-001' },
  { id: 'ast-010', name: 'Adobe Creative Cloud', tag: 'AF-SFT-001', serialNumber: 'ACC-ENT-001', category: 'Software Licenses', categoryId: 'cat-007', department: 'Marketing', departmentId: 'dept-005', status: 'allocated', assignedTo: 'David Kim', assignedToId: 'emp-005', purchaseDate: '2024-01-01', purchasePrice: 3600, currentValue: 2400, warrantyExpiry: '2025-12-31', location: 'Cloud', condition: 'excellent', qrCode: 'AF-SFT-001' },
  { id: 'ast-011', name: 'MacBook Pro 14" M3', tag: 'AF-LPT-004', serialNumber: 'C02ZL0MNOPQR', category: 'Laptops & Computers', categoryId: 'cat-001', department: 'Engineering', departmentId: 'dept-002', status: 'reserved', purchaseDate: '2024-09-01', purchasePrice: 2499, currentValue: 2200, warrantyExpiry: '2027-09-01', location: 'HQ - Floor 4', condition: 'excellent', qrCode: 'AF-LPT-004' },
  { id: 'ast-012', name: 'Samsung Galaxy Tab S9', tag: 'AF-MOB-002', serialNumber: 'SGT-S9-001', category: 'Mobile Devices', categoryId: 'cat-003', department: 'Sales', departmentId: 'dept-006', status: 'available', purchaseDate: '2024-04-15', purchasePrice: 799, currentValue: 650, warrantyExpiry: '2025-04-15', location: 'HQ - Floor 5', condition: 'excellent', qrCode: 'AF-MOB-002' },
]

export const allocations: Allocation[] = [
  { id: 'alc-001', assetId: 'ast-001', assetName: 'MacBook Pro 16" M3', assetTag: 'AF-LPT-001', employeeId: 'emp-007', employeeName: 'Alex Johnson', department: 'Engineering', allocatedAt: '2024-01-20', status: 'active' },
  { id: 'alc-002', assetId: 'ast-003', assetName: 'MacBook Air M2', assetTag: 'AF-LPT-002', employeeId: 'emp-010', employeeName: 'Nina Patel', department: 'Marketing', allocatedAt: '2023-08-25', status: 'active' },
  { id: 'alc-003', assetId: 'ast-004', assetName: 'iPhone 15 Pro', assetTag: 'AF-MOB-001', employeeId: 'emp-011', employeeName: 'Chris Lee', department: 'Sales', allocatedAt: '2024-03-05', status: 'active' },
  { id: 'alc-004', assetId: 'ast-009', assetName: 'Tesla Model 3', assetTag: 'AF-VEH-001', employeeId: 'emp-006', employeeName: 'Lisa Anderson', department: 'Sales', allocatedAt: '2024-02-10', status: 'active' },
  { id: 'alc-005', assetId: 'ast-007', assetName: 'Herman Miller Aeron', assetTag: 'AF-FUR-001', employeeId: 'emp-008', employeeName: 'Maria Garcia', department: 'Engineering', allocatedAt: '2023-03-20', status: 'active' },
  { id: 'alc-006', assetId: 'ast-002', assetName: 'Dell UltraSharp 27" 4K', assetTag: 'AF-MON-001', employeeId: 'emp-007', employeeName: 'Alex Johnson', department: 'Engineering', allocatedAt: '2024-01-20', returnDate: '2026-01-20', status: 'active' },
]

export const transfers: Transfer[] = [
  { id: 'trf-001', assetId: 'ast-005', assetName: 'ThinkPad X1 Carbon', assetTag: 'AF-LPT-003', fromDepartment: 'IT Operations', toDepartment: 'Engineering', requestedBy: 'Priya Sharma', requestedAt: '2026-03-01', status: 'pending', priority: 'medium', reason: 'New developer onboarding' },
  { id: 'trf-002', assetId: 'ast-012', assetName: 'Samsung Galaxy Tab S9', assetTag: 'AF-MOB-002', fromDepartment: 'Sales', toDepartment: 'Marketing', requestedBy: 'David Kim', requestedAt: '2026-03-05', status: 'approved', priority: 'low', reason: 'Trade show presentation device', approvedBy: 'Lisa Anderson' },
  { id: 'trf-003', assetId: 'ast-008', assetName: 'HP LaserJet Pro', assetTag: 'AF-PRT-001', fromDepartment: 'Facilities', toDepartment: 'Finance', requestedBy: 'Emily Rodriguez', requestedAt: '2026-02-28', status: 'in_transit', priority: 'high', reason: 'Department printer replacement', approvedBy: 'Robert Chen' },
  { id: 'trf-004', assetId: 'ast-011', assetName: 'MacBook Pro 14" M3', assetTag: 'AF-LPT-004', fromDepartment: 'Engineering', toDepartment: 'IT Operations', requestedBy: 'Michael Torres', requestedAt: '2026-02-20', status: 'completed', priority: 'medium', reason: 'IT team expansion', approvedBy: 'Priya Sharma', completedAt: '2026-02-25' },
]

export const bookings: any[] = [
  {
    _id: 'bkg-001', id: 'bkg-001',
    resource: resources[0],
    title: 'Q2 Planning Session',
    description: 'Quarterly planning with department heads',
    bookedBy: { _id: 'usr-001', name: 'Sarah Chen', email: 'sarah.chen@assetflow.io' },
    attendees: [{ _id: 'emp-002', name: 'Michael Torres', email: 'm.torres@assetflow.io' }],
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T09:00:00.000Z'),
    endTime:   new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T10:30:00.000Z'),
    status: 'upcoming',
    reminderSent: false,
    reminderTime: 15,
    isCancellationAllowed: true,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    _id: 'bkg-002', id: 'bkg-002',
    resource: resources[1],
    title: 'Client Demo Walkthrough',
    description: 'Demonstrate AssetFlow features to new client',
    bookedBy: { _id: 'emp-010', name: 'Nina Patel', email: 'n.patel@assetflow.io' },
    attendees: [],
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T14:00:00.000Z'),
    endTime:   new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T15:00:00.000Z'),
    status: 'upcoming',
    reminderSent: false,
    reminderTime: 30,
    isCancellationAllowed: true,
    createdAt: '2026-07-02T08:00:00Z',
    updatedAt: '2026-07-02T08:00:00Z',
  },
  {
    _id: 'bkg-003', id: 'bkg-003',
    resource: resources[2],
    title: 'Design Sprint Day 2',
    description: 'UX design workshop for mobile app',
    bookedBy: { _id: 'emp-011', name: 'Chris Lee', email: 'c.lee@assetflow.io' },
    attendees: [{ _id: 'emp-012', name: 'Rachel Green', email: 'r.green@assetflow.io' }],
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime:   new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'ongoing',
    reminderSent: true,
    reminderTime: 15,
    isCancellationAllowed: false,
    createdAt: '2026-07-05T07:00:00Z',
    updatedAt: '2026-07-05T07:00:00Z',
  },
  {
    _id: 'bkg-004', id: 'bkg-004',
    resource: resources[0],
    title: 'All-Hands Meeting',
    description: 'Monthly company-wide update',
    bookedBy: { _id: 'usr-001', name: 'Sarah Chen', email: 'sarah.chen@assetflow.io' },
    attendees: [],
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T10:00:00.000Z'),
    endTime:   new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T11:30:00.000Z'),
    status: 'completed',
    reminderSent: true,
    reminderTime: 15,
    isCancellationAllowed: false,
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-07T11:30:00Z',
  },
  {
    _id: 'bkg-005', id: 'bkg-005',
    resource: resources[1],
    title: '1:1 Performance Review',
    description: 'Cancelled due to travel conflict',
    bookedBy: { _id: 'emp-008', name: 'Maria Garcia', email: 'm.garcia@assetflow.io' },
    attendees: [],
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T15:00:00.000Z'),
    endTime:   new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T.*/, 'T16:00:00.000Z'),
    status: 'cancelled',
    reminderSent: false,
    reminderTime: 15,
    isCancellationAllowed: false,
    cancellationReason: 'Travel conflict',
    createdAt: '2026-07-03T10:00:00Z',
    updatedAt: '2026-07-09T08:00:00Z',
  },
]

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: 'mnt-001', assetId: 'ast-006', assetName: 'Cisco Catalyst 9300', assetTag: 'AF-NET-001', type: 'preventive', status: 'in_progress', scheduledDate: '2026-03-10', assignedTo: 'Tom Bradley', cost: 2500, description: 'Firmware update and port diagnostics', priority: 'high' },
  { id: 'mnt-002', assetId: 'ast-001', assetName: 'MacBook Pro 16" M3', assetTag: 'AF-LPT-001', type: 'preventive', status: 'scheduled', scheduledDate: '2026-06-01', assignedTo: 'Tom Bradley', cost: 0, description: 'Annual hardware inspection', priority: 'low' },
  { id: 'mnt-003', assetId: 'ast-009', assetName: 'Tesla Model 3', assetTag: 'AF-VEH-001', type: 'preventive', status: 'scheduled', scheduledDate: '2026-04-01', assignedTo: 'Robert Chen', cost: 800, description: 'Scheduled tire rotation and inspection', priority: 'medium' },
  { id: 'mnt-004', assetId: 'ast-008', assetName: 'HP LaserJet Pro', assetTag: 'AF-PRT-001', type: 'corrective', status: 'completed', scheduledDate: '2026-02-15', completedDate: '2026-02-16', assignedTo: 'Tom Bradley', cost: 150, description: 'Paper jam mechanism repair', priority: 'medium' },
  { id: 'mnt-005', assetId: 'ast-003', assetName: 'MacBook Air M2', assetTag: 'AF-LPT-002', type: 'corrective', status: 'overdue', scheduledDate: '2026-02-01', assignedTo: 'Tom Bradley', cost: 0, description: 'Battery health check - overdue', priority: 'high' },
]

export const audits: Audit[] = [
  { id: 'aud-001', title: 'Q1 2026 IT Assets Audit', department: 'IT Operations', status: 'in_progress', startDate: '2026-03-01', endDate: '2026-03-31', auditor: 'Sarah Chen', totalAssets: 312, verifiedAssets: 198, discrepancies: 3 },
  { id: 'aud-002', title: 'Q1 2026 Engineering Audit', department: 'Engineering', status: 'planned', startDate: '2026-04-01', endDate: '2026-04-30', auditor: 'Sarah Chen', totalAssets: 456, verifiedAssets: 0, discrepancies: 0 },
  { id: 'aud-003', title: 'Annual Facilities Audit', department: 'Facilities', status: 'completed', startDate: '2026-01-15', endDate: '2026-02-15', auditor: 'Michael Torres', totalAssets: 567, verifiedAssets: 562, discrepancies: 5, notes: '5 missing chair casters reported' },
  { id: 'aud-004', title: 'Mobile Devices Spot Check', department: 'Sales', status: 'overdue', startDate: '2026-02-01', endDate: '2026-02-28', auditor: 'Sarah Chen', totalAssets: 234, verifiedAssets: 145, discrepancies: 2 },
]

export const notifications: Notification[] = [
  { id: 'ntf-001', title: 'Transfer Request Approved', message: 'Transfer of Samsung Galaxy Tab S9 to Marketing has been approved.', type: 'success', read: false, createdAt: '2026-03-06T10:30:00Z', link: '/transfers' },
  { id: 'ntf-002', title: 'Maintenance Overdue', message: 'MacBook Air M2 (AF-LPT-002) maintenance is overdue by 5 weeks.', type: 'warning', read: false, createdAt: '2026-03-05T14:15:00Z', link: '/maintenance' },
  { id: 'ntf-003', title: 'New Asset Registered', message: 'MacBook Pro 14" M3 (AF-LPT-004) has been registered in Engineering.', type: 'info', read: false, createdAt: '2026-03-04T09:00:00Z', link: '/assets' },
  { id: 'ntf-004', title: 'Audit Discrepancy Found', message: '3 discrepancies found in IT Operations Q1 audit.', type: 'error', read: true, createdAt: '2026-03-03T16:45:00Z', link: '/audits' },
  { id: 'ntf-005', title: 'Booking Confirmed', message: 'Your booking for ThinkPad X1 Carbon is confirmed for Mar 15-22.', type: 'success', read: true, createdAt: '2026-03-02T11:20:00Z', link: '/bookings' },
  { id: 'ntf-006', title: 'Warranty Expiring Soon', message: 'iPhone 15 Pro warranty expires in 30 days.', type: 'warning', read: true, createdAt: '2026-03-01T08:00:00Z', link: '/assets/details/ast-004' },
]

export const activities: Activity[] = [
  { id: 'act-001', action: 'Asset Allocated', description: 'MacBook Pro 16" assigned to Alex Johnson', user: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', timestamp: '2026-03-10T09:15:00Z', type: 'allocation' },
  { id: 'act-002', action: 'Transfer Completed', description: 'MacBook Pro 14" transferred to IT Operations', user: 'Michael Torres', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', timestamp: '2026-03-09T14:30:00Z', type: 'transfer' },
  { id: 'act-003', action: 'Maintenance Started', description: 'Cisco Catalyst 9300 firmware update initiated', user: 'Tom Bradley', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', timestamp: '2026-03-10T08:00:00Z', type: 'maintenance' },
  { id: 'act-004', action: 'Booking Created', description: 'ThinkPad X1 Carbon booked by Maria Garcia', user: 'Maria Garcia', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', timestamp: '2026-03-08T16:45:00Z', type: 'booking' },
  { id: 'act-005', action: 'Audit Started', description: 'Q1 2026 IT Assets Audit commenced', user: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', timestamp: '2026-03-01T09:00:00Z', type: 'audit' },
  { id: 'act-006', action: 'Asset Registered', description: 'New MacBook Pro 14" M3 added to inventory', user: 'Priya Sharma', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', timestamp: '2026-03-04T11:20:00Z', type: 'asset' },
  { id: 'act-007', action: 'Return Processed', description: 'Dell Monitor returned from temp allocation', user: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', timestamp: '2026-03-07T10:00:00Z', type: 'allocation' },
  { id: 'act-008', action: 'Transfer Requested', description: 'ThinkPad X1 Carbon transfer to Engineering requested', user: 'Priya Sharma', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', timestamp: '2026-03-01T13:15:00Z', type: 'transfer' },
]

export const dashboardKPIs: DashboardKPI[] = [
  { label: 'Assets Available', value: 2847, change: 12, trend: 'up', icon: 'Package' },
  { label: 'Allocated', value: 1923, change: 8, trend: 'up', icon: 'UserCheck' },
  { label: 'Reserved', value: 156, change: -3, trend: 'down', icon: 'Bookmark' },
  { label: 'Maintenance Today', value: 7, change: 2, trend: 'up', icon: 'Wrench' },
  { label: 'Active Bookings', value: 34, change: 15, trend: 'up', icon: 'Calendar' },
  { label: 'Pending Transfers', value: 12, change: -5, trend: 'down', icon: 'ArrowLeftRight' },
  { label: 'Upcoming Returns', value: 8, change: 0, trend: 'neutral', icon: 'RotateCcw' },
  { label: 'Total Value', value: 4250000, change: 4.2, trend: 'up', icon: 'DollarSign' },
]

export const utilizationData: ChartDataPoint[] = [
  { name: 'Jan', value: 72, allocated: 1650, available: 640 },
  { name: 'Feb', value: 75, allocated: 1720, available: 580 },
  { name: 'Mar', value: 78, allocated: 1800, available: 510 },
  { name: 'Apr', value: 74, allocated: 1750, available: 620 },
  { name: 'May', value: 81, allocated: 1880, available: 440 },
  { name: 'Jun', value: 79, allocated: 1840, available: 490 },
  { name: 'Jul', value: 83, allocated: 1920, available: 400 },
  { name: 'Aug', value: 80, allocated: 1860, available: 465 },
  { name: 'Sep', value: 85, allocated: 1960, available: 350 },
  { name: 'Oct', value: 82, allocated: 1900, available: 420 },
  { name: 'Nov', value: 87, allocated: 1980, available: 300 },
  { name: 'Dec', value: 84, allocated: 1923, available: 368 },
]

export const departmentAllocationData: ChartDataPoint[] = [
  { name: 'Engineering', value: 456, fill: '#4F46E5' },
  { name: 'IT Operations', value: 312, fill: '#6366F1' },
  { name: 'Facilities', value: 567, fill: '#818CF8' },
  { name: 'Sales', value: 234, fill: '#A5B4FC' },
  { name: 'Marketing', value: 198, fill: '#C7D2FE' },
  { name: 'Finance', value: 156, fill: '#E0E7FF' },
  { name: 'HR', value: 89, fill: '#EEF2FF' },
  { name: 'Legal', value: 45, fill: '#F5F3FF' },
]

export const bookingHeatmapData: ChartDataPoint[] = [
  { name: 'Mon', week1: 4, week2: 6, week3: 3, week4: 5 },
  { name: 'Tue', week1: 7, week2: 5, week3: 8, week4: 6 },
  { name: 'Wed', week1: 5, week2: 8, week3: 6, week4: 9 },
  { name: 'Thu', week1: 8, week2: 7, week3: 9, week4: 7 },
  { name: 'Fri', week1: 6, week2: 9, week3: 7, week4: 8 },
]

export const maintenanceTrendData: ChartDataPoint[] = [
  { name: 'Jan', preventive: 12, corrective: 4, emergency: 1 },
  { name: 'Feb', preventive: 10, corrective: 6, emergency: 2 },
  { name: 'Mar', preventive: 15, corrective: 3, emergency: 0 },
  { name: 'Apr', preventive: 11, corrective: 5, emergency: 1 },
  { name: 'May', preventive: 14, corrective: 7, emergency: 3 },
  { name: 'Jun', preventive: 13, corrective: 4, emergency: 1 },
]

export const assetTimeline: TimelineEvent[] = [
  { id: 'tl-001', title: 'Asset Registered', description: 'Added to inventory by Priya Sharma', timestamp: '2024-09-01T10:00:00Z', type: 'update', user: 'Priya Sharma' },
  { id: 'tl-002', title: 'Allocated to Employee', description: 'Assigned to Alex Johnson in Engineering', timestamp: '2024-09-05T14:30:00Z', type: 'allocation', user: 'Sarah Chen' },
  { id: 'tl-003', title: 'Maintenance Completed', description: 'Annual hardware inspection passed', timestamp: '2025-06-01T09:00:00Z', type: 'maintenance', user: 'Tom Bradley' },
  { id: 'tl-004', title: 'Transfer Requested', description: 'Transfer to IT Operations requested', timestamp: '2026-02-20T11:15:00Z', type: 'transfer', user: 'Michael Torres' },
  { id: 'tl-005', title: 'Transfer Completed', description: 'Successfully transferred to IT Operations', timestamp: '2026-02-25T16:00:00Z', type: 'transfer', user: 'Michael Torres' },
]

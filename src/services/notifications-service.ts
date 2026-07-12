export type NotificationType = 'Asset Assigned' | 'Maintenance Approved' | 'Maintenance Rejected' | 'Booking Confirmed' | 'Booking Cancelled' | 'Booking Reminder' | 'Transfer Approved' | 'Overdue Return' | 'Audit Discrepancy'
export type NotificationPriority = 'Low' | 'Medium' | 'High'

export interface NotificationItem {
  id: string
  user: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  createdAt: string
}

export interface ActivityLogItem {
  id: string
  user: string
  role: string
  module: string
  action: string
  description: string
  ipAddress?: string
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const sampleNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    user: 'Current User',
    title: 'Asset assigned',
    message: 'Laptop 14 was assigned to Engineering team.',
    type: 'Asset Assigned',
    priority: 'High',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'notif-2',
    user: 'Current User',
    title: 'Maintenance approved',
    message: 'The maintenance request for Printer 08 has been approved.',
    type: 'Maintenance Approved',
    priority: 'Medium',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-3',
    user: 'Current User',
    title: 'Booking cancelled',
    message: 'Your booking for the conference room projector was cancelled.',
    type: 'Booking Cancelled',
    priority: 'Low',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

const sampleActivityLogs: ActivityLogItem[] = [
  {
    id: 'activity-1',
    user: 'Amelia Chen',
    role: 'Manager',
    module: 'Assets',
    action: 'Assigned',
    description: 'Assigned a laptop to Engineering team.',
    ipAddress: '192.168.1.10',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'activity-2',
    user: 'Nora Singh',
    role: 'Employee',
    module: 'Bookings',
    action: 'Booked',
    description: 'Booked a conference room projector for a client meeting.',
    ipAddress: '192.168.1.11',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
]

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const payload = await request<{ success: boolean; data?: NotificationItem[] }>(`/notifications`)
    return payload.data ?? sampleNotifications
  } catch {
    return sampleNotifications
  }
}

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  try {
    const payload = await request<{ success: boolean; data?: ActivityLogItem[] }>(`/activity`)
    return payload.data ?? sampleActivityLogs
  } catch {
    return sampleActivityLogs
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await request(`/notifications/${id}/read`, { method: 'PATCH' })
  } catch {
    // fallback: ignore network failures
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await request('/notifications/read-all', { method: 'PATCH' })
  } catch {
    // fallback: ignore network failures
  }
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    await request(`/notifications/${id}`, { method: 'DELETE' })
  } catch {
    // fallback: ignore network failures
  }
}

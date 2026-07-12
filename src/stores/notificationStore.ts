import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, Activity } from '@/types'
import { notifications as mockNotifications, activities as mockActivities } from '@/data/mock'

interface NotificationState {
  notifications: Notification[]
  activities: Activity[]
  unreadCount: number
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  
  // Activity actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: mockNotifications,
      activities: mockActivities,
      unreadCount: mockNotifications.filter(n => !n.read).length,

      addNotification: (n) => {
        const newNotification: Notification = {
          ...n,
          id: `ntf-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false
        }
        set((state) => {
          const updated = [newNotification, ...state.notifications]
          return {
            notifications: updated,
            unreadCount: updated.filter(item => !item.read).length
          }
        })
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
          return {
            notifications: updated,
            unreadCount: updated.filter(item => !item.read).length
          }
        })
      },

      markAllAsRead: () => {
        set((state) => {
          const updated = state.notifications.map((n) => ({ ...n, read: true }))
          return {
            notifications: updated,
            unreadCount: 0
          }
        })
      },

      addActivity: (act) => {
        const newActivity: Activity = {
          ...act,
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
        set((state) => ({
          activities: [newActivity, ...state.activities]
        }))
      }
    }),
    {
      name: 'assetflow-notifications-v1'
    }
  )
)

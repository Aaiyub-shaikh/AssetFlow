import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, MaintenanceRecord, Priority, AssetStatus, MaintenanceStatus } from '@/types'
import { assets as mockAssets, maintenanceRecords as mockMaintenanceRecords } from '@/data/mock'
import { useNotificationStore } from './notificationStore'
import { useAuthStore } from './index'

interface AssetMaintenanceState {
  assets: Asset[]
  maintenanceRecords: MaintenanceRecord[]
  raiseRequest: (data: {
    assetId: string
    description: string
    priority: Priority
    type: 'preventive' | 'corrective' | 'emergency'
    photo?: string
  }) => void
  approveRequest: (id: string) => void
  rejectRequest: (id: string) => void
  assignTechnician: (id: string, technicianName: string) => void
  startWork: (id: string) => void
  resolveRequest: (id: string, cost: number, notes?: string) => void
  resetStore: () => void
}

export const useAssetMaintenanceStore = create<AssetMaintenanceState>()(
  persist(
    (set, get) => ({
      assets: mockAssets,
      maintenanceRecords: mockMaintenanceRecords,

      raiseRequest: (data) => {
        const { assets, maintenanceRecords } = get()
        const asset = assets.find((a) => a.id === data.assetId)
        if (!asset) return

        const newRecord: MaintenanceRecord = {
          id: `mnt-${Date.now()}`,
          assetId: data.assetId,
          assetName: asset.name,
          assetTag: asset.tag,
          type: data.type,
          status: 'pending' as MaintenanceStatus,
          scheduledDate: new Date().toISOString().split('T')[0],
          assignedTo: 'Unassigned',
          cost: 0,
          description: data.description,
          priority: data.priority,
          photo: data.photo,
        }

        set({
          maintenanceRecords: [newRecord, ...maintenanceRecords],
        })

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Maintenance Requested',
          message: `Maintenance request raised for "${asset.name}" (${asset.tag}).`,
          type: 'info',
          link: `/maintenance`
        })
        useNotificationStore.getState().addActivity({
          action: 'Maintenance Requested',
          description: `Maintenance request raised for "${asset.name}" (${asset.tag})`,
          user: activeUser,
          type: 'maintenance'
        })
      },

      approveRequest: (id) => {
        const { maintenanceRecords, assets } = get()
        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return { ...rec, status: 'approved' as MaintenanceStatus }
          }
          return rec
        })

        const record = maintenanceRecords.find((rec) => rec.id === id)
        let updatedAssets = assets
        if (record) {
          updatedAssets = assets.map((asset) => {
            if (asset.id === record.assetId) {
              return { ...asset, status: 'maintenance' as AssetStatus }
            }
            return asset
          })
        }

        set({
          maintenanceRecords: updatedRecords,
          assets: updatedAssets,
        })

        if (record) {
          const activeUser = useAuthStore.getState().user?.name ?? 'System'
          useNotificationStore.getState().addNotification({
            title: 'Maintenance Approved',
            message: `Maintenance request for "${record.assetName}" (${record.assetTag}) has been approved.`,
            type: 'success',
            link: `/maintenance`
          })
          useNotificationStore.getState().addActivity({
            action: 'Maintenance Approved',
            description: `Maintenance request for "${record.assetName}" approved`,
            user: activeUser,
            type: 'maintenance'
          })
        }
      },

      rejectRequest: (id) => {
        const { maintenanceRecords } = get()
        const record = maintenanceRecords.find((rec) => rec.id === id)
        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return { ...rec, status: 'rejected' as MaintenanceStatus }
          }
          return rec
        })

        set({
          maintenanceRecords: updatedRecords,
        })

        if (record) {
          const activeUser = useAuthStore.getState().user?.name ?? 'System'
          useNotificationStore.getState().addNotification({
            title: 'Maintenance Rejected',
            message: `Maintenance request for "${record.assetName}" (${record.assetTag}) has been rejected.`,
            type: 'error',
            link: `/maintenance`
          })
          useNotificationStore.getState().addActivity({
            action: 'Maintenance Rejected',
            description: `Maintenance request for "${record.assetName}" rejected`,
            user: activeUser,
            type: 'maintenance'
          })
        }
      },

      assignTechnician: (id, technicianName) => {
        const { maintenanceRecords, assets } = get()
        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return {
              ...rec,
              status: 'assigned' as MaintenanceStatus,
              assignedTo: technicianName,
            }
          }
          return rec
        })

        // Just in case the asset wasn't set to maintenance before, ensure it is
        const record = maintenanceRecords.find((rec) => rec.id === id)
        let updatedAssets = assets
        if (record) {
          updatedAssets = assets.map((asset) => {
            if (asset.id === record.assetId) {
              return { ...asset, status: 'maintenance' as AssetStatus }
            }
            return asset
          })
        }

        set({
          maintenanceRecords: updatedRecords,
          assets: updatedAssets,
        })
      },

      startWork: (id) => {
        const { maintenanceRecords } = get()
        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return { ...rec, status: 'in_progress' as MaintenanceStatus }
          }
          return rec
        })

        set({
          maintenanceRecords: updatedRecords,
        })
      },

      resolveRequest: (id, cost, notes) => {
        const { maintenanceRecords, assets } = get()
        const record = maintenanceRecords.find((rec) => rec.id === id)
        if (!record) return

        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return {
              ...rec,
              status: 'resolved' as MaintenanceStatus,
              cost,
              notes,
              completedDate: new Date().toISOString().split('T')[0],
            }
          }
          return rec
        })

        const updatedAssets = assets.map((asset) => {
          if (asset.id === record.assetId) {
            return {
              ...asset,
              status: 'available' as AssetStatus,
              lastMaintenance: new Date().toISOString().split('T')[0],
            }
          }
          return asset
        })

        set({
          maintenanceRecords: updatedRecords,
          assets: updatedAssets,
        })

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Maintenance Resolved',
          message: `Maintenance for "${record.assetName}" (${record.assetTag}) resolved.`,
          type: 'success',
          link: `/maintenance`
        })
        useNotificationStore.getState().addActivity({
          action: 'Maintenance Completed',
          description: `Maintenance resolved for "${record.assetName}"`,
          user: activeUser,
          type: 'maintenance'
        })
      },

      resetStore: () => {
        set({
          assets: mockAssets,
          maintenanceRecords: mockMaintenanceRecords,
        })
      },
    }),
    {
      name: 'assetflow-maintenance-store',
    }
  )
)

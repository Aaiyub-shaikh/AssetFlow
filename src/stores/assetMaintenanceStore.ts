import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, MaintenanceRecord, Priority, AssetStatus, MaintenanceStatus } from '@/types'
import { assets as mockAssets, maintenanceRecords as mockMaintenanceRecords } from '@/data/mock'

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
      },

      rejectRequest: (id) => {
        const { maintenanceRecords } = get()
        const updatedRecords = maintenanceRecords.map((rec) => {
          if (rec.id === id) {
            return { ...rec, status: 'rejected' as MaintenanceStatus }
          }
          return rec
        })

        set({
          maintenanceRecords: updatedRecords,
        })
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

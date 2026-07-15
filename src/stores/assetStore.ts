import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, Allocation, Transfer, AssetStatus, Priority } from '@/types'
import { assets as mockAssets, allocations as mockAllocations, transfers as mockTransfers, categories, departments } from '@/data/mock'
import { useNotificationStore } from './notificationStore'
import { useAuthStore } from './index'

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateTag(categoryCode: string, existingAssets: Asset[]): string {
  const prefix = `AF-${categoryCode}`
  const nums = existingAssets
    .filter((a) => a.tag.startsWith(prefix))
    .map((a) => parseInt(a.tag.replace(prefix + '-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RegisterAssetData {
  name: string
  serialNumber: string
  categoryId: string
  departmentId: string
  purchaseDate: string
  purchasePrice: number
  location: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  warrantyExpiry: string
  notes?: string
  image?: string
  isBookable?: boolean
}

export interface AllocateData {
  assetId: string
  employeeId: string
  employeeName: string
  department: string
  returnDate?: string
  notes?: string
}

export interface ReturnData {
  allocationId: string
  conditionNotes?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface TransferData {
  assetId: string
  assetName: string
  assetTag: string
  toDepartment: string
  requestedBy: string
  reason: string
  priority: Priority
}

interface AssetState {
  assets: Asset[]
  allocations: Allocation[]
  transfers: Transfer[]

  // Asset CRUD
  registerAsset: (data: RegisterAssetData) => Asset
  updateAsset: (id: string, updates: Partial<Asset>) => void
  retireAsset: (id: string) => void

  // Allocation
  allocateAsset: (data: AllocateData) => { success: boolean; conflict?: Allocation }
  returnAsset: (data: ReturnData) => void

  // Transfer
  requestTransfer: (data: TransferData) => void
  approveTransfer: (id: string, approvedBy: string) => void
  rejectTransfer: (id: string) => void
  completeTransfer: (id: string) => void

  // Computed helpers
  getAssetById: (id: string) => Asset | undefined
  getAllocationsForAsset: (assetId: string) => Allocation[]
  getTransfersForAsset: (assetId: string) => Transfer[]
  getOverdueAllocations: () => Allocation[]
}

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: mockAssets,
      allocations: mockAllocations,
      transfers: mockTransfers,

      // ── Register ──────────────────────────────────────────────────────────
      registerAsset: (data) => {
        const { assets } = get()
        const cat = categories.find((c) => c.id === data.categoryId)
        const dept = departments.find((d) => d.id === data.departmentId)
        const tag = generateTag(cat?.code ?? 'AST', assets)
        const newAsset: Asset = {
          id: `ast-${Date.now()}`,
          name: data.name,
          tag,
          serialNumber: data.serialNumber,
          category: cat?.name ?? data.categoryId,
          categoryId: data.categoryId,
          department: dept?.name ?? data.departmentId,
          departmentId: data.departmentId,
          status: 'available',
          purchaseDate: data.purchaseDate,
          purchasePrice: data.purchasePrice,
          currentValue: data.purchasePrice,
          warrantyExpiry: data.warrantyExpiry,
          location: data.location,
          condition: data.condition,
          image: data.image,
          qrCode: tag,
          notes: data.notes,
        }
        set((s) => ({ assets: [newAsset, ...s.assets] }))

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'New Asset Registered',
          message: `Asset "${newAsset.name}" (${newAsset.tag}) has been registered in department ${newAsset.department}.`,
          type: 'info',
          link: `/assets/details/${newAsset.id}`
        })
        useNotificationStore.getState().addActivity({
          action: 'Asset Registered',
          description: `New asset "${newAsset.name}" (${newAsset.tag}) added to inventory`,
          user: activeUser,
          type: 'asset'
        })

        return newAsset
      },

      updateAsset: (id, updates) => {
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      retireAsset: (id) => {
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id ? { ...a, status: 'retired' as AssetStatus } : a)),
        }))
      },

      // ── Allocate ─────────────────────────────────────────────────────────
      allocateAsset: (data) => {
        const { allocations, assets } = get()

        // Conflict check: is this asset currently allocated (active)?
        const conflict = allocations.find(
          (alloc) => alloc.assetId === data.assetId && alloc.status === 'active'
        )
        if (conflict) {
          return { success: false, conflict }
        }

        // Check asset exists and is allocatable
        const asset = assets.find((a) => a.id === data.assetId)
        if (!asset || !['available', 'reserved'].includes(asset.status)) {
          return { success: false }
        }

        const newAlloc: Allocation = {
          id: `alc-${Date.now()}`,
          assetId: data.assetId,
          assetName: asset.name,
          assetTag: asset.tag,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          department: data.department,
          allocatedAt: new Date().toISOString().split('T')[0],
          returnDate: data.returnDate,
          status: 'active',
          notes: data.notes,
        }

        set((s) => ({
          allocations: [newAlloc, ...s.allocations],
          assets: s.assets.map((a) =>
            a.id === data.assetId
              ? { ...a, status: 'allocated' as AssetStatus, assignedTo: data.employeeName, assignedToId: data.employeeId }
              : a
          ),
        }))

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Asset Assigned',
          message: `Asset "${asset.name}" (${asset.tag}) has been assigned to ${data.employeeName}.`,
          type: 'success',
          link: `/assets/details/${asset.id}`
        })
        useNotificationStore.getState().addActivity({
          action: 'Asset Allocated',
          description: `Assigned "${asset.name}" (${asset.tag}) to ${data.employeeName}`,
          user: activeUser,
          type: 'allocation'
        })

        return { success: true }
      },

      // ── Return ────────────────────────────────────────────────────────────
      returnAsset: (data) => {
        const { allocations } = get()
        const alloc = allocations.find((a) => a.id === data.allocationId)
        if (!alloc) return

        set((s) => ({
          allocations: s.allocations.map((a) =>
            a.id === data.allocationId ? { ...a, status: 'returned' } : a
          ),
          assets: s.assets.map((a) =>
            a.id === alloc.assetId
              ? {
                  ...a,
                  status: 'available' as AssetStatus,
                  assignedTo: undefined,
                  assignedToId: undefined,
                  condition: data.condition,
                }
              : a
          ),
        }))

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Asset Returned',
          message: `Asset "${alloc.assetName}" (${alloc.assetTag}) has been returned by ${alloc.employeeName}.`,
          type: 'info',
          link: `/assets/details/${alloc.assetId}`
        })
        useNotificationStore.getState().addActivity({
          action: 'Return Processed',
          description: `Asset "${alloc.assetName}" returned by ${alloc.employeeName}`,
          user: activeUser,
          type: 'allocation'
        })
      },

      // ── Transfer ──────────────────────────────────────────────────────────
      requestTransfer: (data) => {
        const { assets } = get()
        const asset = assets.find((a) => a.id === data.assetId)
        if (!asset) return

        const newTransfer: Transfer = {
          id: `trf-${Date.now()}`,
          assetId: data.assetId,
          assetName: data.assetName,
          assetTag: data.assetTag,
          fromDepartment: asset.department,
          toDepartment: data.toDepartment,
          requestedBy: data.requestedBy,
          requestedAt: new Date().toISOString().split('T')[0],
          status: 'pending',
          priority: data.priority,
          reason: data.reason,
        }
        set((s) => ({ transfers: [newTransfer, ...s.transfers] }))

        useNotificationStore.getState().addNotification({
          title: 'Transfer Requested',
          message: `Transfer of "${data.assetName}" (${data.assetTag}) to ${data.toDepartment} requested by ${data.requestedBy}.`,
          type: 'info',
          link: `/transfers`
        })
        useNotificationStore.getState().addActivity({
          action: 'Transfer Requested',
          description: `Transfer of "${data.assetName}" to ${data.toDepartment} requested`,
          user: data.requestedBy,
          type: 'transfer'
        })
      },

      approveTransfer: (id, approvedBy) => {
        const { transfers } = get()
        const transfer = transfers.find(t => t.id === id)
        if (!transfer) return

        set((s) => ({
          transfers: s.transfers.map((t) =>
            t.id === id ? { ...t, status: 'approved', approvedBy } : t
          ),
        }))

        useNotificationStore.getState().addNotification({
          title: 'Transfer Approved',
          message: `Transfer request for "${transfer.assetName}" (${transfer.assetTag}) approved by ${approvedBy}.`,
          type: 'success',
          link: `/transfers`
        })
        useNotificationStore.getState().addActivity({
          action: 'Transfer Approved',
          description: `Transfer of "${transfer.assetName}" approved by ${approvedBy}`,
          user: approvedBy,
          type: 'transfer'
        })
      },

      rejectTransfer: (id) => {
        const { transfers } = get()
        const transfer = transfers.find(t => t.id === id)
        if (!transfer) return

        set((s) => ({
          transfers: s.transfers.map((t) =>
            t.id === id ? { ...t, status: 'rejected' } : t
          ),
        }))

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Transfer Rejected',
          message: `Transfer request for "${transfer.assetName}" (${transfer.assetTag}) has been rejected.`,
          type: 'error',
          link: `/transfers`
        })
        useNotificationStore.getState().addActivity({
          action: 'Transfer Rejected',
          description: `Transfer of "${transfer.assetName}" rejected`,
          user: activeUser,
          type: 'transfer'
        })
      },

      completeTransfer: (id) => {
        const { transfers } = get()
        const transfer = transfers.find((t) => t.id === id)
        if (!transfer) return

        set((s) => ({
          transfers: s.transfers.map((t) =>
            t.id === id
              ? { ...t, status: 'completed', completedAt: new Date().toISOString().split('T')[0] }
              : t
          ),
          assets: s.assets.map((a) =>
            a.id === transfer.assetId
              ? { ...a, department: transfer.toDepartment }
              : a
          ),
        }))

        const activeUser = useAuthStore.getState().user?.name ?? 'System'
        useNotificationStore.getState().addNotification({
          title: 'Transfer Completed',
          message: `Transfer of "${transfer.assetName}" to ${transfer.toDepartment} is now complete.`,
          type: 'success',
          link: `/transfers`
        })
        useNotificationStore.getState().addActivity({
          action: 'Transfer Completed',
          description: `Transfer of "${transfer.assetName}" to ${transfer.toDepartment} completed`,
          user: activeUser,
          type: 'transfer'
        })
      },

      // ── Helpers ───────────────────────────────────────────────────────────
      getAssetById: (id) => get().assets.find((a) => a.id === id),

      getAllocationsForAsset: (assetId) =>
        get().allocations.filter((a) => a.assetId === assetId),

      getTransfersForAsset: (assetId) =>
        get().transfers.filter((t) => t.assetId === assetId),

      getOverdueAllocations: () => {
        const today = new Date()
        return get().allocations.filter((a) => {
          if (a.status !== 'active' || !a.returnDate) return false
          return new Date(a.returnDate) < today
        })
      },
    }),
    { name: 'assetflow-assets-v1' }
  )
)

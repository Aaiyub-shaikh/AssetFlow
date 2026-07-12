export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
}

export const ASSET_STATUS = {
  AVAILABLE: 'available',
  ALLOCATED: 'allocated',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  LOST: 'lost',
  DISPOSED: 'disposed',
}

export const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED_DEPT: 'approved_dept', // Approved by Department Head
  APPROVED_FINAL: 'approved',     // Approved by Asset Manager / Admin
  COMPLETED: 'completed',
  REJECTED: 'rejected',
}

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
}

export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
}

export const AUDIT_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const AUDIT_RESULT_STATUS = {
  VERIFIED: 'verified',
  DAMAGED: 'damaged',
  MISSING: 'missing',
}

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

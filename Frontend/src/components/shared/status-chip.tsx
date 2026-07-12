import { Badge } from '@/components/ui/badge'
import type { AssetStatus, TransferStatus, BookingStatus, MaintenanceStatus, AuditStatus, Priority } from '@/types'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' }> = {
  available: { label: 'Available', variant: 'success' },
  allocated: { label: 'Allocated', variant: 'default' },
  reserved: { label: 'Reserved', variant: 'warning' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  retired: { label: 'Retired', variant: 'secondary' },
  lost: { label: 'Lost', variant: 'danger' },
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  in_transit: { label: 'In Transit', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  scheduled: { label: 'Scheduled', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'danger' },
  planned: { label: 'Planned', variant: 'secondary' },
  active: { label: 'Active', variant: 'success' },
  returned: { label: 'Returned', variant: 'secondary' },
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'warning' },
  high: { label: 'High', variant: 'danger' },
  critical: { label: 'Critical', variant: 'danger' },
  preventive: { label: 'Preventive', variant: 'default' },
  corrective: { label: 'Corrective', variant: 'warning' },
  emergency: { label: 'Emergency', variant: 'danger' },
  excellent: { label: 'Excellent', variant: 'success' },
  good: { label: 'Good', variant: 'default' },
  fair: { label: 'Fair', variant: 'warning' },
  poor: { label: 'Poor', variant: 'danger' },
}

interface StatusChipProps {
  status: AssetStatus | TransferStatus | BookingStatus | MaintenanceStatus | AuditStatus | Priority | string
  className?: string
}

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>
}

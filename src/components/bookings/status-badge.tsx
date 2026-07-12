import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/types/booking";

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const statusConfig: Record<BookingStatus, { variant: any; label: string; icon: string }> = {
    upcoming: {
      variant: "default",
      label: "Upcoming",
      icon: "📅"
    },
    ongoing: {
      variant: "secondary",
      label: "Ongoing",
      icon: "▶️"
    },
    completed: {
      variant: "outline",
      label: "Completed",
      icon: "✓"
    },
    cancelled: {
      variant: "destructive",
      label: "Cancelled",
      icon: "✕"
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;

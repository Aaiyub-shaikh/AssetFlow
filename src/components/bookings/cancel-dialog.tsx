import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Booking } from "@/types/booking";
import { format } from "date-fns";

interface CancelDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => void;
  isLoading?: boolean;
}

export const CancelDialog: React.FC<CancelDialogProps> = ({
  booking,
  open,
  onOpenChange,
  onCancel,
  isLoading = false
}) => {
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    onCancel(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking?</DialogTitle>
          <DialogDescription className="space-y-3 mt-3">
            <div>
              <p className="font-medium text-foreground">{booking.title}</p>
              <p className="text-sm">
                {format(new Date(booking.startTime), "MMM d, yyyy h:mm a")} -{" "}
                {format(new Date(booking.endTime), "h:mm a")}
              </p>
            </div>
            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>

            <div className="space-y-2 pt-2">
              <Label htmlFor="cancel-reason" className="text-xs">
                Cancellation Reason (Optional)
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Why are you cancelling this booking?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                className="resize-none h-16 text-sm"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Keep Booking
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelDialog;

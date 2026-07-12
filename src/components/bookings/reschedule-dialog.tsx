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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Booking } from "@/types/booking";
import { format } from "date-fns";

interface RescheduleDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (newStartTime: string, newEndTime: string, reason: string) => void;
  isLoading?: boolean;
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  booking,
  open,
  onOpenChange,
  onReschedule,
  isLoading = false
}) => {
  const [newDate, setNewDate] = useState(format(new Date(booking.startTime), "yyyy-MM-dd"));
  const [newStartTime, setNewStartTime] = useState(
    format(new Date(booking.startTime), "HH:mm")
  );
  const [newEndTime, setNewEndTime] = useState(format(new Date(booking.endTime), "HH:mm"));
  const [reason, setReason] = useState("");

  const handleReschedule = () => {
    const newStart = new Date(`${newDate}T${newStartTime}`);
    const newEnd = new Date(`${newDate}T${newEndTime}`);

    if (newEnd <= newStart) {
      alert("End time must be after start time");
      return;
    }

    onReschedule(newStart.toISOString(), newEnd.toISOString(), reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Reschedule "{booking.title}" to a new date and time
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="space-y-4 pr-4">
          <div className="space-y-4">
            {/* Current Booking Info */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">Current Schedule</p>
              <p className="text-sm">
                {format(new Date(booking.startTime), "MMM d, yyyy h:mm a")} -{" "}
                {format(new Date(booking.endTime), "h:mm a")}
              </p>
            </div>

            {/* New Date */}
            <div className="space-y-2">
              <Label htmlFor="new-date">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* New Start Time */}
            <div className="space-y-2">
              <Label htmlFor="new-start-time">Start Time</Label>
              <Input
                id="new-start-time"
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* New End Time */}
            <div className="space-y-2">
              <Label htmlFor="new-end-time">End Time</Label>
              <Input
                id="new-end-time"
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Reason for Rescheduling */}
            <div className="space-y-2">
              <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
              <Textarea
                id="reschedule-reason"
                placeholder="Why are you rescheduling this booking?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                className="resize-none h-20"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={isLoading}>
            {isLoading ? "Rescheduling..." : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;

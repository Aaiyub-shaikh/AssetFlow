import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Resource } from "@/types/booking";
import { useCheckOverlap } from "@/hooks/useBooking";
import { AlertCircle } from "lucide-react";

const bookingFormSchema = z.object({
  resource: z.string().min(1, "Please select a resource"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select start time"),
  endTime: z.string().min(1, "Please select end time"),
  notes: z.string().optional(),
  reminderTime: z.number().int().min(0)
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: Resource[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const BookingFormDialog: React.FC<BookingFormDialogProps> = ({
  open,
  onOpenChange,
  resources,
  onSubmit,
  isLoading = false
}) => {
  const [overlapError, setOverlapError] = useState("");
  const checkOverlap = useCheckOverlap();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      reminderTime: 15,
      date: new Date().toISOString().split("T")[0]
    }
  });

  const selectedResource = watch("resource");
  const selectedDate = watch("date");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  // Check for overlaps when time changes
  useEffect(() => {
    const checkForOverlaps = async () => {
      if (selectedResource && selectedDate && startTime && endTime) {
        const startDateTime = new Date(`${selectedDate}T${startTime}`);
        const endDateTime = new Date(`${selectedDate}T${endTime}`);

        if (endDateTime <= startDateTime) {
          setOverlapError("End time must be after start time");
          return;
        }

        try {
          setOverlapError("");
          await checkOverlap.mutateAsync({
            resourceId: selectedResource,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
          });
        } catch (error: any) {
          setOverlapError(error.message || "This time slot is not available");
        }
      }
    };

    const debounceTimer = setTimeout(checkForOverlaps, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedResource, selectedDate, startTime, endTime, checkOverlap]);

  const onFormSubmit = async (data: BookingFormValues) => {
    if (overlapError) {
      return;
    }

    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);

    const formData = {
      resource: data.resource,
      title: data.title,
      description: data.description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: data.notes,
      reminderTime: data.reminderTime
    };

    await onSubmit(formData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Book a resource for your team. You'll be notified before the booking starts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Resource Selection */}
          <div className="space-y-2">
            <Label htmlFor="resource">Resource *</Label>
            <Controller
              name="resource"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="resource">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.filter((r) => r.isActive).map((resource) => (
                      <SelectItem key={resource._id} value={resource._id}>
                        {resource.name} ({resource.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.resource && (
              <p className="text-sm text-destructive">{errors.resource.message}</p>
            )}
          </div>

          {/* Booking Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Booking Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Standup, Client Meeting"
              {...register("title")}
              disabled={isLoading || isSubmitting}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this booking for?"
              {...register("description")}
              disabled={isLoading || isSubmitting}
              className="resize-none h-20"
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              disabled={isLoading || isSubmitting}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                disabled={isLoading || isSubmitting}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                disabled={isLoading || isSubmitting}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Overlap Error */}
          {overlapError && (
            <Card className="border-destructive bg-destructive/10 p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{overlapError}</p>
            </Card>
          )}

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder</Label>
            <Controller
              name="reminderTime"
              control={control}
              render={({ field }) => (
                <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                  <SelectTrigger id="reminderTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this booking"
              {...register("notes")}
              disabled={isLoading || isSubmitting}
              className="resize-none h-16"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            disabled={isLoading || isSubmitting || !!overlapError}
          >
            {isLoading || isSubmitting ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFormDialog;

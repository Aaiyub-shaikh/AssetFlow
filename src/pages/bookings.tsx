import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { useResources, useBookings, useCreateBooking, useCancelBooking, useRescheduleBooking } from "@/hooks/useBooking";
import { BookingFormDialog } from "@/components/bookings/booking-form-dialog";
import { BookingList } from "@/components/bookings/booking-list";
import { BookingCalendar } from "@/components/bookings/booking-calendar";
import { CancelDialog } from "@/components/bookings/cancel-dialog";
import { RescheduleDialog } from "@/components/bookings/reschedule-dialog";
import { Booking } from "@/types/booking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BookingsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);

  const { data: resources = [] } = useResources();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();

  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const rescheduleBooking = useRescheduleBooking();

  const handleCreateBooking = async (data: any) => {
    await createBooking.mutateAsync(data);
  };

  const handleCancelBooking = async (reason: string) => {
    if (!selectedBookingForCancel) return;
    await cancelBooking.mutateAsync({
      id: selectedBookingForCancel._id,
      reason
    });
    setSelectedBookingForCancel(null);
  };

  const handleRescheduleBooking = async (newStartTime: string, newEndTime: string, reason: string) => {
    if (!selectedBookingForReschedule) return;
    await rescheduleBooking.mutateAsync({
      id: selectedBookingForReschedule._id,
      newStartTime,
      newEndTime,
      reason
    });
    setSelectedBookingForReschedule(null);
  };

  return (
    <PageShell>
      <PageHeader
        title="Resource Bookings"
        description="Book and manage shared resources with real-time availability"
      />

      <div className="space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Bookings List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <BookingList
              bookings={bookings}
              isLoading={bookingsLoading}
              onCreateNew={() => setFormOpen(true)}
              onCancel={setSelectedBookingForCancel}
              onReschedule={setSelectedBookingForReschedule}
              isActionLoading={cancelBooking.isPending || rescheduleBooking.isPending}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <BookingCalendar
              bookings={bookings}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Form Dialog */}
      <BookingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        resources={resources}
        onSubmit={handleCreateBooking}
        isLoading={createBooking.isPending}
      />

      {/* Cancel Dialog */}
      {selectedBookingForCancel && (
        <CancelDialog
          booking={selectedBookingForCancel}
          open={!!selectedBookingForCancel}
          onOpenChange={(open) => !open && setSelectedBookingForCancel(null)}
          onCancel={handleCancelBooking}
          isLoading={cancelBooking.isPending}
        />
      )}

      {/* Reschedule Dialog */}
      {selectedBookingForReschedule && (
        <RescheduleDialog
          booking={selectedBookingForReschedule}
          open={!!selectedBookingForReschedule}
          onOpenChange={(open) => !open && setSelectedBookingForReschedule(null)}
          onReschedule={handleRescheduleBooking}
          isLoading={rescheduleBooking.isPending}
        />
      )}
    </PageShell>
  );
}

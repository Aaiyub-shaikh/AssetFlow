import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard } from "./booking-card";
import { Booking, BookingStatus } from "@/types/booking";
import { Calendar, Plus } from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
  isLoading?: boolean;
  onCreateNew?: () => void;
  onCancel?: (booking: Booking) => void;
  onReschedule?: (booking: Booking) => void;
  isActionLoading?: boolean;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  isLoading = false,
  onCreateNew,
  onCancel,
  onReschedule,
  isActionLoading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">("all");

  const filteredBookings =
    selectedStatus === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === selectedStatus);

  const statusCounts = {
    all: bookings.length,
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    ongoing: bookings.filter((b) => b.status === "ongoing").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Manage all your resource bookings</CardDescription>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">
              All <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{statusCounts.all}</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming{" "}
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{statusCounts.upcoming}</span>
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              Ongoing{" "}
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{statusCounts.ongoing}</span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed{" "}
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{statusCounts.completed}</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled{" "}
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{statusCounts.cancelled}</span>
            </TabsTrigger>
          </TabsList>

          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-muted-foreground">No {selectedStatus !== "all" ? selectedStatus : ""} bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={() => onCancel?.(booking)}
                  onReschedule={() => onReschedule?.(booking)}
                  isLoading={isActionLoading}
                />
              ))}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BookingList;

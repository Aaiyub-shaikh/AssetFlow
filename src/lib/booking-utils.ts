// Booking utility functions
import { differenceInMinutes, format } from "date-fns";

export const calculateDuration = (startTime: Date | string, endTime: Date | string) => {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  const minutes = differenceInMinutes(end, start);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatTimeRange = (startTime: Date | string, endTime: Date | string) => {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  const startFormatted = format(start, "h:mm a");
  const endFormatted = format(end, "h:mm a");

  return `${startFormatted} - ${endFormatted}`;
};

export const isTimeSlotAvailable = (
  startTime: Date,
  endTime: Date,
  existingBookings: Array<{ startTime: string; endTime: string }>
) => {
  return !existingBookings.some((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    // Check for overlap
    return startTime < bookingEnd && endTime > bookingStart;
  });
};

export const getBookingsByStatus = (
  bookings: any[],
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
) => {
  return bookings.filter((b) => b.status === status);
};

export const getUpcomingBookingsInNextDays = (bookings: any[], days: number = 7) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return bookings.filter((b) => {
    const startTime = new Date(b.startTime);
    return startTime >= now && startTime <= futureDate && b.status === "upcoming";
  });
};

export const groupBookingsByResource = (bookings: any[]) => {
  return bookings.reduce(
    (acc, booking) => {
      const resourceId = booking.resource._id;
      if (!acc[resourceId]) {
        acc[resourceId] = {
          resource: booking.resource,
          bookings: []
        };
      }
      acc[resourceId].bookings.push(booking);
      return acc;
    },
    {} as Record<string, { resource: any; bookings: any[] }>
  );
};

export const getConflictingTimeSlots = (
  startTime: Date,
  endTime: Date,
  bookings: Array<{ startTime: string; endTime: string; title: string }>
) => {
  return bookings.filter((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    return startTime < bookingEnd && endTime > bookingStart;
  });
};

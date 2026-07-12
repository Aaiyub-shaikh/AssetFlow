import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookingAPI from "@/lib/api/bookingAPI";
import { Booking, BookingFormData } from "@/types/booking";
import toast from "react-hot-toast";

// Fetch all resources
export const useResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: () => bookingAPI.fetchResources(),
    staleTime: 5 * 60 * 1000
  });
};

// Fetch single resource
export const useResource = (resourceId: string | null) => {
  return useQuery({
    queryKey: ["resource", resourceId],
    queryFn: () => bookingAPI.fetchResource(resourceId!),
    enabled: !!resourceId,
    staleTime: 5 * 60 * 1000
  });
};

// Fetch bookings with filters
export const useBookings = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingAPI.fetchBookings(filters),
    staleTime: 1 * 60 * 1000
  });
};

// Fetch bookings for a specific resource
export const useResourceBookings = (resourceId: string | null, filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ["resourceBookings", resourceId, filters],
    queryFn: () => bookingAPI.fetchResourceBookings(resourceId!, filters),
    enabled: !!resourceId,
    staleTime: 1 * 60 * 1000
  });
};

// Fetch user's upcoming bookings
export const useUpcomingBookings = (userId: string | null) => {
  return useQuery({
    queryKey: ["upcomingBookings", userId],
    queryFn: () => bookingAPI.fetchUpcomingBookings(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000
  });
};

// Create booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingFormData) => bookingAPI.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["resourceBookings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      toast.success("Booking created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create booking");
    }
  });
};

// Update booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      bookingAPI.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["resourceBookings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      toast.success("Booking updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    }
  });
};

// Cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingAPI.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["resourceBookings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      toast.success("Booking cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel booking");
    }
  });
};

// Reschedule booking
export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      newStartTime,
      newEndTime,
      reason
    }: {
      id: string;
      newStartTime: string;
      newEndTime: string;
      reason?: string;
    }) => bookingAPI.rescheduleBooking(id, newStartTime, newEndTime, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["resourceBookings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      toast.success("Booking rescheduled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reschedule booking");
    }
  });
};

// Check overlap
export const useCheckOverlap = () => {
  return useMutation({
    mutationFn: (data: { resourceId: string; startTime: string; endTime: string }) =>
      bookingAPI.checkOverlap(data)
  });
};

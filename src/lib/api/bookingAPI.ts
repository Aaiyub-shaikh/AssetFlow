import { resources } from "@/data/mock";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Resource API calls
export const fetchResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`);
    if (!response.ok) throw new Error("Failed to fetch resources");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("Using mock resources data:", error);
    return resources;
  }
};

export const fetchResource = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`);
  if (!response.ok) throw new Error("Failed to fetch resource");
  const data = await response.json();
  return data.data;
};

// Booking API calls
export const fetchBookings = async (filters?: Record<string, any>) => {
  try {
    const query = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}/bookings?${query.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("Using mock bookings data:", error);
    const bookings = await getLocalBookings();
    let result = bookings;
    if (filters?.status) {
      result = result.filter(b => b.status === filters.status);
    }
    return result;
  }
};

export const fetchResourceBookings = async (resourceId: string, filters?: Record<string, any>) => {
  try {
    const query = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}/bookings/resource/${resourceId}?${query.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch resource bookings");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("Using mock fetchResourceBookings data:", error);
    const bookings = await getLocalBookings();
    let result = bookings.filter(b => {
      const bResId = b.resource?._id || b.resource || b.assetId;
      return bResId === resourceId;
    });
    if (filters?.status) {
      result = result.filter(b => b.status === filters.status);
    }
    return result;
  }
};

export const fetchUpcomingBookings = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}/upcoming`);
    if (!response.ok) throw new Error("Failed to fetch upcoming bookings");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.warn("Using mock fetchUpcomingBookings data:", error);
    const bookings = await getLocalBookings();
    const now = new Date();
    return bookings.filter(b => b.status === "upcoming" && new Date(b.startTime || b.startDate) >= now && (b.bookedBy?._id === userId || b.bookedById === userId));
  }
};

let localBookings: any[] = [];
let isLocalBookingsInitialized = false;

const getLocalBookings = async () => {
  if (!isLocalBookingsInitialized) {
    const { bookings } = await import("@/data/mock");
    localBookings = [...bookings];
    isLocalBookingsInitialized = true;
  }
  return localBookings;
};

export const checkOverlap = async (data: {
  resourceId: string;
  startTime: string;
  endTime: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/check-overlap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Time slot is not available");
    return result;
  } catch (error) {
    console.warn("Using mock checkOverlap data:", error);
    const bookings = await getLocalBookings();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    const overlap = bookings.some((b) => {
      // If resource is not matching or status is cancelled, skip
      if (b.status === "cancelled") return false;
      // b.resource might be an object if populated or string if ID. Mock data uses assetId/resourceId?
      // Our mock data `mock.ts` has `assetId`. The form uses `resource`. We need to handle this.
      // But wait! If the mock bookings don't match the new booking structure, we'll just check what exists.
      const bResId = b.resource?._id || b.resource || b.assetId;
      if (bResId !== data.resourceId) return false;
      
      const bStart = new Date(b.startTime || b.startDate);
      const bEnd = new Date(b.endTime || b.endDate);
      return start < bEnd && end > bStart;
    });

    if (overlap) {
      throw new Error("Time slot is already booked");
    }
    return { success: true, message: "Time slot is available" };
  }
};

export const createBooking = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create booking");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Using mock createBooking data:", error);
    const bookings = await getLocalBookings();
    
    // We need resource details to add it nicely
    const { resources, currentUser } = await import("@/data/mock");
    const resource = resources.find(r => r._id === data.resource);

    const newBooking = {
      _id: `bkg-${Date.now()}`,
      id: `bkg-${Date.now()}`,
      resource: resource || data.resource,
      title: data.title,
      description: data.description,
      bookedBy: currentUser,
      attendees: data.attendees || [],
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
      reminderTime: data.reminderTime || 15,
      status: "upcoming"
    };

    localBookings = [newBooking, ...bookings];

    const { useNotificationStore } = await import("@/stores/notificationStore");
    const resName = newBooking.resource?.name || newBooking.title || "Shared Resource";
    useNotificationStore.getState().addNotification({
      title: 'Booking Confirmed',
      message: `Your booking for "${resName}" is confirmed for ${new Date(newBooking.startTime).toLocaleString()} - ${new Date(newBooking.endTime).toLocaleString()}.`,
      type: 'success',
      link: '/bookings'
    });
    useNotificationStore.getState().addActivity({
      action: 'Booking Created',
      description: `Booking for "${resName}" created by ${newBooking.bookedBy?.name || 'User'}`,
      user: newBooking.bookedBy?.name || 'System User',
      type: 'booking'
    });

    return newBooking;
  }
};

export const updateBooking = async (id: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update booking");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Using mock updateBooking data:", error);
    const bookings = await getLocalBookings();
    const index = bookings.findIndex(b => b._id === id || b.id === id);
    if (index === -1) throw new Error("Booking not found");
    localBookings[index] = { ...localBookings[index], ...data };
    return localBookings[index];
  }
};

export const rescheduleBooking = async (
  id: string,
  newStartTime: string,
  newEndTime: string,
  reason?: string
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStartTime, newEndTime, reason })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reschedule booking");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Using mock rescheduleBooking data:", error);
    const bookings = await getLocalBookings();
    const index = bookings.findIndex(b => b._id === id || b.id === id);
    if (index === -1) throw new Error("Booking not found");
    localBookings[index] = { 
      ...localBookings[index], 
      startTime: newStartTime, 
      endTime: newEndTime,
      notes: (localBookings[index].notes || "") + `\nRescheduled: ${reason}`
    };

    const rescheduledBooking = localBookings[index];
    const { useNotificationStore } = await import("@/stores/notificationStore");
    const resName = rescheduledBooking.resource?.name || rescheduledBooking.title || "Shared Resource";
    useNotificationStore.getState().addNotification({
      title: 'Booking Rescheduled',
      message: `Your booking for "${resName}" is rescheduled to ${new Date(newStartTime).toLocaleString()} - ${new Date(newEndTime).toLocaleString()}.`,
      type: 'info',
      link: '/bookings'
    });
    useNotificationStore.getState().addActivity({
      action: 'Booking Rescheduled',
      description: `Rescheduled booking for "${resName}"`,
      user: rescheduledBooking.bookedBy?.name || 'System User',
      type: 'booking'
    });

    return rescheduledBooking;
  }
};

export const cancelBooking = async (id: string, reason?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel booking");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Using mock cancelBooking data:", error);
    const bookings = await getLocalBookings();
    const index = bookings.findIndex(b => b._id === id || b.id === id);
    if (index === -1) throw new Error("Booking not found");
    localBookings[index] = { 
      ...localBookings[index], 
      status: "cancelled",
      notes: (localBookings[index].notes || "") + `\nCancelled: ${reason}`
    };

    const cancelledBooking = localBookings[index];
    const { useNotificationStore } = await import("@/stores/notificationStore");
    const resName = cancelledBooking.resource?.name || cancelledBooking.title || "Shared Resource";
    useNotificationStore.getState().addNotification({
      title: 'Booking Cancelled',
      message: `Your booking for "${resName}" has been cancelled.`,
      type: 'error',
      link: '/bookings'
    });
    useNotificationStore.getState().addActivity({
      action: 'Booking Cancelled',
      description: `Cancelled booking for "${resName}"`,
      user: cancelledBooking.bookedBy?.name || 'System User',
      type: 'booking'
    });

    return cancelledBooking;
  }
};

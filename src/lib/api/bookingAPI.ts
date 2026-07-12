const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Resource API calls
export const fetchResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`);
  if (!response.ok) throw new Error("Failed to fetch resources");
  const data = await response.json();
  return data.data;
};

export const fetchResource = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`);
  if (!response.ok) throw new Error("Failed to fetch resource");
  const data = await response.json();
  return data.data;
};

// Booking API calls
export const fetchBookings = async (filters?: Record<string, any>) => {
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
};

export const fetchResourceBookings = async (resourceId: string, filters?: Record<string, any>) => {
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
};

export const fetchUpcomingBookings = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}/upcoming`);
  if (!response.ok) throw new Error("Failed to fetch upcoming bookings");
  const data = await response.json();
  return data.data;
};

export const checkOverlap = async (data: {
  resourceId: string;
  startTime: string;
  endTime: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/bookings/check-overlap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Time slot is not available");
  }
  return result;
};

export const createBooking = async (data: any) => {
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
};

export const updateBooking = async (id: string, data: any) => {
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
};

export const rescheduleBooking = async (
  id: string,
  newStartTime: string,
  newEndTime: string,
  reason?: string
) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newStartTime,
      newEndTime,
      reason
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reschedule booking");
  }

  const result = await response.json();
  return result.data;
};

export const cancelBooking = async (id: string, reason?: string) => {
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
};

// Booking and Resource types
export interface Resource {
  _id: string;
  name: string;
  type: "meeting_room" | "conference_hall" | "equipment" | "workspace";
  description?: string;
  location: string;
  capacity: number;
  amenities?: string[];
  isActive: boolean;
  workingHours?: {
    startTime: string;
    endTime: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Booking {
  _id: string;
  resource: Resource;
  title: string;
  description?: string;
  bookedBy: {
    _id: string;
    name: string;
    email: string;
  };
  attendees?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  reminderSent: boolean;
  reminderTime: number;
  notes?: string;
  isCancellationAllowed: boolean;
  cancellationReason?: string;
  rescheduledFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  resource: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  notes?: string;
  reminderTime?: number;
}

export interface OverlapCheckResponse {
  success: boolean;
  message: string;
  conflictingBooking?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  };
}

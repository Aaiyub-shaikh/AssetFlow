import Booking from "../models/Booking.js";

export const checkOverlap = async (resourceId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    resource: resourceId,
    status: { $in: ["upcoming", "ongoing"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(query);
  return overlappingBooking;
};

export const createBooking = async (bookingData) => {
  const { resource, startTime, endTime } = bookingData;

  // Check for overlaps
  const overlap = await checkOverlap(resource, new Date(startTime), new Date(endTime));
  if (overlap) {
    throw new Error(
      `Booking overlaps with existing booking from ${overlap.startTime.toLocaleString()} to ${overlap.endTime.toLocaleString()}`
    );
  }

  const booking = await Booking.create(bookingData);
  return booking.populate(["resource", "bookedBy", "attendees"]);
};

export const updateBooking = async (bookingId, updateData) => {
  const currentBooking = await Booking.findById(bookingId);
  
  // If start or end time is being changed, check for overlaps
  if (updateData.startTime || updateData.endTime) {
    const startTime = updateData.startTime || currentBooking.startTime;
    const endTime = updateData.endTime || currentBooking.endTime;
    
    const overlap = await checkOverlap(
      currentBooking.resource,
      new Date(startTime),
      new Date(endTime),
      bookingId
    );
    
    if (overlap) {
      throw new Error(
        `Booking overlaps with existing booking from ${overlap.startTime.toLocaleString()} to ${overlap.endTime.toLocaleString()}`
      );
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    updateData,
    { new: true, runValidators: true }
  ).populate(["resource", "bookedBy", "attendees"]);

  return updatedBooking;
};

export const cancelBooking = async (bookingId, cancellationReason = "") => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status === "completed" || booking.status === "cancelled") {
    throw new Error(`Cannot cancel a ${booking.status} booking`);
  }

  booking.status = "cancelled";
  booking.cancellationReason = cancellationReason;
  await booking.save();

  return booking.populate(["resource", "bookedBy", "attendees"]);
};

export const rescheduleBooking = async (bookingId, newStartTime, newEndTime, reason = "") => {
  const currentBooking = await Booking.findById(bookingId);
  
  if (!currentBooking) {
    throw new Error("Booking not found");
  }

  if (currentBooking.status === "completed" || currentBooking.status === "cancelled") {
    throw new Error(`Cannot reschedule a ${currentBooking.status} booking`);
  }

  // Check for overlaps with new times
  const overlap = await checkOverlap(
    currentBooking.resource,
    new Date(newStartTime),
    new Date(newEndTime),
    bookingId
  );

  if (overlap) {
    throw new Error(
      `New time slot overlaps with existing booking from ${overlap.startTime.toLocaleString()} to ${overlap.endTime.toLocaleString()}`
    );
  }

  // Store reference to old booking
  const oldBooking = {
    ...currentBooking.toObject(),
    _id: currentBooking._id
  };

  currentBooking.startTime = new Date(newStartTime);
  currentBooking.endTime = new Date(newEndTime);
  currentBooking.reminderSent = false;
  
  await currentBooking.save();

  return currentBooking.populate(["resource", "bookedBy", "attendees"]);
};

export const getBookingsByResource = async (resourceId, filters = {}) => {
  const query = { resource: resourceId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate && filters.endDate) {
    query.startTime = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  const bookings = await Booking.find(query)
    .populate(["resource", "bookedBy", "attendees"])
    .sort({ startTime: 1 });

  return bookings;
};

export const getUpcomingBookings = async (userId) => {
  const now = new Date();
  const bookings = await Booking.find({
    bookedBy: userId,
    status: "upcoming",
    startTime: { $gte: now }
  })
    .populate(["resource", "bookedBy", "attendees"])
    .sort({ startTime: 1 });

  return bookings;
};

export const updateBookingStatuses = async () => {
  const now = new Date();

  // Update to "ongoing" if within booking time
  await Booking.updateMany(
    {
      status: "upcoming",
      startTime: { $lte: now },
      endTime: { $gt: now }
    },
    { status: "ongoing" }
  );

  // Update to "completed" if past end time
  await Booking.updateMany(
    {
      status: { $in: ["upcoming", "ongoing"] },
      endTime: { $lt: now }
    },
    { status: "completed" }
  );
};

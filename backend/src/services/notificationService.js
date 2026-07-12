import Booking from "../models/Booking.js";

export const getBookingsNeedingReminder = async (reminderMinutes = 15) => {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + reminderMinutes * 60000);

  const bookings = await Booking.find({
    status: "upcoming",
    reminderSent: false,
    startTime: {
      $gte: now,
      $lte: reminderTime
    }
  }).populate(["resource", "bookedBy", "attendees"]);

  return bookings;
};

export const markReminderSent = async (bookingId) => {
  return await Booking.findByIdAndUpdate(
    bookingId,
    { reminderSent: true },
    { new: true }
  );
};

export const sendReminder = (booking) => {
  // This would integrate with your notification system
  // For now, returning the notification data structure
  const resourceName = booking.resource?.name || "Resource";
  const formattedTime = booking.startTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    type: "booking_reminder",
    title: `Reminder: ${booking.title}`,
    message: `Your booking of ${resourceName} is starting at ${formattedTime}`,
    bookingId: booking._id,
    userId: booking.bookedBy,
    severity: "info"
  };
};

export const getBookingStatistics = async (resourceId) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = await Booking.aggregate([
    {
      $match: {
        resource: resourceId,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const totalHours = await Booking.aggregate([
    {
      $match: {
        resource: resourceId,
        status: "completed",
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $project: {
        duration: {
          $divide: [
            { $subtract: ["$endTime", "$startTime"] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: "$duration" }
      }
    }
  ]);

  return {
    byStatus: stats,
    totalBookedHours: totalHours[0]?.totalHours || 0,
    period: "last 30 days"
  };
};

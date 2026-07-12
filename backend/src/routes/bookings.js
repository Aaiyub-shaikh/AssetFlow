import express from "express";
import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import {
  createBooking as createBookingService,
  updateBooking,
  cancelBooking,
  rescheduleBooking,
  getBookingsByResource,
  getUpcomingBookings,
  updateBookingStatuses,
  checkOverlap
} from "../services/bookingService.js";

const router = express.Router();

// Get all bookings with filters
router.get("/", async (req, res) => {
  try {
    const { resourceId, status, startDate, endDate, userId } = req.query;
    const filters = {};

    if (resourceId) filters.resource = resourceId;
    if (status) filters.status = status;
    if (userId) filters.bookedBy = userId;

    if (startDate && endDate) {
      filters.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(filters)
      .populate(["resource", "bookedBy", "attendees"])
      .sort({ startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single booking
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate([
      "resource",
      "bookedBy",
      "attendees"
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get bookings for a specific resource
router.get("/resource/:resourceId", async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filters = { status };

    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const bookings = await getBookingsByResource(req.params.resourceId, filters);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check for overlaps before booking
router.post("/check-overlap", async (req, res) => {
  try {
    const { resourceId, startTime, endTime } = req.body;

    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: resourceId, startTime, endTime"
      });
    }

    const overlap = await checkOverlap(
      resourceId,
      new Date(startTime),
      new Date(endTime)
    );

    if (overlap) {
      return res.json({
        success: false,
        message: "Time slot is already booked",
        conflictingBooking: {
          id: overlap._id,
          title: overlap.title,
          startTime: overlap.startTime,
          endTime: overlap.endTime,
          bookedBy: overlap.bookedBy
        }
      });
    }

    res.json({
      success: true,
      message: "Time slot is available"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create booking
router.post("/", async (req, res) => {
  try {
    const { resource, title, description, startTime, endTime, attendees, notes, reminderTime } =
      req.body;

    if (!resource || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: resource, title, startTime, endTime"
      });
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (endTimeDate <= startTimeDate) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    // Get or create a default system user
    let defaultUser = await User.findOne({ role: "system" });
    if (!defaultUser) {
      defaultUser = await User.create({
        name: "System User",
        email: "system@assetflow.local",
        role: "system"
      });
    }

    const bookingData = {
      resource,
      title,
      description,
      bookedBy: req.userId || defaultUser._id,
      attendees: attendees || [],
      startTime: startTimeDate,
      endTime: endTimeDate,
      notes,
      reminderTime: reminderTime || 15,
      status: "upcoming"
    };

    const booking = await createBookingService(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update booking
router.put("/:id", async (req, res) => {
  try {
    const { startTime, endTime, ...otherUpdates } = req.body;
    const updates = { ...otherUpdates };

    if (startTime) updates.startTime = new Date(startTime);
    if (endTime) updates.endTime = new Date(endTime);

    const booking = await updateBooking(req.params.id, updates);

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Reschedule booking
router.post("/:id/reschedule", async (req, res) => {
  try {
    const { newStartTime, newEndTime, reason } = req.body;

    if (!newStartTime || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: newStartTime, newEndTime"
      });
    }

    const booking = await rescheduleBooking(req.params.id, newStartTime, newEndTime, reason);

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel booking
router.post("/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await cancelBooking(req.params.id, reason);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's upcoming bookings
router.get("/user/:userId/upcoming", async (req, res) => {
  try {
    const bookings = await getUpcomingBookings(req.params.userId);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update booking statuses (call this periodically)
router.post("/admin/update-statuses", async (req, res) => {
  try {
    await updateBookingStatuses();

    res.json({
      success: true,
      message: "Booking statuses updated"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

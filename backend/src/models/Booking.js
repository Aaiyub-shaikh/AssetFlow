import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource is required"]
    },
    title: {
      type: String,
      required: [true, "Booking title is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    startTime: {
      type: Date,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time"
      }
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderTime: {
      type: Number,
      default: 15 // minutes before booking
    },
    notes: String,
    isCancellationAllowed: {
      type: Boolean,
      default: true
    },
    cancellationReason: String,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    }
  },
  { timestamps: true }
);

// Index for efficient overlap queries
bookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ bookedBy: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

export default mongoose.model("Booking", bookingSchema);

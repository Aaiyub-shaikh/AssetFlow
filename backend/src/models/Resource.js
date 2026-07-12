import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true
    },
    type: {
      type: String,
      enum: ["meeting_room", "conference_hall", "equipment", "workspace"],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    amenities: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    workingHours: {
      startTime: String, // HH:mm format
      endTime: String    // HH:mm format
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);

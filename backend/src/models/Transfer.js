import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, "Asset ID is required"],
      trim: true,
    },
    assetName: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    assetTag: {
      type: String,
      required: [true, "Asset tag is required"],
      trim: true,
    },
    fromDepartment: {
      type: String,
      required: [true, "Source department is required"],
      trim: true,
    },
    toDepartment: {
      type: String,
      required: [true, "Destination department is required"],
      trim: true,
    },
    requestedBy: {
      type: String,
      required: [true, "Requester name is required"],
      trim: true,
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "approved", "in_transit", "completed", "rejected"],
        message: "{VALUE} is not a valid transfer status",
      },
      default: "pending",
      lowercase: true,
    },
    priority: {
      type: String,
      required: true,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "{VALUE} is not a valid priority level",
      },
      default: "medium",
      lowercase: true,
    },
    reason: {
      type: String,
      required: [true, "Reason for transfer is required"],
      trim: true,
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transferSchema.index({ assetId: 1 });
transferSchema.index({ status: 1 });

const Transfer = mongoose.model("Transfer", transferSchema);
export default Transfer;

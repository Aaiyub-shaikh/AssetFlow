import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
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
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    allocatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["active", "returned", "overdue"],
        message: "{VALUE} is not a valid allocation status",
      },
      default: "active",
      lowercase: true,
    },
    conditionOnAllocation: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    conditionOnReturn: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

allocationSchema.index({ assetId: 1 });
allocationSchema.index({ employeeId: 1 });
allocationSchema.index({ status: 1 });

const Allocation = mongoose.model("Allocation", allocationSchema);
export default Allocation;

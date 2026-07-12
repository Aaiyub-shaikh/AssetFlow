import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    tag: {
      type: String,
      required: [true, "Asset tag is required"],
      unique: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    categoryId: {
      type: String,
      required: [true, "Category ID is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    departmentId: {
      type: String,
      required: [true, "Department ID is required"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: [
          "available",
          "allocated",
          "reserved",
          "maintenance",
          "retired",
          "lost",
          "disposed",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "available",
      lowercase: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    assignedToId: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, "Purchase date is required"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    currentValue: {
      type: Number,
      required: [true, "Current value is required"],
      min: [0, "Current value cannot be negative"],
    },
    warrantyExpiry: {
      type: Date,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["excellent", "good", "fair", "poor"],
        message: "{VALUE} is not a valid condition",
      },
      default: "good",
      lowercase: true,
    },
    lastMaintenance: {
      type: Date,
    },
    nextMaintenance: {
      type: Date,
    },
    image: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      required: [true, "QR code is required"],
      trim: true,
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

// Indexes for rapid lookups and filters
assetSchema.index({ tag: 1 });
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ categoryId: 1 });
assetSchema.index({ departmentId: 1 });

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;

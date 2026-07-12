const mongoose = require('mongoose');
const { ASSET_STATUS, ASSET_CONDITION } = require('../constants');

const historyEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    description: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition date is required'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition cost is required'],
      min: 0,
    },
    currentValue: {
      type: Number,
      min: 0,
      default: null,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    condition: {
      type: String,
      enum: Object.values(ASSET_CONDITION),
      default: ASSET_CONDITION.GOOD,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
      index: true,
    },
    isSharedResource: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    qrCode: {
      type: String,
      default: null,
    },
    images: [{ type: String }],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    lastMaintenance: {
      type: Date,
      default: null,
    },
    nextMaintenance: {
      type: Date,
      default: null,
    },
    history: [historyEntrySchema],
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assetSchema.index({ name: 'text', assetTag: 'text', serialNumber: 'text' });
assetSchema.index({ status: 1, department: 1 });
assetSchema.index({ isSharedResource: 1, status: 1 });

module.exports = mongoose.model('Asset', assetSchema);

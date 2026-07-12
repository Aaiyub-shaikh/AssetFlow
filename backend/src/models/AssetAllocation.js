const mongoose = require('mongoose');
const { ALLOCATION_STATUS } = require('../constants');

const assetAllocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ALLOCATION_STATUS),
      default: ALLOCATION_STATUS.ACTIVE,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

assetAllocationSchema.index({ asset: 1, status: 1 });
assetAllocationSchema.index({ employee: 1, status: 1 });

module.exports = mongoose.model('AssetAllocation', assetAllocationSchema);

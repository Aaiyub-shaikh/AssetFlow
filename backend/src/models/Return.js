const mongoose = require('mongoose');
const { ASSET_CONDITION } = require('../constants');

const returnSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetAllocation',
      required: true,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    condition: {
      type: String,
      enum: Object.values(ASSET_CONDITION),
      required: true,
    },
    conditionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    requiresMaintenance: {
      type: Boolean,
      default: false,
    },
    returnedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

returnSchema.index({ asset: 1, returnedAt: -1 });

module.exports = mongoose.model('Return', returnSchema);

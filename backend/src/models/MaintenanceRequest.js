const mongoose = require('mongoose');
const { MAINTENANCE_STATUS, MAINTENANCE_TYPE, PRIORITY } = require('../constants');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPE),
      default: MAINTENANCE_TYPE.CORRECTIVE,
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.MEDIUM,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ asset: 1, status: 1 });
maintenanceRequestSchema.index({ assignedTechnician: 1, status: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

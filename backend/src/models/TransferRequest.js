const mongoose = require('mongoose');
const { TRANSFER_STATUS, PRIORITY } = require('../constants');

const approvalSchema = new mongoose.Schema(
  {
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ['approved', 'rejected'], required: true },
    comments: { type: String, default: '' },
    approvedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const transferRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    fromDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    toDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(TRANSFER_STATUS),
      default: TRANSFER_STATUS.REQUESTED,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.MEDIUM,
    },
    reason: {
      type: String,
      required: [true, 'Transfer reason is required'],
      trim: true,
    },
    approvals: [approvalSchema],
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

transferRequestSchema.index({ status: 1, fromDepartment: 1, toDepartment: 1 });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);

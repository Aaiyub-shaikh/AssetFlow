const mongoose = require('mongoose');
const { AUDIT_STATUS } = require('../constants');

const auditCycleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Audit title is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AUDIT_STATUS),
      default: AUDIT_STATUS.PLANNED,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalAssets: {
      type: Number,
      default: 0,
    },
    verifiedAssets: {
      type: Number,
      default: 0,
    },
    discrepancies: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    reportUrl: {
      type: String,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

auditCycleSchema.index({ status: 1, department: 1 });

module.exports = mongoose.model('AuditCycle', auditCycleSchema);

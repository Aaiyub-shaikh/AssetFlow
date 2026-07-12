const mongoose = require('mongoose');
const { AUDIT_RESULT_STATUS } = require('../constants');

const auditResultSchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: true,
      index: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AUDIT_RESULT_STATUS),
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    images: [{ type: String }],
  },
  { timestamps: true }
);

auditResultSchema.index({ auditCycle: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('AuditResult', auditResultSchema);

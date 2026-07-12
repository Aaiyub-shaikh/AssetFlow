const AppError = require('../utils/AppError');
const { AuditCycle, AuditResult, Asset, Department, User } = require('../models');
const { AUDIT_STATUS, AUDIT_RESULT_STATUS, ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const getAudits = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;

  const [audits, total] = await Promise.all([
    AuditCycle.find(filter)
      .populate('department', 'name code')
      .populate('auditor', 'name email')
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    AuditCycle.countDocuments(filter),
  ]);

  return { audits, pagination: buildPaginationMeta(total, page, limit) };
};

const getAuditById = async (id) => {
  const audit = await AuditCycle.findById(id)
    .populate('department', 'name code')
    .populate('auditor', 'name email profileImage')
    .populate('createdBy', 'name email')
    .populate('closedBy', 'name email');

  if (!audit) throw new AppError('Audit cycle not found', 404);

  const results = await AuditResult.find({ auditCycle: id })
    .populate('asset', 'name assetTag serialNumber status location')
    .populate('verifiedBy', 'name email');

  return { audit, results };
};

const createAudit = async (data, performedBy, req) => {
  const auditor = await User.findById(data.auditorId);
  if (!auditor) throw new AppError('Auditor not found', 404);

  if (data.department) {
    const dept = await Department.findById(data.department);
    if (!dept) throw new AppError('Department not found', 404);
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (startDate >= endDate) {
    throw new AppError('End date must be after start date', 400);
  }

  const assetFilter = data.department ? { department: data.department } : {};
  const totalAssets = await Asset.countDocuments({
    ...assetFilter,
    status: { $nin: ['disposed', 'retired'] },
  });

  const audit = await AuditCycle.create({
    title: data.title,
    department: data.department || null,
    startDate,
    endDate,
    auditor: data.auditorId,
    createdBy: performedBy._id,
    totalAssets,
    notes: data.notes || '',
    status: AUDIT_STATUS.PLANNED,
  });

  const populated = await AuditCycle.findById(audit._id)
    .populate('department', 'name code')
    .populate('auditor', 'name email');

  await createNotification({
    recipientId: auditor._id,
    title: 'Audit Assignment',
    message: `You have been assigned to audit: ${data.title}`,
    type: 'info',
    link: `/audits/${audit._id}`,
    entityType: 'AuditCycle',
    entityId: audit._id,
    recipientEmail: auditor.email,
    sendEmailNotification: true,
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.AUDIT,
    entity: 'AuditCycle',
    entityId: audit._id,
    description: `Created audit: ${data.title}`,
    req,
  });

  return populated;
};

const startAudit = async (id, performedBy, req) => {
  const audit = await AuditCycle.findById(id);
  if (!audit) throw new AppError('Audit cycle not found', 404);

  audit.status = AUDIT_STATUS.IN_PROGRESS;
  await audit.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'AuditCycle',
    entityId: audit._id,
    description: 'Audit started',
    req,
  });

  return audit;
};

const verifyAsset = async (auditId, data, performedBy, req) => {
  const audit = await AuditCycle.findById(auditId);
  if (!audit) throw new AppError('Audit cycle not found', 404);

  if (![AUDIT_STATUS.IN_PROGRESS, AUDIT_STATUS.PLANNED].includes(audit.status)) {
    throw new AppError('Audit is not active', 400);
  }

  if (audit.status === AUDIT_STATUS.PLANNED) {
    audit.status = AUDIT_STATUS.IN_PROGRESS;
  }

  const asset = await Asset.findById(data.assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  const existing = await AuditResult.findOne({ auditCycle: auditId, asset: data.assetId });
  if (existing) {
    existing.status = data.status;
    existing.notes = data.notes || '';
    existing.verifiedBy = performedBy._id;
    existing.verifiedAt = new Date();
    await existing.save();
  } else {
    await AuditResult.create({
      auditCycle: auditId,
      asset: data.assetId,
      status: data.status,
      verifiedBy: performedBy._id,
      notes: data.notes || '',
    });
  }

  const results = await AuditResult.find({ auditCycle: auditId });
  audit.verifiedAssets = results.length;
  audit.discrepancies = results.filter(
    (r) => [AUDIT_RESULT_STATUS.MISSING, AUDIT_RESULT_STATUS.DAMAGED].includes(r.status)
  ).length;
  await audit.save();

  if ([AUDIT_RESULT_STATUS.MISSING, AUDIT_RESULT_STATUS.DAMAGED].includes(data.status)) {
    const managers = await User.find({ role: { $in: ['admin', 'asset_manager'] }, status: 'active' });
    await Promise.all(
      managers.map((mgr) =>
        createNotification({
          recipientId: mgr._id,
          title: 'Audit Discrepancy',
          message: `Asset "${asset.name}" marked as ${data.status} during audit.`,
          type: 'error',
          link: `/audits/${auditId}`,
          entityType: 'AuditCycle',
          entityId: auditId,
        })
      )
    );
  }

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.AUDIT,
    entity: 'AuditResult',
    entityId: asset._id,
    description: `Verified asset ${asset.name} as ${data.status}`,
    req,
  });

  return { audit, result: { assetId: data.assetId, status: data.status } };
};

const closeAudit = async (id, performedBy, req) => {
  const audit = await AuditCycle.findById(id);
  if (!audit) throw new AppError('Audit cycle not found', 404);

  audit.status = AUDIT_STATUS.CLOSED;
  audit.closedAt = new Date();
  audit.closedBy = performedBy._id;
  await audit.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'AuditCycle',
    entityId: audit._id,
    description: `Audit closed: ${audit.title}`,
    req,
  });

  return audit;
};

module.exports = {
  getAudits,
  getAuditById,
  createAudit,
  startAudit,
  verifyAsset,
  closeAudit,
};

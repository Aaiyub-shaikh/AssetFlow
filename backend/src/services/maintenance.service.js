const AppError = require('../utils/AppError');
const { MaintenanceRequest, Asset, User } = require('../models');
const {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  ACTIVITY_ACTIONS,
  ROLES,
} = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const getMaintenanceRequests = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.asset) filter.asset = query.asset;
  if (query.type) filter.type = query.type;

  if (currentUser.role === ROLES.EMPLOYEE) {
    filter.requestedBy = currentUser._id;
  } else if (currentUser.role === ROLES.ASSET_MANAGER) {
    // Asset managers see all
  }

  const [requests, total] = await Promise.all([
    MaintenanceRequest.find(filter)
      .populate('asset', 'name assetTag serialNumber status')
      .populate('requestedBy', 'name email')
      .populate('assignedTechnician', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MaintenanceRequest.countDocuments(filter),
  ]);

  return { requests, pagination: buildPaginationMeta(total, page, limit) };
};

const createMaintenanceRequest = async (data, performedBy, req) => {
  const asset = await Asset.findById(data.assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  const request = await MaintenanceRequest.create({
    asset: data.assetId,
    requestedBy: performedBy._id,
    type: data.type || 'corrective',
    priority: data.priority || 'medium',
    description: data.description,
    scheduledDate: data.scheduledDate || null,
    status: MAINTENANCE_STATUS.PENDING,
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('asset', 'name assetTag')
    .populate('requestedBy', 'name email');

  const managers = await User.find({
    role: { $in: [ROLES.ASSET_MANAGER, ROLES.ADMIN] },
    status: 'active',
  });

  await Promise.all(
    managers.map((mgr) =>
      createNotification({
        recipientId: mgr._id,
        title: 'New Maintenance Request',
        message: `Maintenance requested for "${asset.name}": ${data.description.substring(0, 100)}`,
        type: 'warning',
        link: `/maintenance/${request._id}`,
        entityType: 'MaintenanceRequest',
        entityId: request._id,
      })
    )
  );

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.MAINTAIN,
    entity: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance requested for ${asset.name}`,
    req,
  });

  return populated;
};

const approveMaintenance = async (id, performedBy, data, req) => {
  const request = await MaintenanceRequest.findById(id).populate('asset').populate('requestedBy');
  if (!request) throw new AppError('Maintenance request not found', 404);

  if (request.status !== MAINTENANCE_STATUS.PENDING) {
    throw new AppError('Request is not pending approval', 400);
  }

  request.status = MAINTENANCE_STATUS.APPROVED;
  request.approvedBy = performedBy._id;
  request.approvedAt = new Date();
  request.scheduledDate = data.scheduledDate || request.scheduledDate;

  if (data.assignedTechnician) {
    const tech = await User.findById(data.assignedTechnician);
    if (!tech) throw new AppError('Technician not found', 404);
    request.assignedTechnician = data.assignedTechnician;
    request.status = MAINTENANCE_STATUS.ASSIGNED;
  }

  request.asset.status = ASSET_STATUS.UNDER_MAINTENANCE;
  await request.asset.save();
  await request.save();

  await createNotification({
    recipientId: request.requestedBy._id,
    title: 'Maintenance Approved',
    message: `Your maintenance request for "${request.asset.name}" has been approved.`,
    type: 'success',
    link: `/maintenance/${request._id}`,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
  });

  if (request.assignedTechnician) {
    await createNotification({
      recipientId: request.assignedTechnician,
      title: 'Maintenance Assigned',
      message: `You have been assigned to maintain "${request.asset.name}".`,
      type: 'info',
      link: `/maintenance/${request._id}`,
    });
  }

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Maintenance request approved',
    req,
  });

  return request;
};

const startMaintenance = async (id, performedBy, req) => {
  const request = await MaintenanceRequest.findById(id).populate('asset');
  if (!request) throw new AppError('Maintenance request not found', 404);

  if (![MAINTENANCE_STATUS.APPROVED, MAINTENANCE_STATUS.ASSIGNED].includes(request.status)) {
    throw new AppError('Maintenance cannot be started in current status', 400);
  }

  request.status = MAINTENANCE_STATUS.IN_PROGRESS;
  request.startedAt = new Date();
  await request.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Maintenance started',
    req,
  });

  return request;
};

const resolveMaintenance = async (id, performedBy, data, req) => {
  const request = await MaintenanceRequest.findById(id).populate('asset').populate('requestedBy');
  if (!request) throw new AppError('Maintenance request not found', 404);

  if (request.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
    throw new AppError('Maintenance must be in progress to resolve', 400);
  }

  request.status = MAINTENANCE_STATUS.RESOLVED;
  request.resolvedAt = new Date();
  request.cost = data.cost || 0;
  request.resolutionNotes = data.resolutionNotes || '';

  const asset = request.asset;
  asset.status = ASSET_STATUS.AVAILABLE;
  asset.lastMaintenance = new Date();
  asset.nextMaintenance = data.nextMaintenance || null;
  asset.history.push({
    action: 'maintenance_completed',
    description: request.resolutionNotes || 'Maintenance completed',
    performedBy: performedBy._id,
  });
  await asset.save();
  await request.save();

  await createNotification({
    recipientId: request.requestedBy._id,
    title: 'Maintenance Resolved',
    message: `Maintenance for "${asset.name}" has been completed.`,
    type: 'success',
    link: `/maintenance/${request._id}`,
    entityType: 'MaintenanceRequest',
    entityId: request._id,
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'MaintenanceRequest',
    entityId: request._id,
    description: `Maintenance resolved for ${asset.name}`,
    req,
  });

  return request;
};

const rejectMaintenance = async (id, performedBy, reason, req) => {
  const request = await MaintenanceRequest.findById(id).populate('requestedBy').populate('asset');
  if (!request) throw new AppError('Maintenance request not found', 404);

  request.status = MAINTENANCE_STATUS.REJECTED;
  request.rejectionReason = reason;
  await request.save();

  await createNotification({
    recipientId: request.requestedBy._id,
    title: 'Maintenance Rejected',
    message: `Your maintenance request for "${request.asset.name}" was rejected.`,
    type: 'error',
    link: `/maintenance/${request._id}`,
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'MaintenanceRequest',
    entityId: request._id,
    description: 'Maintenance request rejected',
    req,
  });

  return request;
};

module.exports = {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenance,
  startMaintenance,
  resolveMaintenance,
  rejectMaintenance,
};

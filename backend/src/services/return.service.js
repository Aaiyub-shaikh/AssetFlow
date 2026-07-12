const AppError = require('../utils/AppError');
const { Return, Asset, AssetAllocation, User } = require('../models');
const {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  ACTIVITY_ACTIONS,
} = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const getReturns = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.asset) filter.asset = query.asset;
  if (currentUser.role === 'employee') filter.returnedBy = currentUser._id;

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .populate('asset', 'name assetTag')
      .populate('returnedBy', 'name email')
      .populate('receivedBy', 'name email')
      .populate('allocation')
      .sort({ returnedAt: -1 })
      .skip(skip)
      .limit(limit),
    Return.countDocuments(filter),
  ]);

  return { returns, pagination: buildPaginationMeta(total, page, limit) };
};

const processReturn = async (data, performedBy, req) => {
  const allocation = await AssetAllocation.findById(data.allocationId)
    .populate('asset')
    .populate('employee');

  if (!allocation) throw new AppError('Allocation not found', 404);
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE) {
    throw new AppError('Allocation is not active', 400);
  }

  const asset = allocation.asset;
  const requiresMaintenance = data.requiresMaintenance || ['poor', 'fair'].includes(data.condition);

  const returnRecord = await Return.create({
    asset: asset._id,
    allocation: allocation._id,
    returnedBy: allocation.employee._id,
    receivedBy: performedBy._id,
    condition: data.condition,
    conditionNotes: data.conditionNotes || '',
    requiresMaintenance,
    notes: data.notes || '',
  });

  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.returnedAt = new Date();
  await allocation.save();

  asset.assignedTo = null;
  asset.condition = data.condition;
  asset.status = requiresMaintenance ? ASSET_STATUS.UNDER_MAINTENANCE : ASSET_STATUS.AVAILABLE;
  asset.history.push({
    action: 'returned',
    description: `Returned by ${allocation.employee.name}. Condition: ${data.condition}`,
    performedBy: performedBy._id,
    metadata: { requiresMaintenance },
  });
  await asset.save();

  const populated = await Return.findById(returnRecord._id)
    .populate('asset', 'name assetTag')
    .populate('returnedBy', 'name email')
    .populate('receivedBy', 'name email');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.RETURN,
    entity: 'Return',
    entityId: returnRecord._id,
    description: `Asset ${asset.name} returned`,
    req,
  });

  await createNotification({
    recipientId: allocation.employee._id,
    title: 'Asset Return Processed',
    message: `Your return of "${asset.name}" has been processed.`,
    type: 'info',
    link: `/assets/${asset._id}`,
    entityType: 'Return',
    entityId: returnRecord._id,
  });

  if (requiresMaintenance) {
    const managers = await User.find({ role: { $in: ['asset_manager', 'admin'] }, status: 'active' });
    await Promise.all(
      managers.map((mgr) =>
        createNotification({
          recipientId: mgr._id,
          title: 'Maintenance Required After Return',
          message: `Asset "${asset.name}" returned in ${data.condition} condition and needs maintenance.`,
          type: 'warning',
          link: `/assets/${asset._id}`,
        })
      )
    );
  }

  return populated;
};

module.exports = { getReturns, processReturn };

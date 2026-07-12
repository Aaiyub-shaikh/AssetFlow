const AppError = require('../utils/AppError');
const {
  Asset,
  AssetAllocation,
  User,
  Department,
  TransferRequest,
} = require('../models');
const {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  ACTIVITY_ACTIONS,
} = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const getAllocations = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.employee) filter.employee = query.employee;
  if (query.asset) filter.asset = query.asset;
  if (query.department) filter.department = query.department;

  if (currentUser.role === 'employee') {
    filter.employee = currentUser._id;
  } else if (currentUser.role === 'department_head') {
    filter.department = currentUser.department?._id || currentUser.department;
  }

  const [allocations, total] = await Promise.all([
    AssetAllocation.find(filter)
      .populate('asset', 'name assetTag serialNumber status')
      .populate('employee', 'name email profileImage')
      .populate('department', 'name code')
      .populate('allocatedBy', 'name email')
      .sort({ allocatedAt: -1 })
      .skip(skip)
      .limit(limit),
    AssetAllocation.countDocuments(filter),
  ]);

  return { allocations, pagination: buildPaginationMeta(total, page, limit) };
};

const allocateAsset = async (data, performedBy, req) => {
  const asset = await Asset.findById(data.assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  const employee = await User.findById(data.employeeId).populate('department');
  if (!employee) throw new AppError('Employee not found', 404);

  if (asset.status === ASSET_STATUS.ALLOCATED) {
    throw new AppError(
      'Asset is already allocated. Create a transfer request instead.',
      409,
      [{ field: 'assetId', message: 'Asset already allocated' }]
    );
  }

  if (![ASSET_STATUS.AVAILABLE, ASSET_STATUS.RESERVED].includes(asset.status)) {
    throw new AppError(`Asset cannot be allocated. Current status: ${asset.status}`, 400);
  }

  const existingAllocation = await AssetAllocation.findOne({
    asset: data.assetId,
    status: ALLOCATION_STATUS.ACTIVE,
  });
  if (existingAllocation) {
    throw new AppError('Active allocation already exists for this asset', 409);
  }

  const departmentId = employee.department?._id || employee.department || data.departmentId;
  if (!departmentId) throw new AppError('Employee must belong to a department', 400);

  const allocation = await AssetAllocation.create({
    asset: data.assetId,
    employee: data.employeeId,
    department: departmentId,
    allocatedBy: performedBy._id,
    expectedReturnDate: data.expectedReturnDate || null,
    notes: data.notes || '',
    status: ALLOCATION_STATUS.ACTIVE,
  });

  asset.status = ASSET_STATUS.ALLOCATED;
  asset.assignedTo = data.employeeId;
  asset.department = departmentId;
  asset.history.push({
    action: 'allocated',
    description: `Allocated to ${employee.name}`,
    performedBy: performedBy._id,
    metadata: { employeeId: data.employeeId },
  });
  await asset.save();

  const populated = await AssetAllocation.findById(allocation._id)
    .populate('asset', 'name assetTag')
    .populate('employee', 'name email')
    .populate('department', 'name code');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.ALLOCATE,
    entity: 'AssetAllocation',
    entityId: allocation._id,
    description: `Allocated ${asset.name} to ${employee.name}`,
    req,
  });

  await createNotification({
    recipientId: employee._id,
    title: 'Asset Assigned',
    message: `Asset "${asset.name}" (${asset.assetTag}) has been assigned to you.`,
    type: 'success',
    link: `/assets/${asset._id}`,
    entityType: 'AssetAllocation',
    entityId: allocation._id,
    recipientEmail: employee.email,
    sendEmailNotification: true,
  });

  return populated;
};

const suggestTransfer = async (assetId, performedBy) => {
  const asset = await Asset.findById(assetId).populate('assignedTo', 'name email');
  if (!asset) throw new AppError('Asset not found', 404);

  if (asset.status !== ASSET_STATUS.ALLOCATED) {
    throw new AppError('Asset is not allocated', 400);
  }

  return {
    message: 'Asset is currently allocated. Please create a transfer request.',
    asset: {
      id: asset._id,
      name: asset.name,
      tag: asset.assetTag,
      assignedTo: asset.assignedTo,
    },
    action: 'create_transfer_request',
  };
};

module.exports = {
  getAllocations,
  allocateAsset,
  suggestTransfer,
};

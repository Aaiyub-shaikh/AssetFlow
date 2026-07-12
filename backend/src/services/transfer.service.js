const AppError = require('../utils/AppError');
const {
  TransferRequest,
  Asset,
  Department,
  User,
  AssetAllocation,
} = require('../models');
const {
  TRANSFER_STATUS,
  ASSET_STATUS,
  ALLOCATION_STATUS,
  ROLES,
  ACTIVITY_ACTIONS,
} = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const getTransfers = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.asset) filter.asset = query.asset;

  if (currentUser.role === ROLES.DEPARTMENT_HEAD) {
    const deptId = currentUser.department?._id || currentUser.department;
    filter.$or = [{ fromDepartment: deptId }, { toDepartment: deptId }];
  } else if (currentUser.role === ROLES.EMPLOYEE) {
    filter.requestedBy = currentUser._id;
  }

  const [transfers, total] = await Promise.all([
    TransferRequest.find(filter)
      .populate('asset', 'name assetTag serialNumber status')
      .populate('fromDepartment', 'name code')
      .populate('toDepartment', 'name code')
      .populate('requestedBy', 'name email')
      .populate('approvals.approver', 'name email role')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit),
    TransferRequest.countDocuments(filter),
  ]);

  return { transfers, pagination: buildPaginationMeta(total, page, limit) };
};

const createTransferRequest = async (data, performedBy, req) => {
  const asset = await Asset.findById(data.assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  const [fromDept, toDept] = await Promise.all([
    Department.findById(data.fromDepartment || asset.department),
    Department.findById(data.toDepartment),
  ]);

  if (!fromDept) throw new AppError('Source department not found', 404);
  if (!toDept) throw new AppError('Target department not found', 404);
  if (fromDept._id.equals(toDept._id)) {
    throw new AppError('Source and target departments must be different', 400);
  }

  const pendingTransfer = await TransferRequest.findOne({
    asset: data.assetId,
    status: { $nin: [TRANSFER_STATUS.COMPLETED, TRANSFER_STATUS.REJECTED] },
  });
  if (pendingTransfer) {
    throw new AppError('A pending transfer request already exists for this asset', 409);
  }

  const transfer = await TransferRequest.create({
    asset: data.assetId,
    fromDepartment: fromDept._id,
    toDepartment: toDept._id,
    requestedBy: performedBy._id,
    reason: data.reason,
    priority: data.priority || 'medium',
    status: TRANSFER_STATUS.REQUESTED,
  });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('asset', 'name assetTag')
    .populate('fromDepartment', 'name code')
    .populate('toDepartment', 'name code')
    .populate('requestedBy', 'name email');

  if (fromDept.head) {
    const head = await User.findById(fromDept.head);
    if (head) {
      await createNotification({
        recipientId: head._id,
        title: 'Transfer Request Pending',
        message: `Transfer request for "${asset.name}" requires your approval.`,
        type: 'warning',
        link: `/transfers/${transfer._id}`,
        entityType: 'TransferRequest',
        entityId: transfer._id,
        recipientEmail: head.email,
        sendEmailNotification: true,
      });
    }
  }

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.TRANSFER,
    entity: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer requested for ${asset.name}`,
    req,
  });

  return populated;
};

const approveTransfer = async (id, performedBy, comments, req) => {
  const transfer = await TransferRequest.findById(id)
    .populate('asset')
    .populate('fromDepartment')
    .populate('toDepartment');

  if (!transfer) throw new AppError('Transfer request not found', 404);
  if ([TRANSFER_STATUS.COMPLETED, TRANSFER_STATUS.REJECTED].includes(transfer.status)) {
    throw new AppError('Transfer request is already finalized', 400);
  }

  const role = performedBy.role;

  if (role === ROLES.DEPARTMENT_HEAD) {
    const deptId = performedBy.department?._id || performedBy.department;
    if (!transfer.fromDepartment._id.equals(deptId)) {
      throw new AppError('You can only approve transfers from your department', 403);
    }
    if (transfer.status !== TRANSFER_STATUS.REQUESTED) {
      throw new AppError('Transfer is not awaiting department head approval', 400);
    }

    transfer.status = TRANSFER_STATUS.DEPT_HEAD_APPROVED;
    transfer.approvals.push({
      approver: performedBy._id,
      role: ROLES.DEPARTMENT_HEAD,
      status: 'approved',
      comments,
    });
    await transfer.save();

    const assetManagers = await User.find({ role: ROLES.ASSET_MANAGER, status: 'active' });
    await Promise.all(
      assetManagers.map((mgr) =>
        createNotification({
          recipientId: mgr._id,
          title: 'Transfer Awaiting Asset Manager Approval',
          message: `Transfer for "${transfer.asset.name}" approved by dept head, needs your approval.`,
          type: 'info',
          link: `/transfers/${transfer._id}`,
          entityType: 'TransferRequest',
          entityId: transfer._id,
        })
      )
    );
  } else if (role === ROLES.ASSET_MANAGER || role === ROLES.ADMIN) {
    if (![TRANSFER_STATUS.DEPT_HEAD_APPROVED, TRANSFER_STATUS.REQUESTED].includes(transfer.status)) {
      if (transfer.status === TRANSFER_STATUS.REQUESTED && role === ROLES.ADMIN) {
        // Admin can fast-track
      } else if (transfer.status !== TRANSFER_STATUS.DEPT_HEAD_APPROVED) {
        throw new AppError('Transfer must be approved by department head first', 400);
      }
    }

    transfer.status = TRANSFER_STATUS.ASSET_MANAGER_APPROVED;
    transfer.approvals.push({
      approver: performedBy._id,
      role,
      status: 'approved',
      comments,
    });
    await transfer.save();

    await completeTransfer(transfer._id, performedBy, req);
  } else {
    throw new AppError('Insufficient permissions to approve transfer', 403);
  }

  const updated = await TransferRequest.findById(id)
    .populate('asset', 'name assetTag')
    .populate('fromDepartment', 'name code')
    .populate('toDepartment', 'name code')
    .populate('requestedBy', 'name email')
    .populate('approvals.approver', 'name email role');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer approved by ${role}`,
    req,
  });

  return updated;
};

const rejectTransfer = async (id, performedBy, comments, req) => {
  const transfer = await TransferRequest.findById(id).populate('asset').populate('requestedBy');
  if (!transfer) throw new AppError('Transfer request not found', 404);

  if ([TRANSFER_STATUS.COMPLETED, TRANSFER_STATUS.REJECTED].includes(transfer.status)) {
    throw new AppError('Transfer request is already finalized', 400);
  }

  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.approvals.push({
    approver: performedBy._id,
    role: performedBy.role,
    status: 'rejected',
    comments,
  });
  await transfer.save();

  await createNotification({
    recipientId: transfer.requestedBy._id,
    title: 'Transfer Rejected',
    message: `Your transfer request for "${transfer.asset.name}" was rejected.`,
    type: 'error',
    link: `/transfers/${transfer._id}`,
    entityType: 'TransferRequest',
    entityId: transfer._id,
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'TransferRequest',
    entityId: transfer._id,
    description: 'Transfer request rejected',
    req,
  });

  return transfer;
};

const completeTransfer = async (id, performedBy, req) => {
  const transfer = await TransferRequest.findById(id)
    .populate('asset')
    .populate('toDepartment')
    .populate('requestedBy');

  if (!transfer) throw new AppError('Transfer request not found', 404);

  const asset = transfer.asset;

  await AssetAllocation.updateMany(
    { asset: asset._id, status: ALLOCATION_STATUS.ACTIVE },
    { status: ALLOCATION_STATUS.RETURNED, returnedAt: new Date() }
  );

  asset.department = transfer.toDepartment._id;
  asset.history.push({
    action: 'transferred',
    description: `Transferred to ${transfer.toDepartment.name}`,
    performedBy: performedBy._id,
    metadata: { transferId: transfer._id },
  });

  if (asset.status === ASSET_STATUS.ALLOCATED) {
    // Keep allocated status but update department
  } else {
    asset.status = ASSET_STATUS.AVAILABLE;
    asset.assignedTo = null;
  }

  await asset.save();

  transfer.status = TRANSFER_STATUS.COMPLETED;
  transfer.completedAt = new Date();
  transfer.completedBy = performedBy._id;
  await transfer.save();

  await createNotification({
    recipientId: transfer.requestedBy._id,
    title: 'Transfer Completed',
    message: `Transfer for "${asset.name}" to ${transfer.toDepartment.name} is complete.`,
    type: 'success',
    link: `/transfers/${transfer._id}`,
    entityType: 'TransferRequest',
    entityId: transfer._id,
    recipientEmail: transfer.requestedBy.email,
    sendEmailNotification: true,
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.TRANSFER,
    entity: 'TransferRequest',
    entityId: transfer._id,
    description: `Transfer completed for ${asset.name}`,
    req,
  });

  return transfer;
};

module.exports = {
  getTransfers,
  createTransferRequest,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
};

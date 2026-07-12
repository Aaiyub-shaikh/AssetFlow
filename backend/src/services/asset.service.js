const AppError = require('../utils/AppError');
const { Asset, AssetCategory, Department } = require('../models');
const { ASSET_STATUS, ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { generateAssetTag, generateQRCode } = require('../helpers/generators');
const { uploadFile, uploadMultiple } = require('../helpers/upload');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const buildAssetFilter = (query, currentUser) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.department) filter.department = query.department;
  if (query.isSharedResource !== undefined) {
    filter.isSharedResource = query.isSharedResource === 'true';
  }
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { assetTag: { $regex: query.search, $options: 'i' } },
      { serialNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (currentUser?.role === 'employee') {
    filter.$or = [
      { assignedTo: currentUser._id },
      { isSharedResource: true, status: ASSET_STATUS.AVAILABLE },
    ];
  }

  return filter;
};

const getAssets = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = buildAssetFilter(query, currentUser);

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate('category', 'name code icon')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email profileImage')
      .populate('registeredBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(filter),
  ]);

  return { assets, pagination: buildPaginationMeta(total, page, limit) };
};

const getAssetById = async (id) => {
  const asset = await Asset.findById(id)
    .populate('category', 'name code icon depreciationRate warrantyPeriod')
    .populate('department', 'name code location')
    .populate('assignedTo', 'name email profileImage department')
    .populate('registeredBy', 'name email')
    .populate('history.performedBy', 'name email');

  if (!asset) throw new AppError('Asset not found', 404);
  return asset;
};

const registerAsset = async (data, performedBy, files, req) => {
  const [category, department] = await Promise.all([
    AssetCategory.findById(data.category),
    data.department ? Department.findById(data.department) : null,
  ]);

  if (!category) throw new AppError('Category not found', 404);
  if (data.department && !department) throw new AppError('Department not found', 404);

  const tagExists = await Asset.findOne({
    $or: [
      { assetTag: data.assetTag?.toUpperCase() },
      { serialNumber: data.serialNumber },
    ],
  });
  if (tagExists) {
    if (tagExists.assetTag === data.assetTag?.toUpperCase()) {
      throw new AppError('Asset tag already exists', 409);
    }
    throw new AppError('Serial number already exists', 409);
  }

  const assetTag = data.assetTag?.toUpperCase() || generateAssetTag();

  const duplicateCheck = await Asset.findOne({
    $or: [{ assetTag }, { serialNumber: data.serialNumber }],
  });
  if (duplicateCheck) {
    throw new AppError('Duplicate asset tag or serial number', 409);
  }

  const qrData = { tag: assetTag, serial: data.serialNumber, name: data.name };
  const qrCode = await generateQRCode(qrData);

  let images = [];
  let documents = [];

  if (files?.images?.length) {
    const uploaded = await uploadMultiple(files.images, 'assets');
    images = uploaded.map((u) => u.url);
  }
  if (files?.documents?.length) {
    const uploaded = await uploadMultiple(files.documents, 'assets');
    documents = uploaded.map((u) => ({ name: u.format, url: u.url }));
  }

  const asset = await Asset.create({
    assetTag,
    name: data.name,
    category: data.category,
    department: data.department || null,
    serialNumber: data.serialNumber,
    acquisitionDate: data.acquisitionDate,
    acquisitionCost: data.acquisitionCost,
    currentValue: data.currentValue || data.acquisitionCost,
    warrantyExpiry: data.warrantyExpiry || null,
    condition: data.condition || 'good',
    location: data.location || '',
    status: ASSET_STATUS.AVAILABLE,
    isSharedResource: data.isSharedResource || false,
    qrCode,
    images,
    documents,
    notes: data.notes || '',
    registeredBy: performedBy._id,
    history: [
      {
        action: 'registered',
        description: `Asset registered with tag ${assetTag}`,
        performedBy: performedBy._id,
      },
    ],
  });

  const populated = await getAssetById(asset._id);

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.CREATE,
    entity: 'Asset',
    entityId: asset._id,
    description: `Registered asset: ${asset.name} (${assetTag})`,
    newValue: { assetTag, status: ASSET_STATUS.AVAILABLE },
    req,
  });

  await createNotification({
    recipientId: performedBy._id,
    title: 'Asset Registered',
    message: `Asset "${asset.name}" (${assetTag}) has been registered successfully.`,
    type: 'success',
    link: `/assets/${asset._id}`,
    entityType: 'Asset',
    entityId: asset._id,
  });

  return populated;
};

const updateAsset = async (id, data, performedBy, files, req) => {
  const asset = await Asset.findById(id);
  if (!asset) throw new AppError('Asset not found', 404);

  const oldValue = { status: asset.status, condition: asset.condition, location: asset.location };

  if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
    const dup = await Asset.findOne({ serialNumber: data.serialNumber, _id: { $ne: id } });
    if (dup) throw new AppError('Serial number already exists', 409);
    asset.serialNumber = data.serialNumber;
  }

  const updatable = [
    'name', 'category', 'department', 'acquisitionDate', 'acquisitionCost',
    'currentValue', 'warrantyExpiry', 'condition', 'location', 'notes', 'isSharedResource',
  ];
  updatable.forEach((field) => {
    if (data[field] !== undefined) asset[field] = data[field];
  });

  if (files?.images?.length) {
    const uploaded = await uploadMultiple(files.images, 'assets');
    asset.images.push(...uploaded.map((u) => u.url));
  }
  if (files?.documents?.length) {
    const uploaded = await uploadMultiple(files.documents, 'assets');
    asset.documents.push(...uploaded.map((u) => ({ name: u.format, url: u.url })));
  }

  asset.history.push({
    action: 'updated',
    description: 'Asset details updated',
    performedBy: performedBy._id,
  });

  await asset.save();
  const populated = await getAssetById(asset._id);

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'Asset',
    entityId: asset._id,
    description: `Updated asset: ${asset.name}`,
    oldValue,
    newValue: { status: asset.status, condition: asset.condition },
    req,
  });

  return populated;
};

const updateAssetStatus = async (id, status, performedBy, req, notes = '') => {
  const asset = await Asset.findById(id);
  if (!asset) throw new AppError('Asset not found', 404);

  const oldStatus = asset.status;
  asset.status = status;
  asset.history.push({
    action: 'status_change',
    description: `Status changed from ${oldStatus} to ${status}. ${notes}`,
    performedBy: performedBy._id,
  });
  await asset.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'Asset',
    entityId: asset._id,
    description: `Asset status changed: ${oldStatus} → ${status}`,
    oldValue: { status: oldStatus },
    newValue: { status },
    req,
  });

  return asset;
};

const deleteAsset = async (id, performedBy, req) => {
  const asset = await Asset.findById(id);
  if (!asset) throw new AppError('Asset not found', 404);

  if (asset.status === ASSET_STATUS.ALLOCATED) {
    throw new AppError('Cannot delete an allocated asset', 400);
  }

  asset.status = ASSET_STATUS.DISPOSED;
  asset.history.push({
    action: 'disposed',
    description: 'Asset marked as disposed',
    performedBy: performedBy._id,
  });
  await asset.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.DELETE,
    entity: 'Asset',
    entityId: asset._id,
    description: `Disposed asset: ${asset.name}`,
    req,
  });

  return { message: 'Asset disposed successfully' };
};

module.exports = {
  getAssets,
  getAssetById,
  registerAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
};

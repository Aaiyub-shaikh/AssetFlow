import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Transfer from "../models/Transfer.js";

/**
 * Allocate an asset to an employee
 */
export const allocateAsset = async (assetIdOrTag, allocationData) => {
  let asset;

  if (assetIdOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(assetIdOrTag);
  }

  if (!asset) {
    asset = await Asset.findOne({ tag: assetIdOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  // Business Rule: If already allocated, reject and suggest Transfer Request
  if (asset.status === "allocated") {
    // Find the active allocation to get the current holder details
    const activeAllocation = await Allocation.findOne({
      assetId: asset._id.toString(),
      status: "active",
    });

    const currentHolderName = activeAllocation ? activeAllocation.employeeName : (asset.assignedTo || "Unknown");
    const currentHolderId = activeAllocation ? activeAllocation.employeeId : (asset.assignedToId || "");

    const error = new Error(`Conflict: Asset is already allocated to ${currentHolderName}`);
    error.statusCode = 409;
    error.suggestTransfer = true;
    error.currentHolder = {
      name: currentHolderName,
      employeeId: currentHolderId,
      department: activeAllocation ? activeAllocation.department : asset.department,
    };
    throw error;
  }

  // Reject if asset is not in a shape to be allocated
  if (asset.status !== "available") {
    const error = new Error(`Asset is currently in '${asset.status}' state and cannot be allocated`);
    error.statusCode = 400;
    throw error;
  }

  // Create allocation record
  const allocation = new Allocation({
    assetId: asset._id.toString(),
    assetName: asset.name,
    assetTag: asset.tag,
    employeeId: allocationData.employeeId,
    employeeName: allocationData.employeeName,
    department: allocationData.department,
    returnDate: allocationData.returnDate,
    status: "active",
    conditionOnAllocation: allocationData.conditionOnAllocation || asset.condition,
    notes: allocationData.notes,
  });

  const savedAllocation = await allocation.save();

  // Update Asset state
  asset.status = "allocated";
  asset.assignedTo = allocationData.employeeName;
  asset.assignedToId = allocationData.employeeId;
  if (allocationData.department) {
    // Optionally update the department field if the employee's department takes ownership
    asset.department = allocationData.department;
  }
  await asset.save();

  return savedAllocation;
};

/**
 * Return an allocated asset
 */
export const returnAsset = async (assetIdOrTag, returnData) => {
  let asset;

  if (assetIdOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(assetIdOrTag);
  }

  if (!asset) {
    asset = await Asset.findOne({ tag: assetIdOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  // Find the active allocation
  const activeAllocation = await Allocation.findOne({
    assetId: asset._id.toString(),
    status: "active",
  });

  if (!activeAllocation) {
    const error = new Error("No active allocation found for this asset");
    error.statusCode = 400;
    throw error;
  }

  // Update allocation record
  activeAllocation.status = "returned";
  activeAllocation.conditionOnReturn = returnData.conditionOnReturn || asset.condition;
  activeAllocation.notes = returnData.notes ? `${activeAllocation.notes || ""}\nReturn Note: ${returnData.notes}` : activeAllocation.notes;
  // Mark returnedAt/updatedAt
  const savedAllocation = await activeAllocation.save();

  // Update Asset state to available and clear holder
  asset.status = "available";
  asset.assignedTo = undefined;
  asset.assignedToId = undefined;
  if (returnData.conditionOnReturn) {
    asset.condition = returnData.conditionOnReturn;
  }
  await asset.save();

  return savedAllocation;
};

/**
 * Request an asset transfer
 */
export const createTransferRequest = async (transferData) => {
  let asset;

  const assetIdOrTag = transferData.assetId;
  if (assetIdOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(assetIdOrTag);
  }

  if (!asset) {
    asset = await Asset.findOne({ tag: assetIdOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  if (asset.department === transferData.toDepartment) {
    const error = new Error(`Asset is already in the ${transferData.toDepartment} department`);
    error.statusCode = 400;
    throw error;
  }

  // Create transfer record
  const transfer = new Transfer({
    assetId: asset._id.toString(),
    assetName: asset.name,
    assetTag: asset.tag,
    fromDepartment: asset.department,
    toDepartment: transferData.toDepartment,
    requestedBy: transferData.requestedBy,
    priority: transferData.priority || "medium",
    reason: transferData.reason,
    status: "pending",
  });

  return await transfer.save();
};

/**
 * Update transfer request status (approve, reject, transit, complete)
 */
export const processTransferAction = async (transferId, actionData) => {
  const { action, approvedBy } = actionData;
  const transfer = await Transfer.findById(transferId);

  if (!transfer) {
    const error = new Error("Transfer request not found");
    error.statusCode = 404;
    throw error;
  }

  const asset = await Asset.findById(transfer.assetId);
  if (!asset) {
    const error = new Error("Asset associated with this transfer was not found");
    error.statusCode = 404;
    throw error;
  }

  if (action === "approve") {
    transfer.status = "approved";
    transfer.approvedBy = approvedBy || "System Admin";
  } else if (action === "reject") {
    transfer.status = "rejected";
  } else if (action === "transit") {
    transfer.status = "in_transit";
  } else if (action === "complete") {
    transfer.status = "completed";
    transfer.completedAt = new Date();

    // Auto-update the Asset ownership details on completion
    asset.department = transfer.toDepartment;
    
    // Clear any previous individual allocations since ownership changed department
    asset.status = "available";
    asset.assignedTo = undefined;
    asset.assignedToId = undefined;

    // Mark previous active allocations as returned due to transfer completion
    await Allocation.updateMany(
      { assetId: asset._id.toString(), status: "active" },
      { status: "returned", notes: `Returned automatically due to department transfer to ${transfer.toDepartment}` }
    );

    await asset.save();
  } else {
    const error = new Error("Invalid transfer action requested");
    error.statusCode = 400;
    throw error;
  }

  return await transfer.save();
};

/**
 * Get all overdue allocations
 */
export const getOverdueAllocations = async () => {
  const now = new Date();
  
  // Find active allocations where returnDate is in the past
  const overdueAllocations = await Allocation.find({
    status: "active",
    returnDate: { $lt: now },
  });

  // Keep database status values synced
  for (const allocation of overdueAllocations) {
    if (allocation.status !== "overdue") {
      allocation.status = "overdue";
      await allocation.save();
    }
  }

  return overdueAllocations;
};

/**
 * Get all transfer requests
 */
export const getTransfers = async (query = {}) => {
  const filter = {};
  if (query.status) {
    filter.status = query.status.toLowerCase();
  }
  return await Transfer.find(filter).sort({ requestedAt: -1 });
};

/**
 * Get all allocations list
 */
export const getAllAllocations = async () => {
  return await Allocation.find().sort({ allocatedAt: -1 });
};


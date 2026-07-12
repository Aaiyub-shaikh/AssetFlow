import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Transfer from "../models/Transfer.js";

/**
 * Register a new asset in the system
 * @param {Object} assetData - The asset registration data
 * @returns {Promise<Object>} The registered asset document
 */
export const registerAsset = async (assetData) => {
  // Check if tag or serialNumber already exists
  const existingAsset = await Asset.findOne({
    $or: [{ tag: assetData.tag }, { serialNumber: assetData.serialNumber }],
  });

  if (existingAsset) {
    const field = existingAsset.tag === assetData.tag ? "Asset tag" : "Serial number";
    const error = new Error(`${field} already exists in inventory`);
    error.statusCode = 409;
    throw error;
  }

  const asset = new Asset(assetData);
  return await asset.save();
};

/**
 * Retrieve asset directory with optional search & filters
 * @param {Object} query - Request query parameters
 * @returns {Promise<Array>} List of assets matching the query
 */
export const getAssetDirectory = async (query) => {
  const { search, category, department, status, condition, location } = query;
  const mongoQuery = {};

  // Apply filters
  if (category) mongoQuery.categoryId = category;
  if (department) mongoQuery.departmentId = department;
  if (status) mongoQuery.status = status.toLowerCase();
  if (condition) mongoQuery.condition = condition.toLowerCase();
  if (location) mongoQuery.location = { $regex: location, $options: "i" };

  // Apply search (across name, tag, and serial number)
  if (search) {
    mongoQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { tag: { $regex: search, $options: "i" } },
      { serialNumber: { $regex: search, $options: "i" } },
    ];
  }

  return await Asset.find(mongoQuery).sort({ createdAt: -1 });
};

/**
 * Get details for a single asset by ID or Tag
 * @param {string} idOrTag - MongoDB ObjectId or asset tag
 * @returns {Promise<Object>} Asset document with history logs
 */
export const getAssetByIdOrTag = async (idOrTag) => {
  let asset;
  
  // Try finding by Mongoose ID first, then fallback to Asset Tag
  if (idOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(idOrTag);
  }
  
  if (!asset) {
    asset = await Asset.findOne({ tag: idOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  // Fetch allocation and transfer history logs
  const allocations = await Allocation.find({ assetId: asset._id.toString() }).sort({ allocatedAt: -1 });
  const transfers = await Transfer.find({ assetId: asset._id.toString() }).sort({ requestedAt: -1 });

  return {
    ...asset.toObject(),
    history: {
      allocations,
      transfers,
    },
  };
};

/**
 * Update an asset's information
 * @param {string} idOrTag - MongoDB ObjectId or asset tag
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} The updated asset document
 */
export const updateAsset = async (idOrTag, updateData) => {
  let asset;

  if (idOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(idOrTag);
  }

  if (!asset) {
    asset = await Asset.findOne({ tag: idOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  // Check unique constraints if updating tag or serialNumber
  if (updateData.tag && updateData.tag !== asset.tag) {
    const existingTag = await Asset.findOne({ tag: updateData.tag });
    if (existingTag) {
      const error = new Error("Asset tag already exists in inventory");
      error.statusCode = 409;
      throw error;
    }
  }

  if (updateData.serialNumber && updateData.serialNumber !== asset.serialNumber) {
    const existingSerial = await Asset.findOne({ serialNumber: updateData.serialNumber });
    if (existingSerial) {
      const error = new Error("Serial number already exists in inventory");
      error.statusCode = 409;
      throw error;
    }
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      asset[key] = updateData[key];
    }
  });

  return await asset.save();
};

/**
 * Delete an asset (Only if it is not currently allocated)
 * @param {string} idOrTag - MongoDB ObjectId or asset tag
 * @returns {Promise<boolean>} Success status of deletion
 */
export const deleteAsset = async (idOrTag) => {
  let asset;

  if (idOrTag.match(/^[0-9a-fA-F]{24}$/)) {
    asset = await Asset.findById(idOrTag);
  }

  if (!asset) {
    asset = await Asset.findOne({ tag: idOrTag });
  }

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting currently allocated assets
  if (asset.status === "allocated") {
    const error = new Error("Cannot delete an allocated asset. Return the asset first.");
    error.statusCode = 400;
    throw error;
  }

  await Asset.deleteOne({ _id: asset._id });
  return true;
};

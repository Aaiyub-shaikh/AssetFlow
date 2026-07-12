import * as assetService from "../services/assetService.js";

/**
 * Register a new asset controller
 */
export const registerAsset = async (req, res) => {
  try {
    const asset = await assetService.registerAsset(req.body);
    res.status(201).json({
      success: true,
      message: "Asset registered successfully",
      data: asset,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to register asset",
    });
  }
};

/**
 * Get asset directory list (filtered/searched) controller
 */
export const getAssetDirectory = async (req, res) => {
  try {
    const assets = await assetService.getAssetDirectory(req.query);
    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve asset directory",
    });
  }
};

/**
 * Get details for a single asset controller
 */
export const getAssetDetails = async (req, res) => {
  try {
    const asset = await assetService.getAssetByIdOrTag(req.params.id);
    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to retrieve asset details",
    });
  }
};

/**
 * Update an asset controller
 */
export const updateAsset = async (req, res) => {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update asset",
    });
  }
};

/**
 * Delete an asset controller
 */
export const deleteAsset = async (req, res) => {
  try {
    await assetService.deleteAsset(req.params.id);
    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to delete asset",
    });
  }
};

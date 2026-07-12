import * as allocationService from "../services/allocationService.js";

/**
 * Allocate an asset
 */
export const allocateAsset = async (req, res) => {
  try {
    const allocation = await allocationService.allocateAsset(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: "Asset allocated successfully",
      data: allocation,
    });
  } catch (error) {
    // If it's a conflict, return the custom 409 response structure specifying the suggested Transfer Request
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        suggestTransfer: error.suggestTransfer,
        currentHolder: error.currentHolder,
      });
    }

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to allocate asset",
    });
  }
};

/**
 * Return an asset
 */
export const returnAsset = async (req, res) => {
  try {
    const allocation = await allocationService.returnAsset(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Asset returned successfully",
      data: allocation,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to return asset",
    });
  }
};

/**
 * Request asset transfer
 */
export const createTransferRequest = async (req, res) => {
  try {
    const transfer = await allocationService.createTransferRequest(req.body);
    res.status(201).json({
      success: true,
      message: "Transfer request created successfully",
      data: transfer,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to request transfer",
    });
  }
};

/**
 * Process transfer request workflow state action
 */
export const processTransferAction = async (req, res) => {
  try {
    const transfer = await allocationService.processTransferAction(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: `Transfer action '${req.body.action}' processed successfully`,
      data: transfer,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to process transfer action",
    });
  }
};

/**
 * Get overdue allocations list
 */
export const getOverdueAllocations = async (req, res) => {
  try {
    const overdue = await allocationService.getOverdueAllocations();
    res.status(200).json({
      success: true,
      count: overdue.length,
      data: overdue,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to scan overdue allocations",
    });
  }
};

/**
 * Get transfer requests list
 */
export const getTransfers = async (req, res) => {
  try {
    const transfers = await allocationService.getTransfers(req.query);
    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve transfers list",
    });
  }
};

/**
 * Get all allocations controller
 */
export const getAllAllocations = async (req, res) => {
  try {
    const allocations = await allocationService.getAllAllocations();
    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve allocations list",
    });
  }
};


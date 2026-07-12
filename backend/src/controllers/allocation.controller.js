const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const allocationService = require('../services/allocation.service');

exports.getAllocations = asyncHandler(async (req, res) => {
  const result = await allocationService.getAllocations(req.query, req.user);
  return ApiResponse.paginated(res, result.allocations, result.pagination);
});

exports.allocateAsset = asyncHandler(async (req, res) => {
  const allocation = await allocationService.allocateAsset(req.body, req.user, req);
  return ApiResponse.created(res, allocation, 'Asset allocated successfully');
});

exports.suggestTransfer = asyncHandler(async (req, res) => {
  const result = await allocationService.suggestTransfer(req.params.assetId, req.user);
  return ApiResponse.success(res, result);
});

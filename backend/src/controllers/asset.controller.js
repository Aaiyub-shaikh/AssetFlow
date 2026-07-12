const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const assetService = require('../services/asset.service');

exports.getAssets = asyncHandler(async (req, res) => {
  const result = await assetService.getAssets(req.query, req.user);
  return ApiResponse.paginated(res, result.assets, result.pagination);
});

exports.getAssetById = asyncHandler(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  return ApiResponse.success(res, asset);
});

exports.registerAsset = asyncHandler(async (req, res) => {
  const files = {
    images: req.files?.filter((f) => f.mimetype.startsWith('image/')),
    documents: req.files?.filter((f) => !f.mimetype.startsWith('image/')),
  };
  const asset = await assetService.registerAsset(req.body, req.user, files, req);
  return ApiResponse.created(res, asset, 'Asset registered successfully');
});

exports.updateAsset = asyncHandler(async (req, res) => {
  const files = {
    images: req.files?.filter((f) => f.mimetype.startsWith('image/')),
    documents: req.files?.filter((f) => !f.mimetype.startsWith('image/')),
  };
  const asset = await assetService.updateAsset(req.params.id, req.body, req.user, files, req);
  return ApiResponse.success(res, asset, 'Asset updated successfully');
});

exports.updateAssetStatus = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAssetStatus(
    req.params.id,
    req.body.status,
    req.user,
    req,
    req.body.notes
  );
  return ApiResponse.success(res, asset, 'Asset status updated');
});

exports.deleteAsset = asyncHandler(async (req, res) => {
  const result = await assetService.deleteAsset(req.params.id, req.user, req);
  return ApiResponse.success(res, result);
});

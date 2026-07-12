const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const transferService = require('../services/transfer.service');

exports.getTransfers = asyncHandler(async (req, res) => {
  const result = await transferService.getTransfers(req.query, req.user);
  return ApiResponse.paginated(res, result.transfers, result.pagination);
});

exports.createTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.createTransferRequest(req.body, req.user, req);
  return ApiResponse.created(res, transfer, 'Transfer request created');
});

exports.approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.approveTransfer(
    req.params.id,
    req.user,
    req.body.comments,
    req
  );
  return ApiResponse.success(res, transfer, 'Transfer approved');
});

exports.rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.rejectTransfer(
    req.params.id,
    req.user,
    req.body.comments,
    req
  );
  return ApiResponse.success(res, transfer, 'Transfer rejected');
});

exports.completeTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.completeTransfer(req.params.id, req.user, req);
  return ApiResponse.success(res, transfer, 'Transfer completed');
});

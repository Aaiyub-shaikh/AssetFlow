const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const returnService = require('../services/return.service');

exports.getReturns = asyncHandler(async (req, res) => {
  const result = await returnService.getReturns(req.query, req.user);
  return ApiResponse.paginated(res, result.returns, result.pagination);
});

exports.processReturn = asyncHandler(async (req, res) => {
  const returnRecord = await returnService.processReturn(req.body, req.user, req);
  return ApiResponse.created(res, returnRecord, 'Return processed successfully');
});

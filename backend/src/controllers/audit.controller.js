const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const auditService = require('../services/audit.service');

exports.getAudits = asyncHandler(async (req, res) => {
  const result = await auditService.getAudits(req.query);
  return ApiResponse.paginated(res, result.audits, result.pagination);
});

exports.getAuditById = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditById(req.params.id);
  return ApiResponse.success(res, result);
});

exports.createAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.createAudit(req.body, req.user, req);
  return ApiResponse.created(res, audit, 'Audit created successfully');
});

exports.startAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.startAudit(req.params.id, req.user, req);
  return ApiResponse.success(res, audit, 'Audit started');
});

exports.verifyAsset = asyncHandler(async (req, res) => {
  const result = await auditService.verifyAsset(req.params.id, req.body, req.user, req);
  return ApiResponse.success(res, result, 'Asset verified');
});

exports.closeAudit = asyncHandler(async (req, res) => {
  const audit = await auditService.closeAudit(req.params.id, req.user, req);
  return ApiResponse.success(res, audit, 'Audit closed');
});

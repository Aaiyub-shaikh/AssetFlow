const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const maintenanceService = require('../services/maintenance.service');

exports.getMaintenanceRequests = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getMaintenanceRequests(req.query, req.user);
  return ApiResponse.paginated(res, result.requests, result.pagination);
});

exports.createMaintenanceRequest = asyncHandler(async (req, res) => {
  const request = await maintenanceService.createMaintenanceRequest(req.body, req.user, req);
  return ApiResponse.created(res, request, 'Maintenance request created');
});

exports.approveMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.approveMaintenance(req.params.id, req.user, req.body, req);
  return ApiResponse.success(res, request, 'Maintenance approved');
});

exports.startMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.startMaintenance(req.params.id, req.user, req);
  return ApiResponse.success(res, request, 'Maintenance started');
});

exports.resolveMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.resolveMaintenance(req.params.id, req.user, req.body, req);
  return ApiResponse.success(res, request, 'Maintenance resolved');
});

exports.rejectMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.rejectMaintenance(
    req.params.id,
    req.user,
    req.body.reason,
    req
  );
  return ApiResponse.success(res, request, 'Maintenance rejected');
});

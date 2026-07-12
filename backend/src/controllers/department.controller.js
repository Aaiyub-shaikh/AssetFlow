const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const departmentService = require('../services/department.service');

exports.getDepartments = asyncHandler(async (req, res) => {
  const result = await departmentService.getDepartments(req.query);
  return ApiResponse.paginated(res, result.departments, result.pagination);
});

exports.getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await departmentService.getDepartmentById(req.params.id);
  return ApiResponse.success(res, dept);
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const dept = await departmentService.createDepartment(req.body, req.user, req);
  return ApiResponse.created(res, dept, 'Department created successfully');
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const dept = await departmentService.updateDepartment(req.params.id, req.body, req.user, req);
  return ApiResponse.success(res, dept, 'Department updated successfully');
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const result = await departmentService.deleteDepartment(req.params.id, req.user, req);
  return ApiResponse.success(res, result);
});

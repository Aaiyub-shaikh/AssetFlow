const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

exports.getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query, req.user);
  return ApiResponse.paginated(res, result.users, result.pagination);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.success(res, user);
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, req);
  return ApiResponse.created(res, user, 'User created successfully');
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user, req);
  return ApiResponse.success(res, user, 'User updated successfully');
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id, req.user, req);
  return ApiResponse.success(res, result);
});

exports.assignRole = asyncHandler(async (req, res) => {
  const user = await userService.assignRole(
    req.params.id,
    req.body.role,
    req.body.position,
    req.user,
    req
  );
  return ApiResponse.success(res, user, 'Role assigned successfully');
});

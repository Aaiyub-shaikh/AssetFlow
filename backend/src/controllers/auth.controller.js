const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

exports.signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body, req);
  return ApiResponse.created(res, result, 'Account created successfully');
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, req);
  return ApiResponse.success(res, result, 'Login successful');
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  return ApiResponse.success(res, result, 'Token refreshed');
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, req);
  return ApiResponse.success(res, null, 'Logged out successfully');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return ApiResponse.success(res, result);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(
    req.body.email,
    req.body.token,
    req.body.password
  );
  return ApiResponse.success(res, result);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return ApiResponse.success(res, user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  return ApiResponse.success(res, result);
});

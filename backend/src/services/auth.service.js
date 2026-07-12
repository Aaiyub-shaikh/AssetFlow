const crypto = require('crypto');
const AppError = require('../utils/AppError');
const { User } = require('../models');
const { ROLES, USER_STATUS, ACTIVITY_ACTIONS } = require('../constants');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { generateResetToken } = require('../helpers/generators');
const { logActivity } = require('./activityLog.service');
const { sendEmail } = require('./notification.service');

const signup = async (data, req) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    department: data.department || null,
    role: ROLES.EMPLOYEE,
    status: USER_STATUS.ACTIVE,
    phone: data.phone || null,
  });

  const populated = await User.findById(user._id).populate('department', 'name code');
  const tokens = generateTokens(user._id);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    user,
    action: ACTIVITY_ACTIONS.CREATE,
    entity: 'User',
    entityId: user._id,
    description: `New employee account created: ${user.email}`,
    req,
  });

  return { user: populated.toSafeObject(), ...tokens };
};

const login = async (email, password, req) => {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshToken')
    .populate('department', 'name code');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError('Account is not active', 403);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    user,
    action: ACTIVITY_ACTIONS.LOGIN,
    entity: 'User',
    entityId: user._id,
    description: `User logged in: ${user.email}`,
    req,
  });

  return { user: user.toSafeObject(), ...tokens };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.id)
    .select('+refreshToken')
    .populate('department', 'name code');

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), ...tokens };
};

const logout = async (userId, req) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  await logActivity({
    user: userId,
    action: ACTIVITY_ACTIONS.LOGOUT,
    entity: 'User',
    entityId: userId,
    description: 'User logged out',
    req,
  });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires'
  );

  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const resetToken = generateResetToken();
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}&email=${user.email}`;

  await sendEmail(
    user.email,
    'AssetFlow - Password Reset',
    `<p>You requested a password reset.</p>
     <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
     <p>This link expires in 1 hour.</p>`
  );

  return { message: 'If the email exists, a reset link has been sent' };
};

const resetPassword = async (email, token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.refreshToken = null;
  await user.save();

  return { message: 'Password reset successful' };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).populate('department', 'name code location');
  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
};

const AppError = require('../utils/AppError');
const { User, Department } = require('../models');
const { ROLES, USER_STATUS, ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');

const getUsers = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.department) filter.department = query.department;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (currentUser.role === ROLES.DEPARTMENT_HEAD) {
    filter.department = currentUser.department?._id || currentUser.department;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => u.toSafeObject()),
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('department', 'name code location');
  if (!user) throw new AppError('User not found', 404);
  return user.toSafeObject();
};

const createUser = async (data, performedBy, req) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new AppError('Email already exists', 409);

  if (data.department) {
    const dept = await Department.findById(data.department);
    if (!dept) throw new AppError('Department not found', 404);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password || 'password123',
    department: data.department || null,
    role: data.role || ROLES.EMPLOYEE,
    status: data.status || USER_STATUS.ACTIVE,
    phone: data.phone || null,
    position: data.position || 'Employee',
    profileImage: data.profileImage || null,
  });

  const populated = await User.findById(user._id).populate('department', 'name code');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.CREATE,
    entity: 'User',
    entityId: user._id,
    description: `Created employee: ${user.email}`,
    newValue: { name: user.name, email: user.email, role: user.role },
    req,
  });

  return populated.toSafeObject();
};

const updateUser = async (id, data, performedBy, req) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  const oldValue = { role: user.role, status: user.status, department: user.department };

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new AppError('Email already exists', 409);
    user.email = data.email;
  }

  const allowedFields = ['name', 'phone', 'position', 'profileImage', 'department', 'role', 'status'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });

  if (data.password) user.password = data.password;

  await user.save();
  const populated = await User.findById(user._id).populate('department', 'name code');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'User',
    entityId: user._id,
    description: `Updated employee: ${user.email}`,
    oldValue,
    newValue: { role: user.role, status: user.status, department: user.department },
    req,
  });

  return populated.toSafeObject();
};

const deleteUser = async (id, performedBy, req) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  if (user.role === ROLES.ADMIN) {
    const adminCount = await User.countDocuments({ role: ROLES.ADMIN, status: USER_STATUS.ACTIVE });
    if (adminCount <= 1) {
      throw new AppError('Cannot delete the last active admin', 400);
    }
  }

  user.status = USER_STATUS.INACTIVE;
  await user.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.DELETE,
    entity: 'User',
    entityId: user._id,
    description: `Deactivated employee: ${user.email}`,
    req,
  });

  return { message: 'User deactivated successfully' };
};

const assignRole = async (id, role, position, performedBy, req) => {
  if (!Object.values(ROLES).includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  const oldRole = user.role;
  user.role = role;
  if (position) user.position = position;
  await user.save();

  const populated = await User.findById(user._id).populate('department', 'name code');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'User',
    entityId: user._id,
    description: `Role changed from ${oldRole} to ${role} for ${user.email}`,
    oldValue: { role: oldRole },
    newValue: { role },
    req,
  });

  return populated.toSafeObject();
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
};

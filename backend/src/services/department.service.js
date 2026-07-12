const AppError = require('../utils/AppError');
const { Department, User, Asset } = require('../models');
const { ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');

const getDepartments = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .populate('head', 'name email profileImage')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(filter),
  ]);

  const enriched = await Promise.all(
    departments.map(async (dept) => {
      const [employees, assets] = await Promise.all([
        User.countDocuments({ department: dept._id, status: 'active' }),
        Asset.countDocuments({ department: dept._id }),
      ]);
      return {
        ...dept.toObject(),
        employees,
        assets,
      };
    })
  );

  return { departments: enriched, pagination: buildPaginationMeta(total, page, limit) };
};

const getDepartmentById = async (id) => {
  const dept = await Department.findById(id).populate('head', 'name email profileImage phone');
  if (!dept) throw new AppError('Department not found', 404);

  const [employees, assets] = await Promise.all([
    User.countDocuments({ department: dept._id, status: 'active' }),
    Asset.countDocuments({ department: dept._id }),
  ]);

  return { ...dept.toObject(), employees, assets };
};

const createDepartment = async (data, performedBy, req) => {
  const existing = await Department.findOne({
    $or: [{ name: data.name }, { code: data.code.toUpperCase() }],
  });
  if (existing) throw new AppError('Department name or code already exists', 409);

  if (data.head) {
    const headUser = await User.findById(data.head);
    if (!headUser) throw new AppError('Department head user not found', 404);
  }

  const department = await Department.create({
    ...data,
    code: data.code.toUpperCase(),
  });

  if (data.head) {
    await User.findByIdAndUpdate(data.head, { role: 'department_head' });
  }

  const populated = await Department.findById(department._id).populate('head', 'name email');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.CREATE,
    entity: 'Department',
    entityId: department._id,
    description: `Created department: ${department.name}`,
    req,
  });

  return populated;
};

const updateDepartment = async (id, data, performedBy, req) => {
  const department = await Department.findById(id);
  if (!department) throw new AppError('Department not found', 404);

  if (data.code) data.code = data.code.toUpperCase();

  if (data.head && data.head !== department.head?.toString()) {
    const headUser = await User.findById(data.head);
    if (!headUser) throw new AppError('Department head user not found', 404);
    await User.findByIdAndUpdate(data.head, { role: 'department_head' });
  }

  Object.assign(department, data);
  await department.save();

  const populated = await Department.findById(department._id).populate('head', 'name email');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'Department',
    entityId: department._id,
    description: `Updated department: ${department.name}`,
    req,
  });

  return populated;
};

const deleteDepartment = async (id, performedBy, req) => {
  const department = await Department.findById(id);
  if (!department) throw new AppError('Department not found', 404);

  const [userCount, assetCount] = await Promise.all([
    User.countDocuments({ department: id }),
    Asset.countDocuments({ department: id }),
  ]);

  if (userCount > 0 || assetCount > 0) {
    throw new AppError('Cannot delete department with assigned users or assets', 400);
  }

  department.isActive = false;
  await department.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.DELETE,
    entity: 'Department',
    entityId: department._id,
    description: `Deactivated department: ${department.name}`,
    req,
  });

  return { message: 'Department deactivated successfully' };
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

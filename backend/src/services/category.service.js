const AppError = require('../utils/AppError');
const { AssetCategory, Asset } = require('../models');
const { ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');

const getCategories = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [categories, total] = await Promise.all([
    AssetCategory.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    AssetCategory.countDocuments(filter),
  ]);

  const enriched = await Promise.all(
    categories.map(async (cat) => {
      const assets = await Asset.countDocuments({ category: cat._id });
      return { ...cat.toObject(), assets };
    })
  );

  return { categories: enriched, pagination: buildPaginationMeta(total, page, limit) };
};

const getCategoryById = async (id) => {
  const category = await AssetCategory.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  const assets = await Asset.countDocuments({ category: id });
  return { ...category.toObject(), assets };
};

const createCategory = async (data, performedBy, req) => {
  const existing = await AssetCategory.findOne({
    $or: [{ name: data.name }, { code: data.code.toUpperCase() }],
  });
  if (existing) throw new AppError('Category name or code already exists', 409);

  const category = await AssetCategory.create({
    ...data,
    code: data.code.toUpperCase(),
  });

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.CREATE,
    entity: 'AssetCategory',
    entityId: category._id,
    description: `Created category: ${category.name}`,
    req,
  });

  return category;
};

const updateCategory = async (id, data, performedBy, req) => {
  const category = await AssetCategory.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  if (data.code) data.code = data.code.toUpperCase();
  Object.assign(category, data);
  await category.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'AssetCategory',
    entityId: category._id,
    description: `Updated category: ${category.name}`,
    req,
  });

  return category;
};

const deleteCategory = async (id, performedBy, req) => {
  const category = await AssetCategory.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  const assetCount = await Asset.countDocuments({ category: id });
  if (assetCount > 0) {
    throw new AppError('Cannot delete category with associated assets', 400);
  }

  category.isActive = false;
  await category.save();

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.DELETE,
    entity: 'AssetCategory',
    entityId: category._id,
    description: `Deactivated category: ${category.name}`,
    req,
  });

  return { message: 'Category deactivated successfully' };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

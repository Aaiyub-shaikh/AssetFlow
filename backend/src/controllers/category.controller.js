const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');

exports.getCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getCategories(req.query);
  return ApiResponse.paginated(res, result.categories, result.pagination);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return ApiResponse.success(res, category);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user, req);
  return ApiResponse.created(res, category, 'Category created successfully');
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.user, req);
  return ApiResponse.success(res, category, 'Category updated successfully');
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.user, req);
  return ApiResponse.success(res, result);
});

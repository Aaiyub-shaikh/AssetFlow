const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createCategoryValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('categories:read'), categoryController.getCategories);
router.get('/:id', mongoIdParam(), validate, authorize('categories:read'), categoryController.getCategoryById);
router.post('/', isAssetManager, createCategoryValidator, validate, categoryController.createCategory);
router.put('/:id', mongoIdParam(), validate, isAssetManager, categoryController.updateCategory);
router.delete('/:id', mongoIdParam(), validate, isAssetManager, categoryController.deleteCategory);

module.exports = router;

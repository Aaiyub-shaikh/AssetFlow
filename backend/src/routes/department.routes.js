const { Router } = require('express');
const departmentController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAdmin } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createDepartmentValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('departments:read'), departmentController.getDepartments);
router.get('/:id', mongoIdParam(), validate, authorize('departments:read'), departmentController.getDepartmentById);
router.post('/', isAdmin, createDepartmentValidator, validate, departmentController.createDepartment);
router.put('/:id', mongoIdParam(), validate, isAdmin, departmentController.updateDepartment);
router.delete('/:id', mongoIdParam(), validate, isAdmin, departmentController.deleteDepartment);

module.exports = router;

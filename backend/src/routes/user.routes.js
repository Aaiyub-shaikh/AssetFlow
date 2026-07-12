const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAdmin } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createUserValidator,
  assignRoleValidator,
  mongoIdParam,
  paginationQuery,
} = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('users:read', 'users:read_dept'), userController.getUsers);
router.get('/:id', mongoIdParam(), validate, authorize('users:read', 'users:read_dept'), userController.getUserById);
router.post('/', isAdmin, createUserValidator, validate, userController.createUser);
router.put('/:id', mongoIdParam(), validate, isAdmin, userController.updateUser);
router.delete('/:id', mongoIdParam(), validate, isAdmin, userController.deleteUser);
router.patch('/:id/role', assignRoleValidator, validate, isAdmin, userController.assignRole);

module.exports = router;

const { body, param, query } = require('express-validator');
const { ROLES, USER_STATUS } = require('../constants');

const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').optional().isMongoId().withMessage('Invalid department ID'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('role').optional().isIn(Object.values(ROLES)),
  body('status').optional().isIn(Object.values(USER_STATUS)),
  body('department').optional().isMongoId(),
];

const assignRoleValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('position').optional().trim(),
];

const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  createUserValidator,
  assignRoleValidator,
  mongoIdParam,
  paginationQuery,
};

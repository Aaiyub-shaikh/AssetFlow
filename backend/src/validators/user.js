import { body } from 'express-validator'
import { ROLES } from '../constants/index.js'

export const createUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role type'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID format'),
  body('position')
    .optional()
    .isString(),
  body('phone')
    .optional()
    .isString(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
]

export const updateUserValidator = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('phone')
    .optional()
    .isString(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID format'),
]

export const promoteUserValidator = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role type'),
  body('position')
    .notEmpty()
    .withMessage('Position title is required')
    .isString()
    .withMessage('Position must be a string'),
]

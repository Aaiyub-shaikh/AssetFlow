import { body } from 'express-validator'

export const departmentValidator = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2 })
    .withMessage('Department name must be at least 2 characters'),
  body('code')
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ min: 2 })
    .withMessage('Department code must be at least 2 characters'),
  body('head')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid department head user ID'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('location')
    .optional()
    .isString(),
]

import { body } from 'express-validator'

export const categoryValidator = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2 })
    .withMessage('Category name must be at least 2 characters'),
  body('code')
    .notEmpty()
    .withMessage('Category code is required')
    .isLength({ min: 2 })
    .withMessage('Category code must be at least 2 characters'),
  body('depreciationRate')
    .notEmpty()
    .withMessage('Depreciation rate is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Depreciation rate must be a percentage between 0 and 100'),
  body('warrantyPeriod')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Warranty period must be an integer of months'),
  body('icon')
    .optional()
    .isString(),
]

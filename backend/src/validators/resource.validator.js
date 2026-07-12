const { body, param } = require('express-validator');

const createDepartmentValidator = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required').isLength({ max: 10 }),
  body('head').optional().isMongoId(),
  body('location').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }),
];

const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('code').trim().notEmpty().withMessage('Category code is required').isLength({ max: 10 }),
  body('description').optional().trim(),
  body('depreciationRate').optional().isFloat({ min: 0, max: 100 }),
  body('warrantyPeriod').optional().isInt({ min: 0 }),
  body('icon').optional().trim(),
];

const registerAssetValidator = [
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('acquisitionDate').isISO8601().withMessage('Valid acquisition date is required'),
  body('acquisitionCost').isFloat({ min: 0 }).withMessage('Valid acquisition cost is required'),
  body('department').optional().isMongoId(),
  body('assetTag').optional().trim(),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor']),
  body('isSharedResource').optional().isBoolean(),
];

const allocateAssetValidator = [
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('employeeId').isMongoId().withMessage('Valid employee ID is required'),
  body('expectedReturnDate').optional().isISO8601(),
  body('notes').optional().trim(),
];

const transferRequestValidator = [
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('toDepartment').isMongoId().withMessage('Valid target department is required'),
  body('fromDepartment').optional().isMongoId(),
  body('reason').trim().notEmpty().withMessage('Transfer reason is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
];

const returnAssetValidator = [
  body('allocationId').isMongoId().withMessage('Valid allocation ID is required'),
  body('condition').isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Valid condition is required'),
  body('conditionNotes').optional().trim(),
  body('requiresMaintenance').optional().isBoolean(),
  body('notes').optional().trim(),
];

const bookingValidator = [
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required'),
  body('location').optional().trim(),
];

const maintenanceRequestValidator = [
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('type').optional().isIn(['preventive', 'corrective', 'emergency']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('scheduledDate').optional().isISO8601(),
];

const auditValidator = [
  body('title').trim().notEmpty().withMessage('Audit title is required'),
  body('auditorId').isMongoId().withMessage('Valid auditor ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('department').optional().isMongoId(),
  body('notes').optional().trim(),
];

const verifyAssetValidator = [
  body('assetId').isMongoId().withMessage('Valid asset ID is required'),
  body('status').isIn(['verified', 'missing', 'damaged']).withMessage('Valid status is required'),
  body('notes').optional().trim(),
];

const approvalValidator = [
  body('comments').optional().trim(),
];

const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
];

module.exports = {
  createDepartmentValidator,
  createCategoryValidator,
  registerAssetValidator,
  allocateAssetValidator,
  transferRequestValidator,
  returnAssetValidator,
  bookingValidator,
  maintenanceRequestValidator,
  auditValidator,
  verifyAssetValidator,
  approvalValidator,
  mongoIdParam,
};

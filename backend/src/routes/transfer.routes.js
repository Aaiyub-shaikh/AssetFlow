const { Router } = require('express');
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager, isDepartmentHead } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { transferRequestValidator, approvalValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('transfers:read'), transferController.getTransfers);
router.post('/', transferRequestValidator, validate, authorize('transfers:request'), transferController.createTransfer);
router.patch(
  '/:id/approve',
  mongoIdParam(),
  approvalValidator,
  validate,
  authorize('transfers:approve', 'transfers:approve_dept'),
  transferController.approveTransfer
);
router.patch(
  '/:id/reject',
  mongoIdParam(),
  approvalValidator,
  validate,
  authorize('transfers:approve', 'transfers:approve_dept'),
  transferController.rejectTransfer
);
router.patch('/:id/complete', mongoIdParam(), validate, isAssetManager, transferController.completeTransfer);

module.exports = router;

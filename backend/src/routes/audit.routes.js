const { Router } = require('express');
const auditController = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { auditValidator, verifyAssetValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('audits:read'), auditController.getAudits);
router.get('/:id', mongoIdParam(), validate, authorize('audits:read'), auditController.getAuditById);
router.post('/', isAssetManager, auditValidator, validate, auditController.createAudit);
router.patch('/:id/start', mongoIdParam(), validate, isAssetManager, auditController.startAudit);
router.post('/:id/verify', mongoIdParam(), verifyAssetValidator, validate, authorize('audits:read'), auditController.verifyAsset);
router.patch('/:id/close', mongoIdParam(), validate, isAssetManager, auditController.closeAudit);

module.exports = router;

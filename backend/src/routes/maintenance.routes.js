const { Router } = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { maintenanceRequestValidator, approvalValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('maintenance:read', 'maintenance:read_own'), maintenanceController.getMaintenanceRequests);
router.post('/', maintenanceRequestValidator, validate, authorize('maintenance:request'), maintenanceController.createMaintenanceRequest);
router.patch('/:id/approve', mongoIdParam(), approvalValidator, validate, isAssetManager, maintenanceController.approveMaintenance);
router.patch('/:id/start', mongoIdParam(), validate, isAssetManager, maintenanceController.startMaintenance);
router.patch('/:id/resolve', mongoIdParam(), validate, isAssetManager, maintenanceController.resolveMaintenance);
router.patch('/:id/reject', mongoIdParam(), validate, isAssetManager, maintenanceController.rejectMaintenance);

module.exports = router;

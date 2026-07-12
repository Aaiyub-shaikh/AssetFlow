const { Router } = require('express');
const allocationController = require('../controllers/allocation.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { allocateAssetValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('allocations:read', 'allocations:read_own'), allocationController.getAllocations);
router.post('/', isAssetManager, allocateAssetValidator, validate, allocationController.allocateAsset);
router.get('/suggest-transfer/:assetId', mongoIdParam('assetId'), validate, isAssetManager, allocationController.suggestTransfer);

module.exports = router;

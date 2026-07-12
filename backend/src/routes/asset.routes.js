const { Router } = require('express');
const assetController = require('../controllers/asset.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { registerAssetValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('assets:read', 'assets:read_assigned'), assetController.getAssets);
router.get('/:id', mongoIdParam(), validate, authorize('assets:read', 'assets:read_assigned'), assetController.getAssetById);
router.post(
  '/',
  isAssetManager,
  upload.array('files', 5),
  registerAssetValidator,
  validate,
  assetController.registerAsset
);
router.put(
  '/:id',
  mongoIdParam(),
  validate,
  isAssetManager,
  upload.array('files', 5),
  assetController.updateAsset
);
router.patch('/:id/status', mongoIdParam(), validate, isAssetManager, assetController.updateAssetStatus);
router.delete('/:id', mongoIdParam(), validate, isAssetManager, assetController.deleteAsset);

module.exports = router;

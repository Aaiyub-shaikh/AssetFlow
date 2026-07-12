const { Router } = require('express');
const returnController = require('../controllers/return.controller');
const { protect } = require('../middleware/auth');
const { authorize, isAssetManager } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { returnAssetValidator } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('returns:read', 'returns:request'), returnController.getReturns);
router.post('/', isAssetManager, returnAssetValidator, validate, returnController.processReturn);

module.exports = router;

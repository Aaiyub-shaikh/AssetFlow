const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);
router.use(authorize('activitylogs:read', 'activitylogs:read_own'));

router.get('/', paginationQuery, validate, notificationController.getActivityLogs);

module.exports = router;

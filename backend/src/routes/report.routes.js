const { Router } = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = Router();

router.use(protect);

router.get('/dashboard', authorize('reports:*', 'reports:read_dept'), reportController.getDashboard);
router.get('/dashboard/me', reportController.getUserDashboard);
router.get('/:type', authorize('reports:*', 'reports:read_dept'), reportController.getReport);

module.exports = router;

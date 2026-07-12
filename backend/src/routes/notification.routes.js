const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { mongoIdParam, paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, notificationController.getNotifications);
router.patch('/:id/read', mongoIdParam(), validate, notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;

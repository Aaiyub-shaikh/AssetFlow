const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');
const activityLogService = require('../services/activityLog.service');
const { buildPaginationMeta } = require('../utils/pagination');

exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const unreadOnly = req.query.unreadOnly === 'true';

  const result = await notificationService.getUserNotifications(req.user._id, {
    page,
    limit,
    unreadOnly,
  });

  return res.status(200).json({
    success: true,
    message: 'Notifications retrieved',
    data: {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    },
    pagination: buildPaginationMeta(result.total, result.page, result.limit),
    errors: null,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  return ApiResponse.success(res, notification, 'Notification marked as read');
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return ApiResponse.success(res, null, 'All notifications marked as read');
});

exports.getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.entity) filters.entity = req.query.entity;
  if (req.query.action) filters.action = req.query.action;
  if (req.query.user) filters.user = req.query.user;

  if (req.user.role === 'employee') {
    filters.user = req.user._id;
  }

  const result = await activityLogService.getActivityLogs(filters, { page, limit, skip });

  return ApiResponse.paginated(
    res,
    result.logs,
    buildPaginationMeta(result.total, result.page, result.limit)
  );
});

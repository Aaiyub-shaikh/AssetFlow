const { Router } = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');
const transferRoutes = require('./transfer.routes');
const returnRoutes = require('./return.routes');
const bookingRoutes = require('./booking.routes');
const maintenanceRoutes = require('./maintenance.routes');
const auditRoutes = require('./audit.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const activityLogRoutes = require('./activityLog.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/assets', assetRoutes);
router.use('/allocations', allocationRoutes);
router.use('/transfers', transferRoutes);
router.use('/returns', returnRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/audits', auditRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activitylogs', activityLogRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AssetFlow API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    errors: null,
  });
});

module.exports = router;

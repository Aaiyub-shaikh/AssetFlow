import express from 'express';
import {
  getDashboardReport,
  getUtilizationReport,
  getDepartmentReport,
  getMaintenanceReport,
  getRetirementReport,
  getBookingReport,
  exportReport,
} from '../controllers/reportsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardReport);
router.get('/utilization', getUtilizationReport);
router.get('/department', getDepartmentReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/retirement', getRetirementReport);
router.get('/bookings', getBookingReport);
router.get('/export', exportReport);

export default router;

import express from 'express';
import { createActivityLog, getActivityLogs } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getActivityLogs);
router.post('/', createActivityLog);

export default router;

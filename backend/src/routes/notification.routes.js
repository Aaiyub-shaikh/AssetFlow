import express from 'express';
import { createNotification, deleteNotification, getNotifications, markAllAsRead, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;

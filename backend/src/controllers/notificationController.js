import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

const sampleNotifications = [
  {
    user: 'Current User',
    title: 'Asset Assigned',
    message: 'Laptop 14 was assigned to the Engineering team.',
    type: 'Asset Assigned',
    priority: 'High',
    isRead: false,
  },
  {
    user: 'Current User',
    title: 'Maintenance Approved',
    message: 'The maintenance request for Printer 08 has been approved.',
    type: 'Maintenance Approved',
    priority: 'Medium',
    isRead: false,
  },
];

const sampleActivityLogs = [
  {
    user: 'Amelia Chen',
    role: 'Manager',
    module: 'Assets',
    action: 'Assigned',
    description: 'Assigned a laptop to Engineering team.',
    ipAddress: '192.168.1.10',
  },
  {
    user: 'Nora Singh',
    role: 'Employee',
    module: 'Bookings',
    action: 'Booked',
    description: 'Booked a conference room projector for a client meeting.',
    ipAddress: '192.168.1.11',
  },
];

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const payload = notifications.length ? notifications : sampleNotifications;
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find().sort({ createdAt: -1 });
    const payload = activityLogs.length ? activityLogs : sampleActivityLogs;
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createActivityLog = async (req, res) => {
  try {
    const activityLog = await ActivityLog.create(req.body);
    res.status(201).json({ success: true, data: activityLog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

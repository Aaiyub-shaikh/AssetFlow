const { Notification } = require('../models');
const { getTransporter } = require('../config/email');

let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AssetFlow <noreply@assetflow.io>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'info',
  link = null,
  entityType = null,
  entityId = null,
  metadata = {},
  sendEmailNotification = false,
  recipientEmail = null,
}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    title,
    message,
    type,
    link,
    entityType,
    entityId,
    metadata,
  });

  if (ioInstance) {
    ioInstance.to(`user:${recipientId}`).emit('notification', {
      id: notification._id,
      title,
      message,
      type,
      link,
      createdAt: notification.createdAt,
    });
  }

  if (sendEmailNotification && recipientEmail) {
    await sendEmail(
      recipientEmail,
      `[AssetFlow] ${title}`,
      `<p>${message}</p>${link ? `<p><a href="${link}">View Details</a></p>` : ''}`
    );
  }

  return notification;
};

const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const skip = (page - 1) * limit;
  const query = { recipient: userId };
  if (unreadOnly) query.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return { notifications, total, unreadCount, page, limit };
};

const markAsRead = async (notificationId, userId) =>
  Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

const markAllAsRead = async (userId) =>
  Notification.updateMany({ recipient: userId, read: false }, { read: true });

module.exports = {
  setSocketIO,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  sendEmail,
};

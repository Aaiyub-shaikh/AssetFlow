const { ActivityLog } = require('../models');
const { getClientIp } = require('../helpers/request');

const logActivity = async ({
  user,
  action,
  entity,
  entityId = null,
  description,
  oldValue = null,
  newValue = null,
  req = null,
}) => {
  try {
    await ActivityLog.create({
      user: user._id || user,
      action,
      entity,
      entityId,
      description,
      oldValue,
      newValue,
      ipAddress: req ? getClientIp(req) : null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};

const getActivityLogs = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20, skip = 0 } = pagination;
  const query = {};

  if (filters.user) query.user = filters.user;
  if (filters.entity) query.entity = filters.entity;
  if (filters.entityId) query.entityId = filters.entityId;
  if (filters.action) query.action = filters.action;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('user', 'name email profileImage role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(query),
  ]);

  return { logs, total, page, limit };
};

module.exports = { logActivity, getActivityLogs };

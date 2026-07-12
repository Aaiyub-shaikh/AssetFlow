const {
  Asset,
  AssetAllocation,
  Booking,
  MaintenanceRequest,
  AuditCycle,
  TransferRequest,
  ActivityLog,
  User,
  Notification,
} = require('../models');

const getDashboardKPIs = async () => {
  const [
    totalAssets,
    allocatedAssets,
    availableAssets,
    underMaintenance,
    activeAllocations,
    pendingTransfers,
    pendingMaintenance,
    activeAudits,
    totalEmployees,
    unreadNotifications,
  ] = await Promise.all([
    Asset.countDocuments({ status: { $nin: ['disposed', 'retired'] } }),
    Asset.countDocuments({ status: 'allocated' }),
    Asset.countDocuments({ status: 'available' }),
    Asset.countDocuments({ status: 'under_maintenance' }),
    AssetAllocation.countDocuments({ status: 'active' }),
    TransferRequest.countDocuments({ status: { $in: ['requested', 'dept_head_approved'] } }),
    MaintenanceRequest.countDocuments({ status: { $in: ['pending', 'approved', 'assigned', 'in_progress'] } }),
    AuditCycle.countDocuments({ status: { $in: ['planned', 'in_progress'] } }),
    User.countDocuments({ status: 'active' }),
    Notification.countDocuments({ read: false }),
  ]);

  const utilizationRate = totalAssets > 0 ? Math.round((allocatedAssets / totalAssets) * 100) : 0;

  return {
    kpis: [
      { label: 'Total Assets', value: totalAssets, change: 0, trend: 'neutral', icon: 'package' },
      { label: 'Utilization Rate', value: utilizationRate, change: 0, trend: utilizationRate > 70 ? 'up' : 'neutral', icon: 'activity' },
      { label: 'Active Allocations', value: activeAllocations, change: 0, trend: 'up', icon: 'users' },
      { label: 'Under Maintenance', value: underMaintenance, change: 0, trend: underMaintenance > 5 ? 'down' : 'neutral', icon: 'wrench' },
      { label: 'Pending Transfers', value: pendingTransfers, change: 0, trend: 'neutral', icon: 'arrow-right-left' },
      { label: 'Pending Maintenance', value: pendingMaintenance, change: 0, trend: 'neutral', icon: 'tool' },
      { label: 'Active Audits', value: activeAudits, change: 0, trend: 'neutral', icon: 'clipboard-check' },
      { label: 'Active Employees', value: totalEmployees, change: 0, trend: 'up', icon: 'user-check' },
    ],
    summary: {
      totalAssets,
      allocatedAssets,
      availableAssets,
      underMaintenance,
      utilizationRate,
      unreadNotifications,
    },
  };
};

const getRecentActivity = async (limit = 10) => {
  const activities = await ActivityLog.find()
    .populate('user', 'name email profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);

  return activities.map((log) => ({
    id: log._id,
    action: log.action,
    description: log.description,
    user: log.user?.name || 'System',
    userAvatar: log.user?.profileImage,
    timestamp: log.createdAt,
    type: log.entity?.toLowerCase() || 'update',
    entity: log.entity,
    entityId: log.entityId,
  }));
};

const getAssetStatusChart = async () => {
  const result = await Asset.aggregate([
    { $match: { status: { $nin: ['disposed'] } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return result.map((r) => ({ name: r._id, value: r.count }));
};

const getDepartmentAssetChart = async () => {
  const result = await Asset.aggregate([
    { $match: { department: { $ne: null } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    {
      $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' },
    },
    { $unwind: '$dept' },
    { $project: { name: '$dept.name', value: '$count' } },
    { $sort: { value: -1 } },
    { $limit: 10 },
  ]);

  return result;
};

const getUserDashboard = async (userId) => {
  const [myAllocations, myBookings, myMaintenance, myNotifications] = await Promise.all([
    AssetAllocation.countDocuments({ employee: userId, status: 'active' }),
    Booking.countDocuments({ bookedBy: userId, status: { $in: ['pending', 'confirmed'] } }),
    MaintenanceRequest.countDocuments({ requestedBy: userId, status: { $nin: ['resolved', 'rejected'] } }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  const assignedAssets = await Asset.find({ assignedTo: userId })
    .populate('category', 'name icon')
    .select('name assetTag status condition');

  return {
    myAllocations,
    myBookings,
    myMaintenance,
    unreadNotifications: myNotifications,
    assignedAssets,
  };
};

module.exports = {
  getDashboardKPIs,
  getRecentActivity,
  getAssetStatusChart,
  getDepartmentAssetChart,
  getUserDashboard,
};

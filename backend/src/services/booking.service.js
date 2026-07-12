const AppError = require('../utils/AppError');
const { Booking, Asset, User } = require('../models');
const { BOOKING_STATUS, ASSET_STATUS, ACTIVITY_ACTIONS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { logActivity } = require('./activityLog.service');
const { createNotification } = require('./notification.service');

const checkBookingOverlap = async (assetId, startDate, endDate, excludeId = null) => {
  const query = {
    asset: assetId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ],
  };

  if (excludeId) query._id = { $ne: excludeId };

  return Booking.findOne(query);
};

const getBookings = async (query, currentUser) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.asset) filter.asset = query.asset;
  if (currentUser.role === 'employee') filter.bookedBy = currentUser._id;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('asset', 'name assetTag isSharedResource')
      .populate('bookedBy', 'name email')
      .populate('department', 'name code')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return { bookings, pagination: buildPaginationMeta(total, page, limit) };
};

const createBooking = async (data, performedBy, req) => {
  const asset = await Asset.findById(data.assetId);
  if (!asset) throw new AppError('Asset not found', 404);

  if (!asset.isSharedResource) {
    throw new AppError('Only shared resources can be booked', 400);
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate >= endDate) {
    throw new AppError('End date must be after start date', 400);
  }

  if (startDate < new Date()) {
    throw new AppError('Start date cannot be in the past', 400);
  }

  const overlap = await checkBookingOverlap(data.assetId, startDate, endDate);
  if (overlap) {
    throw new AppError('Booking overlaps with an existing reservation', 409);
  }

  const departmentId = performedBy.department?._id || performedBy.department || data.departmentId;
  if (!departmentId) throw new AppError('User must belong to a department', 400);

  const booking = await Booking.create({
    asset: data.assetId,
    bookedBy: performedBy._id,
    department: departmentId,
    startDate,
    endDate,
    purpose: data.purpose,
    location: data.location || asset.location,
    status: BOOKING_STATUS.CONFIRMED,
  });

  if (asset.status === ASSET_STATUS.AVAILABLE) {
    asset.status = ASSET_STATUS.RESERVED;
    await asset.save();
  }

  const populated = await Booking.findById(booking._id)
    .populate('asset', 'name assetTag')
    .populate('bookedBy', 'name email')
    .populate('department', 'name code');

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.BOOK,
    entity: 'Booking',
    entityId: booking._id,
    description: `Booked ${asset.name} from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    req,
  });

  await createNotification({
    recipientId: performedBy._id,
    title: 'Booking Confirmed',
    message: `Your booking for "${asset.name}" is confirmed.`,
    type: 'success',
    link: `/bookings/${booking._id}`,
    entityType: 'Booking',
    entityId: booking._id,
    recipientEmail: performedBy.email,
    sendEmailNotification: true,
  });

  return populated;
};

const cancelBooking = async (id, performedBy, req) => {
  const booking = await Booking.findById(id).populate('asset');
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.bookedBy.toString() !== performedBy._id.toString() &&
      !['admin', 'asset_manager', 'department_head'].includes(performedBy.role)) {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new AppError('Booking is already cancelled', 400);
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancelledBy = performedBy._id;
  await booking.save();

  const otherBookings = await Booking.countDocuments({
    asset: booking.asset._id,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
    endDate: { $gte: new Date() },
  });

  if (otherBookings === 0 && booking.asset.status === ASSET_STATUS.RESERVED) {
    booking.asset.status = ASSET_STATUS.AVAILABLE;
    await booking.asset.save();
  }

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'Booking',
    entityId: booking._id,
    description: 'Booking cancelled',
    req,
  });

  return booking;
};

const completeBooking = async (id, performedBy, req) => {
  const booking = await Booking.findById(id).populate('asset');
  if (!booking) throw new AppError('Booking not found', 404);

  booking.status = BOOKING_STATUS.COMPLETED;
  await booking.save();

  const activeBookings = await Booking.countDocuments({
    asset: booking.asset._id,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
    endDate: { $gte: new Date() },
  });

  if (activeBookings === 0) {
    booking.asset.status = ASSET_STATUS.AVAILABLE;
    await booking.asset.save();
  }

  await logActivity({
    user: performedBy,
    action: ACTIVITY_ACTIONS.UPDATE,
    entity: 'Booking',
    entityId: booking._id,
    description: 'Booking completed',
    req,
  });

  return booking;
};

module.exports = {
  getBookings,
  createBooking,
  cancelBooking,
  completeBooking,
  checkBookingOverlap,
};

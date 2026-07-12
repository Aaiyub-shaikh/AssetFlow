const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const bookingService = require('../services/booking.service');

exports.getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings(req.query, req.user);
  return ApiResponse.paginated(res, result.bookings, result.pagination);
});

exports.createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user, req);
  return ApiResponse.created(res, booking, 'Booking created successfully');
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user, req);
  return ApiResponse.success(res, booking, 'Booking cancelled');
});

exports.completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.id, req.user, req);
  return ApiResponse.success(res, booking, 'Booking completed');
});

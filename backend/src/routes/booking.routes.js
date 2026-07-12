const { Router } = require('express');
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { bookingValidator, mongoIdParam } = require('../validators/resource.validator');
const { paginationQuery } = require('../validators/auth.validator');

const router = Router();

router.use(protect);

router.get('/', paginationQuery, validate, authorize('bookings:*'), bookingController.getBookings);
router.post('/', bookingValidator, validate, authorize('bookings:*'), bookingController.createBooking);
router.patch('/:id/cancel', mongoIdParam(), validate, authorize('bookings:*'), bookingController.cancelBooking);
router.patch('/:id/complete', mongoIdParam(), validate, authorize('bookings:*'), bookingController.completeBooking);

module.exports = router;

const express = require('express');
const { getBookings, getBooking, addBooking, updateBooking, deleteBooking, deleteBookings } = require('../controllers/booking');


const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getBookings)
    .post(protect, authorize('admin', 'user'), addBooking)
    .delete(protect, authorize('admin'), deleteBookings);
router.route('/:id')
    .get(protect, getBooking)
    .put(protect, authorize('admin', 'user'), updateBooking)
    .delete(protect, authorize('admin', 'user'), deleteBooking);

module.exports = router;
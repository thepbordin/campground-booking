const Booking = require('../models/Booking');
const Campground = require('../models/Campground');
// @desc Get all bookings
// @route GET /api/v1/bookings
// @access Public
exports.getBookings = async (req, res, next) => {
    let query;
    // General user can see only ther booking
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path: 'campground',
            select: 'name province tel'
        });
    } else {
        if (req.params.campgroundId) {
            query = Booking.find({ campground: req.params.campgroundId }.populate({
                path: 'campground',
                select: 'name province tel'
            }));
        } else {
            query = Booking.find().populate({
                path: 'campground',
                select: 'name province tel'
            });
        }
    }
    try {
        const bookings = await query;
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch {
        console.log(err.stack);
        res.status(400).json({ success: false, message: "Cannot find booking" });
    }
}
// @desc Get Single bookings
// @route GET /api/v1/bookings/:id
// @access Public
exports.getBooking = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: "campground",
                select: "name address tel",
            })

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "You don't have permission to access this booking or Booking Not found",
            });
        }
        if (booking.user.toString() !== req.user.id && req.user.role != 'admin') {
            return res.status(401).json({
                success: false,
                message: `You don't have permission to access this booking or Booking Not found`
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot find Booking",
        });
    }
};


// @desc Add bookings
// @route POST /api/v1/campground/:campgroundId/bookings
// @access Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.campground = req.params.campgroundId;
        console.log(req.body);
        const campground = await Campground.findById(req.params.campgroundId);

        if (!campground) {
            return res.status(404).json({
                success: false,
                message: `No campground with the id of ${req.params.campgroundId}`
            });
        }

        req.body.user = req.user.id;

        const existedBookings = await Booking.find({ user: req.user.id });

        if (existedBookings.length >= 3 && req.user.role != 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 bookings`
            });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot create Booking"
        });
    }
}

// @desc Update bookings
// @route PUT /api/v1/bookings/:id
// @access Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        if (booking.user.toString() !== req.user.id && req.user.role != 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot update Booking"
        });
    }
}

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        if (booking.user.toString() !== req.user.id && req.user.role != 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`
            });
        }

        const deleted = await booking.deleteOne();

        res.status(200).json({
            success: true,
            deletedCount: deleted.deletedCount
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Booking"
        });
    }
}

exports.deleteBookings = async (req, res, next) => {
    try {
        if (!req.params.campgroundId) {
            return res.status(400).json({
                success: false,
                message: "Please provide campground id"
            });
        }
        if (!req.body.bookDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide booking date"
            });
        }
        console.log(req.body.bookDate);

        const date = new Date(req.body.bookDate);
        date.setHours(0, 0, 0, 0);
        // DELETE ALL BOOKING IN DATE
        const DeletedBookings = await Booking.deleteMany({
            campground: req.params.campgroundId,
            bookDate: {
                $gte: date,
                $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        res.status(200).json({
            success: true,
            counts: DeletedBookings.deletedCount
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Cannot delete Bookings"
        });
    }
}
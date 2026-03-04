const express = require('express');
const router = express.Router();
const Bookings = require('../../models/Bookings');
const Token = require('../../models/Token');
const Tour = require('../../models/Tour');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/createbooking', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(' ')[1];

        // Token se userId nikalo
        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const { tourId, noOfGuests, pricePerPerson, totalAmount, bookingDate } = req.body;

        if (!tourId || !noOfGuests || !pricePerPerson || !totalAmount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newBooking = new Bookings({
            userId: tokenDoc.userId,
            tourId,
            noOfGuests,
            pricePerPerson,
            totalAmount,
            bookingDate: bookingDate || Date.now(),
            paymentStatus: 'pending',
            bookingStatus: 'pending'
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL BOOKINGS (Admin — sab dekh sakta hai, Agency — sirf apni)
router.get('/getallbookings', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const skip = parseInt(req.query.skip) || 0;

        let filter = {};

        if (req.user.userType === 'Agency') {
            const agencyTours = await Tour.find({ agencyId: req.user.id }).select('_id');
            const tourIds = agencyTours.map(t => t._id);
            filter = { tourId: { $in: tourIds } };

        } else if (req.user.userType === 'Admin') {
            filter = {};

        } else {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const bookings = await Bookings.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('userId', '-password')
            .populate({
                path: 'tourId',
                populate: {
                    path: 'agencyId'
                }
            })
            .sort({ createdAt: -1 });

        const total = await Bookings.countDocuments(filter);
        const hasMore = skip + limit < total;

        res.status(200).json({
            message: "Bookings fetched successfully",
            total,
            fetched: bookings.length,
            hasMore,        // frontend ko pata chalega aur bookings hain ya nahi
            nextSkip: hasMore ? skip + limit : null,   // agla skip value
            bookings
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/updatebookingstatus/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { bookingStatus, paymentStatus } = req.body;

        // Validate values
        const validBookingStatuses = ['pending', 'confirmed', 'cancelled'];
        const validPaymentStatuses = ['pending', 'paid', 'cancelled', 'refunded'];

        if (bookingStatus && !validBookingStatuses.includes(bookingStatus)) {
            return res.status(400).json({ error: "Invalid bookingStatus value" });
        }
        if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
            return res.status(400).json({ error: "Invalid paymentStatus value" });
        }

        // Agency sirf apne tours ki bookings update kar sakti hai
        if (req.user.userType === 'Agency') {
            const booking = await Bookings.findById(id).populate('tourId', 'agencyId');
            if (!booking) return res.status(404).json({ error: "Booking not found" });

            if (booking.tourId.agencyId.toString() !== req.user.id.toString()) {
                return res.status(403).json({ error: "Not authorized to update this booking" });
            }
        }

        const updateFields = {};
        if (bookingStatus) updateFields.bookingStatus = bookingStatus;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;

        const updated = await Bookings.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        )
            .populate('userId', '-password')
            .populate({ path: 'tourId', populate: { path: 'agencyId' } });

        if (!updated) return res.status(404).json({ error: "Booking not found" });

        res.status(200).json({
            message: "Booking status updated successfully",
            booking: updated
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Agency = require('../../models/Agency');
const Tour = require('../../models/Tour');
const Bookings = require('../../models/Bookings'); // ✅ changed here
const Review = require('../../models/Reviews');


// =======================================
// GET DASHBOARD STATS + RECENT ACTIVITY
// =======================================
router.get('/getdashboardstats', async (req, res) => {
    try {

        // ======================
        // STATS COUNTS
        // ======================
        const totalUsers = await User.countDocuments();
        const totalAgencies = await Agency.countDocuments();
        const activeTours = await Tour.countDocuments({ status: "active" });
        const totalBookings = await Bookings.countDocuments(); // ✅ changed here
        const totalReviews = await Review.countDocuments();

        // ======================
        // RECENT ACTIVITIES
        // ======================

        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email createdAt")
            .lean();

        const recentAgencies = await Agency.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name createdAt")
            .lean();

        const recentBookings = await Bookings.find({}) // ✅ changed here
            .sort({ createdAt: -1 })
            .limit(5)
            .select("bookingStatus createdAt")
            .lean();

        const recentReviews = await Review.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("rating createdAt")
            .lean();

        // ======================
        // COMBINE ACTIVITY
        // ======================

        let activities = [];

        recentUsers.forEach(user => {
            activities.push({
                type: "New User",
                message: `${user.name} registered`,
                date: user.createdAt
            });
        });

        recentAgencies.forEach(agency => {
            activities.push({
                type: "New Agency",
                message: `${agency.name} registered`,
                date: agency.createdAt
            });
        });

        recentBookings.forEach(booking => {
            activities.push({
                type: "New Booking",
                message: `Booking created with status ${booking.bookingStatus}`,
                date: booking.createdAt
            });
        });

        recentReviews.forEach(review => {
            activities.push({
                type: "New Review",
                message: `New review with rating ${review.rating}`,
                date: review.createdAt
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            message: "Dashboard data fetched successfully",
            stats: {
                totalUsers,
                totalAgencies,
                activeTours,
                totalBookings,
                totalReviews
            },
            recentActivity: activities.slice(0, 10)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
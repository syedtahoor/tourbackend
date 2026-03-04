const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

// =======================================
// GET AGENCY DASHBOARD STATS
// Route: GET /api/agency/getagencydashboardstats/:agencyId
// =======================================
router.get('/getagencydashboardstats/:agencyId', async (req, res) => {
    try {
        const { agencyId } = req.params;

        // Validate agencyId
        if (!mongoose.Types.ObjectId.isValid(agencyId)) {
            return res.status(400).json({ error: "Invalid agency ID" });
        }

        const agencyObjectId = new mongoose.Types.ObjectId(agencyId);

        // =====================================================
        // STEP 1: Tours Table → Get all tours of this agency
        // =====================================================

        const allTours = await Tour.find({ agencyId: agencyObjectId })
            .select('_id name category status price capacity startDate endDate')
            .lean();

        const tourIds = allTours.map(t => t._id);

        const totalTours = allTours.length;
        const activeTours = allTours.filter(t => t.status === 'active').length;
        const draftTours = allTours.filter(t => t.status === 'draft').length;
        const inactiveTours = allTours.filter(t => t.status === 'inactive').length;

        // =====================================================
        // STEP 2: Bookings Table → All bookings for these tours
        // =====================================================

        const allBookings = tourIds.length > 0
            ? await Bookings.find({ tourId: { $in: tourIds } })
                .select('tourId userId totalAmount paymentStatus bookingStatus noOfGuests bookingDate createdAt')
                .lean()
            : [];

        const totalBookings = allBookings.length;
        const confirmedBookings = allBookings.filter(b => b.bookingStatus === 'confirmed').length;
        const pendingBookings = allBookings.filter(b => b.bookingStatus === 'pending').length;
        const cancelledBookings = allBookings.filter(b => b.bookingStatus === 'cancelled').length;

        // Revenue: only from 'paid' paymentStatus
        const totalRevenue = allBookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Pending revenue: confirmed but not yet paid
        const pendingRevenue = allBookings
            .filter(b => b.bookingStatus === 'confirmed' && b.paymentStatus === 'pending')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Active travelers: unique users with confirmed bookings
        const activeTravelerIds = [
            ...new Set(
                allBookings
                    .filter(b => b.bookingStatus === 'confirmed')
                    .map(b => b.userId?.toString())
                    .filter(Boolean)
            )
        ];
        const activeTravelers = activeTravelerIds.length;

        // Total guests (confirmed bookings)
        const totalGuests = allBookings
            .filter(b => b.bookingStatus === 'confirmed')
            .reduce((sum, b) => sum + (b.noOfGuests || 0), 0);

        // Confirmed bookings created this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedThisMonth = allBookings.filter(b =>
            b.bookingStatus === 'confirmed' &&
            new Date(b.createdAt) >= startOfMonth
        ).length;

        // =====================================================
        // STEP 3: Reviews Table → Reviews for this agency's tours
        // =====================================================

        const allReviews = tourIds.length > 0
            ? await Review.find({
                tour: { $in: tourIds },
                isApproved: true
            })
                .select('tour rating review name createdAt')
                .lean()
            : [];

        const totalReviews = allReviews.length;

        const avgRating = totalReviews > 0
            ? parseFloat(
                (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            )
            : 0;

        // Rating breakdown: 1★ to 5★
        const ratingBreakdown = [1, 2, 3, 4, 5].map(star => ({
            star,
            count: allReviews.filter(r => r.rating === star).length,
            percentage: totalReviews > 0
                ? Math.round((allReviews.filter(r => r.rating === star).length / totalReviews) * 100)
                : 0
        }));

        // =====================================================
        // STEP 4: Revenue & Bookings Trend (Monthly - current year)
        // =====================================================

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const trendData = months.map((month, index) => {
            const monthBookings = allBookings.filter(b => {
                const d = new Date(b.createdAt);
                return d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === index;
            });

            const monthRevenue = monthBookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            return {
                month,
                revenue: monthRevenue,
                bookings: monthBookings.length
            };
        });

        // =====================================================
        // STEP 5: Tour Distribution by Category
        // =====================================================

        const categoryMap = {};
        allTours.forEach(tour => {
            const cat = tour.category || 'Other';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const tourDistribution = Object.entries(categoryMap)
            .map(([type, count]) => ({
                type,
                count,
                percentage: totalTours > 0
                    ? Math.round((count / totalTours) * 100)
                    : 0
            }))
            .sort((a, b) => b.count - a.count);

        // =====================================================
        // STEP 6: Top 5 Performing Tours (by revenue)
        // =====================================================

        const topTours = allTours
            .map(tour => {
                const tourBookings = allBookings.filter(
                    b => b.tourId?.toString() === tour._id.toString()
                );
                const tourRevenue = tourBookings
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

                const tourReviews = allReviews.filter(
                    r => r.tour?.toString() === tour._id.toString()
                );
                const tourAvgRating = tourReviews.length > 0
                    ? parseFloat(
                        (tourReviews.reduce((s, r) => s + r.rating, 0) / tourReviews.length).toFixed(1)
                    )
                    : 0;

                return {
                    tourId: tour._id,
                    name: tour.name,
                    category: tour.category,
                    status: tour.status,
                    price: tour.price,
                    totalBookings: tourBookings.length,
                    confirmedBookings: tourBookings.filter(b => b.bookingStatus === 'confirmed').length,
                    revenue: tourRevenue,
                    avgRating: tourAvgRating,
                    totalReviews: tourReviews.length
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // =====================================================
        // STEP 7: Notifications (Recent Bookings + Reviews)
        // =====================================================

        const recentBookings = tourIds.length > 0
            ? await Bookings.find({ tourId: { $in: tourIds } })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('tourId', 'name')
                .populate('userId', 'name')
                .select('bookingStatus paymentStatus createdAt tourId userId')
                .lean()
            : [];

        const recentReviews = tourIds.length > 0
            ? await Review.find({ tour: { $in: tourIds }, isApproved: true })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('tour', 'name')
                .select('rating name tour createdAt')
                .lean()
            : [];

        let notifications = [];

        recentBookings.forEach(b => {
            const typeMap = {
                confirmed: 'Booking Confirmed',
                pending: 'New Booking',
                cancelled: 'Booking Cancelled'
            };
            notifications.push({
                type: typeMap[b.bookingStatus] || 'New Booking',
                message: `${b.userId?.name || 'A traveler'} booked ${b.tourId?.name || 'a tour'}`,
                bookingStatus: b.bookingStatus,
                paymentStatus: b.paymentStatus,
                date: b.createdAt
            });
        });

        recentReviews.forEach(r => {
            notifications.push({
                type: 'New Review',
                message: `${r.name} gave ${r.rating}★ on ${r.tour?.name || 'your tour'}`,
                rating: r.rating,
                date: r.createdAt
            });
        });

        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        res.status(200).json({
            message: "Agency dashboard data fetched successfully",

            stats: {
                // ── Top 4 Stat Cards ──────────────────────
                totalTours,          // Tours table    → agencyId se count
                totalBookings,       // Bookings table → tourId in agencyTours
                totalRevenue,        // Bookings table → paymentStatus='paid' ka sum
                activeTravelers,     // Bookings table → confirmed bookings ke unique userId

                // ── Bottom Status Bar ─────────────────────
                activeTours,         // Tours table    → status='active'
                pendingBookings,     // Bookings table → bookingStatus='pending'
                completedThisMonth,  // Bookings table → confirmed + is month created
                avgRating,           // Reviews table  → approved reviews ka avg rating

                // ── Extra Breakdown ───────────────────────
                draftTours,
                inactiveTours,
                confirmedBookings,
                cancelledBookings,
                pendingRevenue,
                totalGuests,
                totalReviews,

                // ── Calculated KPIs ───────────────────────
                bookingRate: totalTours > 0
                    ? parseFloat((totalBookings / totalTours).toFixed(1))
                    : 0,
                avgRevenuePerTour: totalTours > 0
                    ? Math.round(totalRevenue / totalTours)
                    : 0,
                conversionRate: totalBookings > 0
                    ? parseFloat(((confirmedBookings / totalBookings) * 100).toFixed(1))
                    : 0
            },

            revenueTrend: trendData,            // Monthly chart (Jan–Dec)
            tourDistribution: tourDistribution,     // Category pie chart
            ratingBreakdown: ratingBreakdown,      // 1★–5★ breakdown
            topTours: topTours,             // Top 5 tours by revenue
            notifications: notifications.slice(0, 8) // Bell icon list
        });

    } catch (error) {
        console.error("Agency Dashboard Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
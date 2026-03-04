const express = require('express');
const router = express.Router();
const Review = require('../../models/Reviews');
const Token = require('../../models/Token');
const Tour = require('../../models/Tour');
const authMiddleware = require('../../middlewares/authMiddleware');


// =======================================
// CREATE REVIEW (User side)
// =======================================
// =======================================
// CREATE REVIEW (User side)
// =======================================
router.post('/createreview', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(' ')[1];

        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const { tourId, rating, review, name } = req.body;

        if (!tourId || !rating || !review || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const newReview = new Review({
            tour: tourId,          // ✅ FIXED
            rating,
            review,
            name,
            isApproved: false
        });

        await newReview.save();

        res.status(201).json({
            message: "Review submitted successfully (Waiting for approval)",
            review: newReview
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================================
// =======================================
router.get('/getallreviews', async (req, res) => {
    try {

        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }

        const tokenData = await Token.findOne({ token })
            .select("userId userType")
            .lean();

        if (!tokenData || tokenData.userType !== "Agency") {
            return res.status(403).json({ message: "Invalid or unauthorized token" });
        }

        const agencyId = tokenData.userId;

        // 🔥 Removed isApproved filter
        const reviews = await Review.find({})
            .populate({
                path: "tour",
                match: { agencyId: agencyId },
                select: "name"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Remove reviews where populate returned null
        const filteredReviews = reviews.filter(r => r.tour !== null);

        const total = filteredReviews.length;

        res.status(200).json({
            message: "Agency reviews fetched successfully",
            total,
            fetched: filteredReviews.length,
            reviews: filteredReviews
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================================
// GET REVIEWS BY TOUR (Public)
// =======================================
router.get('/tour/:tourId', async (req, res) => {
    try {

        const { tourId } = req.params;

        const reviews = await Review.find({
            tour: tourId,
            isApproved: true
        })
            .populate({
                path: 'tour',
                select: 'title'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Tour reviews fetched successfully",
            total: reviews.length,
            reviews
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================================
// UPDATE REVIEW STATUS (Admin Only)
// =======================================
router.patch('/updatereviewstatus/:id', authMiddleware, async (req, res) => {
    try {

        if (req.user.userType !== 'Agency') {
            return res.status(403).json({ error: "Only Admin can update review status" });
        }

        const { id } = req.params;
        const { isApproved } = req.body;

        const updated = await Review.findByIdAndUpdate(
            id,
            { $set: { isApproved } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.status(200).json({
            message: "Review status updated successfully",
            review: updated
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
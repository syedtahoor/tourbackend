const express = require('express');
const router = express.Router();
const Newsletter = require('../../models/Newsletter');


// =======================================
// CREATE NEWSLETTER SUBSCRIPTION (Public)
// =======================================
router.post('/subscribe', async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if already exists
        const existingEmail = await Newsletter.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ error: "Email already subscribed" });
        }

        const newSubscriber = new Newsletter({
            email
        });

        await newSubscriber.save();

        res.status(201).json({
            message: "Subscribed to newsletter successfully",
            subscriber: newSubscriber
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================================
// GET ALL SUBSCRIBERS (Admin / Agency)
// =======================================
router.get('/getallsubscribers', async (req, res) => {
    try {

        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const subscribers = await Newsletter.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Newsletter.countDocuments();

        res.status(200).json({
            message: "Subscribers fetched successfully",
            total,
            fetched: subscribers.length,
            subscribers
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================================
// DELETE SUBSCRIBER BY ID (Admin)
// =======================================
router.delete('/deletesubscriber/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const deletedSubscriber = await Newsletter.findByIdAndDelete(id);

        if (!deletedSubscriber) {
            return res.status(404).json({ error: "Subscriber not found" });
        }

        res.status(200).json({
            message: "Subscriber deleted successfully",
            deletedSubscriber
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
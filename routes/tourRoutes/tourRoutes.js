const express = require('express');
const router = express.Router();
const Tour = require('../../models/Tour');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../multerConfig');
const fs = require('fs');
const path = require('path');

/* ----------------- CREATE TOUR ----------------- */
router.post('/create', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        if (req.user.userType !== 'Agency') {
            return res.status(403).json({ message: 'Only Agency can create tours' });
        }

        // Parse JSON fields from FormData
        const tourData = {
            name: req.body.name,
            location: req.body.location,
            category: req.body.category,
            duration: req.body.duration,
            price: req.body.price,
            capacity: req.body.capacity,
            description: req.body.description,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            difficulty: req.body.difficulty,
            highlights: req.body.highlights,
            days: req.body.days,
            nights: req.body.nights,
            status: req.body.status,
            agencyId: req.user.id
        };

        // Parse arrays (sent as JSON strings from frontend)
        if (req.body.itinerary) {
            tourData.itinerary = JSON.parse(req.body.itinerary);
        }
        if (req.body.amenities) {
            tourData.amenities = JSON.parse(req.body.amenities);
        }
        if (req.body.included) {
            tourData.included = JSON.parse(req.body.included);
        }
        if (req.body.excluded) {
            tourData.excluded = JSON.parse(req.body.excluded);
        }

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            tourData.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        const tour = new Tour(tourData);
        await tour.save();

        res.status(201).json({
            message: 'Tour created successfully',
            tour
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ----------------- GET ALL TOURS ----------------- */
router.get('/gettours', authMiddleware, async (req, res) => {
    try {
        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can access all tours' });
        }

        // Pagination parameters from query, default to 0 and 6
        const limit = parseInt(req.query.limit) || 6;
        const skip = parseInt(req.query.skip) || 0;

        // Fetch tours with skip & limit, populate agency info
        let tours = await Tour.find()
            .skip(skip)
            .limit(limit)
            .populate('agencyId', 'agencyUsername emailAddress totalRatings');

        // Map tours to rename agencyId -> tourBy
        tours = tours.map(tour => {
            const tourObj = tour.toObject();
            tourObj.tourBy = tourObj.agencyId;
            delete tourObj.agencyId;
            return tourObj;
        });

        // Total tours count
        const totalTours = await Tour.countDocuments();

        res.status(200).json({
            message: 'Tours fetched successfully',
            total: totalTours,
            fetched: tours.length,
            tours
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------- GET ALL TOURS FOR SPECIFIC AGENCY ----------------- */
router.get('/mytours', authMiddleware, async (req, res) => {
    try {
        if (req.user.userType !== 'Agency') {
            return res.status(403).json({ message: 'Only agencies can access their own tours' });
        }

        // Pagination parameters
        const limit = parseInt(req.query.limit) || 6;
        const skip = parseInt(req.query.skip) || 0;

        // Count total tours for this agency (needed for pagination info)
        const totalTours = await Tour.countDocuments({ agencyId: req.user.id });

        // Fetch tours with skip & limit
        let tours = await Tour.find({ agencyId: req.user.id })
            .skip(skip)
            .limit(limit)
            .populate('agencyId', 'agencyUsername emailAddress totalRatings');

        // Map tours to replace agencyId with tourBy
        tours = tours.map(tour => {
            const tourObj = tour.toObject();
            tourObj.tourBy = tourObj.agencyId;
            delete tourObj.agencyId;
            return tourObj;
        });

        res.status(200).json({
            message: 'Your tours fetched successfully',
            total: totalTours,
            fetched: tours.length,
            tours
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------- DELETE SPECIFIC TOUR ----------------- */
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const tourId = req.params.id;
        const tour = await Tour.findById(tourId);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        if (req.user.userType === 'Agency' && tour.agencyId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own tours' });
        }

        await Tour.findByIdAndDelete(tourId);
        res.status(200).json({ message: 'Tour deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------- EDIT SPECIFIC TOUR ----------------- */
router.put('/update/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {

        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        // -------------------------
        // BASIC FIELDS UPDATE
        // -------------------------
        tour.name = req.body.name || tour.name;
        tour.location = req.body.location || tour.location;
        tour.category = req.body.category || tour.category;
        tour.duration = req.body.duration || tour.duration;
        tour.price = req.body.price || tour.price;
        tour.capacity = req.body.capacity || tour.capacity;
        tour.description = req.body.description || tour.description;
        tour.startDate = req.body.startDate || tour.startDate;
        tour.endDate = req.body.endDate || tour.endDate;
        tour.difficulty = req.body.difficulty || tour.difficulty;
        tour.highlights = req.body.highlights || tour.highlights;
        tour.status = req.body.status || tour.status;

        // -------------------------
        // ARRAY FIELDS
        // -------------------------
        if (req.body.itinerary) {
            tour.itinerary = JSON.parse(req.body.itinerary);
        }

        if (req.body.amenities) {
            tour.amenities = JSON.parse(req.body.amenities);
        }

        if (req.body.included) {
            tour.included = JSON.parse(req.body.included);
        }

        if (req.body.excluded) {
            tour.excluded = JSON.parse(req.body.excluded);
        }

        // -------------------------
        // IMAGE DELETE LOGIC
        // -------------------------
        let existingImages = [];

        if (req.body.existingImages) {
            existingImages = JSON.parse(req.body.existingImages);
        }

        const imagesToDelete = tour.images.filter(
            img => !existingImages.includes(img)
        );

        imagesToDelete.forEach(imgPath => {
            // remove starting slash
            const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;

            const fullPath = path.join(process.cwd(), cleanPath);

            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log("Deleted:", fullPath);
            } else {
                console.log("File not found:", fullPath);
            }
        });


        // -------------------------
        // ADD NEW IMAGES
        // -------------------------
        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        tour.images = [...existingImages, ...newImages];

        await tour.save();

        res.status(200).json({
            message: 'Tour updated successfully',
            tour
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ----------------- GET SINGLE TOUR ----------------- */
router.get('/gettours/:id', authMiddleware, async (req, res) => {
    try {

        const tour = await Tour.findById(req.params.id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        res.status(200).json({
            message: 'Tour fetched successfully',
            tour: tour
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------- PUBLIC GET ALL TOURS ----------------- */
router.get('/getalltours', async (req, res) => {
    try {
        // Number of tours per request
        const limit = parseInt(req.query.limit) || 8;
        const skip = parseInt(req.query.skip) || 0;

        // Fetch tours with pagination
        const tours = await Tour.find({ status: "active" })
            .skip(skip)
            .limit(limit)
            .populate('agencyId', 'agencyUsername totalRatings');

        // Total number of active tours
        const totalTours = await Tour.countDocuments({ status: "active" });

        res.status(200).json({
            message: "Tours fetched successfully",
            total: totalTours,
            fetched: tours.length,
            tours
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single tour by ID
router.get('/gettour/:id', async (req, res) => {
    try {
        const tourId = req.params.id;  

        const tour = await Tour.findById(tourId)
            .populate('agencyId', 'agencyUsername totalRatings');

        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        res.status(200).json({
            message: "Tour fetched successfully",
            tour
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const Testimonial = require("../../models/Testimonial");
const upload = require("../../multerConfig");


/* ─────────────────────────────────────────
   GET - Fetch All Testimonials
───────────────────────────────────────── */
router.get("/getTestimonials", async (req, res) => {
    try {
        const testimonials = await Testimonial
            .find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Testimonials fetched successfully",
            total: testimonials.length,
            testimonials
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


/* ─────────────────────────────────────────
   CREATE - Add New Testimonial
───────────────────────────────────────── */
router.post("/createTestimonial", upload.single("image"), async (req, res) => {
    try {
        const { name, designation, message } = req.body;

        if (!name || !designation || !message) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const newTestimonial = new Testimonial({
            name,
            designation,
            message,
            image: imagePath
        });

        await newTestimonial.save();

        res.status(201).json({
            message: "Testimonial created successfully",
            testimonial: newTestimonial
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


/* ─────────────────────────────────────────
   UPDATE - Edit Testimonial
───────────────────────────────────────── */
router.put("/updateTestimonial/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, designation, message } = req.body;

        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({
                message: "Testimonial not found"
            });
        }

        // Update fields if provided
        if (name) testimonial.name = name;
        if (designation) testimonial.designation = designation;
        if (message) testimonial.message = message;

        // If new image uploaded → delete old one
        if (req.file) {

            const oldImagePath = path.join(__dirname, "../../", testimonial.image);

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            testimonial.image = `/uploads/${req.file.filename}`;
        }

        await testimonial.save();

        res.status(200).json({
            message: "Testimonial updated successfully",
            testimonial
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


/* ─────────────────────────────────────────
   DELETE - Remove Testimonial
───────────────────────────────────────── */
router.delete("/deleteTestimonial/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({
                message: "Testimonial not found"
            });
        }

        // Delete image from uploads folder
        const imagePath = path.join(__dirname, "../../", testimonial.image);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Testimonial.findByIdAndDelete(id);

        res.status(200).json({
            message: "Testimonial deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;
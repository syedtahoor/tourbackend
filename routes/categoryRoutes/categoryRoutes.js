const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const path = require("path");
const fs = require("fs");
const upload = require("../../multerConfig"); 

// CREATE CATEGORY
router.post("/createCategory", upload.single("image"), async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const newCategory = new Category({
            title,
            image: imagePath
        });

        await newCategory.save();

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL CATEGORIES
router.get("/getCategories", async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Categories fetched successfully",
            total: categories.length,
            categories: categories
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE CATEGORY
router.delete("/deleteCategory/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Delete image from uploads folder
        const imagePath = path.join(__dirname, "../../", category.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE CATEGORY
router.put("/updateCategory/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Update title if provided
        if (title) {
            category.title = title;
        }

        // If new image uploaded
        if (req.file) {

            // Delete old image
            const oldImagePath = path.join(__dirname, "../../", category.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            // Save new image path
            category.image = `/uploads/${req.file.filename}`;
        }

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category: category
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
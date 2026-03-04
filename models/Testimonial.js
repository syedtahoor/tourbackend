const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String, // store image path like /uploads/xyz.jpg
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    review: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
        required: false
    },

    isApproved: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
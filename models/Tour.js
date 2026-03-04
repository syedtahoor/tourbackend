const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { _id: false });

const tourSchema = new mongoose.Schema({

    // 🔹 Agency Reference
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',     // your Agency model name
        required: true
    },

    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },

    location: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    duration: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ['easy', 'moderate', 'hard'],
        default: 'moderate'
    },

    price: {
        type: Number,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    highlights: {
        type: String
    },

    images: [
        {
            type: String
        }
    ],

    itinerary: [itinerarySchema],

    amenities: [{ type: String }],

    included: [{ type: String }],

    excluded: [{ type: String }],

    status: {
        type: String,
        enum: ['draft', 'active', 'inactive'],
        default: 'draft'
    }

}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);
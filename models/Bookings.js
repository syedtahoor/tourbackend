const mongoose = require('mongoose');

const bookingsSchema = new mongoose.Schema({

    // 🔹 User Reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // 🔹 Tour Reference
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },

    // 🔹 Guests
    noOfGuests: {
        type: Number,
        required: true,
        min: 1
    },

    // 🔹 Price Snapshot (Important)
    pricePerPerson: {
        type: Number,
        required: true
    },

    // 🔹 Total Amount
    totalAmount: {
        type: Number,
        required: true
    },

    // 🔹 Booking Date
    bookingDate: {
        type: Date,
        default: Date.now
    },

    // 🔹 Payment Status
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'refunded'],
        default: 'pending'
    },

    // 🔹 Booking Status
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }

}, { timestamps: true });

module.exports = mongoose.model('Bookings', bookingsSchema);
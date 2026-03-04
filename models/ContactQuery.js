const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    emailAddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },

    subject: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true });

module.exports = mongoose.model('ContactQuery', contactQuerySchema);

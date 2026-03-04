const mongoose = require('mongoose');   
const bcrypt = require('bcrypt');

const agencySchema = new mongoose.Schema({
    agencyUsername: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    activeTours: {
        type: Number,
        default: 0
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalTours: {
        type: Number,
        default: 0
    },
    avgRevenuePerTour: {
        type: Number,
        default: 0
    },
    bookingRate: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspend'],
        default: 'pending'
    }
}, { timestamps: true });

// Password hash karne ka pre-save hook
agencySchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password verify karne ka method
agencySchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('Agency', agencySchema);

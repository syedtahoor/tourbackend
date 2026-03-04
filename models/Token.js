const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // reference dynamic based on userType
        refPath: 'userType'
    },
    userType: {
        type: String,
        enum: ['Admin', 'Agency', 'User'], // 3 types
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d' // auto delete after 7 days
    }
});

module.exports = mongoose.model("Token", tokenSchema);

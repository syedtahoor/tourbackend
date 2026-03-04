const express = require('express');
const router = express.Router();
const Admin = require('../../models/Admin');
const Token = require('../../models/Token'); // Token model
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/* ----------------- CREATE ADMIN ----------------- */
router.post('/create', async (req, res) => {
    try {
        const headerCode = req.headers['x-admin-code']; // client headers se 4-digit code
        const envCode = process.env.ADMIN_CREATION_CODE; // .env me stored code

        if (!headerCode || headerCode !== envCode) {
            return res.status(403).json({ error: 'Unauthorized: Invalid admin code' });
        }

        const admin = new Admin(req.body);
        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: { id: admin._id, email: admin.email }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ----------------- LOGIN ADMIN ----------------- */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });

        const admin = await Admin.findOne({ email });
        if (!admin)
            return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await admin.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ error: 'Invalid email or password' });

        // 🔎 Check existing token in DB
        const existingToken = await Token.findOne({
            userId: admin._id,
            userType: 'Admin'
        });

        if (existingToken) {
            try {
                // Verify if token is still valid
                jwt.verify(existingToken.token, JWT_SECRET);

                // ✅ Token valid → return existing
                return res.status(200).json({
                    message: 'Login successful',
                    token: existingToken.token,
                    admin: { id: admin._id, email: admin.email }
                });

            } catch (err) {
                // ❌ Token expired → delete old token
                await Token.deleteOne({ _id: existingToken._id });
            }
        }

        // 🆕 Generate new token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, userType: 'Admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Save new token
        await Token.create({
            userId: admin._id,
            userType: 'Admin',
            token
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: { id: admin._id, email: admin.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ----------------- LOGOUT ADMIN ----------------- */
router.post('/logout', async (req, res) => {
    try {
        const { adminToken } = req.body;   // 👈 yahan change

        if (!adminToken) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // 🔎 Verify token first
        let decoded;
        try {
            decoded = jwt.verify(adminToken, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // 🗑 Delete token from DB
        const deleted = await Token.findOneAndDelete({
            token: adminToken,   // 👈 yahan bhi change
            userId: decoded.id,
            userType: decoded.userType
        });

        if (!deleted) {
            return res.status(400).json({ error: 'Invalid token or already logged out' });
        }

        res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Agency = require('../../models/Agency');
const Token = require('../../models/Token'); // Token model
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/* ----------------- CREATE AGENCY ----------------- */
router.post('/create', async (req, res) => {
    try {
        const agency = new Agency(req.body);
        await agency.save();
        res.status(201).json({
            message: 'Agency created successfully',
            agency: {
                id: agency._id,
                agencyUsername: agency.agencyUsername,
                emailAddress: agency.emailAddress
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/* ----------------- GET AGENCY ----------------- */
router.get('/agencies', authMiddleware, async (req, res) => {
    try {
        // Latest first
        const agencies = await Agency.find().sort({ createdAt: -1 }); // ya _id: -1 bhi kaam karega

        res.status(200).json({
            message: 'Agencies fetched successfully',
            total: agencies.length,
            agencies: agencies
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ----------------- UPDATE AGENCY STATUS ----------------- */
router.patch('/agencies/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const agency = await Agency.findById(id);

        if (!agency) {
            return res.status(404).json({ message: 'Agency not found' });
        }

        // Toggle Logic
        if (agency.status === 'pending') {
            agency.status = 'approved';
        }
        else if (agency.status === 'approved') {
            agency.status = 'suspend';
        }
        else if (agency.status === 'suspend') {
            agency.status = 'approved';
        }

        await agency.save();

        res.status(200).json({
            message: 'Agency status updated successfully',
            newStatus: agency.status,
            agency
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/* ----------------- LOGIN AGENCY ----------------- */
router.post('/login', async (req, res) => {
    try {
        const { emailAddress, password } = req.body;

        if (!emailAddress || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const agency = await Agency.findOne({ emailAddress });
        if (!agency) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check status
        if (agency.status === 'pending') {
            return res.status(403).json({ error: 'Your request has not been approved yet from the Admin.' });
        } else if (agency.status === 'suspend') {
            return res.status(403).json({ error: 'You are not allowed to log in. Please contact support.' });
        }

        // Verify password
        const isMatch = await agency.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if token already exists for this user
        let existingToken = await Token.findOne({ userId: agency._id, userType: 'Agency' });

        let token;
        if (existingToken) {
            try {
                // Verify if token is still valid
                jwt.verify(existingToken.token, JWT_SECRET);
                token = existingToken.token; // token valid, reuse it
            } catch (err) {
                // token expired or invalid, generate new one
                token = jwt.sign(
                    { id: agency._id, email: agency.emailAddress, userType: 'Agency' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                // Update token in DB
                existingToken.token = token;
                await existingToken.save();
            }
        } else {
            // No token exists, generate new
            token = jwt.sign(
                { id: agency._id, email: agency.emailAddress, userType: 'Agency' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            await Token.create({
                userId: agency._id,
                userType: 'Agency',
                token
            });
        }

        res.status(200).json({
            message: 'Login successful',
            token,
            agency: {
                id: agency._id,
                agencyUsername: agency.agencyUsername,
                emailAddress: agency.emailAddress,
                phone: agency.phone
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ----------------- LOGOUT AGENCY ----------------- */
router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body; // frontend se token bhejna hoga

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Token ko DB se delete karo
        const deleted = await Token.findOneAndDelete({ token });

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
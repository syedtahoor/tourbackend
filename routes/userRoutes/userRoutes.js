const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Token = require('../../models/Token');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// GET USERS
router.get('/getusers', authMiddleware, async (req, res) => {
    try {

        // ✅ Sirf Admin access kare
        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can access all users' });
        }

        // ✅ Pagination parameters (default: skip = 0, limit = 6)
        const limit = parseInt(req.query.limit) || 6;
        const skip = parseInt(req.query.skip) || 0;

        // ✅ Fetch users (password hide)
        let users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // ✅ Total users count
        const totalUsers = await User.countDocuments();

        res.status(200).json({
            message: 'Users fetched successfully',
            total: totalUsers,
            fetched: users.length,   // exactly like tours API
            users
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE USER
router.post('/createuser', async (req, res) => {
    try {

        const { name, email, phone, password, status } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({
            name,
            email,
            phone,
            password,
            status
        });

        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({
            message: 'User created successfully',
            user: userObj
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check status
        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Your account is inactive. Please contact support.' });
        } else if (user.status === 'suspend') {
            return res.status(403).json({ error: 'You are not allowed to log in. Please contact support.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if token already exists for this user
        let existingToken = await Token.findOne({ userId: user._id, userType: 'User' });

        let token;
        if (existingToken) {
            try {
                // Verify if token is still valid
                jwt.verify(existingToken.token, JWT_SECRET);
                token = existingToken.token; // token valid, reuse it
            } catch (err) {
                // token expired or invalid, generate new one
                token = jwt.sign(
                    { id: user._id, email: user.email, userType: 'User' },
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
                { id: user._id, email: user.email, userType: 'User' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            await Token.create({
                userId: user._id,
                userType: 'User',
                token
            });
        }

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: user.status
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGOUT USER
router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const deleted = await Token.findOneAndDelete({ token, userType: 'User' });

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

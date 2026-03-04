const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const Agency = require('../models/Agency');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, JWT_SECRET);

        const tokenExists = await Token.findOne({ token, userType: decoded.userType });
        if (!tokenExists) return res.status(401).json({ error: 'Invalid token' });

        if (decoded.userType === 'Agency') {
            const agency = await Agency.findById(decoded.id);
            if (!agency) return res.status(401).json({ error: 'Agency not found' });

            req.user = {
                id: agency._id,
                email: agency.email,
                userType: 'Agency',
                role: 'Agency'
            };

        } else if (decoded.userType === 'Admin') {
            req.user = {
                id: decoded.id,
                email: decoded.email,
                userType: 'Admin',
                role: 'Admin'
            };
        } else {
            return res.status(403).json({ error: 'Unauthorized user type' });
        }

        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin privileges required.' 
        });
    }
    next();
};

// Middleware to check if user is alumni
const isAlumni = (req, res, next) => {
    if (req.user.role !== 'alumni') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Alumni privileges required.' 
        });
    }
    next();
};

// Middleware to check if alumni is verified
const isVerified = (req, res, next) => {
    if (req.user.role === 'alumni' && !req.user.verified) {
        return res.status(403).json({ 
            success: false, 
            message: 'Account not verified. Please wait for admin verification.' 
        });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isAlumni, isVerified };

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('graduation_year').isInt({ min: 1950, max: 2100 }).withMessage('Valid graduation year required')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register new alumni
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { name, email, password, branch, graduation_year, company, field, phone, city, state, country } = req.body;

        // Check if alumni already exists
        const [existing] = await db.query(
            'SELECT email FROM alumni WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert alumni
        const [result] = await db.query(
            `INSERT INTO alumni (name, email, password_hash, branch, graduation_year, company, field) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, password_hash, branch, graduation_year, company || null, field || null]
        );
        
        const alumni_id = result.insertId;
        
        // Insert contact info if provided
        if (phone) {
            await db.query(
                'INSERT INTO alumni_contact (alumni_id, phone) VALUES (?, ?)',
                [alumni_id, phone]
            );
        }
        
        // Insert location if provided
        if (city || state || country) {
            await db.query(
                'INSERT INTO alumni_location (alumni_id, city, state, country) VALUES (?, ?, ?, ?)',
                [alumni_id, city || null, state || null, country || null]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please wait for admin verification.',
            alumni_id: result.insertId
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login alumni or admin
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email, password, role } = req.body;

        let user, tableName, idField;

        // Determine if logging in as admin or alumni
        if (role === 'admin') {
            tableName = 'admin';
            idField = 'admin_id';
            const [admins] = await db.query(
                'SELECT admin_id, name, email, password_hash FROM admin WHERE email = ?',
                [email]
            );
            user = admins[0];
        } else {
            tableName = 'alumni';
            idField = 'alumni_id';
            const [alumni] = await db.query(
                'SELECT alumni_id, name, email, password_hash, verified FROM alumni WHERE email = ?',
                [email]
            );
            user = alumni[0];
        }

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create JWT payload
        const payload = {
            id: user[idField],
            email: user.email,
            name: user.name,
            role: role || 'alumni',
            verified: role === 'admin' ? true : user.verified
        };

        // Sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user[idField],
                name: user.name,
                email: user.email,
                role: payload.role,
                verified: payload.verified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token || 
                      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            user: decoded
        });

    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
});

module.exports = router;

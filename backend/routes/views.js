const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to check authentication for views
const checkAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};

// Home page
router.get('/', checkAuth, (req, res) => {
    res.render('layout', { user: req.user, page: 'index' });
});

// Login page
router.get('/login', checkAuth, (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('layout', { user: null, page: 'login' });
});

// Alumni directory page
router.get('/directory', checkAuth, (req, res) => {
    res.render('layout', { 
        user: req.user,
        page: 'directory'
    });
});

// Register page
router.get('/register', checkAuth, (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('layout', { user: null, page: 'register' });
});

// Dashboard
router.get('/dashboard', checkAuth, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'dashboard' });
});

// Profile
router.get('/profile', checkAuth, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'profile' });
});

// Jobs
router.get('/jobs', checkAuth, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'jobs' });
});

// Events
router.get('/events', checkAuth, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'events' });
});

// Mentorship
router.get('/mentorship', checkAuth, (req, res) => {
    if (!req.user || req.user.role !== 'alumni') {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'mentorship' });
});

// Messages
router.get('/messages', checkAuth, (req, res) => {
    if (!req.user || req.user.role !== 'alumni') {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'messages' });
});

// Admin Dashboard
router.get('/admin', checkAuth, (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.render('layout', { user: req.user, page: 'admin' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   GET /api/mentorship/mentors
// @desc    Search for potential mentors
// @access  Private (Verified Alumni only)
router.get('/mentors', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const { branch, field } = req.query;
        const current_alumni_id = req.user.id;

        let query = `
            SELECT a.alumni_id, a.name, a.email, a.branch, a.graduation_year,
                   a.company, a.field, l.city, l.country
            FROM alumni a
            LEFT JOIN alumni_location l ON a.alumni_id = l.alumni_id
            WHERE a.verified = TRUE AND a.alumni_id != ?
        `;
        const params = [current_alumni_id];

        if (branch) {
            query += ' AND a.branch = ?';
            params.push(branch);
        }
        if (field) {
            query += ' AND a.field = ?';
            params.push(field);
        }

        query += ' ORDER BY a.graduation_year ASC';

        const [mentors] = await db.query(query, params);

        res.json({
            success: true,
            count: mentors.length,
            mentors
        });

    } catch (error) {
        console.error('Get mentors error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/mentorship/request
// @desc    Request mentorship from an alumni
// @access  Private (Verified Alumni only)
router.post('/request', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const mentee_id = req.user.id;
        const { mentor_id } = req.body;

        if (!mentor_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mentor ID is required' 
            });
        }

        if (mentor_id === mentee_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot request mentorship from yourself' 
            });
        }

        // Check if mentor exists and is verified
        const [mentors] = await db.query(
            'SELECT alumni_id FROM alumni WHERE alumni_id = ? AND verified = TRUE',
            [mentor_id]
        );

        if (mentors.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Mentor not found or not verified' 
            });
        }

        // Check if request already exists
        const [existing] = await db.query(
            'SELECT mentorship_id FROM mentorship WHERE mentor_id = ? AND mentee_id = ?',
            [mentor_id, mentee_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mentorship request already exists' 
            });
        }

        // Create request
        const [result] = await db.query(
            'INSERT INTO mentorship (mentor_id, mentee_id) VALUES (?, ?)',
            [mentor_id, mentee_id]
        );

        res.status(201).json({
            success: true,
            message: 'Mentorship request sent successfully',
            mentorship_id: result.insertId
        });

    } catch (error) {
        console.error('Request mentorship error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/mentorship/requests/received
// @desc    Get mentorship requests received (as mentor)
// @access  Private (Verified Alumni only)
router.get('/requests/received', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT m.mentorship_id, m.status, m.requested_at,
                   a.alumni_id as mentee_id, a.name as mentee_name, 
                   a.email as mentee_email, a.branch, a.graduation_year, a.company,
                   ac.phone as mentee_phone
            FROM mentorship m
            JOIN alumni a ON m.mentee_id = a.alumni_id
            LEFT JOIN alumni_contact ac ON a.alumni_id = ac.alumni_id
            WHERE m.mentor_id = ?
            ORDER BY m.requested_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('Get received requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/mentorship/requests/sent
// @desc    Get mentorship requests sent (as mentee)
// @access  Private (Verified Alumni only)
router.get('/requests/sent', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const [requests] = await db.query(`
            SELECT m.mentorship_id, m.status, m.requested_at,
                   a.alumni_id as mentor_id, a.name as mentor_name, 
                   a.email as mentor_email, a.branch, a.graduation_year, a.company, a.field,
                   ac.phone as mentor_phone
            FROM mentorship m
            JOIN alumni a ON m.mentor_id = a.alumni_id
            LEFT JOIN alumni_contact ac ON a.alumni_id = ac.alumni_id
            WHERE m.mentee_id = ?
            ORDER BY m.requested_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/mentorship/:id/respond
// @desc    Accept or reject mentorship request
// @access  Private (Mentor only)
router.put('/:id/respond', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const mentorship_id = req.params.id;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status. Must be "accepted" or "rejected"' 
            });
        }

        // Check if user is the mentor for this request
        const [requests] = await db.query(
            'SELECT mentor_id FROM mentorship WHERE mentorship_id = ?',
            [mentorship_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Mentorship request not found' 
            });
        }

        if (requests[0].mentor_id !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to respond to this request' 
            });
        }

        // Update status
        await db.query(
            'UPDATE mentorship SET status = ? WHERE mentorship_id = ?',
            [status, mentorship_id]
        );

        res.json({
            success: true,
            message: `Mentorship request ${status}`
        });

    } catch (error) {
        console.error('Respond to mentorship error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;

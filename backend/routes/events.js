const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT e.*, 
                   COUNT(ep.alumni_id) as participants_count,
                   ad.name as created_by_name
            FROM event e
            LEFT JOIN event_participation ep ON e.event_id = ep.event_id
            LEFT JOIN admin ad ON e.created_by = ad.admin_id
            GROUP BY e.event_id
            ORDER BY e.event_date DESC
        `);

        res.json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get event by ID with participants
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT e.*, 
                   ad.name as created_by_name
            FROM event e
            LEFT JOIN admin ad ON e.created_by = ad.admin_id
            WHERE e.event_id = ?
        `, [req.params.id]);

        if (events.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Get participants
        const [participants] = await db.query(`
            SELECT al.alumni_id, al.name, al.branch, al.graduation_year, ep.registered_at
            FROM event_participation ep
            JOIN alumni al ON ep.alumni_id = al.alumni_id
            WHERE ep.event_id = ?
            ORDER BY ep.registered_at DESC
        `, [req.params.id]);

        res.json({
            success: true,
            event: events[0],
            participants
        });

    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event (RSVP)
// @access  Private (Verified Alumni only)
router.post('/:id/register', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const event_id = req.params.id;
        const alumni_id = req.user.id;

        // Check if event exists
        const [events] = await db.query('SELECT event_id FROM event WHERE event_id = ?', [event_id]);
        if (events.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        // Check if already registered
        const [existing] = await db.query(
            'SELECT participation_id FROM event_participation WHERE event_id = ? AND alumni_id = ?',
            [event_id, alumni_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already registered for this event' 
            });
        }

        // Register
        await db.query(
            'INSERT INTO event_participation (event_id, alumni_id) VALUES (?, ?)',
            [event_id, alumni_id]
        );

        res.json({
            success: true,
            message: 'Successfully registered for event'
        });

    } catch (error) {
        console.error('Event registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister from an event
// @access  Private (Alumni only)
router.delete('/:id/register', verifyToken, isAlumni, async (req, res) => {
    try {
        const event_id = req.params.id;
        const alumni_id = req.user.id;

        const [result] = await db.query(
            'DELETE FROM event_participation WHERE event_id = ? AND alumni_id = ?',
            [event_id, alumni_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Registration not found' 
            });
        }

        res.json({
            success: true,
            message: 'Successfully unregistered from event'
        });

    } catch (error) {
        console.error('Event unregistration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/events/my/registrations
// @desc    Get alumni's registered events
// @access  Private (Alumni only)
router.get('/my/registrations', verifyToken, isAlumni, async (req, res) => {
    try {
        const [events] = await db.query(`
            SELECT e.*, ep.registered_at
            FROM event e
            JOIN event_participation ep ON e.event_id = ep.event_id
            WHERE ep.alumni_id = ?
            ORDER BY e.event_date DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/events
// @desc    Create new event (Alumni can create events)
// @access  Private (Verified Alumni only)
router.post('/', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const { name, description, event_date, location } = req.body;

        if (!name || !event_date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and event date are required' 
            });
        }

        const [result] = await db.query(
            `INSERT INTO event (name, description, event_date, location, created_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, description, event_date, location, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event_id: result.insertId
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/events/:id/participants
// @desc    Get list of participants for an event
// @access  Private
router.get('/:id/participants', verifyToken, async (req, res) => {
    try {
        const [participants] = await db.query(`
            SELECT al.alumni_id, al.name, al.email, al.branch, al.graduation_year, 
                   al.company, ep.registered_at,
                   ac.phone
            FROM event_participation ep
            JOIN alumni al ON ep.alumni_id = al.alumni_id
            LEFT JOIN alumni_contact ac ON al.alumni_id = ac.alumni_id
            WHERE ep.event_id = ?
            ORDER BY ep.registered_at DESC
        `, [req.params.id]);

        res.json({
            success: true,
            count: participants.length,
            participants
        });

    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;

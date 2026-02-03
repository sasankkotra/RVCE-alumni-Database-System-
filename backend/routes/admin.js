const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
    try {
        // Total alumni count
        const [totalAlumni] = await db.query('SELECT COUNT(*) as count FROM alumni');
        
        // Verified alumni count
        const [verifiedAlumni] = await db.query('SELECT COUNT(*) as count FROM alumni WHERE verified = TRUE');
        
        // Pending verifications
        const [pendingVerifications] = await db.query('SELECT COUNT(*) as count FROM alumni WHERE verified = FALSE');
        
        // Active jobs count
        const [activeJobs] = await db.query('SELECT COUNT(*) as count FROM job_posting WHERE status = "active"');
        
        // Total events count
        const [totalEvents] = await db.query('SELECT COUNT(*) as count FROM event');
        
        // Upcoming events
        const [upcomingEvents] = await db.query('SELECT COUNT(*) as count FROM event WHERE event_date >= CURDATE()');
        
        // Alumni by branch
        const [alumniByBranch] = await db.query(`
            SELECT branch, COUNT(*) as count 
            FROM alumni 
            WHERE verified = TRUE 
            GROUP BY branch 
            ORDER BY count DESC
        `);
        
        // Alumni by graduation year (last 10 years)
        const [alumniByYear] = await db.query(`
            SELECT graduation_year, COUNT(*) as count 
            FROM alumni 
            WHERE verified = TRUE AND graduation_year >= YEAR(CURDATE()) - 10
            GROUP BY graduation_year 
            ORDER BY graduation_year DESC
        `);

        // Recent registrations
        const [recentRegistrations] = await db.query(`
            SELECT alumni_id, name, email, branch, graduation_year, verified, created_at
            FROM alumni
            ORDER BY created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            stats: {
                total_alumni: totalAlumni[0].count,
                verified_alumni: verifiedAlumni[0].count,
                pending_verifications: pendingVerifications[0].count,
                active_jobs: activeJobs[0].count,
                total_events: totalEvents[0].count,
                upcoming_events: upcomingEvents[0].count
            },
            alumni_by_branch: alumniByBranch,
            alumni_by_year: alumniByYear,
            recent_registrations: recentRegistrations
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/admin/alumni
// @desc    Get all alumni with filters
// @access  Private (Admin only)
router.get('/alumni', async (req, res) => {
    try {
        const { verified, branch, graduation_year } = req.query;
        
        let query = `
            SELECT a.alumni_id, a.name, a.email, a.branch, a.graduation_year,
                   a.company, a.field, a.verified, a.created_at,
                   l.city, l.country
            FROM alumni a
            LEFT JOIN alumni_location l ON a.alumni_id = l.alumni_id
            WHERE 1=1
        `;
        const params = [];

        if (verified !== undefined) {
            query += ' AND a.verified = ?';
            params.push(verified === 'true' ? 1 : 0);
        }
        if (branch) {
            query += ' AND a.branch = ?';
            params.push(branch);
        }
        if (graduation_year) {
            query += ' AND a.graduation_year = ?';
            params.push(graduation_year);
        }

        query += ' ORDER BY a.created_at DESC';

        const [alumni] = await db.query(query, params);

        res.json({
            success: true,
            count: alumni.length,
            alumni
        });

    } catch (error) {
        console.error('Get alumni error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/admin/alumni/:id/verify
// @desc    Verify or unverify an alumni
// @access  Private (Admin only)
router.put('/alumni/:id/verify', async (req, res) => {
    try {
        const alumni_id = req.params.id;
        const { verified } = req.body;

        if (verified === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Verified status is required' 
            });
        }

        const [result] = await db.query(
            'UPDATE alumni SET verified = ? WHERE alumni_id = ?',
            [verified ? 1 : 0, alumni_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Alumni not found' 
            });
        }

        res.json({
            success: true,
            message: `Alumni ${verified ? 'verified' : 'unverified'} successfully`
        });

    } catch (error) {
        console.error('Verify alumni error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/admin/alumni/:id
// @desc    Delete an alumni account
// @access  Private (Admin only)
router.delete('/alumni/:id', async (req, res) => {
    try {
        const alumni_id = req.params.id;

        const [result] = await db.query('DELETE FROM alumni WHERE alumni_id = ?', [alumni_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Alumni not found' 
            });
        }

        res.json({
            success: true,
            message: 'Alumni deleted successfully'
        });

    } catch (error) {
        console.error('Delete alumni error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/admin/events
// @desc    Create new event
// @access  Private (Admin only)
router.post('/events', async (req, res) => {
    try {
        const { name, description, event_date, location } = req.body;
        const created_by = req.user.id;

        if (!name || !event_date || !location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, event date, and location are required' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO event (name, description, event_date, location, created_by) VALUES (?, ?, ?, ?, ?)',
            [name, description, event_date, location, created_by]
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

// @route   PUT /api/admin/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/events/:id', async (req, res) => {
    try {
        const event_id = req.params.id;
        const { name, description, event_date, location } = req.body;

        const [result] = await db.query(
            'UPDATE event SET name = ?, description = ?, event_date = ?, location = ? WHERE event_id = ?',
            [name, description, event_date, location, event_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully'
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/admin/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/events/:id', async (req, res) => {
    try {
        const event_id = req.params.id;

        const [result] = await db.query('DELETE FROM event WHERE event_id = ?', [event_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs (including closed)
// @access  Private (Admin only)
router.get('/jobs', async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, a.name as posted_by_name, a.email as posted_by_email
            FROM job_posting j
            JOIN alumni a ON j.posted_by = a.alumni_id
            ORDER BY j.created_at DESC
        `);

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        console.error('Get all jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete job posting
// @access  Private (Admin only)
router.delete('/jobs/:id', async (req, res) => {
    try {
        const job_id = req.params.id;

        const [result] = await db.query('DELETE FROM job_posting WHERE job_id = ?', [job_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/admin/reports/queries
// @desc    Run useful database queries for reports
// @access  Private (Admin only)
router.get('/reports/queries', async (req, res) => {
    try {
        // Query 1: Alumni count by branch
        const [alumniByBranch] = await db.query(`
            SELECT branch, COUNT(*) as count 
            FROM alumni 
            WHERE verified = TRUE 
            GROUP BY branch
        `);

        // Query 2: Active job postings with details
        const [activeJobs] = await db.query(`
            SELECT j.job_id, j.title, j.company, j.location, a.name as posted_by
            FROM job_posting j 
            JOIN alumni a ON j.posted_by = a.alumni_id 
            WHERE j.status = 'active'
        `);

        // Query 3: Upcoming events with participation
        const [upcomingEvents] = await db.query(`
            SELECT e.event_id, e.name, e.event_date, COUNT(ep.alumni_id) as participants
            FROM event e 
            LEFT JOIN event_participation ep ON e.event_id = ep.event_id
            WHERE e.event_date >= CURDATE() 
            GROUP BY e.event_id
        `);

        // Query 4: Mentorship statistics
        const [mentorshipStats] = await db.query(`
            SELECT status, COUNT(*) as count 
            FROM mentorship 
            GROUP BY status
        `);

        // Query 5: Top companies by alumni count
        const [topCompanies] = await db.query(`
            SELECT company, COUNT(*) as count 
            FROM alumni 
            WHERE verified = TRUE AND company IS NOT NULL 
            GROUP BY company 
            ORDER BY count DESC 
            LIMIT 10
        `);

        res.json({
            success: true,
            reports: {
                alumni_by_branch: alumniByBranch,
                active_jobs: activeJobs,
                upcoming_events: upcomingEvents,
                mentorship_stats: mentorshipStats,
                top_companies: topCompanies
            }
        });

    } catch (error) {
        console.error('Reports queries error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;

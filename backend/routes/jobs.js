const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all active jobs with filters
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const { branch, field, company, location, status } = req.query;
        
        let query = `
            SELECT j.job_id, j.title, j.company, j.location, j.description,
                   j.required_branch, j.required_field, j.status, j.created_at,
                   a.name as posted_by_name, a.alumni_id as posted_by_id, a.email as poster_email
            FROM job_posting j
            JOIN alumni a ON j.posted_by = a.alumni_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND j.status = ?';
            params.push(status);
        } else {
            query += ' AND j.status = "active"';
        }

        if (branch) {
            query += ' AND (j.required_branch LIKE ? OR j.required_branch IS NULL)';
            params.push(`%${branch}%`);
        }
        if (field) {
            query += ' AND (j.required_field LIKE ? OR j.required_field IS NULL)';
            params.push(`%${field}%`);
        }
        if (company) {
            query += ' AND j.company LIKE ?';
            params.push(`%${company}%`);
        }
        if (location) {
            query += ' AND j.location LIKE ?';
            params.push(`%${location}%`);
        }

        query += ' ORDER BY j.created_at DESC';

        const [jobs] = await db.query(query, params);

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT j.*, a.name as posted_by_name, a.email as posted_by_email
            FROM job_posting j
            JOIN alumni a ON j.posted_by = a.alumni_id
            WHERE j.job_id = ?
        `, [req.params.id]);

        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }

        res.json({
            success: true,
            job: jobs[0]
        });

    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private (Verified Alumni only)
router.post('/', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const { title, company, location, description, required_branch, required_field } = req.body;
        const posted_by = req.user.id;

        if (!title || !company || !location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title, company, and location are required' 
            });
        }

        const [result] = await db.query(`
            INSERT INTO job_posting (posted_by, title, company, location, description, required_branch, required_field)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [posted_by, title, company, location, description, required_branch, required_field]);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job_id: result.insertId
        });

    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Owner or Admin)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const job_id = req.params.id;
        const { title, company, location, description, required_branch, required_field, status } = req.body;

        // Check if user owns this job or is admin
        const [jobs] = await db.query('SELECT posted_by FROM job_posting WHERE job_id = ?', [job_id]);
        
        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }

        if (req.user.role !== 'admin' && jobs[0].posted_by !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this job' 
            });
        }

        await db.query(`
            UPDATE job_posting 
            SET title = ?, company = ?, location = ?, description = ?, 
                required_branch = ?, required_field = ?, status = ?
            WHERE job_id = ?
        `, [title, company, location, description, required_branch, required_field, status, job_id]);

        res.json({
            success: true,
            message: 'Job updated successfully'
        });

    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Owner or Admin)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const job_id = req.params.id;

        // Check if user owns this job or is admin
        const [jobs] = await db.query('SELECT posted_by FROM job_posting WHERE job_id = ?', [job_id]);
        
        if (jobs.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found' 
            });
        }

        if (req.user.role !== 'admin' && jobs[0].posted_by !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this job' 
            });
        }

        await db.query('DELETE FROM job_posting WHERE job_id = ?', [job_id]);

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

module.exports = router;

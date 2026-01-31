const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   POST /api/alumni/ai-search
// @desc    AI-powered semantic search for alumni
// @access  Public
router.post('/ai-search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }
        
        // Get all verified alumni with their details
        const [allAlumni] = await db.query(`
            SELECT 
                a.alumni_id,
                a.name,
                a.branch,
                a.graduation_year,
                a.company,
                a.field,
                a.verified,
                al.city,
                al.state,
                al.country
            FROM alumni a
            LEFT JOIN alumni_location al ON a.alumni_id = al.alumni_id
            WHERE a.verified = TRUE
            ORDER BY a.graduation_year DESC, a.name ASC
        `);
        
        // Use Google's Gemini API for semantic search
        const fetch = (await import('node-fetch')).default;
        const aiApiKey = process.env.GOOGLE_AI_API_KEY;
        
        if (!aiApiKey) {
            // Fallback to simple text search if API key not configured
            const filtered = allAlumni.filter(alumnus => {
                const searchFields = [
                    alumnus.name,
                    alumnus.field,
                    alumnus.company,
                    alumnus.branch,
                    alumnus.city,
                    alumnus.state,
                    alumnus.country
                ].filter(Boolean).join(' ').toLowerCase();
                
                return searchFields.includes(query.toLowerCase());
            });
            
            return res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false
            });
        }
        
        // Create a prompt for the AI to understand the query and match alumni
        const alumniDescriptions = allAlumni.map((alumnus, idx) => {
            return `${idx}. ${alumnus.name} - ${alumnus.field || 'N/A'} at ${alumnus.company || 'N/A'}, ${alumnus.branch} graduate from ${alumnus.graduation_year}, located in ${alumnus.city || 'Unknown'}`;
        }).join('\n');
        
        const prompt = `Given the user search query: "${query}"

Here are the alumni profiles:
${alumniDescriptions}

Task: Identify which alumni are most relevant to the search query. The query might be vague like "chip design", "construction", "AI", "machine learning", "web development", "hardware", etc.

Match based on:
- Their field of work/specialization
- Their company (if it's related to the query)
- Their branch (CSE for software, ECE for electronics, ME for mechanical, CV for construction, etc.)

Return ONLY a JSON array of the indices (numbers before each name) of the top 10 most relevant alumni, ordered by relevance. If fewer than 10 are relevant, return only those that match.

Example format: [0, 3, 7, 12]

If no alumni match the query well, return an empty array: []`;

        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );
        
        const aiData = await aiResponse.json();
        
        console.log('AI Response:', JSON.stringify(aiData, null, 2));
        
        if (!aiData.candidates || !aiData.candidates[0] || !aiData.candidates[0].content) {
            console.log('No valid AI response, falling back to simple search');
            throw new Error('Invalid AI response');
        }
        
        const aiText = aiData.candidates[0].content.parts[0].text;
        console.log('AI Text:', aiText);
        
        // Extract JSON array from AI response
        const jsonMatch = aiText.match(/\[[\d,\s]*\]/);
        if (!jsonMatch) {
            console.log('No JSON match found, falling back to simple search');
            // Fallback to simple search
            const filtered = allAlumni.filter(alumnus => {
                const searchFields = [
                    alumnus.name,
                    alumnus.field,
                    alumnus.company,
                    alumnus.branch,
                    alumnus.city,
                    alumnus.state
                ].filter(Boolean).join(' ').toLowerCase();
                
                const queryLower = query.toLowerCase();
                
                // Match query words
                return searchFields.includes(queryLower) || 
                       queryLower.split(' ').some(word => searchFields.includes(word));
            });
            
            return res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false
            });
        }
        
        const relevantIndices = JSON.parse(jsonMatch[0]);
        const relevantAlumni = relevantIndices
            .filter(idx => idx >= 0 && idx < allAlumni.length)
            .map(idx => allAlumni[idx]);
        
        res.json({
            success: true,
            count: relevantAlumni.length,
            data: relevantAlumni,
            aiPowered: true,
            query: query
        });
        
    } catch (error) {
        console.error('AI search error:', error);
        
        // Fallback to simple search on error
        try {
            const { query } = req.body;
            const [allAlumni] = await db.query(`
                SELECT 
                    a.alumni_id,
                    a.name,
                    a.branch,
                    a.graduation_year,
                    a.company,
                    a.field,
                    a.verified,
                    al.city,
                    al.state,
                    al.country
                FROM alumni a
                LEFT JOIN alumni_location al ON a.alumni_id = al.alumni_id
                WHERE a.verified = TRUE
                ORDER BY a.graduation_year DESC, a.name ASC
            `);
            
            const filtered = allAlumni.filter(alumnus => {
                const searchFields = [
                    alumnus.name,
                    alumnus.field,
                    alumnus.company,
                    alumnus.branch,
                    alumnus.city,
                    alumnus.state
                ].filter(Boolean).join(' ').toLowerCase();
                
                const queryLower = query.toLowerCase();
                
                // Match query words
                return searchFields.includes(queryLower) || 
                       queryLower.split(' ').some(word => searchFields.includes(word));
            });
            
            res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false
            });
        } catch (fallbackError) {
            res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
    }
});

// @route   GET /api/alumni/public
// @desc    Get all alumni (public info only - no email/phone)
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const { branch, field, city, graduation_year } = req.query;
        
        let query = `
            SELECT 
                a.alumni_id,
                a.name,
                a.branch,
                a.graduation_year,
                a.company,
                a.field,
                a.verified,
                al.city,
                al.state,
                al.country
            FROM alumni a
            LEFT JOIN alumni_location al ON a.alumni_id = al.alumni_id
            WHERE a.verified = TRUE
        `;
        
        const params = [];
        
        if (branch) {
            query += ' AND a.branch = ?';
            params.push(branch);
        }
        if (field) {
            query += ' AND a.field LIKE ?';
            params.push(`%${field}%`);
        }
        if (city) {
            query += ' AND al.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (graduation_year) {
            query += ' AND a.graduation_year = ?';
            params.push(graduation_year);
        }
        
        query += ' ORDER BY a.graduation_year DESC, a.name ASC';
        
        const [alumni] = await db.query(query, params);
        
        res.json({
            success: true,
            count: alumni.length,
            data: alumni
        });
    } catch (error) {
        console.error('Get public alumni error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/alumni/profile/:id
// @desc    Get alumni profile by ID (with contact info if mentorship exists)
// @access  Private
router.get('/profile/:id', verifyToken, async (req, res) => {
    try {
        const alumni_id = req.params.id;

        const [alumni] = await db.query(`
            SELECT a.alumni_id, a.name, a.email, a.branch, a.graduation_year, 
                   a.company, a.field, a.verified, a.created_at,
                   c.phone, c.linkedin_url, c.github_url,
                   l.city, l.state, l.country
            FROM alumni a
            LEFT JOIN alumni_contact c ON a.alumni_id = c.alumni_id
            LEFT JOIN alumni_location l ON a.alumni_id = l.alumni_id
            WHERE a.alumni_id = ?
        `, [alumni_id]);

        if (alumni.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Alumni not found' 
            });
        }

        res.json({
            success: true,
            alumni: alumni[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/alumni/profile
// @desc    Update alumni profile
// @access  Private (Alumni only)
router.put('/profile', verifyToken, isAlumni, async (req, res) => {
    try {
        const alumni_id = req.user.id;
        const { name, company, field, phone, linkedin_url, github_url, city, state, country } = req.body;

        // Update alumni basic info
        await db.query(`
            UPDATE alumni 
            SET name = ?, company = ?, field = ?
            WHERE alumni_id = ?
        `, [name, company, field, alumni_id]);

        // Update or insert contact info
        const [existingContact] = await db.query(
            'SELECT contact_id FROM alumni_contact WHERE alumni_id = ?',
            [alumni_id]
        );

        if (existingContact.length > 0) {
            await db.query(`
                UPDATE alumni_contact 
                SET phone = ?, linkedin_url = ?, github_url = ?
                WHERE alumni_id = ?
            `, [phone, linkedin_url, github_url, alumni_id]);
        } else {
            await db.query(`
                INSERT INTO alumni_contact (alumni_id, phone, linkedin_url, github_url)
                VALUES (?, ?, ?, ?)
            `, [alumni_id, phone, linkedin_url, github_url]);
        }

        // Update or insert location info
        const [existingLocation] = await db.query(
            'SELECT location_id FROM alumni_location WHERE alumni_id = ?',
            [alumni_id]
        );

        if (existingLocation.length > 0) {
            await db.query(`
                UPDATE alumni_location 
                SET city = ?, state = ?, country = ?
                WHERE alumni_id = ?
            `, [city, state, country, alumni_id]);
        } else {
            await db.query(`
                INSERT INTO alumni_location (alumni_id, city, state, country)
                VALUES (?, ?, ?, ?)
            `, [alumni_id, city, state, country]);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/alumni/search
// @desc    Search alumni by filters
// @access  Private
router.get('/search', verifyToken, async (req, res) => {
    try {
        const { branch, field, city, graduation_year } = req.query;
        
        let query = `
            SELECT a.alumni_id, a.name, a.email, a.branch, a.graduation_year, 
                   a.company, a.field, l.city, l.country
            FROM alumni a
            LEFT JOIN alumni_location l ON a.alumni_id = l.alumni_id
            WHERE a.verified = TRUE
        `;
        const params = [];

        if (branch) {
            query += ' AND a.branch = ?';
            params.push(branch);
        }
        if (field) {
            query += ' AND a.field = ?';
            params.push(field);
        }
        if (city) {
            query += ' AND l.city = ?';
            params.push(city);
        }
        if (graduation_year) {
            query += ' AND a.graduation_year = ?';
            params.push(graduation_year);
        }

        query += ' ORDER BY a.name';

        const [alumni] = await db.query(query, params);

        res.json({
            success: true,
            count: alumni.length,
            alumni
        });

    } catch (error) {
        console.error('Search alumni error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;

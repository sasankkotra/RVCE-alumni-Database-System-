const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   POST /api/alumni/ai-search
// @desc    AI-powered semantic search with fuzzy matching and domain understanding
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
            // Enhanced fallback with fuzzy matching
            const filtered = fuzzySemanticSearch(allAlumni, query);
            
            return res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false,
                fuzzyMatch: true
            });
        }
        
        // Create a more comprehensive prompt for better semantic understanding
        const alumniDescriptions = allAlumni.map((alumnus, idx) => {
            return `${idx}. ${alumnus.name} - ${alumnus.field || 'N/A'} at ${alumnus.company || 'N/A'}, ${alumnus.branch} branch, ${alumnus.graduation_year} grad, ${alumnus.city || 'Location N/A'}`;
        }).join('\n');
        
        const prompt = `You are an intelligent career matcher helping to find relevant professionals based on a user's search query.

User Query: "${query}"

Alumni Database:
${alumniDescriptions}

IMPORTANT INSTRUCTIONS:
1. UNDERSTAND SEMANTIC MEANING: If user searches for "IC design", "chip design", or "VLSI", match with Electronics (ECE), VLSI, Embedded Systems, Semiconductor, Hardware Engineering
2. HANDLE SPELLING MISTAKES: Ignore typos and match phonetically similar terms (e.g., "softwere" → "software", "elektronics" → "electronics", "machne lerning" → "machine learning")
3. DOMAIN KNOWLEDGE:
   - Software/Tech: CSE, IT, Software Engineer, Developer, Full Stack, Backend, Frontend, SDE, Programming, Coding, Web Development
   - Hardware/Electronics: ECE, EEE, VLSI, IC Design, Chip Design, Embedded, Hardware, Semiconductor, Circuit, Electronics, Digital Design, Analog Design
   - AI/ML/Data: Machine Learning, Deep Learning, AI, Data Science, NLP, Computer Vision, Neural Networks, Analytics
   - Mechanical: ME, Mechanical Engineer, Manufacturing, CAD, Design, Automotive, Robotics, Mechatronics
   - Civil: CV, CE, Civil Engineer, Construction, Structural, Architecture, Building
   - Finance: Banking, Investment, Trading, Financial Analyst, Fintech
   - Consulting: Management Consultant, Strategy, Business Analyst
   
4. MATCH CRITERIA (in order of importance):
   a) Field of work/specialization (most important)
   b) Branch of study (strong indicator)
   c) Company name (if related to industry)
   d) Job title synonyms and variations
   
5. BE FLEXIBLE: Include related fields even if not exact match
6. RANKING: Order by relevance score (highest to lowest)
7. RETURN TOP 15-20 matches if available

OUTPUT FORMAT:
Return ONLY a JSON array of indices, ordered by relevance.
Example: [5, 12, 3, 18, 7]
If no relevant matches: []`;

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
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            }
        );
        
        const aiData = await aiResponse.json();
        
        console.log('AI Response:', JSON.stringify(aiData, null, 2));
        
        if (!aiData.candidates || !aiData.candidates[0] || !aiData.candidates[0].content) {
            console.log('No valid AI response, falling back to enhanced fuzzy search');
            throw new Error('Invalid AI response');
        }
        
        const aiText = aiData.candidates[0].content.parts[0].text;
        console.log('AI Text:', aiText);
        
        // Extract JSON array from AI response (more flexible matching)
        const jsonMatch = aiText.match(/\[[\d,\s]*\]/);
        if (!jsonMatch) {
            console.log('No JSON match found, falling back to enhanced fuzzy search');
            // Enhanced fallback with fuzzy matching
            const filtered = fuzzySemanticSearch(allAlumni, query);
            
            return res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false,
                fuzzyMatch: true
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
        
        // Enhanced fallback with fuzzy matching
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
            
            const filtered = fuzzySemanticSearch(allAlumni, query);
            
            res.json({
                success: true,
                count: filtered.length,
                data: filtered,
                aiPowered: false,
                fuzzyMatch: true
            });
        } catch (fallbackError) {
            res.status(500).json({ 
                success: false, 
                message: 'Server error' 
            });
        }
    }
});

// Helper function for fuzzy semantic search with domain knowledge
function fuzzySemanticSearch(alumni, query) {
    const queryLower = query.toLowerCase().trim();
    
    // Domain knowledge mapping for semantic understanding (EXPANDED)
    const domainMappings = {
        // Hardware/Electronics/VLSI
        'ic': ['vlsi', 'chip', 'semiconductor', 'ece', 'eee', 'electronics', 'hardware', 'asic', 'fpga', 'digital', 'analog', 'circuit design'],
        'ic design': ['vlsi', 'ic', 'chip', 'semiconductor', 'ece', 'eee', 'electronics', 'hardware', 'asic', 'fpga', 'digital design', 'analog', 'circuit'],
        'chip design': ['vlsi', 'ic', 'chip', 'semiconductor', 'ece', 'eee', 'electronics', 'hardware', 'asic', 'fpga'],
        'chip': ['vlsi', 'ic', 'semiconductor', 'ece', 'eee', 'electronics', 'hardware', 'asic', 'fpga'],
        'vlsi': ['ic design', 'chip', 'semiconductor', 'ece', 'eee', 'electronics', 'hardware', 'asic', 'fpga', 'digital'],
        'hardware': ['electronics', 'ece', 'eee', 'vlsi', 'embedded', 'chip', 'circuit', 'semiconductor', 'ic'],
        'electronics': ['ece', 'eee', 'vlsi', 'hardware', 'embedded', 'chip', 'circuit', 'semiconductor', 'ic'],
        'embedded': ['hardware', 'ece', 'electronics', 'firmware', 'iot', 'microcontroller', 'embedded systems'],
        'semiconductor': ['vlsi', 'ic', 'chip', 'hardware', 'ece', 'eee', 'electronics'],
        'ece': ['electronics', 'vlsi', 'hardware', 'ic', 'chip', 'embedded', 'semiconductor'],
        'eee': ['electronics', 'electrical', 'vlsi', 'hardware', 'ic', 'power'],
        
        // Software/Programming (EXPANDED)
        'software': ['developer', 'sde', 'engineer', 'programming', 'cse', 'it', 'coding', 'full stack', 'backend', 'frontend', 'web', 'app'],
        'developer': ['software', 'sde', 'engineer', 'programming', 'cse', 'coding', 'web', 'app', 'full stack'],
        'programming': ['software', 'developer', 'coding', 'engineer', 'cse', 'it'],
        'coding': ['programming', 'software', 'developer', 'engineer', 'cse'],
        'web development': ['frontend', 'backend', 'full stack', 'react', 'node', 'javascript', 'developer', 'web'],
        'web': ['frontend', 'backend', 'full stack', 'developer', 'javascript', 'react', 'node'],
        'full stack': ['developer', 'web', 'frontend', 'backend', 'software'],
        'backend': ['server', 'api', 'database', 'node', 'python', 'java', 'developer', 'full stack'],
        'frontend': ['react', 'angular', 'vue', 'javascript', 'ui', 'web', 'developer', 'full stack'],
        'cse': ['software', 'developer', 'programming', 'computer science', 'coding', 'web', 'app'],
        'it': ['software', 'developer', 'programming', 'information technology', 'cse'],
        
        // AI/ML/Data (EXPANDED)
        'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural', 'data science', 'nlp', 'computer vision', 'data', 'analytics'],
        'artificial intelligence': ['ai', 'machine learning', 'ml', 'deep learning', 'neural', 'data science'],
        'machine learning': ['ml', 'ai', 'deep learning', 'data science', 'analytics', 'neural', 'artificial intelligence'],
        'ml': ['machine learning', 'ai', 'deep learning', 'data science', 'analytics', 'neural'],
        'deep learning': ['ml', 'ai', 'machine learning', 'neural', 'data science'],
        'data science': ['ml', 'ai', 'analytics', 'data analyst', 'big data', 'statistics', 'data', 'machine learning'],
        'data': ['data science', 'data analyst', 'analytics', 'ml', 'ai', 'big data', 'data engineer'],
        'analytics': ['data science', 'data analyst', 'ml', 'ai', 'business intelligence', 'data'],
        'nlp': ['natural language', 'ai', 'ml', 'text', 'linguistics', 'machine learning'],
        'computer vision': ['ai', 'ml', 'image', 'deep learning', 'vision'],
        
        // Mechanical (EXPANDED)
        'mechanical': ['me', 'manufacturing', 'cad', 'design', 'automotive', 'robotics', 'mech'],
        'me': ['mechanical', 'manufacturing', 'automotive', 'design', 'robotics'],
        'mech': ['mechanical', 'me', 'manufacturing', 'design'],
        'automotive': ['mechanical', 'vehicle', 'car', 'me', 'design', 'automobile'],
        'robotics': ['mechanical', 'automation', 'control', 'me', 'robot'],
        'manufacturing': ['mechanical', 'me', 'production', 'industrial'],
        
        // Civil/Construction (EXPANDED)
        'civil': ['cv', 'ce', 'construction', 'structural', 'building', 'architecture'],
        'cv': ['civil', 'construction', 'structural', 'building'],
        'ce': ['civil', 'construction', 'structural'],
        'construction': ['civil', 'cv', 'building', 'structural', 'contractor', 'architecture'],
        'building': ['civil', 'construction', 'architecture', 'structural'],
        'structural': ['civil', 'construction', 'building', 'cv'],
        
        // Finance (EXPANDED)
        'finance': ['banking', 'investment', 'trading', 'financial', 'fintech', 'bank', 'analyst'],
        'banking': ['finance', 'financial', 'investment', 'bank', 'fintech'],
        'bank': ['banking', 'finance', 'financial', 'investment'],
        'fintech': ['finance', 'banking', 'financial', 'technology'],
        'investment': ['finance', 'banking', 'trading', 'analyst'],
        
        // Consulting (EXPANDED)
        'consulting': ['consultant', 'strategy', 'management', 'business analyst', 'advisory'],
        'consultant': ['consulting', 'advisory', 'strategy', 'management'],
        'strategy': ['consulting', 'consultant', 'management', 'business'],
        
        // Additional broad terms
        'engineer': ['engineering', 'developer', 'software', 'hardware', 'mechanical', 'civil'],
        'engineering': ['engineer', 'developer', 'software', 'hardware', 'technical'],
        'tech': ['technology', 'software', 'it', 'developer', 'engineer'],
        'technology': ['tech', 'software', 'it', 'developer', 'engineering'],
    };
    
    // Extract all related keywords
    let searchKeywords = [queryLower];
    for (const [key, synonyms] of Object.entries(domainMappings)) {
        if (queryLower.includes(key) || key.includes(queryLower)) {
            searchKeywords.push(...synonyms);
            searchKeywords.push(key);
        }
    }
    
    // Also split query into words for partial matching
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1); // Changed from > 2 to > 1
    searchKeywords.push(...queryWords);
    
    // Remove duplicates
    searchKeywords = [...new Set(searchKeywords)];
    
    console.log('Search keywords:', searchKeywords);
    
    // Score each alumnus
    const scoredAlumni = alumni.map(alumnus => {
        const searchableText = [
            alumnus.name,
            alumnus.field,
            alumnus.company,
            alumnus.branch,
            alumnus.city,
            alumnus.state,
            alumnus.country
        ].filter(Boolean).join(' ').toLowerCase();
        
        let score = 0;
        
        // Exact phrase match (highest priority)
        if (searchableText.includes(queryLower)) {
            score += 100;
        }
        
        // Check each keyword with fuzzy matching
        for (const keyword of searchKeywords) {
            // Exact word match
            if (searchableText.includes(keyword)) {
                score += 10;
            }
            
            // Fuzzy match (Levenshtein distance for typos) - MORE AGGRESSIVE
            const words = searchableText.split(/\s+/);
            for (const word of words) {
                // Skip very short words for fuzzy matching
                if (word.length < 2 || keyword.length < 2) continue;
                
                const distance = levenshteinDistance(word, keyword);
                const maxLen = Math.max(word.length, keyword.length);
                const similarity = 1 - (distance / maxLen);
                
                // LOWERED threshold from 0.7 to 0.6 (60% similarity)
                if (similarity > 0.6) {
                    score += Math.floor(similarity * 8);
                }
                
                // Also check if one word contains the other (substring match)
                if (word.includes(keyword) || keyword.includes(word)) {
                    if (keyword.length >= 2) {
                        score += 5;
                    }
                }
            }
        }
        
        return { ...alumnus, score };
    });
    
    // Filter and sort by score - LOWERED minimum score threshold
    return scoredAlumni
        .filter(a => a.score > 0) // Accept ANY positive score
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...alumnus }) => alumnus); // Remove score from output
}

// Levenshtein distance for fuzzy string matching (handles typos)
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return matrix[len1][len2];
}

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

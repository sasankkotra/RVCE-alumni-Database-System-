const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, isAlumni, isVerified } = require('../middleware/auth');

// @route   GET /api/messages/inbox
// @desc    Get received messages
// @access  Private (Verified Alumni only)
router.get('/inbox', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT m.message_id, m.subject, m.body, m.read_status, m.sent_at,
                   a.alumni_id as sender_id, a.name as sender_name, a.email as sender_email
            FROM message m
            JOIN alumni a ON m.sender_id = a.alumni_id
            WHERE m.receiver_id = ?
            ORDER BY m.sent_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/messages/sent
// @desc    Get sent messages
// @access  Private (Verified Alumni only)
router.get('/sent', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT m.message_id, m.subject, m.body, m.read_status, m.sent_at,
                   a.alumni_id as receiver_id, a.name as receiver_name, a.email as receiver_email
            FROM message m
            JOIN alumni a ON m.receiver_id = a.alumni_id
            WHERE m.sender_id = ?
            ORDER BY m.sent_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        console.error('Get sent messages error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/messages/:id
// @desc    Get single message
// @access  Private
router.get('/:id', verifyToken, isAlumni, async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT m.*,
                   sender.name as sender_name, sender.email as sender_email,
                   receiver.name as receiver_name, receiver.email as receiver_email
            FROM message m
            JOIN alumni sender ON m.sender_id = sender.alumni_id
            JOIN alumni receiver ON m.receiver_id = receiver.alumni_id
            WHERE m.message_id = ?
        `, [req.params.id]);

        if (messages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }

        const message = messages[0];

        // Check if user is sender or receiver
        if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to view this message' 
            });
        }

        // Mark as read if receiver
        if (message.receiver_id === req.user.id && !message.read_status) {
            await db.query(
                'UPDATE message SET read_status = TRUE WHERE message_id = ?',
                [req.params.id]
            );
            message.read_status = true;
        }

        res.json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private (Verified Alumni only)
router.post('/', verifyToken, isAlumni, isVerified, async (req, res) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, subject, body } = req.body;

        if (!receiver_id || !subject || !body) {
            return res.status(400).json({ 
                success: false, 
                message: 'Receiver, subject, and body are required' 
            });
        }

        if (receiver_id === sender_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot send message to yourself' 
            });
        }

        // Check if receiver exists and is verified
        const [receivers] = await db.query(
            'SELECT alumni_id FROM alumni WHERE alumni_id = ? AND verified = TRUE',
            [receiver_id]
        );

        if (receivers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Receiver not found or not verified' 
            });
        }

        // Send message
        const [result] = await db.query(
            'INSERT INTO message (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, subject, body]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            message_id: result.insertId
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', verifyToken, isAlumni, async (req, res) => {
    try {
        const message_id = req.params.id;

        // Check if user is sender or receiver
        const [messages] = await db.query(
            'SELECT sender_id, receiver_id FROM message WHERE message_id = ?',
            [message_id]
        );

        if (messages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }

        if (messages[0].sender_id !== req.user.id && messages[0].receiver_id !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this message' 
            });
        }

        await db.query('DELETE FROM message WHERE message_id = ?', [message_id]);

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private (Alumni only)
router.get('/unread/count', verifyToken, isAlumni, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM message WHERE receiver_id = ? AND read_status = FALSE',
            [req.user.id]
        );

        res.json({
            success: true,
            unread_count: result[0].count
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;

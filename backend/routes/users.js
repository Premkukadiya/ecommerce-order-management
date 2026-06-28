// routes/users.js
// POST /users/register  → create new user
// POST /users/login     → login and get JWT token

const express       = require('express');
const router        = express.Router();
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const { mysqlPool } = require('../config/db');
require('dotenv').config();


// ─── POST /users/register ─────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Step 1: Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required'
            });
        }

        // Step 2: Check if email already exists
        const [existing] = await mysqlPool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Step 3: Hash the password (never store plain text passwords!)
        // bcrypt adds a "salt" — 10 rounds means it runs 2^10 = 1024 times
        // This makes brute force attacks very slow
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 4: Insert into MySQL
        const [result] = await mysqlPool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'customer')`,
            [name, email, hashedPassword]
        );

        // Step 5: Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }  // token expires in 7 days
        );

        res.status(201).json({
            success : true,
            message : 'User registered successfully',
            token,
            user: {
                user_id : result.insertId,
                name,
                email,
                role    : 'customer'
            }
        });

    } catch (error) {
        console.error('POST /users/register error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ─── POST /users/login ────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Step 2: Find user by email
        const [users] = await mysqlPool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Step 3: Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Step 4: Generate JWT token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success : true,
            message : 'Login successful',
            token,
            user: {
                user_id : user.user_id,
                name    : user.name,
                email   : user.email,
                role    : user.role
            }
        });

    } catch (error) {
        console.error('POST /users/login error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;

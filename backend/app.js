// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
require('dotenv').config();

const pool = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors()); app.use(helmet()); app.use(express.json());

// Rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: 'Too many requests' });

// Health-check
app.get('/', async (req, res) => {
  try {
    const now = await pool.query('SELECT NOW()');
    res.send(`🚀 OneSecurity API running. DB time: ${now.rows[0].now}`);
  } catch (err) {
    res.status(500).send('DB connection failed');
  }
});

// Auth routes (with rate limiter)
app.use('/api/auth', authLimiter, authRoutes);

// Protected credential routes
app.use('/api/credentials', authMiddleware, rateLimit({ windowMs:60*1000, max:60 }), credentialRoutes);

// Celebrate error handler
app.use(errors());

module.exports = app;
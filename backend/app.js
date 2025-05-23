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
const FRONTEND_ORIGIN = 'https://onesecurity.netlify.app';

// 1) CORS preflight handler for all routes
app.options('*', cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 3) Other hardening middlewares
app.use(helmet());
app.use(express.json());


// Health-check
app.get('/', async (req, res) => {
  try {
    const now = await pool.query('SELECT NOW()');
    res.send(`🚀 OneSecurity API running. DB time: ${now.rows[0].now}`);
  } catch (err) {
    res.status(500).send('DB connection failed');
  }
});
// Rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: 'Too many requests' });
// Auth routes (with rate limiter)
app.use('/api/auth', authLimiter, authRoutes);

// Protected credential routes
app.use('/api/credentials', authMiddleware, rateLimit({ windowMs:60*1000, max:60 }), credentialRoutes);

// Celebrate error handler
app.use(errors());

module.exports = app;
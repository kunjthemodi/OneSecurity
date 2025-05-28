// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const credentialRoutes = require('./routes/credentialRoutes'); 

const app = express();
const FRONTEND_ORIGIN = 'https://onesecurity.netlify.app';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,            // allow session cookies from browser to pass through
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);  

// … your 404 and error handlers …
// 4) (Optional) a simple root handler so GET / isn’t 404
app.get('/', (req, res) => res.send(`🎉 OneSecurity API is alive! `));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

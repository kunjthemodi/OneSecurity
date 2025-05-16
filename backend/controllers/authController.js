// backend/controllers/authController.js
const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Register new user
exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (userCheck.rows.length) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users(email, password, totp_enabled, totp_secret, totp_temp_secret) VALUES($1, $2, false, null, null)',
      [email, hash]
    );
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login and issue tokens
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, password, totp_enabled FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh access token
exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const newAccess = jwt.sign({ userId: payload.userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Change master password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;
  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, userId]);
    res.json({ message: 'Password changed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get TOTP 2FA status
exports.totpStatus = async (req, res) => {
  const userId = req.userId;
  try {
    const result = await pool.query('SELECT totp_enabled FROM users WHERE id = $1', [userId]);
    res.json({ enabled: result.rows[0].totp_enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ enabled: false });
  }
};

// Enable TOTP - generate temp secret
exports.totpEnable = async (req, res) => {
  const userId = req.userId;
  const secret = speakeasy.generateSecret({ length: 20 });
  try {
    await pool.query('UPDATE users SET totp_temp_secret = $1 WHERE id = $2', [secret.base32, userId]);
    res.json({ otpauthUrl: secret.otpauth_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating secret' });
  }
};

// Verify TOTP and enable
exports.totpVerify = async (req, res) => {
  const userId = req.userId;
  const { code } = req.body;
  try {
    const result = await pool.query('SELECT totp_temp_secret FROM users WHERE id = $1', [userId]);
    const tempSecret = result.rows[0].totp_temp_secret;
    const valid = speakeasy.totp.verify({ secret: tempSecret, encoding: 'base32', token: code });
    if (!valid) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    await pool.query(
      'UPDATE users SET totp_secret = $1, totp_enabled = true, totp_temp_secret = null WHERE id = $2',
      [tempSecret, userId]
    );
    res.json({ message: '2FA enabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// Disable TOTP
exports.totpDisable = async (req, res) => {
  const userId = req.userId;
  const { code } = req.body;
  try {
    const result = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [userId]);
    const secret = result.rows[0].totp_secret;
    const valid = speakeasy.totp.verify({ secret, encoding: 'base32', token: code });
    if (!valid) {
      return res.status(400).json({ message: 'Invalid code' });
    }
    await pool.query('UPDATE users SET totp_secret = null, totp_enabled = false WHERE id = $1', [userId]);
    res.json({ message: '2FA disabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Disable failed' });
  }
};

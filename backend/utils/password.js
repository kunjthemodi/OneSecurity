const crypto = require('crypto');
require('dotenv').config();

if (!process.env.PEPPER) {
  throw new Error('PEPPER not set in env');
}

const ITERATIONS = 200_000;
const KEYLEN     = 64;           // 512-bit
const DIGEST     = 'sha256';
const PEPPER     = process.env.PEPPER;

/**
 * Hashes a plaintext password with PBKDF2 using salt + pepper.
 * Returns a string of the form salt:hash
 */
function hashPassword(password) {
  if (typeof password !== 'string') {
    throw new TypeError('Password must be a string');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto
    .pbkdf2Sync(password + PEPPER, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString('hex');

  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a plaintext password against the stored salt:hash value.
 * Returns true if they match.
 */
function verifyPassword(stored, passwordAttempt) {
  if (typeof stored !== 'string' || typeof passwordAttempt !== 'string') {
    throw new TypeError('Both parameters must be strings');
  }

  const [salt, key] = stored.split(':');
  const derivedAttempt = crypto
    .pbkdf2Sync(passwordAttempt + PEPPER, salt, ITERATIONS, KEYLEN, DIGEST)
    .toString('hex');

  // Prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(key, 'hex'),
    Buffer.from(derivedAttempt, 'hex')
  );
}

module.exports = { hashPassword, verifyPassword };
// backend/utils/crypto.js
const crypto = require('crypto');
require('dotenv').config();
if (!process.env.AES_SECRET) throw new Error('AES_SECRET not set');
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(String(process.env.AES_SECRET), 'salt', 32);
const iv = Buffer.alloc(16, 0);
module.exports.encrypt = (text) => {
  if (typeof text !== 'string') throw new TypeError('encrypt: text must be string');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let enc = cipher.update(text, 'utf8', 'hex'); enc += cipher.final('hex');
  return enc;
};
module.exports.decrypt = (enc) => {
  if (typeof enc !== 'string') throw new TypeError('decrypt: data must be string');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let dec = decipher.update(enc, 'hex', 'utf8'); dec += decipher.final('utf8');
  return dec;
};
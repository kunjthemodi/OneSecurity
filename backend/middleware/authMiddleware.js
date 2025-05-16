
// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = h.split(' ')[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
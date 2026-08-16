const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'change_me';
const jwtExpiry = process.env.JWT_EXPIRY || '1h';
const refreshExpiry = process.env.REFRESH_EXPIRY || '7d';

function signAccessToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: refreshExpiry });
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('JWT error', err.message);
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  authenticateJWT
};

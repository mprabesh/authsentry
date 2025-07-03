const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RefreshToken = require('./models/RefreshToken');

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
}

async function storeRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, token, expiresAt });
}

async function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const record = await RefreshToken.findOne({ token, userId: payload.id });
    if (!record || new Date() > record.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

async function revokeRefreshToken(token) {
  await RefreshToken.deleteOne({ token });
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  hashPassword,
  comparePassword
};

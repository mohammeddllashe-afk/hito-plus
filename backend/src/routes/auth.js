const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken } = require('../auth');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// Register (simple) - for demo only
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, tenant_id } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'missing_fields' });
    const existing = await db('users').where({ tenant_id, email }).first();
    if (existing) return res.status(409).json({ error: 'user_exists' });
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const payload = {
      tenant_id,
      email,
      name,
      password_hash: hash,
      created_at: new Date()
    };
    const [id] = await db('users').insert(payload).returning('id');
    const user = await db('users').where({ id }).first();
    delete user.password_hash;
    res.status(201).json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, tenant_id } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const user = await db('users').where({ tenant_id, email }).first();
    if (!user || !user.password_hash) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const payload = { sub: user.id, tenant_id: user.tenant_id, email: user.email, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ sub: user.id, tenant_id: user.tenant_id });
    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'missing_refresh' });
    // verify token
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'change_me';
    try {
      const decoded = jwt.verify(refreshToken, secret);
      const user = await db('users').where({ id: decoded.sub }).first();
      if (!user) return res.status(401).json({ error: 'invalid_token' });
      const payload = { sub: user.id, tenant_id: user.tenant_id, email: user.email, name: user.name };
      const accessToken = signAccessToken(payload);
      const newRefresh = signRefreshToken({ sub: user.id, tenant_id: user.tenant_id });
      return res.json({ accessToken, refreshToken: newRefresh });
    } catch (e) {
      return res.status(401).json({ error: 'invalid_refresh' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

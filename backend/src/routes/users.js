const express = require('express');
const router = express.Router();
const db = require('../db');

// List users (basic, no auth)
router.get('/', async (req, res) => {
  try {
    const users = await db('users').select('*').limit(100);
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    payload.created_at = new Date();
    const [id] = await db('users').insert(payload).returning('id');
    const user = await db('users').where({ id }).first();
    res.status(201).json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Get user
router.get('/:id', async (req, res) => {
  try {
    const user = await db('users').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ error: 'not_found' });
    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Update user
router.patch('/:id', async (req, res) => {
  try {
    await db('users').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const user = await db('users').where({ id: req.params.id }).first();
    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

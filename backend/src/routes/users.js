const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

// List users
router.get('/', async (req, res) => {
  try {
    const users = await db('users').select('id','tenant_id','employee_no','email','phone','name','roles','status','created_at','updated_at').limit(100);
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Create user (hash password if provided)
router.post('/', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.password) {
      const hash = await bcrypt.hash(payload.password, SALT_ROUNDS);
      payload.password_hash = hash;
      delete payload.password;
    }
    payload.created_at = new Date();
    const [id] = await db('users').insert(payload).returning('id');
    const user = await db('users').where({ id }).first();
    if (user) delete user.password_hash;
    res.status(201).json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Get user
router.get('/:id', async (req, res) => {
  try {
    const user = await db('users').select('id','tenant_id','employee_no','email','phone','name','roles','status','created_at','updated_at').where({ id: req.params.id }).first();
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
    const updates = { ...req.body };
    if (updates.password) {
      const hash = await bcrypt.hash(updates.password, SALT_ROUNDS);
      updates.password_hash = hash;
      delete updates.password;
    }
    updates.updated_at = new Date();
    await db('users').where({ id: req.params.id }).update(updates);
    const user = await db('users').select('id','tenant_id','employee_no','email','phone','name','roles','status','created_at','updated_at').where({ id: req.params.id }).first();
    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// List tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await db('tasks').select('*').limit(100);
    res.json({ data: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    payload.created_at = new Date();
    // generate simple task_no
    payload.task_no = payload.task_no || `T-${Date.now()}`;
    const [id] = await db('tasks').insert(payload).returning('id');
    const task = await db('tasks').where({ id }).first();
    res.status(201).json({ data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Get task
router.get('/:id', async (req, res) => {
  try {
    const task = await db('tasks').where({ id: req.params.id }).first();
    if (!task) return res.status(404).json({ error: 'not_found' });
    res.json({ data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Update task
router.patch('/:id', async (req, res) => {
  try {
    await db('tasks').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() });
    const task = await db('tasks').where({ id: req.params.id }).first();
    res.json({ data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;

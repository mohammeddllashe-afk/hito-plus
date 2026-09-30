require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const { authenticateJWT } = require('./auth');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);

// Protect API routes
app.use('/api/v1/users', authenticateJWT, usersRouter);
app.use('/api/v1/tasks', authenticateJWT, tasksRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));

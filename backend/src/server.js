require('dotenv').config();
const express = require('express');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tasks', tasksRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));

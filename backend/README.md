# HITO-Plus Backend Skeleton

This folder contains a minimal backend skeleton using Node.js, Express and Knex/Postgres.

Quick start (local dev):
1. Copy `.env.example` to `.env` and set DATABASE_URL
2. npm install
3. npx knex migrate:latest --knexfile backend/knexfile.js
4. npm run dev

Endpoints (examples):
- GET /health
- GET /api/v1/users
- POST /api/v1/users
- GET /api/v1/tasks
- POST /api/v1/tasks

Notes:
- This is a starter skeleton. Add authentication, validation and RBAC before production use.

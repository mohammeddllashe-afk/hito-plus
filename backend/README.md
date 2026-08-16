# HITO-Plus Backend Skeleton

This folder contains a minimal backend skeleton using Node.js, Express and Knex/Postgres.

Quick start (local dev):

Option A — local (node):
1. Copy `.env.example` to `.env` and set DATABASE_URL
2. cd backend && npm install
3. npx knex migrate:latest --knexfile backend/knexfile.js
4. npm run dev

Option B — Docker (recommended for quick setup):
1. Install Docker & Docker Compose
2. From repository root run: `docker-compose up --build`
   - This will start Postgres and the backend service.
   - The backend runs migrations on startup and starts in dev mode.
3. Backend will be available at http://localhost:3000

Production image
----------------
A production-ready image is provided via `backend/Dockerfile.prod` (multi-stage build):
- Builds only production dependencies (npm ci --production)
- Copies source and exposes port 3000
- Does NOT run migrations by default (recommended to run migrations as part of CI/CD pipeline)

Example production compose (for reference): `docker-compose.prod.yml` (uses Dockerfile.prod). Fill JWT_SECRET and other secrets using env or secret manager.

Endpoints (examples):
- GET /health
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/users (requires Authorization: Bearer <token>)
- GET /api/v1/tasks (requires Authorization)

Notes:
- This is a starter skeleton. Add production-grade auth storage, validation, RBAC, secrets management and monitoring before production use.
- Migrations should be executed via CI/CD or a specific admin job; avoid running migrations automatically at container start in production.

# Backend Dockerfile for local development
FROM node:18-slim

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY ./src ./src
COPY knexfile.js .
COPY .env.example .env

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx knex migrate:latest --knexfile ./knexfile.js && npm start"]

const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/hito_dev';
const maxRetries = parseInt(process.env.DB_WAIT_RETRIES || '30', 10);
const waitMs = parseInt(process.env.DB_WAIT_INTERVAL_MS || '2000', 10);

let attempts = 0;

async function wait() {
  while (attempts < maxRetries) {
    attempts += 1;
    try {
      const client = new Client({ connectionString, connectionTimeoutMillis: 2000 });
      await client.connect();
      await client.end();
      console.log('Database is available');
      process.exit(0);
    } catch (err) {
      console.log(`Database not ready yet (attempt ${attempts}/${maxRetries}): ${err.message}`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  console.error('Database did not become ready in time');
  process.exit(1);
}

wait();

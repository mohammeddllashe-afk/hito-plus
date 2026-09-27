const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'orders.json');

function getKvClientConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function getKv() {
  const config = getKvClientConfig();
  if (!config) {
    throw new Error('Durable order storage is not configured');
  }
  const { createClient } = await import('@vercel/kv');
  return createClient(config);
}

function stripDemoOrders(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((order) => {
    if (!order || typeof order !== 'object') return false;
    const isDemo = String(order.id).trim() === 'v1'
      || String(order.customer || '').trim().toLowerCase() === 'test'
      || Number(order.no) === 1001;
    return !isDemo;
  });
}

async function readOrders() {
  if (process.env.VERCEL) {
    const client = await getKv();
    const value = await client.get('orders');
    if (value == null) return [];
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return stripDemoOrders(parsed);
  }

  const kvConfig = getKvClientConfig();
  if (kvConfig) {
    try {
      const client = await getKv();
      const value = await client.get('orders');
      const parsed = value == null ? [] : (typeof value === 'string' ? JSON.parse(value) : value);
      return stripDemoOrders(parsed);
    } catch (error) {
      // Use local file storage only during local development.
    }
  }

  try {
    const file = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(file);
    return stripDemoOrders(parsed);
  } catch (error) {
    return [];
  }
}

async function writeOrders(orders) {
  if (process.env.VERCEL) {
    const client = await getKv();
    await client.set('orders', stripDemoOrders(orders));
    return;
  }

  const kvConfig = getKvClientConfig();
  if (kvConfig) {
    try {
      const client = await getKv();
      await client.set('orders', stripDemoOrders(orders));
      return;
    } catch (error) {
      // Use local file storage only during local development.
    }
  }

  const cleaned = stripDemoOrders(orders);
  fs.writeFileSync(dataPath, JSON.stringify(cleaned, null, 2));
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.status(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/api/orders') {
    try {
      return res.status(200).json(await readOrders());
    } catch (error) {
      res.status(503);
      return res.json({ error: 'Shared order storage is not configured or unavailable' });
    }
  }

  if (req.method === 'PUT' && req.url === '/api/orders') {
    let payload;
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!Array.isArray(payload)) {
        throw new Error('orders must be an array');
      }
    } catch (error) {
      res.status(400);
      return res.json({ error: 'Invalid orders payload' });
    }

    try {
      await writeOrders(payload);
      res.status(204);
      return res.end();
    } catch (error) {
      res.status(503);
      return res.json({ error: 'Shared order storage is not configured or unavailable' });
    }
  }

  res.status(404);
  return res.end('Not found');
};

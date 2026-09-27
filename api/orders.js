const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'orders.json');

function readOrders() {
  try {
    const file = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
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
    return res.status(200).json(readOrders());
  }

  if (req.method === 'PUT' && req.url === '/api/orders') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!Array.isArray(payload)) {
        throw new Error('orders must be an array');
      }
      writeOrders(payload);
      res.status(204);
      return res.end();
    } catch (error) {
      res.status(400);
      return res.json({ error: 'Invalid orders payload' });
    }
  }

  res.status(404);
  return res.end('Not found');
};

const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const ordersHandler = require(path.join(__dirname, '..', 'api', 'orders.js'));

  const body = JSON.stringify([{ id: 'v1', status: 'new', no: 1001, customer: 'Test' }]);

  let statusCode = 200;
  let responseBody = '';
  const res = {
    headers: {},
    statusCode,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(value) {
      responseBody = value ?? '';
      return value;
    },
    json(payload) {
      responseBody = JSON.stringify(payload);
      return payload;
    }
  };

  await ordersHandler({ method: 'GET', url: '/api/orders' }, res);
  assert.equal(res.statusCode, 200);

  await ordersHandler({ method: 'PUT', url: '/api/orders', body }, res);
  assert.equal(res.statusCode, 204);

  await ordersHandler({ method: 'OPTIONS', url: '/api/orders' }, res);
  assert.equal(res.statusCode, 204);

  console.log('vercel-api tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

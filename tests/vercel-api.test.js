const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const ordersHandler = require(path.join(__dirname, '..', 'api', 'orders.js'));

  const demoBody = JSON.stringify([{ id: 'v1', status: 'new', no: 1001, customer: 'Test' }]);
  const realBody = JSON.stringify([{ id: Date.now(), status: 'new', no: 2001, customer: 'Alice', items: 'Coffee' }]);

  function createResponse() {
    return {
      headers: {},
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(name, value) {
        this.headers[name] = value;
      },
      end(value) {
        this.responseBody = value ?? '';
        return value;
      },
      json(payload) {
        this.responseBody = JSON.stringify(payload);
        return payload;
      }
    };
  }

  const readRes = createResponse();
  await ordersHandler({ method: 'GET', url: '/api/orders', headers: {} }, readRes);
  assert.equal(readRes.statusCode, 200);

  const publicWriteRes = createResponse();
  await ordersHandler({ method: 'PUT', url: '/api/orders', body: realBody, headers: {} }, publicWriteRes);
  assert.equal(publicWriteRes.statusCode, 204);

  const demoCleanupRes = createResponse();
  await ordersHandler({ method: 'PUT', url: '/api/orders', body: demoBody, headers: {} }, demoCleanupRes);
  assert.equal(demoCleanupRes.statusCode, 204);

  const optionsRes = createResponse();
  await ordersHandler({ method: 'OPTIONS', url: '/api/orders', headers: {} }, optionsRes);
  assert.equal(optionsRes.statusCode, 204);

  console.log('vercel-api tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

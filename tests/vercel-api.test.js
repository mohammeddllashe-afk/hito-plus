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

  const previousVercel = process.env.VERCEL;
  const previousKvUrl = process.env.KV_REST_API_URL;
  const previousKvToken = process.env.KV_REST_API_TOKEN;
  const previousUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const previousUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.VERCEL = '1';
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const unconfiguredReadRes = createResponse();
  await ordersHandler({ method: 'GET', url: '/api/orders', headers: {} }, unconfiguredReadRes);
  assert.equal(unconfiguredReadRes.statusCode, 503);

  const unconfiguredWriteRes = createResponse();
  await ordersHandler({ method: 'PUT', url: '/api/orders', body: realBody, headers: {} }, unconfiguredWriteRes);
  assert.equal(unconfiguredWriteRes.statusCode, 503);

  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
  if (previousKvUrl === undefined) delete process.env.KV_REST_API_URL;
  else process.env.KV_REST_API_URL = previousKvUrl;
  if (previousKvToken === undefined) delete process.env.KV_REST_API_TOKEN;
  else process.env.KV_REST_API_TOKEN = previousKvToken;
  if (previousUpstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = previousUpstashUrl;
  if (previousUpstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = previousUpstashToken;

  console.log('vercel-api tests passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const port = Number(process.env.PORT || 3000);
const dataPath = path.join(__dirname, 'orders.json');

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

let orders = fs.existsSync(dataPath)
  ? stripDemoOrders(JSON.parse(fs.readFileSync(dataPath, 'utf8')))
  : [];
const clients = new Set();

function cors(response){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function save(){
  fs.writeFileSync(dataPath, JSON.stringify(stripDemoOrders(orders), null, 2));
}

function broadcast(){
  const payload = `data: ${JSON.stringify(orders)}\n\n`;
  for(const response of clients) response.write(payload);
}

const server = http.createServer((request, response) => {
  cors(response);

  if(request.method === 'OPTIONS'){
    response.writeHead(204);
    return response.end();
  }

  if(request.url === '/api/orders' && request.method === 'GET'){
    response.writeHead(200, {'Content-Type':'application/json'});
    return response.end(JSON.stringify(orders));
  }

  if(request.url === '/api/orders' && request.method === 'PUT'){
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      try{
        const nextOrders = JSON.parse(body);
        if(!Array.isArray(nextOrders)) throw new Error('orders must be an array');
        orders = nextOrders;
        save();
        broadcast();
        response.writeHead(204);
        response.end();
      }catch(error){
        response.writeHead(400, {'Content-Type':'application/json'});
        response.end(JSON.stringify({error:'Invalid orders payload'}));
      }
    });
    return;
  }

  if(request.url === '/events'){
    response.writeHead(200, {
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive'
    });
    response.write(`data: ${JSON.stringify(orders)}\n\n`);
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  const requestedPath = request.url === '/' ? '/index.html' : request.url;
  const filePath = path.join(__dirname, requestedPath);
  if(!filePath.startsWith(__dirname) || !fs.existsSync(filePath)){
    response.writeHead(404);
    return response.end('Not found');
  }
  const contentType = filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain';
  response.writeHead(200, {'Content-Type':contentType});
  response.end(fs.readFileSync(filePath));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Sweet Tic Tac running on http://localhost:${port}`);
});
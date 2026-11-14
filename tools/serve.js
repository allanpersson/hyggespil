// Lille statisk server til at prøve spillet uden Home Assistant: node tools/serve.js [port]
// Åbn http://127.0.0.1:<port>/hs.html
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'custom_components', 'hyggespil', 'www'), PORT = +(process.argv[2] || 8899);
const TYPE = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'hs.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('ikke fundet') }
  res.writeHead(200, { 'Content-Type': TYPE[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('Hyggespil på http://127.0.0.1:' + PORT + '/hs.html'));

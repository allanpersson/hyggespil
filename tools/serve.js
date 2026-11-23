// Lille statisk server til at prøve spillet uden Home Assistant: node tools/serve.js [port]
// Åbn http://127.0.0.1:<port>/hs.html
// Serveren har også et lille rum-relay (/rum/sub og /rum/pub), så fælles spil kan
// prøves lokalt uden at gå gennem en ekstern tjeneste.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'custom_components', 'hyggespil', 'www'), PORT = +(process.argv[2] || 8899);
const TYPE = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

const emner = new Map();          // emne -> Set af svar (SSE)
function abonnenter(emne) {
  if (!emner.has(emne)) emner.set(emne, new Set());
  return emner.get(emne);
}
function udsend(emne, tekst) {
  for (const svar of abonnenter(emne)) {
    try { svar.write('data: ' + tekst.replace(/\n/g, ' ') + '\n\n'); } catch (e) {}
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const emne = String(url.searchParams.get('t') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 80);

  if (url.pathname === '/rum/sub') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(': hej\n\n');
    const sæt = abonnenter(emne);
    sæt.add(res);
    const hjerte = setInterval(() => { try { res.write(': hjerte\n\n'); } catch (e) {} }, 20000);
    req.on('close', () => { clearInterval(hjerte); sæt.delete(res); if (!sæt.size) emner.delete(emne); });
    return;
  }

  if (url.pathname === '/rum/pub' && req.method === 'POST') {
    let krop = '';
    req.on('data', b => { krop += b; if (krop.length > 200000) req.destroy(); });
    req.on('end', () => {
      udsend(emne, krop);
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
      res.end();
    });
    return;
  }

  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'hs.html';
  if (rel === 'favicon.ico') { res.writeHead(204); return res.end(); }
  const file = path.join(ROOT, rel);
  if (rel === 'extra.json' && !fs.existsSync(file)) {
    /* brugerens egne tilføjelser ligger ikke i repoet – svar med en tom pulje */
    res.writeHead(200, { 'Content-Type': TYPE['.json'], 'Cache-Control': 'no-store' });
    return res.end('{}');
  }
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('ikke fundet') }
  res.writeHead(200, { 'Content-Type': TYPE[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log('Hyggespil på http://127.0.0.1:' + PORT + '/hs.html'));

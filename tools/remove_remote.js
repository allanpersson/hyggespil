// Fjerner en fil fra GitHub (også fra main) via API'en. Kør: node tools/remove_remote.js <sti> [sti ...]
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const REPO = cfg.repo || 'allanpersson/hyggespil';
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'hyggespil', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
(async () => {
  const [owner, name] = REPO.split('/');
  for (const p of process.argv.slice(2)) {
    const sti = p.split('/').map(encodeURIComponent).join('/');
    const info = await (await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${sti}?ref=main`, { headers: H })).json();
    if (!info.sha) { console.log(' findes ikke: ' + p); continue }
    const r = await fetch(`https://api.github.com/repos/${owner}/${name}/contents/${sti}`, {
      method: 'DELETE', headers: H, body: JSON.stringify({ message: 'Fjerner ' + path.basename(p), sha: info.sha, branch: 'main',
        author: { name: 'Allan Persson', email: '46043392+allanpersson@users.noreply.github.com' } }),
    });
    console.log((r.ok ? ' fjernet: ' : ' FEJL ' + r.status + ': ') + p);
  }
})();

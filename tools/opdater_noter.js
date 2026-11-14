// Opdaterer release-noterne for en udgivelse, så de viser ændringerne fra CHANGELOG.md
// (Marketplace viser dem direkte på udgiversiden i stedet for "se CHANGELOG").
// Kør: node tools/opdater_noter.js 0.2.4 [0.2.3 ...]   – uden argumenter: alle 0.2.x
const fs = require('fs'), path = require('path');
const ROD = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'x', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
const REPO = cfg.repo || 'allanpersson/hyggespil';
const CHANGELOG = fs.readFileSync(path.join(ROD, 'CHANGELOG.md'), 'utf8');

function afsnit(v) {
  const m = CHANGELOG.match(new RegExp('^## ' + v.replace(/\./g, '\\.') + '\\s+[–-]\\s+.*?$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  return m ? m[1].trim() : null;
}

(async () => {
  let versioner = process.argv.slice(2);
  if (!versioner.length) versioner = [...CHANGELOG.matchAll(/^## ([0-9][^\s]*)\s+[–-]\s+/gm)].map(m => m[1]).filter(v => v.startsWith('0.2.'));
  for (const v of versioner) {
    const krop = afsnit(v);
    if (!krop) { console.log(v + ': findes ikke i CHANGELOG'); continue; }
    const noter = '## Hyggespil ' + v + '\n\n' + krop +
      '\n\n---\nHent: **Indstillinger → Marketplace → Hyggespil** → Opdater, og genstart Home Assistant.\n';
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${v}`, { headers: H });
    if (!r.ok) { console.log(v + ': ingen udgivelse (HTTP ' + r.status + ')'); continue; }
    const rel = await r.json();
    const p = await fetch(`https://api.github.com/repos/${REPO}/releases/${rel.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ body: noter }) });
    console.log(v + ': HTTP ' + p.status + (p.ok ? ' – noterne opdateret' : ' ' + (await p.text()).slice(0, 120)));
  }
})();

// Opretter en ALMINDELIG udgivelse (ikke prerelease) for versionen i manifest.json,
// med tag på nuværende main og hyggespil.zip vedhæftet.
//
// Kør: node tools/release.js            - opretter/opdaterer udgivelsen
//      node tools/release.js --tving   - sletter og genskaber udgivelsen
//
// Prereleases må ikke bruges: Marketplace/HACS læser /releases/latest, som springer
// dem over, og så viser Marketplace en commit-SHA i stedet for en version.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'secrets', 'github.json'), 'utf8'));
const REPO = cfg.repo || 'allanpersson/hyggespil';
const TOKEN = cfg.token.trim();
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'custom_components/hyggespil/manifest.json'), 'utf8')).version;
const H = { Authorization: 'Bearer ' + TOKEN, 'User-Agent': 'hyggespil-release', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
const api = async (p, m = 'GET', b) => {
  const r = await fetch('https://api.github.com' + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined });
  const t = await r.text();
  return { ok: r.ok, status: r.status, json: t ? JSON.parse(t) : null };
};
(async () => {
  if (!/^\d+\.\d+\.\d+$/.test(VERSION)) {
    console.error('FEJL: versionen i manifest.json er "' + VERSION + '" - den skal være x.x.x');
    process.exit(1);
  }
  const [owner, name] = REPO.split('/');
  const head = (await api(`/repos/${owner}/${name}/commits/main`)).json.sha;
  const tag = await api(`/repos/${owner}/${name}/git/refs`, 'POST', { ref: 'refs/tags/' + VERSION, sha: head });
  console.log((tag.ok ? 'tag sat på main: ' : 'tag findes allerede: ') + VERSION);
  let rel = (await api(`/repos/${owner}/${name}/releases/tags/${VERSION}`)).json;
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  const m = changelog.match(new RegExp('^## ' + VERSION.replace(/\./g, '\\.') + '\\s+[–-]\\s+.*?$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  const krop = m ? m[1].trim() : 'Se CHANGELOG.md for hvad der er nyt.';
  const noter = '## Hyggespil ' + VERSION + '\n\n' + krop +
    '\n\n---\nHent: **Indstillinger → Marketplace → Hyggespil** → Opdater, og genstart Home Assistant.\n';
  if (!rel || rel.tag_name !== VERSION || process.argv.includes('--tving')) {
    if (rel && rel.id && process.argv.includes('--tving')) await api(`/repos/${owner}/${name}/releases/${rel.id}`, 'DELETE');
    const k = await api(`/repos/${owner}/${name}/releases`, 'POST', {
      tag_name: VERSION, name: 'Hyggespil', prerelease: false, draft: false, target_commitish: 'main',
      body: noter,
    });
    rel = k.json;
    console.log(k.ok ? 'udgivelse oprettet: ' + rel.html_url : 'udgivelsesfejl: HTTP ' + k.status + ' ' + JSON.stringify(k.json).slice(0, 220));
    if (!k.ok) process.exit(1);
  } else {
    await api(`/repos/${owner}/${name}/releases/${rel.id}`, 'PATCH', { body: noter });
    console.log('udgivelsen findes (noterne opdateret): ' + rel.html_url);
  }
  cp.execSync(`python "${path.join(ROOT, 'tools', 'make_zip.py')}" "${path.join(ROOT, 'out')}"`, { stdio: 'inherit' });
  const data = fs.readFileSync(path.join(ROOT, 'out', 'hyggespil.zip'));
  const gammel = (rel.assets || []).find(a => a.name === 'hyggespil.zip');
  if (gammel) await api(`/repos/${owner}/${name}/releases/assets/${gammel.id}`, 'DELETE');
  const up = await fetch(`https://uploads.github.com/repos/${owner}/${name}/releases/${rel.id}/assets?name=hyggespil.zip`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/zip', 'Content-Length': data.length }, body: data });
  const b = await up.json().catch(() => ({}));
  console.log('zip: HTTP ' + up.status + ' → ' + (b.browser_download_url || JSON.stringify(b).slice(0, 160)));
  console.log('\nHusk: opdater CHANGELOG.md, og giv besked om at hente ' + VERSION + '.');
})();

// Saetter tag, opretter prerelease og vedhaefter hyggespil.zip for versionen fra manifest.json.
// Koer: node tools/release.js          - saetter tag og udgiver, hvis det mangler
//      node tools/release.js --tving   - sletter og genskaber udgivelsen, hvis den allerede findes
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
  const [owner, name] = REPO.split('/');
  const head = (await api(`/repos/${owner}/${name}/commits/main`)).json.sha;
  const tag = await api(`/repos/${owner}/${name}/git/refs`, 'POST', { ref: 'refs/tags/' + VERSION, sha: head });
  console.log((tag.ok ? 'tagget ' : 'tag findes allerede eller fejl: ') + VERSION + (tag.ok ? '' : ' (' + tag.status + ')'));
  let rel = (await api(`/repos/${owner}/${name}/releases/tags/${VERSION}`)).json;
  if (!rel || rel.tag_name !== VERSION || process.argv.includes('--tving')) {
    if (rel && rel.id && process.argv.includes('--tving')) await api(`/repos/${owner}/${name}/releases/${rel.id}`, 'DELETE');
    const k = await api(`/repos/${owner}/${name}/releases`, 'POST', {
      tag_name: VERSION, name: 'Hyggespil ' + VERSION, prerelease: true, draft: false, target_commitish: 'main',
      body: 'Se [CHANGELOG.md](https://github.com/' + REPO + '/blob/main/CHANGELOG.md) for hvad der er ændret.\n\n' +
        'Sådan henter du den: **Indstillinger → Marketplace → Hyggespil** (versionen ligger under pre-release, ellers slå «Pre-release» til for repositoriet) → download → genstart Home Assistant.',
    });
    rel = k.json;
    console.log(k.ok ? 'release oprettet: ' + rel.html_url : 'release-fejl: HTTP ' + k.status + ' ' + JSON.stringify(k.json).slice(0, 220));
    if (!k.ok) process.exit(1);
  } else console.log('release findes: ' + rel.html_url);
  cp.execSync(`python "${path.join(ROOT, 'tools', 'make_zip.py')}" "${path.join(ROOT, 'out')}"`, { stdio: 'inherit' });
  const data = fs.readFileSync(path.join(ROOT, 'out', 'hyggespil.zip'));
  const gammel = (rel.assets || []).find(a => a.name === 'hyggespil.zip');
  if (gammel) await api(`/repos/${owner}/${name}/releases/assets/${gammel.id}`, 'DELETE');
  const up = await fetch(`https://uploads.github.com/repos/${owner}/${name}/releases/${rel.id}/assets?name=hyggespil.zip`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/zip', 'Content-Length': data.length }, body: data });
  const b = await up.json().catch(() => ({}));
  console.log('zip: HTTP ' + up.status + ' → ' + (b.browser_download_url || JSON.stringify(b).slice(0, 160)));
  console.log('\nHUS: opdater CHANGELOG.md og projekt.noterne, og giv besked om at hente ' + VERSION + '.');
})();

// Udgiver Hyggespil til GitHub. Kører kun for udvikleren.
//
//   node tools/publish.js --check     – test om nøglen virker og hvad repoet indeholder (ingen ændringer)
//   node tools/publish.js             – opret repo (hvis det mangler), upload alt fra HEAD, sæt emne/beskrivelse, labels
//   node tools/publish.js --release   – oveni: tag + prerelease 0.1.0-beta.1 med hyggespil.zip
//
// Nøglen læses fra tools/secrets/github.json (feltet "token"), som står i .gitignore og aldrig committes.
// Brug en fin-granulert nøgle med: Administration af repository (read/write) + Indhold (read/write), kun til dette repo.
// Alt indhold sendes fra den lokale git-commit (git archive), så hvad der ligger på GitHub er præcis det, der er committet.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const SECRET = path.join(ROOT, 'tools', 'secrets', 'github.json');
const RELEASE = process.argv.includes('--release'), CHECK = process.argv.includes('--check');

const cfg = JSON.parse(fs.readFileSync(SECRET, 'utf8'));
const REPO = cfg.repo || 'allanpersson/hyggespil';
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'custom_components/hyggespil/manifest.json'), 'utf8')).version;
const enc = b => Buffer.from(b).toString('base64');
const GIT = process.env.GIT_EXE || 'C:\\Program Files\\Git\\cmd\\git.exe';

async function api(p, method = 'GET', body) {
  const r = await fetch('https://api.github.com' + p, {
    method,
    headers: { Authorization: 'Bearer ' + cfg.token, 'User-Agent': 'hyggespil-publish', Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(method + ' ' + p + ' -> ' + r.status + ': ' + t.slice(0, 300));
  return t ? JSON.parse(t) : null;
}

function trackedFiles() {
  const list = cp.execSync(`"${GIT}" -C "${ROOT}" ls-tree -r HEAD --name-only`, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  return list;
}

async function uploadFiles(files) {
  const [owner, repo] = REPO.split('/');
  let ok = 0, skipped = 0;
  for (const p of files) {
    const content = enc(cp.execSync(`"${GIT}" -C "${ROOT}" show HEAD:"${p.replace(/"/g, '\\"')}"`, { maxBuffer: 1 << 28, encoding: 'buffer' }));
    let sha = null;
    try { const cur = await api(`/repos/${owner}/${repo}/contents/${encodeURI(p)}?ref=main`); sha = cur.sha } catch (e) { /* ny fil */ }
    try {
      await api(`/repos/${owner}/${repo}/contents/${encodeURI(p)}`, 'PUT', { message: `Upload ${p}`, content, sha, branch: 'main' });
      ok++;
      if (ok % 10 === 0) console.log('  ' + ok + '/' + files.length + ' filer');
    } catch (e) {
      if (sha) { skipped++; console.log(' springes over (uændret): ' + p) } else throw e;
    }
  }
  console.log(`filer: ${ok} oprettet/opdateret, ${skipped} uændrede`);
}

const LABELS = [
  ['fejl', 'd93f4a', 'Noget virker ikke'],
  ['facit', 'f7b731', 'Et svar eller en kilde skal gencheckes'],
  ['forslag', '4cc9f0', 'Forbedring eller nyt indhold'],
  ['børn', '2ec4b6', 'Alder, niveau og børnepuljer'],
  ['upassende', 'b33939', 'Indhold der opleves som stødende'],
  ['installation', '8f6bff', 'Marketplace, panel eller Home Assistant'],
];

(async () => {
  const me = await api('/user');
  console.log('Nøgle tilhorer: ' + me.login + ' (id ' + me.id + ')');
  const [owner, name] = REPO.split('/');
  if (me.login.toLowerCase() !== owner.toLowerCase()) throw new Error('Nøglens ejer (' + me.login + ') er ikke repoets ejer (' + owner + ') – stopper.');
  let repo = null;
  try { repo = await api(`/repos/${owner}/${name}`) } catch (e) { console.log('Repoet findes ikke endnu.') }
  if (CHECK) {
    if (repo) console.log('Repo: ' + repo.html_url + ' · ' + repo.default_branch + ' · ' + repo.size + ' KB · offentlig: ' + !repo.private);
    return;
  }
  if (!repo) {
    const created = await api('/user/repos', 'POST', { name, private: false, has_issues: true, has_wiki: false, has_discussions: true, auto_init: false });
    repo = created; console.log('Oprettede ' + created.html_url);
  }
  await api(`/repos/${owner}/${name}`, 'PATCH', {
    description: 'Danske selskabsspil til Home Assistant – kører helt lokalt, ingen eksterne tjenester. 55 spil, 6.400+ spørgsmål.',
    homepage: '', topics: ['home-assistant', 'hacs', 'party-game', 'danish', 'board-games', 'home-assistant-integration'],
  }).catch(e => console.log('  (emner/beskrivelse: ' + e.message.slice(0, 100) + ')'));
  const files = trackedFiles();
  console.log('Uploader ' + files.length + ' filer fra HEAD ...');
  await uploadFiles(files);
  for (const [n, color, description] of LABELS) {
    await api(`/repos/${owner}/${name}/labels`, 'POST', { name: n, color, description })
      .catch(async e => { if (e.message.includes('already_exists')) await api(`/repos/${owner}/${name}/labels/${encodeURIComponent(n)}`, 'PATCH', { color, description }).catch(() => { }); else console.log('  label ' + n + ': ' + e.message.slice(0, 80)) });
  }
  console.log('labels ok');
  if (!RELEASE) { console.log('\nFærdig uden udgivelse. Kør med --release for tag + prerelease ' + VERSION); return }
  const tag = VERSION;
  const head = (await api(`/repos/${owner}/${name}/commits/main`)).sha;
  try { await api(`/repos/${owner}/${name}/git/refs`, 'POST', { ref: 'refs/tags/' + tag, sha: head }); console.log('tagget ' + tag + ' er oprettet') }
  catch (e) { console.log('  tag: ' + e.message.slice(0, 120)) }
  const rel = await api(`/repos/${owner}/${name}/releases`, 'POST', {
    tag_name: tag, name: 'Hyggespil ' + tag, body: 'Første beta. Se [CHANGELOG.md](blob/main/CHANGELOG.md).\n\nInstallation: Marketplace (eller HACS) → tilføj dette repo → Hyggespil → slå pre-release til → genstart Home Assistant → tilføj integrationen.',
    draft: false, prerelease: true,
  }).catch(e => { console.log('release: ' + e.message.slice(0, 200)); return null });
  if (rel) {
    console.log('Release: ' + rel.html_url);
    const zip = 'hyggespil.zip', zpath = path.join(ROOT, 'out', zip);
    fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
    cp.execSync(`python "${path.join(ROOT, 'tools', 'make_zip.py')}" "${path.join(ROOT, 'out')}"`, { stdio: 'inherit' });
    const up = await fetch(rel.upload_url.replace('{name}', zip).split('?')[0] + '?name=' + zip, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/zip', Accept: 'application/vnd.github+json', 'Content-Length': fs.statSync(zpath).size },
      body: fs.createReadStream(zpath),
    });
    const body = await up.json().catch(() => ({}));
    console.log('zip upload: HTTP ' + up.status + (up.ok ? ' – færdig: ' + (body.browser_download_url || '') : ' – ' + JSON.stringify(body).slice(0, 200)));
  }
})().catch(e => { console.error('FEJL: ' + e.message); process.exit(1) });

// Sender filer fra den lokale git-commit op på GitHub via API'en.
// (En fin-granulert nøgle kan ikke bruges til git over HTTPS, så derfor denne vej.)
//
//   node tools/update_remote.js                      – alle filer i HEAD, dem der faktisk er ændrede
//   node tools/update_remote.js fil1 fil2 ...        – kun de nævnte filer
//
// Nøglen læses fra tools/secrets/github.json (står i .gitignore) og skrives aldrig ud.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'secrets', 'github.json'), 'utf8'));
const REPO = cfg.repo || 'allanpersson/hyggespil';
const GIT = process.env.GIT_EXE || 'C:\\Program Files\\Git\\cmd\\git.exe';
const TOKEN = cfg.token.trim();
const HEADERS = { Authorization: 'Bearer ' + TOKEN, 'User-Agent': 'hyggespil', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };

const api = async (p, method = 'GET', body) => {
  const r = await fetch('https://api.github.com' + p, { method, headers: HEADERS, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(method + ' ' + p + ' → ' + r.status + ': ' + t.slice(0, 240));
  return t ? JSON.parse(t) : null;
};
const blob = p => raw(p).toString('base64');
const raw = p => cp.execSync(`"${GIT}" -C "${ROOT}" show HEAD:"${p.replace(/"/g, '\\"')}"`, { maxBuffer: 1 << 28 });
const sti = p => p.split('/').map(encodeURIComponent).join('/');

(async () => {
  const [owner, name] = REPO.split('/');
  const valgte = process.argv.slice(2);
  const alle = valgte.length ? valgte : cp.execSync(`"${GIT}" -C "${ROOT}" ls-tree -r HEAD --name-only`, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  const filer = alle.filter(f => !/(^|\/)secrets\//.test(f) && !/(^|\/)[\w.-]*\.token$/.test(f) && path.basename(f) !== 'github.json');
  const skjult = alle.length - filer.length;
  if (skjult) console.log('holder ' + skjult + ' fil(er) tilbage (se .gitignore): ' + alle.filter(f => !filer.includes(f)).join(', '));
  let opdateret = 0, uændret = 0;
  for (const p of filer) {
    let fjernIndhold = null, sha = null;
    try {
      const info = await api(`/repos/${owner}/${name}/contents/${sti(p)}?ref=main`);
      sha = info.sha;
      fjernIndhold = Buffer.from(info.content, 'base64');
    } catch (e) { /* filen findes ikke endnu */ }
    const lokal = raw(p);
    if (sha && fjernIndhold && Buffer.compare(fjernIndhold, lokal) === 0) { uændret++; continue }
    await api(`/repos/${owner}/${name}/contents/${sti(p)}`, 'PUT', {
      message: (sha ? 'Opdater ' : 'Tilføj ') + path.basename(p), content: blob(p), sha, branch: 'main',
      author: { name: 'Allan Persson', email: '46043392+allanpersson@users.noreply.github.com' },
    });
    opdateret++; console.log('  ' + (sha ? '↑' : '+') + ' ' + p);
  }
  console.log(`\n${opdateret} filer sendt, ${uændret} var ens allerede`);
  if (opdateret) console.log('Se kørslerne: https://github.com/' + REPO + '/actions');
})().catch(e => { console.error('FEJL: ' + e.message); process.exit(1) });

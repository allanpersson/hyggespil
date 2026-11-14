// Genopretter/synkroniserer main med den lokale git-HEAD (filer der mangler oprettes, ændrede opdateres).
// Kør: node tools/genskab_main.js
const fs = require('fs'), path = require('path'), cp = require('child_process');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'x', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const ROD = path.join(__dirname, '..');
const GIT = 'C:\\Program Files\\Git\\cmd\\git.exe';
// udviklerhjælp: _enkelunderscore i begyndelsen af filnavnet (IKKE __init__.py / __pycache__)
const udvikler = f => /(^|\/)_[^_][^/]*\.(js|py|md)$/.test(f) || f.startsWith('tools/klar_') || f === 'tools/prov_ci.md';
const vis = async p => {
  const r = await fetch(G + p, { headers: H });
  return { s: r.status, b: r.status === 200 ? await r.json() : null };
};
(async () => {
  const filer = cp.execSync(`"${GIT}" -C "${ROD}" ls-tree -r HEAD --name-only`, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  const skal = filer.filter(f => !udvikler(f));
  console.log('synkroniserer ' + skal.length + ' filer (holder ' + (filer.length - skal.length) + ' udviklerfiler tilbage)');
  let genoprettet = [], opdateret = 0, uændret = 0;
  for (const f of skal) {
    const ind = cp.execSync(`"${GIT}" -C "${ROD}" show HEAD:"${f.replace(/"/g, '\\"')}"`, { maxBuffer: 1 << 28 });
    const nu = await vis('/contents/' + f.split('/').map(encodeURIComponent).join('/') + '?ref=main');
    if (nu.s === 200) {
      if (Buffer.from(nu.b.content, 'base64').equals(ind)) { uændret++; continue }
      await PUT(f, ind, nu.b.sha, 'Opdater '); opdateret++;
    } else {
      await PUT(f, ind, null, 'Genskaber ');
      genoprettet.push(f);
    }
  }
  async function PUT(f, ind, sha, ord) {
    const r = await fetch(G + '/contents/' + f.split('/').map(encodeURIComponent).join('/'), {
      method: 'PUT', headers: H,
      body: JSON.stringify({ message: ord + path.basename(f), content: ind.toString('base64'), sha, branch: 'main' }),
    });
    if (r.status >= 300) { console.log('FEJL ' + f + ': ' + r.status + ' ' + (await r.text()).slice(0, 200)); process.exit(1) }
  }
  // fjern udviklerfiler der всеg ligger på main (kun _xxx.js, aldrig __init__.py)
  const træ = (await (await fetch(G + '/git/trees/main?recursive=1', { headers: H })).json()).tree || [];
  for (const t of træ.filter(x => x.type === 'blob' && udvikler(x.path))) {
    const r = await fetch(G + '/contents/' + t.path.split('/').map(encodeURIComponent).join('/'), {
      method: 'DELETE', headers: H, body: JSON.stringify({ message: 'Fjerner udviklerhjælp ' + path.basename(t.path), sha: t.sha, branch: 'main' }),
    });
    console.log('sletter ' + t.path + ': HTTP ' + r.status);
  }
  console.log('genoprettet: ' + (genoprettet.join(', ') || 'intet') + ' | opdateret: ' + opdateret + ' | uændret: ' + uændret);
})();

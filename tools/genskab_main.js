// Spejler den lokale git-HEAD til GitHub main i ÉT commit (Git Data API).
//
// Hvorfor ikke ét PUT pr. fil: det gav ~100 commits pr. synkronisering, lige så mange
// CI-kørsler og lejlighedsvise push-kollisioner, når CI selv skrev til main samtidig.
// Her laves først alle blobs, så ét træ, ét commit og én ref-opdatering.
//
// Kør: node tools/genskab_main.js ["commit-besked"]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'hyggespil-sync', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const ROD = path.join(__dirname, '..');
const GIT = process.env.GIT || (fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe') ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git');
const BESKED = process.argv[2] || 'Spejler lokal HEAD til main';
// udviklerhjælp: _enkelunderscore i begyndelsen af filnavnet (IKKE __init__.py / __pycache__)
const udvikler = f => /(^|\/)_[^_][^/]*\.(js|py|md)$/.test(f) || f.startsWith('tools/klar_') || f === 'tools/prov_ci.md';

const git = a => cp.execSync(`"${GIT}" -C "${ROD}" ${a}`, { maxBuffer: 1 << 28 });
const api = async (p, metode = 'GET', krop) => {
  const r = await fetch(G + p, { method: metode, headers: H, body: krop ? JSON.stringify(krop) : undefined });
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch { }
  if (!r.ok) throw new Error(`${metode} ${p}: HTTP ${r.status} ${t.slice(0, 200)}`);
  return j;
};

(async () => {
  const ref = await api('/git/ref/heads/main');
  const forælder = ref.object.sha;
  const base = await api('/git/commits/' + forælder);
  const træGrund = await api('/git/trees/' + base.tree.sha + '?recursive=1');

  const lokale = git('ls-tree -r HEAD --name-only').toString('utf8').split(/\r?\n/).filter(Boolean).filter(f => !udvikler(f));
  const påMain = new Map(træGrund.tree.filter(e => e.type === 'blob').map(e => [e.path, e]));
  const lokalSæt = new Set(lokale);

  // 1) blobs for ændrede/nye filer (GitHub genbruger identiske blobs, så sha'en er den samme)
  const ændrede = [];
  const poster = [];
  for (const f of lokale) {
    const ind = git(`show HEAD:"${f.replace(/"/g, '\\"')}"`);
    const blob = await api('/git/blobs', 'POST', { content: ind.toString('base64'), encoding: 'base64' });
    if (!påMain.has(f) || påMain.get(f).sha !== blob.sha) ændrede.push(f);
    poster.push({ path: f, mode: '100644', type: 'blob', sha: blob.sha });
  }

  // 2) filer der kun findes på main fjernes (så main altid ligner den lokale HEAD)
  const slettede = [...påMain.keys()].filter(f => !lokalSæt.has(f) && påMain.get(f).type === 'blob');
  for (const f of slettede) poster.push({ path: f, mode: '100644', type: 'blob', sha: null });

  if (!ændrede.length && !slettede.length) {
    console.log('main er allerede identisk med lokal HEAD – intet at gøre');
    return;
  }

  // 3) ét træ, ét commit, én ref-opdatering
  const træ = await api('/git/trees', 'POST', { base_tree: base.tree.sha, tree: poster });
  const commit = await api('/git/commits', 'POST', { message: BESKED, tree: træ.sha, parents: [forælder] });
  await api('/git/refs/heads/main', 'PATCH', { sha: commit.sha, force: false });

  console.log(`ét commit ${commit.sha.slice(0, 7)}: ${ændrede.length} opdateret, ${slettede.length} slettet`);
  for (const f of ændrede) console.log('  opdateret: ' + f);
  for (const f of slettede) console.log('  slettet:   ' + f);
})().catch(e => { console.error('FEJL: ' + e.message); process.exit(1); });

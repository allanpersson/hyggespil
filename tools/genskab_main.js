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
// Filer som CI selv ejer: version, changelog, README og tællinger. De må ikke rulles
// tilbage af en lokal, ældre kopi. Send dem kun med, når de bevidst skal rettes: --med-ci-filer
const CI_FILER = new Set([
  'CHANGELOG.md', 'README.md',
  'custom_components/hyggespil/manifest.json',
  'custom_components/hyggespil/www/hs-cfg.js',
  'docs/antal.json', 'docs/puljestatus.json',
]);
const MED_CI = process.argv.includes('--med-ci-filer');

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
  let forælder = ref.object.sha;
  let base = await api('/git/commits/' + forælder);
  const træGrund = await api('/git/trees/' + base.tree.sha + '?recursive=1');

  const lokale = git('ls-tree -r -z HEAD --name-only').toString('utf8').split('\0')
    .filter(Boolean).filter(f => !udvikler(f)).filter(f => MED_CI || !CI_FILER.has(f));
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
  const slettede = [...påMain.keys()].filter(f => !lokalSæt.has(f) && påMain.get(f).type === 'blob'
    && (MED_CI || !CI_FILER.has(f)));
  for (const f of slettede) poster.push({ path: f, mode: '100644', type: 'blob', sha: null });

  if (!ændrede.length && !slettede.length) {
    console.log('main er allerede identisk med lokal HEAD – intet at gøre');
    return;
  }

  // 3) ét træ, ét commit, én ref-opdatering – med genforsøg hvis main er flyttet
  for (let forsøg = 1; forsøg <= 3; forsøg++) {
    try {
      const træ = await api('/git/trees', 'POST', { base_tree: base.tree.sha, tree: poster });
      const commit = await api('/git/commits', 'POST', { message: BESKED, tree: træ.sha, parents: [forælder] });
      await api('/git/refs/heads/main', 'PATCH', { sha: commit.sha, force: false });
      console.log(`ét commit ${commit.sha.slice(0, 7)}: ${ændrede.length} opdateret, ${slettede.length} slettet`);
      for (const f of ændrede) console.log('  opdateret: ' + f);
      for (const f of slettede) console.log('  slettet:   ' + f);
      return;
    } catch (e) {
      if (!/fast forward|422/.test(e.message) || forsøg === 3) throw e;
      console.log('main blev flyttet – henter ny position og prøver igen (' + forsøg + '/3)');
      await new Promise(r => setTimeout(r, 2500));
      const nyRef = await api('/git/ref/heads/main');
      forælder = nyRef.object.sha;
      base = await api('/git/commits/' + forælder);
      base = { ...base, tree: { sha: (await api('/git/trees/' + base.tree.sha)).sha } };
      // genberegn hvilke filer der stadig afviger
      const nytTræ = await api('/git/trees/' + base.tree.sha + '?recursive=1');
      const nyMain = new Map(nytTræ.tree.filter(x => x.type === 'blob').map(x => [x.path, x]));
      poster.length = 0;
      for (const f of lokale) {
        const ind = git(`show HEAD:"${f.replace(/"/g, '\\"')}"`);
        const blob = await api('/git/blobs', 'POST', { content: ind.toString('base64'), encoding: 'base64' });
        poster.push({ path: f, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const nyeSlettede = [...nyMain.keys()].filter(f => !lokalSæt.has(f) && nyMain.get(f).type === 'blob'
        && (MED_CI || !CI_FILER.has(f)));
      for (const f of nyeSlettede) poster.push({ path: f, mode: '100644', type: 'blob', sha: null });
      påMain.clear();
      for (const [k, v] of nyMain) påMain.set(k, v);
      for (const f of poster) if (f.sha === null && !påMain.has(f.path)) påMain.set(f.path, { sha: 'slettet', type: 'blob' });
    }
  }
})().catch(e => { console.error('FEJL: ' + e.message); process.exit(1); });

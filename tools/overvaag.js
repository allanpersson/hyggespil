// Overvåger GitHub: er alle filer på main identiske med den lokale HEAD, og er den
// nyeste udgivelse komplet (x.x.x, almindelig udgivelse, zip med manifest.json i roden)?
//
// Kør: node tools/overvaag.js
// Afslutter med kode 1, hvis noget er galt, så den kan bruges i CI.
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = path.join(__dirname, '..');
// Virker både lokalt (token i tools/secrets/github.json) og i GitHub Actions (GITHUB_TOKEN).
const hemmelig = path.join(ROOT, 'tools', 'secrets', 'github.json');
const TOKEN = process.env.GITHUB_TOKEN || (fs.existsSync(hemmelig) ? JSON.parse(fs.readFileSync(hemmelig, 'utf8')).token.trim() : '');
if (!TOKEN) { console.error('mangler GITHUB_TOKEN (eller tools/secrets/github.json)'); process.exit(1); }
const H = { Authorization: 'Bearer ' + TOKEN, 'User-Agent': 'hyggespil-overvaag', Accept: 'application/vnd.github+json' };
const GIT = process.env.GIT || (fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe') ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git');
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const UDVIKLER = f => /(^|\/)_[^_][^/]*\.(js|py|md)$/.test(f) || f.startsWith('tools/klar_');
const fejl = [];
const g = a => cp.execSync(`"${GIT}" -C "${ROOT}" ${a}`, { maxBuffer: 1 << 28 });

async function hentJson(p, init) {
  const r = await fetch(G + p, { ...init, headers: { ...H, ...(init && init.headers) } });
  return { status: r.status, json: r.status === 200 || r.status === 201 ? await r.json() : null, r };
}

(async () => {
  // Fast reference: i CI den commit der er checket ud, lokalt main.
  // Uden dette ville et push midt i en kørsel give falske afvigelser.
  let ref = process.env.GITHUB_SHA || '';
  if (!ref) {
    const r = await hentJson('/git/ref/heads/main');
    ref = (r.json && r.json.object && r.json.object.sha) || 'main';
  }
  console.log('reference: ' + ref.slice(0, 12));

  // 1) FILER: hver fil i lokal HEAD skal ligge på GitHub med samme indhold
  const dekod = s => s.replace(/\\([0-7]{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
  const filer = g('-c core.quotepath=false ls-tree -r HEAD --name-only').toString('utf8')
    .split(/\r?\n/).map(dekod).filter(Boolean).filter(f => !UDVIKLER(f));
  const træ = (await hentJson('/git/trees/' + ref + '?recursive=1')).json;
  if (!træ) { fejl.push('kunne ikke læse filoversigten på GitHub'); }
  else {
    const påMain = new Set(træ.tree.filter(x => x.type === 'blob').map(x => x.path));
    let mangler = [], afviger = [];
    for (const f of filer) {
      if (!påMain.has(f)) { mangler.push(f); continue; }
      const lokal = g(`show HEAD:"${f.replace(/"/g, '\\"')}"`);
      const r = await fetch(G + '/contents/' + f.split('/').map(encodeURIComponent).join('/') + '?ref=' + ref, { headers: { ...H, Accept: 'application/vnd.github.raw+json' } });
      if (!r.ok) { mangler.push(f); continue; }
      const web = Buffer.from(await r.arrayBuffer());
      if (Buffer.compare(web, lokal) !== 0) {
        let i = 0;
        while (i < Math.min(web.length, lokal.length) && web[i] === lokal[i]) i++;
        afviger.push({ f, fra: i, lokal: lokal.length, web: web.length });
      }
    }
    console.log(`FILER: ${filer.length} tjekket — ${mangler.length} mangler, ${afviger.length} afviger`);
    for (const f of mangler) { console.log('  MANGLER PÅ GITHUB: ' + f); fejl.push('fil mangler: ' + f); }
    for (const a of afviger) {
      console.log(`  AFVIGER: ${a.f}  (lokal ${a.lokal} B, GitHub ${a.web} B, første forskel ved byte ${a.fra})`);
      fejl.push('fil afviger: ' + a.f);
    }
  }

  // 2) UDGIVELSE: /releases/latest skal være en almindelig x.x.x med et brugbart zip
  const seneste = await hentJson('/releases/latest');
  if (!seneste.json) {
    fejl.push('der findes ingen almindelig udgivelse (kun prereleases?) — Marketplace viser så en commit-SHA');
    console.log('UDGIVELSE: ingen almindelig udgivelse fundet');
  } else {
    const rel = seneste.json;
    console.log('UDGIVELSE: ' + rel.tag_name + ' (prerelease=' + rel.prerelease + ')');
    if (rel.prerelease) fejl.push('nyeste udgivelse er en prerelease');
    if (!/^\d+\.\d+\.\d+$/.test(rel.tag_name)) fejl.push('udgivelsens navn er ikke x.x.x: ' + rel.tag_name);
    const asset = (rel.assets || []).find(a => a.name === 'hyggespil.zip');
    if (!asset) fejl.push('udgivelsen mangler hyggespil.zip');
    else {
      const r = await fetch(asset.browser_download_url, { headers: { 'User-Agent': 'x' }, redirect: 'follow' });
      const buf = Buffer.from(await r.arrayBuffer());
      const zip = path.join(os.tmpdir(), 'overvaag-hyggespil.zip');
      fs.writeFileSync(zip, buf);
      try {
        const ud = cp.execFileSync('python', [path.join(ROOT, 'tools', 'tjek_installation.py'), zip], { encoding: 'utf8' });
        console.log('  zip: ' + asset.size + ' B — ' + ud.trim().split('\n').pop());
      } catch (e) {
        console.log('  ZIP-FEJL: ' + (e.stdout || e.message));
        fejl.push('udgivelsens zip kan ikke installeres');
      } finally { fs.rmSync(zip, { force: true }); }
      const man = JSON.parse(g('show HEAD:custom_components/hyggespil/manifest.json').toString('utf8'));
      if (man.version !== rel.tag_name) {
        console.log(`  (bemærk: manifest.json i repo siger ${man.version}, udgivelsen er ${rel.tag_name})`);
      }
    }
  }

  // 3) CI: kun kørsler på DENNE commit tæller, og Overvågning springes over
  //    (en gammel fejl på en ældre commit er ikke et problem nu, og en overvågning
  //    må ikke holde sig selv rød for evigt).
  const kørsler = await hentJson('/actions/runs?head_sha=' + ref + '&per_page=30');
  if (kørsler.json) {
    const senestePr = new Map();
    for (const r of kørsler.json.workflow_runs) {
      if (r.name === 'Overvågning') continue;
      if (r.head_sha && r.head_sha !== ref) continue;   // sikkerhed, hvis filteret ikke virker
      if (!senestePr.has(r.name)) senestePr.set(r.name, r);
    }
    const fejlede = [...senestePr.values()].filter(r => r.status === 'completed' && r.conclusion === 'failure');
    const kører = [...senestePr.values()].filter(r => r.status !== 'completed');
    console.log(`CI: ${senestePr.size} workflows — ${fejlede.length} fejler` + (kører.length ? `, ${kører.length} kører stadig` : ''));
    for (const r of fejlede) {
      console.log('  FEJL: ' + r.name + ' ' + r.created_at + ' ' + r.html_url);
      fejl.push('CI-fejl: ' + r.name);
    }
  }

  console.log(fejl.length ? `\n${fejl.length} PROBLEM(ER) — se ovenfor` : '\nALT OK: filer, udgivelse og CI er i orden');
  process.exit(fejl.length ? 1 : 0);
})();

// Vedligeholder Hyggespil-repoet. Kør fra roden: node tools/build.js <opgave>
//
//   check   – syntakstjek af alle JavaScript-filer + kontrol af, at intet privat er havnet i spillets filer
//   pull    – (kun udvikleren) henter dagligt opdaterede indholdsfiler fra udviklerens Home Assistant
//   deploy  – (kun udvikleren) check + kopierer spillet til udviklerens Home Assistant (config/www/hyggespil)
//
// Spillets filer ligger i custom_components/hyggespil/www/ og rettes dér. Der er intet byggetrin.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'custom_components', 'hyggespil', 'www');
const LIVE = process.env.HYGGESPIL_LIVE || '\\\\homeassistant\\config\\www\\hyggespil';
// Indholdsfiler, som udviklerens kildetjek-job skriver direkte i Home Assistant.
const PULL = ['extra.json', 'ex_daily.js', 'vf2.js', 'vf.js'];

// Må aldrig stå i spillets filer (personlige data, lokale stier, gamle koder, udviklerens værktøjer).
const FORBIDDEN = [
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, 'e-mailadresse'],
  [/\b(?:10|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/, 'lokal IP-adresse'],
  [/[A-Z]:\\Users\\|\\\\homeassistant\\/, 'lokal filsti'],
  [/nabu\.casa/i, 'Home Assistant Cloud-adresse'],
  [/hyggespil-tools|ledger\.json|verify_state/, 'henvisning til udviklerens private værktøjer'],
  [/value\s*===?\s*['"]\d{4,8}['"]/, 'fast kode i kildekoden'],
  [/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/, 'GitHub-token'],
];
const SKIP_SCAN = new Set(['three.min.js', 'world3d.js', 'world.js']);

const exists = f => { try { fs.accessSync(f); return true } catch (e) { return false } };
const log = (...a) => console.log(...a);
const files = dir => fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());

function versions() {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'custom_components', 'hyggespil', 'manifest.json'), 'utf8')).version;
  const c = (/version:'([\w.\-]+)'/.exec(fs.readFileSync(path.join(SRC, 'hs-cfg.js'), 'utf8')) || [])[1];
  return { manifest: m, game: c };
}

function check() {
  let bad = 0, n = 0;
  for (const f of files(SRC)) {
    const p = path.join(SRC, f);
    if (f.endsWith('.js')) {
      n++;
      const r = cp.spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
      if (r.status !== 0) { bad++; log('SYNTAKSFEJL ' + f + '\n' + (r.stderr || '').split('\n').slice(0, 5).join('\n')) }
    }
    if (f.endsWith('.json')) { try { JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { bad++; log('UGYLDIG JSON ' + f + ': ' + e.message) } }
    if (SKIP_SCAN.has(f) || !/\.(js|json|html)$/.test(f)) continue;
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => { for (const [re, what] of FORBIDDEN) { const m = re.exec(l); if (m) { bad++; log(`PRIVAT INDHOLD ${f}:${i + 1} (${what}): ${m[0].slice(0, 40)}`) } } });
  }
  const v = versions();
  if (v.manifest !== v.game) { bad++; log(`VERSION: manifest.json (${v.manifest}) != www/hs-cfg.js (${v.game})`) }
  log(`check: ${n} js-filer, version ${v.manifest}, ${bad} fejl`);
  return bad === 0;
}

function pull() {
  if (!exists(LIVE)) { log('pull: findes ikke: ' + LIVE); process.exit(1) }
  for (const f of PULL) {
    const src = path.join(LIVE, f), dst = path.join(SRC, f);
    if (!exists(src)) { log('  (findes ikke: ' + f + ')'); continue }
    const a = fs.readFileSync(src), b = exists(dst) ? fs.readFileSync(dst) : null;
    if (b && a.equals(b)) { log('  uændret ' + f); continue }
    fs.writeFileSync(dst, a); log(`  hentet ${f} (${a.length} bytes)`);
  }
  log('Kør nu: node tools/build.js check');
}

function deploy() {
  if (!exists(LIVE)) { log('deploy: findes ikke: ' + LIVE); process.exit(1) }
  let n = 0;
  for (const f of files(SRC)) {
    if (PULL.includes(f)) continue;            // indholdsfilerne ejes af kildetjek-jobbene i Home Assistant
    fs.copyFileSync(path.join(SRC, f), path.join(LIVE, f)); n++;
  }
  log(`deploy: ${n} filer -> ${LIVE} (indholdsfilerne ${PULL.join(', ')} er ikke rørt)`);
}

const task = process.argv[2] || 'check';
if (task === 'check') process.exit(check() ? 0 : 1);
else if (task === 'pull') pull();
else if (task === 'deploy') { if (!check()) process.exit(1); deploy() }
else { log('brug: node tools/build.js [check|pull|deploy]'); process.exit(2) }

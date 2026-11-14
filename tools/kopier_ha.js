// Kopierer spillets filer fra repoet og ind i Home Assistant-installationen (udviklerens genvej).
// Kør: node tools/kopiér_ha.js
// Overskriver alt undtagen udviklerens lokale mellemresultater, som ikke hører til udgivelsen.
const fs = require('fs'), path = require('path');
const ROD = path.join(__dirname, '..');
const KILDE = path.join(ROD, 'custom_components', 'hyggespil');
const MÅL = process.env.HA_MAPPE || '\\\\homeassistant\\config\\custom_components\\hyggespil';
const SPRING = new Set(['ledger.json', 'verify_state.json', 'extra_pending.json', '__pycache__']);
if (!fs.existsSync(MÅL)) { console.log('målets mappe findes ikke: ' + MÅL); process.exit(1) }
let n = 0, sprunget = [];
(function gå(dir, basis) {
  for (const navn of fs.readdirSync(dir)) {
    const p = path.join(dir, navn);
    const rel = path.relative(basis, p).split(path.sep).join('/');
    if (fs.statSync(p).isDirectory()) { if (!SPRING.has(navn)) gå(p, basis); else sprunget.push(rel + '/'); continue }
    if (SPRING.has(navn)) { sprunget.push(rel); continue }
    const t = path.join(MÅL, ...rel.split('/'));
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.copyFileSync(p, t); n++;
  }
})(KILDE, KILDE);
console.log('kopierede ' + n + ' filer til ' + MÅL);
console.log('sprang over: ' + (sprunget.join(', ') || 'intet'));
const check = ['www/c1.js', 'www/w1.js', 'www/t1.js', 'www/backup.js', 'www/sporgsmal.js', 'www/hs-cfg.js', 'www/feedback.js', 'manifest.json', '__init__.py', 'config_flow.py', 'const.py', 'translations/en.json', 'brand/icon.png'];
const manglende = check.filter(f => !fs.existsSync(path.join(MÅL, ...f.split('/'))));
console.log(manglende.length ? 'MANGLER: ' + manglende.join(', ') : 'alle vigtige filer er på plads');
const mf = JSON.parse(fs.readFileSync(path.join(MÅL, 'manifest.json'), 'utf8'));
const cfg = fs.readFileSync(path.join(MÅL, 'www', 'hs-cfg.js'), 'utf8');
console.log('installation: manifest ' + mf.version + ', spillet melder ' + (/version:'([\w.\-]+)'/.exec(cfg) || [, '?'])[1]);

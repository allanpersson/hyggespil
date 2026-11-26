/* Røgtest af spillets indhold uden browser.
 *
 * Læser de krypterede puljer, kører kerne-scriptet og ext.js i en lille VM og
 * kontrollerer, at alle spil har det, de skal bruge: en pulje, en renderer og
 * gyldige fler-svars-opgaver. Fanger blandt andet tomme puljer, ukendte
 * spillertyper og dobbelte svarmuligheder.
 *
 * Kør: node tools/smoke.js
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROD = path.join(__dirname, '..');
const WWW = path.join(ROD, 'custom_components', 'hyggespil', 'www');

const krypto = fs.readFileSync(path.join(WWW, 'hs-krypto.js'), 'utf8');
const nøgle = [...krypto.match(/const K = \[([\s\S]*?)\]\.join/)[1].matchAll(/'([^']+)'/g)].map(x => x[1]).join('');
function rc4(key, str) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) { j = (j + s[i] + key.charCodeAt(i % key.length)) & 255; const t = s[i]; s[i] = s[j]; s[j] = t; }
  let i = 0; j = 0, ud = '';
  for (let n = 0; n < str.length; n++) { i = (i + 1) & 255; j = (j + s[i]) & 255; const t = s[i]; s[i] = s[j]; s[j] = t; ud += String.fromCharCode(str.charCodeAt(n) ^ s[(s[i] + s[j]) & 255]); }
  return ud;
}
const tomt = () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, remove() {}, setAttribute() {}, querySelector: () => null, textContent: '', innerHTML: '' });
const stille = { log() {}, warn() {}, error() {}, info() {} };
const ctx = {
  console: stille, Buffer,
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  document: { createElement: tomt, createElementNS: tomt, head: tomt(), body: tomt(), querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, currentScript: null, readyState: 'loading', write() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { href: 'http://localhost/', search: '' }, navigator: { userAgent: 'node' },
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
  crypto: require('crypto').webcrypto,
  addEventListener() {}, removeEventListener() {},
  DOMPoint: class { constructor(x, y) { this.x = x; this.y = y } },
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);

function kør(fil) {
  let s = fs.readFileSync(path.join(WWW, fil), 'utf8');
  const blob = s.match(/hsKrypt\("([^"]+)","([^"]+)"(?:,"(u8)")?\)/);
  if (blob) {
    const bin = rc4(nøgle + '|' + blob[1], Buffer.from(blob[2], 'base64').toString('binary'));
    s = blob[3] === 'u8' ? Buffer.from(bin, 'binary').toString('utf8') : bin;
  }
  vm.runInContext(s, ctx, { filename: fil });
}

['hs-krypto.js', 'data.js', 'data2.js', 'data3.js'].forEach(kør);
const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
vm.runInContext(html.split('<script>')[1].split('</script>')[0], ctx, { filename: 'index-inline.js' });
const skrevet = [];
ctx.document.write = h => skrevet.push(String(h));
kør('ext.js');
const navne = [...skrevet.join('').matchAll(/src="([^"?]+)/g)].map(x => x[1]);
for (const n of navne) kør(n);
const x = fs.readFileSync(path.join(WWW, 'hs.html'), 'utf8').match(/X=\[([^\]]*)\]/);
if (x) for (const m of x[1].matchAll(/'([^']+)'/g)) kør(m[1] + '.js');
if (typeof ctx.HS_FINISH === 'function') ctx.HS_FINISH();

const fejl = [], advarsler = [];
const GAMES = ctx.GAMES || [], DATA = ctx.DATA || {}, KINDS = ctx.KINDS || {};
const indbyggede = new Set(['choice', 'cards', 'award', 'est', 'pin', 'mix', 'glass', 'block', 'quiz', 'wheel',
  'who', 'qa', 'secret', 'ffm']);
const idSet = new Set();

if (!GAMES.length) fejl.push('ingen spil blev indlæst');
for (const g of GAMES) {
  if (!g || !g.id) { fejl.push('spil uden id'); continue; }
  if (idSet.has(g.id)) fejl.push('dobbelt spil-id: ' + g.id);
  idSet.add(g.id);
  if (!g.t) fejl.push(g.id + ': mangler titel');
  const liste = g.key ? DATA[g.key] : null;
  const egen = KINDS[g.kind] && KINDS[g.kind].egen;
  if (!g.key && g.kind !== 'menu' && !egen) fejl.push(g.id + ': mangler pulje-nøgle');
  if (g.key && g.kind !== 'mix' && !Array.isArray(liste)) fejl.push(g.id + ': puljen «' + g.key + '» findes ikke');
  if (Array.isArray(liste) && liste.length === 0) advarsler.push(g.id + ': puljen er tom');
  if (g.kind !== 'menu' && !KINDS[g.kind] && !indbyggede.has(g.kind)) fejl.push(g.id + ': ukendt spillertype «' + g.kind + '»');
  if (g.kind === 'menu' && (!Array.isArray(g.sub) || !g.sub.length)) fejl.push(g.id + ': menu uden underspil');
  if (!(g.min >= 1)) fejl.push(g.id + ': ugyldigt minimum antal spillere');
}

/* fler-svars-opgaver: fire unikke svar og et gyldigt indeks */
for (const [pool, liste] of Object.entries(DATA)) {
  if (!Array.isArray(liste)) continue;
  liste.forEach((it, i) => {
    if (!Array.isArray(it)) return;
    const [q, o, a] = it;
    if (typeof q !== 'string' || !Array.isArray(o)) return;
    const norm = o.map(v => String(v).toLowerCase().trim());
    if (new Set(norm).size !== norm.length) fejl.push(pool + '[' + i + ']: dobbelt svarmulighed');
    if (!(Number.isInteger(a) && a >= 0 && a < o.length)) fejl.push(pool + '[' + i + ']: svarindeks uden for rækkevidde');
    if (!q.trim()) fejl.push(pool + '[' + i + ']: tomt spørgsmål');
    if (/[\u0000-\u001f]/.test(JSON.stringify(it))) fejl.push(pool + '[' + i + ']: kontroltegn i teksten');
  });
}

/* ekspert-dækning rapporteres, men stopper ikke bygget */
let ekspert = 0, huller = 0;
for (const liste of Object.values(DATA)) {
  if (!Array.isArray(liste)) continue;
  const n = liste.filter(it => it && (it.niveau === 'ekspert' || (Array.isArray(it) && it[4] === 'ekspert'))).length;
  ekspert += n;
  if (n < 5 && liste.length > 1) huller++;
}

console.log(`spil: ${GAMES.length} · puljer: ${Object.keys(DATA).length} · ekspertspørgsmål: ${ekspert} (${huller} puljer mangler stadig 5)`);
for (const a of advarsler.slice(0, 15)) console.log('ADVARSEL: ' + a);
for (const f of fejl.slice(0, 40)) console.log('FEJL: ' + f);
if (fejl.length) {
  console.log(`\n${fejl.length} fejl – røgtesten fejlede`);
  process.exit(1);
}
console.log('røgtest OK');

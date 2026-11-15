/* Tæller spil og spørgsmål i det, brugeren faktisk får at se.
 *
 * Metoden er den samme som i browseren: puljefilerne (krypterede blobs) læses,
 * afkodes med nøglen fra www/hs-krypto.js og køres i en lille sandkasse sammen
 * med kerne-scriptet fra index.html og ext.js. Derefter køres HS_FINISH(), som
 * folder pakkerne ud og frasorterer dubletter/ugyldige kort – præcis som i spillet.
 *
 * Kør:
 *   node tools/antal.js            # skriv docs/antal.json og udskriv tallene
 *   node tools/antal.js --json     # kun JSON på stdout (bruges af README-værktøjet)
 *
 * Bruges af tools/opdater_readme.py, så README altid viser de rigtige tal.
 */
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROD = path.join(__dirname, '..');
const WWW = path.join(ROD, 'custom_components', 'hyggespil', 'www');
const UD = path.join(ROD, 'docs', 'antal.json');

/* ---- nøgle + rc4 (samme som tools/krypt.js) ---- */
const krypto = fs.readFileSync(path.join(WWW, 'hs-krypto.js'), 'utf8');
const m = krypto.match(/const K = \[([\s\S]*?)\]\.join/);
if (!m) throw new Error('kunne ikke finde nøglen i hs-krypto.js');
const nøgle = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).join('');

function rc4(key, str) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) & 255;
    const t = s[i]; s[i] = s[j]; s[j] = t;
  }
  let i = 0; j = 0, ud = '';
  for (let n = 0; n < str.length; n++) {
    i = (i + 1) & 255; j = (j + s[i]) & 255;
    const t = s[i]; s[i] = s[j]; s[j] = t;
    ud += String.fromCharCode(str.charCodeAt(n) ^ s[(s[i] + s[j]) & 255]);
  }
  return ud;
}

/* ---- lille DOM-sandkasse: nok til at ext.js kan køre uden browser ---- */
const skrevet = [];
const tomtElement = () => ({
  style: {}, textContent: '', innerHTML: '', dataset: {},
  classList: { add() {}, remove() {}, toggle() {} },
  appendChild() {}, removeChild() {}, setAttribute() {}, remove() {},
  insertBefore() {}, querySelector: () => null, querySelectorAll: () => [],
});
const stille = { log() {}, warn() {}, error() {}, info() {}, debug() {} };

const ctx = {
  console: stille,
  Buffer,
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  DOMPoint: class { constructor(x, y) { this.x = x; this.y = y; } },
  Audio: class { play() {} pause() {} },
  document: {
    createElement: tomtElement, createElementNS: tomtElement,
    head: tomtElement(), body: tomtElement(),
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    addEventListener() {}, currentScript: null, readyState: 'loading',
    write: h => skrevet.push(String(h)),
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  location: { href: 'http://localhost/', search: '' },
  navigator: { userAgent: 'node' },
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
  crypto: require('crypto').webcrypto,
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);

function kør(fil) {
  const p = path.join(WWW, fil);
  let s = fs.readFileSync(p, 'utf8');
  const blob = s.match(/hsKrypt\("([^"]+)","([^"]+)"(?:,"(u8)")?\)/);
  if (blob) {
    const bin = rc4(nøgle + '|' + blob[1], Buffer.from(blob[2], 'base64').toString('binary'));
    s = blob[3] === 'u8' ? Buffer.from(bin, 'binary').toString('utf8') : bin;
  }
  vm.runInContext(s, ctx, { filename: fil });
}

['hs-krypto.js', 'data.js', 'data2.js', 'data3.js'].forEach(kør);

const html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
const kerne = html.split('<script>')[1].split('</script>')[0];
vm.runInContext(kerne, ctx, { filename: 'index-inline.js' });

kør('ext.js');
const filer = [...skrevet.join('').matchAll(/src="([^"?]+)/g)].map(x => x[1]);
for (const f of filer) kør(f);

/* hs.html indsætter ekstra puljefiler lige efter ext.js (fx qb.js med «love & regler») */
const hsHtml = fs.readFileSync(path.join(WWW, 'hs.html'), 'utf8');
const xListe = hsHtml.match(/X=\[([^\]]*)\]/);
if (xListe) for (const m of xListe[1].matchAll(/'([^']+)'/g)) kør(m[1] + '.js');

if (typeof ctx.HS_FINISH === 'function') ctx.HS_FINISH();

/* ---- tal ---- */
const D = ctx.DATA || {};
const puljer = Object.fromEntries(Object.entries(D).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
const spørgsmål = Object.values(puljer).reduce((a, b) => a + b, 0);
const set = new Map();
for (const g of (ctx.GAMES || [])) if (g && g.id && !g.skjult && !set.has(g.id)) set.set(g.id, String(g.t || g.id));
const spil = set.size;

const tal = { spil, spoergsmaal: spørgsmål, puljer: Object.keys(puljer).length };

/* Hver (pulje, aldersgruppe) er sin egen pulje. Kort uden alder gælder alle aldre. */
const grupper = [[3, 5], [6, 8], [9, 11], [12, 14]];
const detaljer = {};
for (const [k, liste] of Object.entries(D)) {
  if (!Array.isArray(liste)) continue;
  if (liste.length <= 1) continue;      // spil med kun ét kort (fx Glasbroen) kan ikke vokse
  if (!liste.some(x => x && typeof x.age === 'number')) { detaljer[k] = liste.length; continue; }
  for (const [a, b] of grupper) {
    detaljer[k + ':' + a + '-' + b] = liste.filter(x => !x || typeof x.age !== 'number' || (x.age >= a && x.age <= b)).length;
  }
}
const mindste = Math.min(...Object.values(detaljer), Infinity);

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(tal) + '\n');
} else {
  fs.mkdirSync(path.dirname(UD), { recursive: true });
  fs.writeFileSync(UD, JSON.stringify({ ...tal, spilNavne: Object.fromEntries(set), puljer }, null, 1) + '\n', 'utf8');
  fs.writeFileSync(path.join(ROD, 'docs', 'puljestatus.json'), JSON.stringify({
    min: mindste,
    detaljer,
    over200: mindste >= 200,
    over300: mindste >= 300,
    spil,
    spoergsmaal: spørgsmål,
  }, null, 1) + '\n', 'utf8');
  console.log(`${tal.spil} spil · ${tal.spoergsmaal} spørgsmål, opgaver og kort i ${tal.puljer} puljer`);
  console.log(`mindste (pulje, aldersgruppe): ${mindste} – over 200: ${mindste >= 200}, over 300: ${mindste >= 300}`);
  console.log('skrev ' + path.relative(ROD, UD) + ' og docs/puljestatus.json');
}

/* Ekspert-spørgsmål: mindst 5 i hver pulje (Mensa/Einstein-niveau).
   Markeres med niveau:'ekspert' på objekter eller «ekspert» som 5. led i fler-svars-rækker. */
const erEkspert = it => !!it && (it.niveau === 'ekspert' || (Array.isArray(it) && it[4] === 'ekspert'));
const ekspert = {};
for (const [pool, liste] of Object.entries(D)) {
  if (!Array.isArray(liste)) continue;
  ekspert[pool] = liste.filter(erEkspert).length;
}
const huller = Object.entries(ekspert).filter(([, n]) => n < 5).map(([p, n]) => ({ pool: p, antal: n }));
if (!process.argv.includes('--json')) {
  fs.writeFileSync(path.join(ROD, 'docs', 'ekspertstatus.json'),
    JSON.stringify({ maal: 5, huller, ekspert }, null, 1) + '\n', 'utf8');
}

/* --- kontekst til de daglige job: hvad findes der allerede i hver pulje? ---
   Skrives som emnelister, så AI'en kan undgå dubletter uden at skulle gætte. */
const ki = process.argv.indexOf('--kontekst');
if (ki > 0 && process.argv[ki + 1]) {
  const emne = it => {
    if (!it) return '';
    if (typeof it === 'string') return it.slice(0, 90);
    if (Array.isArray(it)) return '';
    const t = it.q || it.s || it.t || it.w || (Array.isArray(it.o) ? it.o[it.a] : '') || it.a || '';
    return String(t).slice(0, 90);
  };
  const ud = {};
  for (const [pool, liste] of Object.entries(D)) {
    if (!Array.isArray(liste)) continue;
    ud[pool] = liste.map(it => {
      const post = { e: emne(it) };
      if (it && typeof it.age === 'number') post.age = it.age;
      return post;
    }).filter(x => x.e);
  }
  const mål = process.argv[ki + 1];
  fs.mkdirSync(path.dirname(mål), { recursive: true });
  fs.writeFileSync(mål, JSON.stringify({ opdateret: new Date().toISOString(), antal: tal, puljer: ud }) + '\n', 'utf8');
  console.log('kontekst skrevet: ' + mål + ' (' + Object.keys(ud).length + ' puljer)');
}

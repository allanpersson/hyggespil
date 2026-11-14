// Krypterer/obfuskerer spørgsmålspuljerne, så de ikke kan læses direkte på GitHub.
// Kør:
//   node tools/krypt.js laas            # krypter alle puljer (klartekst gemmes i hyggespil-tools/klart)
//   node tools/krypt.js laas-fil X.js   # krypter én fil (fx ex_daily.js efter et natjob)
//   node tools/krypt.js laas-op         # dekrypter tilbage til klartekst (til redigering)
//   node tools/krypt.js --tjek          # dekrypter og syntakskontrollér alle (bruges i CI)
// Nøglen læses fra www/hs-krypto.js, så der kun er ét sted at ændre den.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROD = path.join(__dirname, '..');
const WWW = path.join(ROD, 'custom_components', 'hyggespil', 'www');
const KLART = path.join(ROD, '..', 'hyggespil-tools', 'klart');
const KRYPTO = path.join(WWW, 'hs-krypto.js');
const FILER = ['data.js', 'data2.js', 'data3.js',
  ...Array.from({ length: 9 }, (_, i) => 'p' + (i + 1) + '.js'),
  ...Array.from({ length: 9 }, (_, i) => 'q' + (i + 1) + '.js'),
  'qa.js', 'qb.js', 'vf.js', 'vf2.js', 'ex_daily.js', 'gs.js', 'fb.js', 'reality.js'];

const nøgle = (() => {
  const k = fs.readFileSync(KRYPTO, 'utf8');
  const m = k.match(/const K = \[([\s\S]*?)\]\.join/);
  if (!m) throw new Error('kunne ikke finde nøglen i hs-krypto.js');
  const dele = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).join('');
  if (dele.length < 32) throw new Error('nøglen ser for kort ud');
  return dele;
})();

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

function erStub(tekst) {
  return /^\/\*[^*]*\*\/\s*hsKrypt\(/.test(tekst.trim()) || /^\s*hsKrypt\(/.test(tekst.trim());
}
function navn(p) { return path.basename(p); }

function laasFil(fil, kilde) {
  const p = path.join(WWW, fil);
  if (!fs.existsSync(p)) return 'findes ikke';
  const tekst = fs.readFileSync(p, 'utf8');
  if (erStub(tekst)) return 'allerede krypteret';
  fs.mkdirSync(KLART, { recursive: true });
  fs.writeFileSync(path.join(KLART, fil), tekst, 'utf8');           // klartekst uden for repoet
  const b64 = Buffer.from(rc4(nøgle + '|' + fil, tekst), 'binary').toString('base64');
  fs.writeFileSync(p, '/* Krypteret pulje – se tools/krypt.js */\nhsKrypt(' + JSON.stringify(fil) + ',' +
    JSON.stringify(b64) + ');\n', 'utf8');
  return 'krypteret (' + Math.round(tekst.length / 1024) + ' KB)';
}

function laasOp(fil) {
  const p = path.join(WWW, fil);
  if (!fs.existsSync(p)) return 'findes ikke';
  const tekst = fs.readFileSync(p, 'utf8');
  if (!erStub(tekst)) return 'er ikke krypteret';
  const m = tekst.match(/hsKrypt\("([^"]+)","([^"]+)"\)/);
  if (!m) return 'kunne ikke læse stub';
  const klart = rc4(nøgle + '|' + m[1], Buffer.from(m[2], 'base64').toString('binary'));
  fs.mkdirSync(KLART, { recursive: true });
  fs.writeFileSync(path.join(KLART, fil), klart, 'utf8');
  return 'dekrypteret (' + Math.round(klart.length / 1024) + ' KB)';
}

function tjekFil(fil) {
  const p = path.join(WWW, fil);
  if (!fs.existsSync(p)) return null;
  const tekst = fs.readFileSync(p, 'utf8');
  if (!erStub(tekst)) return 'IKKE KRYPTeret';
  const m = tekst.match(/hsKrypt\("([^"]+)","([^"]+)"\)/);
  if (!m) return 'stub uden blob';
  try {
    const klart = rc4(nøgle + '|' + m[1], Buffer.from(m[2], 'base64').toString('binary'));
    new vm.Script(klart, { filename: fil });
    return null;
  } catch (e) { return 'kan ikke dekrypteres/syntaks: ' + e.message; }
}

const mode = process.argv[2] || 'laas';
if (mode === 'laas') {
  for (const f of FILER) console.log(f.padEnd(14) + ' ' + laasFil(f));
} else if (mode === 'laas-op') {
  for (const f of FILER) console.log(f.padEnd(14) + ' ' + laasOp(f));
} else if (mode === 'laas-fil') {
  const f = process.argv[3];
  if (!f) { console.error('angiv en fil'); process.exit(2); }
  console.log(f + ': ' + laasFil(f));
} else if (mode === '--tjek') {
  let fejl = 0;
  for (const f of FILER) {
    const r = tjekFil(f);
    if (r) { console.log('FEJL ' + f + ': ' + r); fejl++; }
  }
  console.log(fejl ? fejl + ' pulje(r) fejler' : 'alle ' + FILER.length + ' puljer er krypterede og kan læses');
  process.exit(fejl ? 1 : 0);
} else {
  console.log('brug: node tools/krypt.js laas | laas-fil <fil> | laas-op | --tjek');
  process.exit(2);
}

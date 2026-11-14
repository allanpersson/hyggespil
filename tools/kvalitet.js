// Kvalitetskontrol af spørgsmålspuljerne (krypterede filer dekrypteres i hukommelsen).
// Tjekker: tomme/korte tekster, dubletter, svar der står i spørgsmålet, dobbelt mellemrum,
// manglende stort begyndelsesbogstav, skæve anførselstegn/parenteser, "??"-pladsholdere,
// HTML-rester og tal-svar uden for rimelige grænser.
//
// Kør:
//   node tools/kvalitet.js            # skriv rapport til docs/kvalitetsrapport.md
//   node tools/kvalitet.js --fejl     # afslut med fejlkode ved alvorlige fejl (bruges i CI)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROD = path.join(__dirname, '..');
const WWW = path.join(ROD, 'custom_components', 'hyggespil', 'www');
const KRYPTO = path.join(WWW, 'hs-krypto.js');

const nøgle = (() => {
  const k = fs.readFileSync(KRYPTO, 'utf8');
  const m = k.match(/const K = \[([\s\S]*?)\]\.join/);
  if (!m) throw new Error('kunne ikke finde nøglen');
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).join('');
})();
function rc4(key, str) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) { j = (j + s[i] + key.charCodeAt(i % key.length)) & 255; const t = s[i]; s[i] = s[j]; s[j] = t; }
  let i = 0; j = 0, ud = '';
  for (let n = 0; n < str.length; n++) { i = (i + 1) & 255; j = (j + s[i]) & 255; const t = s[i]; s[i] = s[j]; s[j] = t; ud += String.fromCharCode(str.charCodeAt(n) ^ s[(s[i] + s[j]) & 255]); }
  return ud;
}
function klart(fil) {
  const tekst = fs.readFileSync(path.join(WWW, fil), 'utf8');
  const m = tekst.match(/hsKrypt\("([^"]+)","([^"]+)"\)/);
  if (!m) return tekst;
  return rc4(nøgle + '|' + m[1], Buffer.from(m[2], 'base64').toString('binary'));
}

const DATA = {};
const sandkasse = { window: { DATA }, DATA, PACK: () => {}, Object, console: { log() {}, warn() {} }, Math, JSON };
sandkasse.globalThis = sandkasse;
vm.createContext(sandkasse);
for (const f of ['data.js', 'data2.js', 'data3.js']) {
  try { new vm.Script(klart(f), { filename: f }).runInContext(sandkasse); }
  catch (e) { console.error('kunne ikke læse ' + f + ': ' + e.message); }
}
const pools = sandkasse.window.DATA || DATA;

const ALVORLIG = new Set(['tom', 'dublet', 'lækage', 'html']);
const fund = [];

function tekstAf(it) {
  if (typeof it === 'string') return it;
  if (!it) return '';
  return String(it.q || it.s || it.t || it.w || (it.o && it.o[0]) || it.a || '');
}
function svarAf(it) {
  if (it && typeof it === 'object') return it.a;
  return null;
}

for (const [pool, liste] of Object.entries(pools)) {
  if (!Array.isArray(liste)) continue;
  const set = new Set();
  liste.forEach((it, idx) => {
    const t = tekstAf(it);
    const fejl = [];
    if (!t || t.trim().length < 8) fejl.push('tom');
    if (/[<>]/.test(t)) fejl.push('html');
    if (/  +/.test(t)) fejl.push('dobbelt-mellemrum');
    if (/^\s|\s$/.test(t)) fejl.push('løse-mellemrum');
    if (/^[a-zæøå]/.test(t) && !/^[a-z]{1,3}\./.test(t)) fejl.push('lille-begyndelse');
    if (/\?\?\?|�/.test(t)) fejl.push('pladsholder');
    const åbne = (t.match(/"/g) || []).length, cite = (t.match(/«|»/g) || []).length;
    if (åbne % 2 === 1 || cite % 2 === 1) fejl.push('skæve-citater');
    if ((t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length) fejl.push('skæve-parenteser');
    const n = svarAf(it);
    if (typeof n === 'number' && (n < 0 || n > 1e9 || !isFinite(n))) fejl.push('tal-ude-af-range');
    if (typeof n === 'string' && t && n.length > 3 && t.toLowerCase().includes(n.toLowerCase())) fejl.push('lækage');
    const k = t.toLowerCase().replace(/\s+/g, ' ').trim();
    if (k && set.has(k)) fejl.push('dublet'); else set.add(k);
    if (fejl.length) fund.push({ pool, idx, tekst: t.slice(0, 90), fejl });
  });
}

const prPool = {};
for (const f of fund) for (const x of f.fejl) prPool[x] = (prPool[x] || 0) + 1;
console.log('puljer:', Object.keys(pools).filter(k => Array.isArray(pools[k])).length,
  '| poster:', Object.values(pools).reduce((a, b) => a + (Array.isArray(b) ? b.length : 0), 0),
  '| fund:', fund.length);
console.log(Object.entries(prPool).map(([k, v]) => k + '=' + v).join(' '));

/* ---- sprog- og grammatiktjek via LanguageTool (kun når --sprog er sat) ---- */
async function sprogtjek() {
  const kandidater = [];
  for (const [pool, liste] of Object.entries(pools)) {
    if (!Array.isArray(liste)) continue;
    liste.forEach((it, idx) => {
      const t = tekstAf(it);
      if (t && t.length >= 8) kandidater.push({ pool, idx, tekst: t });
    });
  }
  console.log('sprogtjek: ' + kandidater.length + ' tekster');
  const fundSprog = [];
  const BATCH = 60;                       // LanguageTool: højst 20 KB og 20 kald/min
  for (let i = 0; i < kandidater.length; i += BATCH) {
    const del = kandidater.slice(i, i + BATCH);
    let tekst = '', start = [];
    for (const x of del) { const t = x.tekst.trim(); start.push(tekst.length); tekst += t + '\n'; x.tekst = t; }
    if (tekst.length > 19000) {           // hold os under grænsen
      del.length = Math.max(1, Math.floor(del.length * 19000 / tekst.length));
      tekst = ''; start = [];
      for (const x of del) { const t = x.tekst.trim(); start.push(tekst.length); tekst += t + '\n'; x.tekst = t; }
    }
    try {
      const svar = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Hyggespil-kvalitet/1.0' },
        body: new URLSearchParams({ text: tekst, language: 'da-DK', enabledOnly: 'false' }).toString(),
      }).then(r => r.json());
      for (const m of svar.matches || []) {
        if ((m.rule && m.rule.id) === 'WHITESPACE_RULE') continue;
        const hvem = del.findLastIndex((_, k) => start[k] <= m.offset);
        if (hvem < 0) continue;
        const x = del[hvem];
        const type = (m.rule && (m.rule.issueType || (m.rule.category && m.rule.category.id))) || 'ukendt';
        fundSprog.push({ pool: x.pool, idx: x.idx, tekst: x.tekst.slice(0, 80),
          besked: m.message, type, regel: (m.rule && m.rule.id) || '', ord: tekst.substr(m.offset, m.length).slice(0, 40) });
      }
    } catch (e) {
      console.log('sprogtjek-kald fejlede (springer resten over): ' + e.message);
      break;
    }
    await new Promise(r => setTimeout(r, 3200));   // respekter rate limit
  }
  const prType = {};
  for (const f of fundSprog) prType[f.type] = (prType[f.type] || 0) + 1;
  console.log('sprogfund:', fundSprog.length, JSON.stringify(prType));
  return { fundSprog, prType };
}

(async () => {
  let sprog = { fundSprog: [], prType: {} };
  if (process.argv.includes('--sprog')) sprog = await sprogtjek();

  const alvor = fund.filter(f => f.fejl.some(x => ALVORLIG.has(x)));
  const linjer = ['# Kvalitetsrapport', '', `Genereret ${new Date().toISOString().slice(0, 10)} af \`tools/kvalitet.js\`.`, '',
    '| Regel | Antal |', '|---|---|',
    ...Object.entries(prPool).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`), '',
    '## Poster med alvorlige fejl', ''];
  for (const f of alvor.slice(0, 80)) linjer.push(`- **${f.pool}** #${f.idx}: ${f.tekst} — ${f.fejl.join(', ')}`);
  if (!alvor.length) linjer.push('Ingen.');

  if (process.argv.includes('--sprog')) {
    linjer.push('', '## Sprog og grammatik (LanguageTool, da-DK)', '');
    linjer.push('| Type | Antal |', '|---|---|',
      ...Object.entries(sprog.prType).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`));
    linjer.push('', '### Eksempler', '');
    for (const f of sprog.fundSprog.slice(0, 60)) {
      linjer.push(`- **${f.pool}** #${f.idx}: «${f.ord}» – ${f.besked} (${f.regel || f.type})`);
    }
    if (!sprog.fundSprog.length) linjer.push('Ingen fund.');
  }

  fs.writeFileSync(path.join(ROD, 'docs', 'kvalitetsrapport.md'), linjer.join('\n') + '\n');

  if (process.argv.includes('--fejl') && alvor.length) {
    console.error(`\n${alvor.length} post(er) med alvorlige fejl – se docs/kvalitetsrapport.md`);
    process.exit(1);
  }
  console.log('rapport skrevet til docs/kvalitetsrapport.md (' + alvor.length + ' alvorlige' +
    (process.argv.includes('--sprog') ? ', ' + sprog.fundSprog.length + ' sprogfund' : '') + ')');
})();

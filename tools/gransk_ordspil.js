// Gennemser ordspil-puljerne i w1.js efter spillereglerne (kæder, trapper, bunker, rim).
// Kør: node tools/gransk_ordspil.js [fil ...]   (standard: w1.js)
const fs = require('fs'), path = require('path');
const ROD = path.join(__dirname, '..', 'custom_components', 'hyggespil', 'www');
const filer = process.argv.slice(2).length ? process.argv.slice(2) : ['w1.js'];
const fejl = [];
function check( Hvad, ok, besked) { if (!ok) fejl.push(Hvad + ': ' + besked) }

function puljer(kilde) {
  const ud = [];
  const re = /DATA\.(\w+)=\[/g;
  let m;
  while ((m = re.exec(kilde))) {
    const start = m.index + m[0].length - 1;
    const slut = finderBlok(kilde, start);
    const tekst = kilde.slice(start, slut + 1);
    try { ud.push({ navn: m[1], rækker: Function('return ' + tekst)() }) } catch (e) { fejl.push('kan ikke læse ' + m[1] + ' (' + e.message + ')') }
  }
  return ud;
}
function finderBlok(s, i) {
  let d = 0, q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') { i++; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'" || c === '`') { q = c; continue }
    if (c === '[' || c === '{' || c === '(') d++;
    else if (c === ']' || c === '}' || c === ')') { d--; if (!d) return i }
  }
  return -1;
}

for (const f of filer) {
  const kilde = fs.readFileSync(path.join(ROD, f), 'utf8');
  const ps = puljer(kilde);
  console.log(f + ': ' + ps.length + ' puljer (' + ps.map(p => p.navn + ':' + p.rækker.length).join(', ') + ')');
  for (const p of ps) {
    for (const it of p.rækker) {
      const id = it.q || it.a || JSON.stringify(it).slice(0, 26);
      const mærke = f + ' ' + p.navn + ' «' + id + '»';
      if (Array.isArray(it.chain)) {
        const højst = /højst ?(\d+) bogstaver/.exec(it.regel || ''), nøj = /nøjagtig ?(\d+)/.exec(it.regel || '');
        for (let i = 0; i < it.chain.length; i++) {
          const w = it.chain[i];
          if (højst) check(mærke, w.length <= +højst[1], '«' + w + '» har ' + w.length + ' bogstaver, regelen siger højst ' + højst[1]);
          if (nøj) check(mærke, w.length === +nøj[1], '«' + w + '» har ' + w.length + ' bogstaver, regelen siger nøjagtig ' + nøj[1]);
          if (i) check(mærke, it.chain[i - 1].slice(-1) === w[0], '«' + w + '» starter ikke på forriges sidste bogstav (' + it.chain[i - 1].slice(-1) + ')');
        }
      }
      if (Array.isArray(it.ladder)) {
        check(mærke, it.ladder[0] === it.fra, 'starter ikke på «' + it.fra + '»');
        check(mærke, it.ladder[it.ladder.length - 1] === it.til, 'ender ikke på «' + it.til + '»');
        for (let i = 1; i < it.ladder.length; i++) {
          const a = it.ladder[i - 1], b = it.ladder[i];
          check(mærke, a.length === b.length, '«' + b + '» har andet antal bogstaver end «' + a + '»');
          const ændringer = [...a].filter((c, k) => c !== b[k]).length;
          check(mærke, ændringer === 1, '«' + a + '» -> «' + b + '» ændrer ' + ændringer + ' bogstaver');
        }
      }
      if (Array.isArray(it.ord) && typeof it.bogstaver === 'string')
        check(mærke, it.ord.every(o => [...o.toUpperCase()].every(c => it.bogstaver.toUpperCase().includes(c))), 'facitord bruger bogstaver uden for bunken');
      if (Array.isArray(it.rim) && it.ord) it.rim.forEach(r => check(mærke, r.slice(-2) === it.ord.slice(-2), '«' + r + '» rimer ikke på «' + it.ord + '»'));
      check(mærke, it.age !== undefined, 'mangler aldersmærkning');
    }
  }
}
console.log('\n' + (fejl.length ? 'PROBLEMER (' + fejl.length + '):\n  ' + fejl.join('\n  ') : 'alle kæder, trapper, bunker og rim holder sig til reglerne'));

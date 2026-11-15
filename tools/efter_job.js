// Efter nattens puljejob: skriv udgivelsesnoter med antal nye spørgsmål pr. kategori,
// commit og send til GitHub, så CI udgiver dem automatisk med rigtige noter.
// Kør: node tools/efter_job.js ["dag"]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROD = path.join(__dirname, '..');
const TOOLS = path.join(ROD, '..', 'hyggespil-tools');
const LOG = path.join(TOOLS, 'logs', 'ingest.log');
const GIT = process.env.GIT || 'C:\\Program Files\\Git\\cmd\\git.exe';
const dag = process.argv[2] || new Date().toISOString().slice(0, 10);

const NAVNE = {
  num: 'Tal & gæt', tf: 'Sandt eller falsk', odd: 'Find løgnen', tl: 'Hvad skete først?',
  rec: 'Skøre rekorder', who: 'Hvem/hvad er jeg?', weird: 'Mærkelige ord', lang: 'Hvilket sprog?',
  city: 'Byer', dx: 'Destination', law: 'Love & regler', ftl: 'Færdselsloven',
  kquiz: 'Børnequiz', ktf: 'Sandt eller falsk (børn)', kest: 'Tæl og gæt', kwho: 'Hvilket dyr er jeg?',
  kodd: 'Hvad hører ikke til?', kriddle: 'Børnegåder', kmove: 'Gør som dyret', kword: 'Ord og rim',
  klik: 'Mest sandsynlig (børn)', krather: 'Hvad ville du helst? (børn)', kchar: 'Gæt og vis (børn)',
  rather: 'Hellere end', never: 'Jeg har aldrig', likely: 'Mest sandsynlig', dare: 'Udfordringer',
  deep: 'Dybe samtaler', taboo: 'Forbudte ord', char: 'Gæt og vis', sm: 'Stormester',
  sqdal: 'Dalgona', sqdil: 'Dystre valg', sqwho: 'Hvem i familien?', prov: 'Ordsprog',
  grsyg: 'Græker eller sygdom', reality: 'Dansk reality', fb_dk: 'Dansk fodbold', fb_int: 'International fodbold',
};

if (!fs.existsSync(LOG)) console.log('ingen ingest.log – bruger tælling fra docs/antal.json');
const tæller = {};
if (fs.existsSync(LOG)) {
  for (const linje of fs.readFileSync(LOG, 'utf8').split(/\r?\n/)) {
    if (!linje.startsWith(dag)) continue;
    const m = /^\S+ (\w+): godkendt (\d+)/.exec(linje);
    if (m && +m[2] > 0) tæller[m[1]] = (tæller[m[1]] || 0) + +m[2];
  }
}

/* Sandheden er forskellen mellem den udgivne tælling (docs/antal.json, som følger med
   hver udgivelse) og puljerne nu. Dubletter, der frasorteres ved indlæsning, tælles
   derfor ikke med – i modsætning til ingest.log, som tæller rå godkendelser. */
const FØR = path.join(ROD, 'docs', 'antal.json');
try { cp.execFileSync('node', [path.join(ROD, 'tools', 'hent_ci_filer.js'), '--med-tal'], { stdio: 'inherit' }); }
catch (e) { console.log('kunne ikke hente CI-filer fra main: ' + e.message); }
let gammel = null;
try { gammel = JSON.parse(fs.readFileSync(FØR, 'utf8')); } catch (e) {}
cp.execFileSync('node', [path.join(ROD, 'tools', 'antal.js')], { stdio: 'inherit' });
const ny = JSON.parse(fs.readFileSync(FØR, 'utf8'));

let iAlt = 0;
if (gammel && gammel.puljer) {
  for (const k of Object.keys(tæller)) delete tæller[k];
  for (const k of new Set([...Object.keys(gammel.puljer), ...Object.keys(ny.puljer)])) {
    const d = (ny.puljer[k] || 0) - (gammel.puljer[k] || 0);
    if (d > 0) { tæller[k] = d; iAlt += d; }
  }
}
if (!iAlt) iAlt = Object.values(tæller).reduce((a, b) => a + b, 0);
if (!iAlt) { console.log('ingen nye spørgsmål i dag – ingen udgivelse'); process.exit(0); }

const dele = Object.entries(tæller).sort((a, b) => b[1] - a[1])
  .map(([p, n]) => (NAVNE[p] || p) + ' (' + n + ')').join(', ');
let noter = '### Tilføjet\n- **' + iAlt + ' nye spørgsmål og kort** fordelt på: ' + dele + '.\n';

/* Nye spil siden sidste udgivelse nævnes ved navn. */
if (gammel && gammel.spilNavne) {
  const nye = Object.entries(ny.spilNavne || {}).filter(([id]) => !(id in gammel.spilNavne));
  if (nye.length) noter += '- **Nye spil:** ' + nye.map(([, t]) => t).join(' · ') + '.\n';
}
fs.writeFileSync(path.join(ROD, 'docs', 'udgivelsesnoter.md'), noter, 'utf8');

/* Kadence-status (mindste pulje/aldersgruppe) skrives af antal.js – vis den her. */
try {
  const s = JSON.parse(fs.readFileSync(path.join(ROD, 'docs', 'puljestatus.json'), 'utf8'));
  console.log('puljestatus: mindste pulje har ' + s.min + ' (over200=' + s.over200 + ', over300=' + s.over300 + ')');
} catch (e) { console.log('kunne ikke læse puljestatus: ' + e.message); }
console.log('noter:\n' + noter);

try {
  cp.execFileSync(GIT, ['-C', ROD, 'add', '-A'], { stdio: 'inherit' });
  cp.execFileSync(GIT, ['-C', ROD, 'commit', '-m', 'Nye spørgsmål: ' + iAlt + ' (' + dag + ')'], { stdio: 'inherit' });
} catch (e) { console.log('intet at committe'); }
cp.execFileSync('node', [path.join(ROD, 'tools', 'genskab_main.js'), 'Nye spørgsmål: ' + iAlt], { stdio: 'inherit' });

/* Tøm noterne, så de ikke bliver genbrugt (og dermed dubleret) ved næste udgivelse. */
try {
  fs.writeFileSync(path.join(ROD, 'docs', 'udgivelsesnoter.md'), '', 'utf8');
  cp.execFileSync(GIT, ['-C', ROD, 'add', 'docs/udgivelsesnoter.md']);
  cp.execFileSync(GIT, ['-C', ROD, 'commit', '-m', 'Tømmer udgivelsesnoter efter afsendelse'], { stdio: 'ignore' });
} catch (e) { /* intet at rydde */ }

/* GitHub-beskrivelsen (den HACS/Marketplace viser) følger indholdet. CI's egen token
   må ikke ændre den, så den opdateres herfra med udviklerens token. */
try { cp.execFileSync('python', [path.join(ROD, 'tools', 'opdater_beskrivelse.py')], { stdio: 'inherit' }); }
catch (e) { console.log('kunne ikke opdatere beskrivelsen: ' + e.message); }
console.log('sendt til GitHub – CI udgiver med noterne');



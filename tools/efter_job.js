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

if (!fs.existsSync(LOG)) { console.log('ingen ingest.log'); process.exit(0); }
const tæller = {};
for (const linje of fs.readFileSync(LOG, 'utf8').split(/\r?\n/)) {
  if (!linje.startsWith(dag)) continue;
  const m = /^\S+ (\w+): godkendt (\d+)/.exec(linje);
  if (m && +m[2] > 0) tæller[m[1]] = (tæller[m[1]] || 0) + +m[2];
}
const iAlt = Object.values(tæller).reduce((a, b) => a + b, 0);
if (!iAlt) { console.log('ingen nye spørgsmål i dag – ingen udgivelse'); process.exit(0); }

const dele = Object.entries(tæller).sort((a, b) => b[1] - a[1])
  .map(([p, n]) => (NAVNE[p] || p) + ' (' + n + ')').join(', ');
const noter = '### Tilføjet\n- **' + iAlt + ' nye spørgsmål og kort** fordelt på: ' + dele + '.\n';
fs.writeFileSync(path.join(ROD, 'docs', 'udgivelsesnoter.md'), noter, 'utf8');

/* Status til CI: hvor stor er den mindste (pulje, aldersgruppe) lige nu?
   <200 = daglig udgivelse, >=200 = hver 3. dag, >=300 = ugentligt. */
try {
  const st = JSON.parse(fs.readFileSync(path.join(TOOLS, 'state', 'daily_store.json'), 'utf8'));
  const grupper = [[3, 5], [6, 8], [9, 11], [12, 14]];
  let min = Infinity; const detaljer = {};
  for (const [p, liste] of Object.entries(st)) {
    for (const [a, b] of grupper) {
      const n = (liste || []).filter(x => { const al = x.item && x.item.age; return typeof al === 'number' && al >= a && al <= b; }).length;
      detaljer[p + ':' + a + '-' + b] = n;
      if (n < min) min = n;
    }
  }
  fs.writeFileSync(path.join(ROD, 'docs', 'puljestatus.json'),
    JSON.stringify({ min, detaljer, over200: min >= 200, over300: min >= 300, opdateret: new Date().toISOString() }, null, 1));
  console.log('puljestatus: mindste pulje har ' + min + ' (over200=' + (min >= 200) + ', over300=' + (min >= 300) + ')');
} catch (e) { console.log('kunne ikke skrive puljestatus: ' + e.message); }
console.log('noter:\n' + noter);

try {
  cp.execFileSync(GIT, ['-C', ROD, 'add', '-A'], { stdio: 'inherit' });
  cp.execFileSync(GIT, ['-C', ROD, 'commit', '-m', 'Nye spørgsmål: ' + iAlt + ' (' + dag + ')'], { stdio: 'inherit' });
} catch (e) { console.log('intet at committe'); }
cp.execFileSync('node', [path.join(ROD, 'tools', 'genskab_main.js'), 'Nye spørgsmål: ' + iAlt], { stdio: 'inherit' });
console.log('sendt til GitHub – CI udgiver med noterne');

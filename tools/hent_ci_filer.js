const fs = require('fs'), cp = require('child_process'), path = require('path');
const ROD = path.join(__dirname, '..');
const GIT = process.env.GIT || (fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe') ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git');
// Filer som CI selv skriver ved hver udgivelse. Lokale kopier bliver hurtigt forældede,
// og en synkronisering må ikke rulle CI's version, changelog eller README tilbage.
const ALTID = [
  'CHANGELOG.md',
  'README.md',
  'custom_components/hyggespil/manifest.json',
  'custom_components/hyggespil/www/hs-cfg.js',
];
// Tællingerne skrives af tools/antal.js; hent dem kun, når de skal bruges som sammenligningsgrundlag.
const TAL = ['docs/antal.json', 'docs/puljestatus.json'];
const FILER = process.argv.includes('--med-tal') ? ALTID.concat(TAL) : ALTID;

(async () => {
  const ændret = [];
  for (const f of FILER) {
    const r = await fetch(`https://raw.githubusercontent.com/allanpersson/hyggespil/main/${f}`);
    if (!r.ok) { console.log('findes ikke på main endnu: ' + f); continue; }
    const ny = await r.text();
    const p = path.join(ROD, f);
    const gammel = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    if (gammel === ny) continue;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, ny, 'utf8');
    ændret.push(f);
  }
  if (!ændret.length) { console.log('de CI-styrede filer er allerede på niveau med main'); return; }
  cp.execFileSync(GIT, ['-C', ROD, 'add', ...ændret], { stdio: 'inherit' });
  try {
    cp.execFileSync(GIT, ['-C', ROD, 'commit', '-m', 'Henter CI-filer fra main'], { stdio: 'inherit' });
    console.log('hentet fra main: ' + ændret.join(', '));
  } catch (e) {
    console.log('filerne er hentet, men der var intet nyt at committe');
  }
})();

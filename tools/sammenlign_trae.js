// Sammenligner hver fil i git-HEAD med det, der ligger på GitHub. Kør: node tools/_træ.js [mønster]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'hyggespil', Accept: 'application/vnd.github.raw+json' };
const GIT = 'C:\\Program Files\\Git\\cmd\\git.exe';
const MØNSTER = process.argv[2] || '';
const g = a => cp.execSync(`"${GIT}" -C "${ROOT}" ${a}`, { maxBuffer: 1 << 28 });
(async () => {
  const filer = g('ls-tree -r HEAD --name-only').toString('utf8').split(/\r?\n/).filter(Boolean).filter(f => !MØNSTER || f.includes(MØNSTER));
  const afvig = [];
  for (const f of filer) {
    const lokal = g(`show HEAD:"${f.replace(/"/g, '\\"')}"`);
    const r = await fetch('https://api.github.com/repos/allanpersson/hyggespil/contents/' + f.split('/').map(encodeURIComponent).join('/') + '?ref=main', { headers: H });
    if (!r.ok) { afvig.push([f, 'FINDES IKKE (' + r.status + ')', lokal.length]); continue }
    const web = Buffer.from(await r.arrayBuffer());
    if (Buffer.compare(web, lokal) !== 0) afvig.push([f, 'indhold afviger', lokal.length + ' / ' + web.length]);
  }
  console.log(`sammenlignet ${filer.length} filer — ${afvig.length} afvigelser:`);
  for (const [f, hvorfor, størrelse] of afvig) console.log('  ' + f + '  [' + størrelse + ']  ' + hvorfor);
})();

/* Tjekker, at der ikke ligger hemmeligheder i det, der sendes til GitHub.
 *
 * Kør:
 *   node tools/tjek_hemmeligheder.js          # tjek arbejdstræet (filer der ikke er ignoreret)
 *   node tools/tjek_hemmeligheder.js --head   # tjek præcis den filsamling, der synkroniseres
 *
 * Bruges før synkronisering og i CI. Stopper med fejlkode, hvis noget ser hemmeligt ud.
 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROD = path.join(__dirname, '..');
const GIT = process.env.GIT || (fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe') ? 'C:\\Program Files\\Git\\cmd\\git.exe' : 'git');

const FORBUDTE_STIER = [
  /^tools\/secrets\//, /(^|\/)github\.json$/, /(^|\/)secrets\.json$/, /\.token$/, /(^|\/)\.env(\.|$)/,
  /(^|\/)id_rsa$/, /(^|\/)\.netrc$/,
];
const TOKEN = /gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const MAKS = 4 * 1024 * 1024;

const git = a => cp.execSync(`"${GIT}" -C "${ROD}" ${a}`, { maxBuffer: 1 << 28 });

function filer() {
  if (process.argv.includes('--head')) {
    return git('ls-tree -r -z HEAD --name-only').toString('utf8').split('\0').filter(Boolean);
  }
  return git('ls-files -z --cached --others --exclude-standard').toString('utf8').split('\0').filter(Boolean);
}

function indhold(f) {
  if (process.argv.includes('--head')) return git(`show HEAD:"${f.replace(/"/g, '\\"')}"`);
  return fs.readFileSync(path.join(ROD, f));
}

const fund = [];
for (const f of filer()) {
  if (FORBUDTE_STIER.some(r => r.test(f))) { fund.push(f + ' (filnavn)'); continue; }
  let buf;
  try { buf = indhold(f); } catch (e) { continue; }
  if (!buf || buf.length > MAKS) continue;
  const s = buf.toString('utf8');
  if (TOKEN.test(s)) fund.push(f + ' (token/private key i indholdet)');
}

if (fund.length) {
  console.error('STOP: disse filer må ikke deles:\n  ' + fund.join('\n  '));
  process.exit(1);
}
console.log('ingen hemmeligheder fundet (' + filer().length + ' filer tjekket)');

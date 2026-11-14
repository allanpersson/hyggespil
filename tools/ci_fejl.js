// Henter loggen fra den seneste fejlede "Daglig udgivelse"-kørsel.
// Kør: node tools/ci_fejl.js [antal]
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'x', Accept: 'application/vnd.github+json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const j = async p => (await (await fetch(G + p, { headers: H })).json());
const rense = s => s.replace(/\u001b\[[0-9;]*m/g, '');
(async () => {
  const n = +(process.argv[2] || 8);
  const runs = (await j('/actions/runs?per_page=' + n)).workflow_runs || [];
  const fejl = runs.filter(x => x.name === 'Daglig udgivelse' && x.conclusion === 'failure');
  if (!fejl.length) { console.log('Ingen fejlede udgivelses-kørsler blandt de sidste ' + n + ':\n' + runs.map(w => w.name + ' ' + w.status + '/' + w.conclusion).join('\n')); return }
  for (const w of fejl.slice(0, 2)) {
    console.log('\n=== ' + w.created_at + ' · ' + w.html_url);
    const jobs = (await j(w.jobs_url)).jobs || [];
    for (const job of jobs.filter(x => x.conclusion === 'failure')) {
      for (const st of job.steps || []) console.log('  ' + (st.conclusion || '-') + '  ' + st.name);
      const log = rense(await (await fetch(G + '/actions/jobs/' + job.id + '/logs', { headers: H, redirect: 'follow' })).text());
      const linjer = log.split('\n').map(x => x.replace(/^.*?\d{2}:\d{2}:\d{2}Z ?/, '').trim()).filter(x => x && !/^::/.test(x));
      console.log('\n--- de sidste 28 linjer ---\n' + linjer.slice(-28).map(x => '  ' + x.slice(0, 190)).join('\n'));
    }
  }
})();

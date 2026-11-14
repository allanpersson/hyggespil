// Detaljer om en bestemt kørsel. Kør: node tools/ci_koersel.js <run-id>
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'x', Accept: 'application/vnd.github+json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const j = async p => (await (await fetch(G + p, { headers: H })).json());
const rense = s => s.replace(/\u001b\[[0-9;]*m/g, '');
(async () => {
  const id = process.argv[2];
  const w = await j('/actions/runs/' + id);
  console.log(w.name + ' · ' + w.status + '/' + w.conclusion + ' · udløst af ' + w.event + ' · ' + w.head_sha.slice(0, 7));
  const jobs = (await j('/actions/runs/' + id + '/jobs')).jobs || [];
  for (const job of jobs) {
    console.log('\njob: ' + job.name + ' → ' + job.conclusion);
    for (const st of job.steps || []) console.log('   ' + (st.conclusion || '-').padEnd(10) + st.name);
    if (job.conclusion !== 'success') {
      const log = rense(await (await fetch(G + '/actions/jobs/' + job.id + '/logs', { headers: H, redirect: 'follow' })).text());
      const L = log.split('\n').map(x => x.replace(/^.{0,35}?(\d{2}:\d{2}:\d{2}Z)?/, '').trim()).filter(Boolean);
      console.log('  --- log (sidste 24) ---');
      for (const x of L.slice(-24)) console.log('    ' + x.slice(0, 190));
    }
  }
})();

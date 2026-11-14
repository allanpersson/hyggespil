// Viser de seneste workflows-kørsler (og loggen for den første fejl). Kør: node tools/ci.js [antal]
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const REPO = cfg.repo || 'allanpersson/hyggespil';
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'hyggespil-ci', Accept: 'application/vnd.github+json' };
const j = async u => await (await fetch(u, { headers: H })).json();
const rense = s => s.replace(/\u001b\[[0-9;]*m/g, '');
const v = t => (t.match(/##\[error\]([^\n]*)/g) || []).map(x => rense(x).slice(0, 220));
(async () => {
  const n = +(process.argv[2] || 5);
  const runs = (await j(`https://api.github.com/repos/${REPO}/actions/runs?per_page=${n}`)).workflow_runs || [];
  for (const w of runs) console.log(`${new Date(w.created_at).toISOString().slice(11, 19)}  ${w.name.padEnd(20)} ${String(w.status).padEnd(12)} ${w.conclusion || '-'}`);
  const fejl = runs.find(r => r.conclusion === 'failure');
  if (!fejl) return console.log('\nIngen fejl i de seneste kørsler.');
  console.log('\n=== fejl: ' + fejl.name + ' — ' + fejl.html_url);
  const jobs = (await j(fejl.jobs_url)).jobs || [];
  for (const job of jobs.filter(x => x.conclusion === 'failure')) {
    console.log('\njob: ' + job.name);
    for (const s of job.steps || []) if (s.conclusion === 'failure') console.log('  trin: ' + s.name);
    const r = await fetch(`https://api.github.com/repos/${REPO}/actions/jobs/${job.id}/logs`, { headers: H, redirect: 'follow' });
    if (!r.ok) { console.log('  log: HTTP ' + r.status); continue }
    const t = rense(await r.text());
    for (const l of v(t)) console.log('  ' + l);
    const i = t.lastIndexOf('Opret tag');
    if (i > 0) console.log('\n  --- omkring trinnet ---\n' + t.slice(i, i + 1400).split('\n').map(x => '  ' + x.replace(/^.*?\d{2}:\d{2}:\d{2}Z /, '').trim().slice(0, 190)).join('\n').slice(0, 2200));
  }
})();

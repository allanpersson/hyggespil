// Læser status og resultater af repositoryets workflows. Kør: node tools/ci_status.js [antal kørsler]
const fs = require('fs'), path = require('path');
const tok = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8')).token.trim();
const H = { Authorization: 'Bearer ' + tok, 'User-Agent': 'hyggespil-ci', Accept: 'application/vnd.github+json' };
const j = async p => { const r = await fetch('https://api.github.com' + p, { headers: H }); return { s: r.status, b: await r.json().catch(() => null) } };
(async () => {
  const n = +(process.argv[2] || 6);
  const runs = (await j(`/repos/allanpersson/hyggespil/actions/runs?per_page=${n}`)).b.workflow_runs || [];
  for (const w of runs) {
    console.log(`\n=== ${w.name} · ${w.status}/${w.conclusion} · ${w.event} · ${new Date(w.created_at).toISOString().slice(0, 16)}Z`);
    console.log('    ' + w.html_url);
    const jobs = (await j(`/actions/runs/${w.id}/jobs`)).b;
    for (const job of (jobs && jobs.jobs) || []) {
      console.log(`  ${job.conclusion || job.status}  ${job.name}`);
      for (const st of job.steps || []) if (st.conclusion === 'failure') console.log('      .fejlende trin: ' + st.name);
      if (job.conclusion === 'failure') {
        const log = await fetch(job.log_url, { headers: H });
        const t = await log.text();
        const fejl = t.split('\n').filter(l => /Error|error:|HACS|hassfest|failed|FAIL|invalid/i.test(l)).slice(-8);
        console.log(feil.map(l => '        ' + l.replace(/\u001b\[[0-9;]*m/g, '').trim().slice(0, 170)).join('\n'));
      }
    }
  }
})();

// Henter loggen for det fejlende trin i en körsel (rundfräker "Post job cleanup"-stöjen).
// Kqr: node tools/ci_trin.js <run-id>
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'x', Accept: 'application/vnd.github+json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const rense = s => s.replace(/\u001b\[[0-9;]*m/g, '');
(async () => {
  const id = process.argv[2];
  const jobs = (await (await fetch(G + '/actions/runs/' + id + '/jobs', { headers: H })).json()).jobs || [];
  for (const job of jobs.filter(j => j.conclusion === 'failure')) {
    const txt = rense(await (await fetch(G + '/actions/jobs/' + job.id + '/logs', { headers: H, redirect: 'follow' })).text());
    const linjer = txt.split('\n');
    const start = linjer.findIndex(l => /Set up job|::group::Run Opret/.test(l));
    const merke = linjer.findIndex(l => /Opret udgivelse med zip/.test(l));
    const hvorSomhelst = merke >= 0 ? merke : start;
    const del = linjer.slice(hvorSomhelst, hvorSomhelst + 55).map(x => x.replace(/^.{0,45}?(\d{2}:\d{2}:\d{2}Z)?\s?/, '').trim()).filter(Boolean);
    console.log('### ' + job.name);
    console.log(del.slice(0, 45).map(x => '  ' + x.slice(0, 200)).join('\n'));
  }
})();

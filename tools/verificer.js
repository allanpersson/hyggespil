// Tjekker hvad der faktisk ligger på GitHub: version, nøglefil, CI-status.
// Kør: node tools/_verifi.js
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const H = { Authorization: 'Bearer ' + cfg.token.trim(), 'User-Agent': 'hyggespil', Accept: 'application/vnd.github+json' };
const R = 'https://api.github.com/repos/allanpersson/hyggespil';
(async () => {
  const tree = (await (await fetch(R + '/git/trees/main?recursive=1', { headers: H })).json()).tree;
  const hemmelige = tree.filter(x => /secrets|\.token$/.test(x.path));
  console.log('filer på main: ' + tree.filter(x => x.type === 'blob').length + ' | hemmelige filer: ' + (hemmelige.map(x => x.path).join(', ') || 'INGEN ✓'));
  const m = await (await fetch(R + '/contents/custom_components/hyggespil/manifest.json?ref=main', { headers: { ...H, Accept: 'application/vnd.github.raw+json' } })).text();
  console.log('manifest på GitHub: version ' + JSON.parse(m).version);
  const c = await (await fetch(R + '/contents/custom_components/hyggespil/www/hs-cfg.js?ref=main', { headers: { ...H, Accept: 'application/vnd.github.raw+json' } })).text();
  console.log('hs-cfg på GitHub: ' + (/version:'([\w.\-]+)'/.exec(c) || [, '?'])[1]);
  const e = await (await fetch(R + '/contents/custom_components/hyggespil/www/ex_daily.js?ref=main', { headers: { ...H, Accept: 'application/vnd.github.raw+json' } })).text();
  console.log('ex_daily.js på GitHub: ' + e.length + ' bytes (lokal: ' + fs.statSync(path.join(__dirname, '..', 'custom_components/hyggespil/www/ex_daily.js')).size + ')');
  const runs = (await (await fetch(R + '/actions/runs?per_page=4', { headers: H })).json()).workflow_runs;
  for (const w of runs) console.log(`  CI: ${w.name} ${w.status}/${w.conclusion}`);
  const rel = await (await fetch(R + '/releases', { headers: H })).json();
  for (const r of rel) console.log(`  release ${r.tag_name} · prerelease=${r.prerelease} · assets: ${r.assets.map(a => a.name + ' ' + a.size + 'B').join(', ') || 'ingen'}`);
})();

// Rydder op: sletter den ved en fejl oprettede "0.1.0"-udgivelse og laver den rette prerelease ud fra CI's tag.
// Kbr: node tools/ryd_udgivelse.js [tag som skal udgives]
const fs = require('fs'), path = require('path'), cp = require('child_process');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'secrets', 'github.json'), 'utf8'));
const T = cfg.token.trim();
const H = { Authorization: 'Bearer ' + T, 'User-Agent': 'x', Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
const G = 'https://api.github.com/repos/allanpersson/hyggespil';
const ROD = path.join(__dirname, '..');
const j = async (p, m = 'GET', b) => {
  const r = await fetch(G + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined });
  return { s: r.status, b: r.status === 204 ? null : await r.json().catch(() => null) };
};
(async () => {
  // 1) slet 0.1.0-udgivelsen (tagget beholder vi ikke — det var en fejl)
  const rels = (await j('/releases?per_page=40')).b || [];
  for (const r of rels.filter(x => x.tag_name === '0.1.0')) {
    console.log('sletter udgivelse ' + r.tag_name + ' (id ' + r.id + ')');
    await j('/releases/' + r.id, 'DELETE');
    const t = await j('/git/refs/tags/' + r.tag_name, 'DELETE');
    console.log('  tag slettet: HTTP ' + t.s);
  }
  // 2) lav den rette prerelease ud fra CI's seneste tag
  const tag = process.argv[2];
  if (!tag) { console.log('ingen tag angivet - holder os til oprydning'); return }
  const tags = (await j('/git/refs/tags')).b || [];
  const ref = tags.find(x => x.ref === 'refs/tags/' + tag);
  if (!ref) { console.log('tagget ' + tag + ' findes ikke'); return }
  if (rels.some(x => x.tag_name === tag)) { console.log('udgivelsen ' + tag + ' findes allerede'); return }
  const noter = ['## Hyggespil ' + tag, '', 'Se [CHANGELOG.md](https://github.com/allanpersson/hyggespil/blob/main/CHANGELOG.md) for hvad der er nyt.', '',
    'Hent: Indstillinger -> Marketplace -> Hyggespil -> Opdater, og genstart Home Assistant.',
    'Vises versionen ikke: slaa "Pre-release" til for repositoriet i Marketplace.'].join('\n');
  const op = await j('/releases', 'POST', { tag_name: tag, name: 'Hyggespil ' + tag, body: noter, prerelease: true, draft: false });
  console.log('release oprettet: HTTP ' + op.s + ' ' + ((op.b || {}).html_url || JSON.stringify(op.b).slice(0, 160)));
  if (op.s < 300) {
    cp.execSync(`python "${path.join(ROD, 'tools', 'make_zip.py')}" "${path.join(ROD, 'udg')}"`, { stdio: 'inherit' });
    const data = fs.readFileSync(path.join(ROD, 'udg', 'hyggespil.zip'));
    const r = await fetch(`https://uploads.github.com/repos/allanpersson/hyggespil/releases/${op.b.id}/assets?name=hyggespil.zip`, {
      method: 'POST', headers: { ...H, 'Content-Type': 'application/zip', 'Content-Length': data.length }, body: data });
    const b = await r.json().catch(() => ({}));
    console.log('zip: HTTP ' + r.status + ' ' + (b.browser_download_url || JSON.stringify(b).slice(0, 120)));
  }
})();

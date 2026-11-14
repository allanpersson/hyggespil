#!/usr/bin/env node
// Dagens automatiske udgivelse: hvis natjobberne har ændret spillets indhold, bygges en ny prerelease.
//
//   node tools/auto_release.js          – kør (brugt af Opgavestyringen)
//   node tools/auto_release.js --tør   – vis hvad der ville ske, uden at ændre noget
//
// Rækken er: diff i www/ → bump_version → CHANGELOG → git commit → update_remote → release.js.
// Kører kun, når der faktisk er nyt indhold; ellers afsluttes med "ingen ændringer".
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const TØR = process.argv.includes('--tør');
const GIT = process.env.GIT_EXE || 'C:\\Program Files\\Git\\cmd\\git.exe';
const LOG = path.join(ROOT, 'tools', 'auto_release.log');
const log = s => { const l = `${new Date().toISOString().slice(0, 19)} ${s}`; console.log(l); try { fs.appendFileSync(LOG, l + '\n') } catch (e) { } };
const run = (cmd, args) => {
  const r = cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
  return { ok: r.status === 0, ud: (r.stdout || '') + (r.stderr || ''), kode: r.status };
};
const git = a => run(GIT, ['-C', ROOT, ...a.split(' ').filter(Boolean)]);

function gitInit() {
  if (fs.existsSync(path.join(ROOT, '.git'))) return true;
  const s = ['init', '-b', 'main'];
  if (!TØR) git(s.join(' '));
  return fs.existsSync(path.join(ROOT, '.git'));
}

(async () => {
  log('auto_release starter' + (TØR ? ' (tør-kørsel)' : ''));
  if (!gitInit()) { log(' Ingen git (kunne ikke initialisere) – stopper'); process.exit(1) }
  const status = git('status --porcelain custom_components/hyggespil/www tools custom_components/hyggespil/manifest.json');
  const ændrede = (status.ud || '').split(/\r?\n/).filter(l => l.trim() && !/\.gitignore|auto_release/.test(l));
  if (!ændrede.length) { log('Ingen ændringer i spillets filer – ingen udgivelse.'); return }
  log('Ændret indhold (' + ændrede.length + ' filer):\n  ' + ændrede.map(l => l.trim()).join('\n  '));
  const prøve = git('diff --stat -- custom_components/hyggespil/www');
  log(prøve.ud.trim().split('\n').slice(-4).join('\n'));

  if (TØR) { log('Tør-kørsel: stoppede før bump/commit/udgivelse.'); return }

  // hvad er ændret? (til CHANGELOG-teksten)
  const navne = ændrede.map(l => l.replace(/^\s*\w+\s+/, '').replace('custom_components/hyggespil/www/', '').replace('custom_components/hyggespil/', ''));
  const fakta = navne.filter(n => /^(ex_daily|vf2|vf|extra)\./.test(n));
  const kort = navne.filter(n => /^(p\d|q\d|k1|data\d?|dx|sm|pv)\./.test(n));
  const kode = navne.filter(n => !fakta.includes(n) && !kort.includes(n));
  const punkter = [];
  if (fakta.length) punkter.push('Nye og kildekontrollerede spørgsmål/opgaver er kommet i puljerne (' + fakta.join(', ') + ').');
  if (kort.length) punkter.push('Rettelser og nyt i spillets kort (' + kort.join(', ') + ').');
  if (kode.length) punkter.push('Ændringer i spillets kode: ' + kode.join(', ') + '.');

  const b = run('python', [path.join('tools', 'bump_version.py'), '--skriv']);
  if (!b.ok) { log('bump_version fejlede: ' + b.ud.slice(-400)); process.exit(1) }
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'custom_components/hyggespil/manifest.json'), 'utf8')).version;
  log('Ny version: ' + version);

  // CHANGELOG: sæt ny sektion øverst
  const clPath = path.join(ROOT, 'CHANGELOG.md');
  const cl = fs.readFileSync(clPath, 'utf8');
  const i = cl.indexOf('\n## ');
  const dato = new Date().toISOString().slice(0, 10);
  const indsat = cl.slice(0, i + 1) + `\n## ${version} – ${dato}\n\n` + punkter.map(p => '- ' + p).join('\n') + '\n' + cl.slice(i + 1);
  fs.writeFileSync(clPath, indsat);

  const tjek = run(process.execPath, [path.join('tools', 'build.js'), 'check']);
  if (!tjek.ok) { log('check fejlede – forttryder udgivelsen:\n' + tjek.ud.slice(-800)); process.exit(1) }

  git('add -A');
  const c = git('commit -m "Indhold ' + version + ' (automatisk daglig udgivelse)"');
  if (!c.ok) { log('commit fejlede: ' + c.ud.slice(-300)); process.exit(1) }
  const op = run(process.execPath, [path.join('tools', 'update_remote.js')]);
  log('upload: ' + (op.ud.split('\n').filter(x => /sendt|FEJL/.test(x)).join(' ') || '(ingen besked)'));
  const rel = run(process.execPath, [path.join('tools', 'release.js')]);
  log('release: ' + (rel.ud.split('\n').filter(x => /release|zip|tag|FEJL/.test(x)).join(' | ') || '(ingen besked)'));
  log('Færdig. Version ' + version + ' ligger på GitHub som prerelease – download den i Home Assistant under Indstillinger → Marketplace.');
})().catch(e => { log('FEJL: ' + (e && e.stack || e)); process.exit(1) });

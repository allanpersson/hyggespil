// Sætter basis-versionen i manifest.json (CI udleder beta-nummeret fra tags) og rydder op i CI-filer.
const fs = require('fs');
const path = require('path');
const ROD = path.join(__dirname, '..');

function omdøbManifest() {
  const p = path.join(ROD, 'custom_components/hyggespil/manifest.json');
  const mf = JSON.parse(fs.readFileSync(p, 'utf8'));
  mf.version = '0.1.0';
  const sort = Object.keys(mf).filter(k => k !== 'domain' && k !== 'name').sort();
  const række = ['domain', 'name'].concat(sort);
  const ud = {};
  for (const k of række) ud[k] = mf[k];
  fs.writeFileSync(p, JSON.stringify(ud, null, 2) + '\n');
  console.log('manifest.version = ' + ud.version + ' (basis – CI sætter beta-nummer)');
}

function letmpVersionstjek() {
  const p = path.join(ROD, 'tools/build.js');
  let s = fs.readFileSync(p, 'utf8');
  const gammelt = 'if (v.manifest !== v.game)';
  if (s.includes(gammelt)) {
    s = s.replace(gammelt, 'if (!String(v.game).startsWith(v.manifest))');
    s = s.replace('VERSION: manifest.json (${v.manifest}) != www/hs-cfg.js (${v.game})',
      'VERSION: ${v.game} er ikke bygget på basis ${v.manifest}');
    fs.writeFileSync(p, s);
    console.log('build.js: versionstjekket tillader nu beta-numre udledt af CI');
  } else console.log('build.js: versionstjekket er allerede lempet');
}

function nulstilSpilletVersion() {
  const p = path.join(ROD, 'custom_components/hyggespil/www/hs-cfg.js');
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/version:'[\w.\-]+'/, "version:'0.1.0'");
  fs.writeFileSync(p, s);
  console.log('hs-cfg.js: ' + (/version:'([\w.\-]+)'/.exec(s) || [, '?'])[1] + ' (CI overskriver ved hver udgivelse)');
}

function fjernOverflødige() {
  for (const f of ['.github/workflows/udgiv-zip.yml', 'tools/auto_release.js', 'tools/klar_udgivelse.js']) {
    const p = path.join(ROD, f);
    try { fs.rmSync(p); console.log('fjernet: ' + f) } catch (e) { console.log('findes ikke: ' + f) }
  }
}

function pathsIgnore() {
  const p = path.join(ROD, '.github/workflows/validate.yml');
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('paths-ignore')) { console.log('validate.yml: paths-ignore er der allerede'); return }
  s = s.replace('  push:\n    branches: [main]\n', "  push:\n    branches: [main]\n    paths-ignore:\n      - 'CHANGELOG.md'\n      - 'custom_components/hyggespil/www/hs-cfg.js'\n");
  fs.writeFileSync(p, s);
  console.log('validate.yml: springer over CI\'s egne versions-commits');
}

omdøbManifest();
letmpVersionstjek();
nulstilSpilletVersion();
fjernOverflødige();
pathsIgnore();

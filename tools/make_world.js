// Genererer det flade reservekort (www/world.js) ud fra globus-dataene (www/world3d.js).
// Kør: node tools/make_world.js
// Kilde for begge filer: Natural Earth 1:50m (land, søer, floder) – public domain, naturalearthdata.com.
// Projektion i world.js: x = længdegrad + 180, y = 90 − breddegrad (samme som svgMap i ext.js).
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..', 'custom_components', 'hyggespil', 'www');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, 'world3d.js'), 'utf8'), ctx);
const MIN_SIZE = 1.2, MIN_STEP = 0.45;   // grader: spring småøer over og tynd punkterne ud
let d = '', rings = 0, pts = 0;
for (const ring of ctx.window.W3D.land) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < ring.length; i += 2) { x0 = Math.min(x0, ring[i]); x1 = Math.max(x1, ring[i]); y0 = Math.min(y0, ring[i + 1]); y1 = Math.max(y1, ring[i + 1]) }
  if (x1 - x0 < MIN_SIZE && y1 - y0 < MIN_SIZE) continue;
  const out = []; let lx = 1e9, ly = 1e9;
  for (let i = 0; i < ring.length; i += 2) {
    const x = ring[i], y = ring[i + 1], last = i >= ring.length - 2;
    if (!last && Math.hypot(x - lx, y - ly) < MIN_STEP) continue;
    out.push((Math.round((x + 180) * 10) / 10) + ' ' + (Math.round((90 - y) * 10) / 10)); lx = x; ly = y;
  }
  if (out.length < 4) continue;
  d += 'M' + out.join('L') + 'Z'; rings++; pts += out.length;
}
const head = '/* Fladt reservekort (bruges kun uden WebGL). Kilde: Natural Earth 1:50m, public domain. Genereret af tools/make_world.js. */\n';
fs.writeFileSync(path.join(DIR, 'world.js'), head + 'window.WORLD="' + d + '";\n');
console.log(`world.js: ${rings} landområder, ${pts} punkter, ${head.length + d.length + 18} bytes`);

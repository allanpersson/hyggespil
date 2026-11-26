/* Ordjagt: find så mange ord som muligt i et bogstavgitter – uden at få ordene.
 *
 * Let (9×9) → mellem (11×11) → svær (13×13) → ekstrem (15×15).
 * Point efter ordets sværhedsgrad: 1, 1, 2 eller 5.
 * Ordene ligger skjult i gitteret; man markerer dem ved at trykke første og sidste bogstav.
 */
(function () {
  if (window.__ordjagt) return;
  window.__ordjagt = true;

  const EN = () => (window.HSLANG || 'da') !== 'da';
  const NIVEAU = [
    { k: 'let', n: 9, pts: 1, max: 8 },
    { k: 'mellem', n: 11, pts: 1, max: 8 },
    { k: 'svaer', n: 13, pts: 2, max: 8 },
    { k: 'ekstrem', n: 15, pts: 5, max: 7 },
  ];
  const navn = i => EN()
    ? ['Easy', 'Medium', 'Hard', 'Extreme'][i]
    : ['Let', 'Mellem', 'Svær', 'Ekstrem'][i];

  const stil = document.createElement('style');
  stil.textContent = '.ojgrid{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:3px;margin:12px auto;max-width:min(94vw,560px);touch-action:manipulation}'
    + '.ojc{aspect-ratio:1;border-radius:7px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;font-weight:900;font-size:clamp(11px,2.5vw,18px);display:grid;place-items:center;padding:0;line-height:1}'
    + '.ojc.sel{background:#ffb703;color:#1b1340}'
    + '.ojc.fund{background:rgba(46,196,182,.35);border-color:#2ec4b6;color:#bff7ef}'
    + '.ojwords{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}'
    + '.ojw{padding:5px 10px;border-radius:999px;background:rgba(46,196,182,.25);border:1px solid #2ec4b6;font-weight:800;font-size:13px}'
    + '.ojlvl{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0 2px}';
  document.head.appendChild(stil);

  function bank() {
    const alle = window.HSORD || {};
    return (alle[(window.HSLANG || 'da') === 'en' ? 'en' : 'da']) || alle.da || {};
  }
  let ordbogCache = null;
  function ordbog() {
    if (ordbogCache) return ordbogCache;
    const m = new Map();
    const b = bank();
    NIVEAU.forEach((n, i) => (b[n.k] || []).forEach(w => m.set(w, NIVEAU[i].pts)));
    ordbogCache = m;
    return m;
  }
  const bland = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const bogstaver = () => (window.HSLANG === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ');
  const RET = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]];

  function placer(gitter, ord) {
    const n = gitter.length;
    for (let t = 0; t < 400; t++) {
      const d = RET[(Math.random() * RET.length) | 0];
      const r = (Math.random() * n) | 0, c = (Math.random() * n) | 0;
      const er = r + (ord.length - 1) * d[0], ec = c + (ord.length - 1) * d[1];
      if (er < 0 || er >= n || ec < 0 || ec >= n) continue;
      let ok = true;
      for (let i = 0; i < ord.length; i++) {
        const x = gitter[r + d[0] * i][c + d[1] * i];
        if (x && x !== ord[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < ord.length; i++) gitter[r + d[0] * i][c + d[1] * i] = ord[i];
      return true;
    }
    return false;
  }

  function byg() {
    const lvl = NIVEAU[g.oj.level] || NIVEAU[0];
    const kilde = (bank()[lvl.k] || []).filter(w => w.length <= lvl.n - 1);
    const gitter = Array.from({ length: lvl.n }, () => Array(lvl.n).fill(''));
    const skjulte = [];
    for (const w of bland(kilde)) {
      if (skjulte.length >= lvl.max) break;
      if (placer(gitter, w)) skjulte.push(w);
    }
    const alf = bogstaver();
    for (let r = 0; r < lvl.n; r++) for (let c = 0; c < lvl.n; c++) {
      if (!gitter[r][c]) gitter[r][c] = alf[(Math.random() * alf.length) | 0];
    }
    g.oj.grid = gitter;
    g.oj.skjulte = skjulte;
    g.oj.sel = [];
    g.oj.fundne = new Set();
    g.oj.fundneCeller = [];
    g.oj.fundetSkjulte = 0;
  }

  function vej(a, b) {
    const dr = b[0] - a[0], dc = b[1] - a[1];
    if (!dr && !dc) return null;
    if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return null;
    const st = Math.max(Math.abs(dr), Math.abs(dc));
    const sr = Math.sign(dr), sc = Math.sign(dc);
    const ud = [];
    for (let i = 0; i <= st; i++) ud.push([a[0] + sr * i, a[1] + sc * i]);
    return ud;
  }

  const ordAf = celler => celler.map(([r, c]) => g.oj.grid[r][c]).join('');

  function vaelg(r, c) {
    const oj = g.oj;
    if (oj.sel.length >= 2) oj.sel = [];
    if (!oj.sel.length) { oj.sel = [[r, c]]; return; }
    const a = oj.sel[0];
    if (a[0] === r && a[1] === c) { oj.sel = []; return; }
    const sti = vej(a, [r, c]);
    if (!sti) { oj.sel = [[r, c]]; return; }
    const tekst = ordAf(sti), omvendt = [...tekst].reverse().join('');
    const ord = ordbog().has(tekst) ? tekst : ordbog().has(omvendt) ? omvendt : '';
    if (!ord || oj.fundne.has(ord)) { oj.sel = [[r, c]]; return; }
    const pts = ordbog().get(ord) || 1;
    oj.fundne.add(ord);
    oj.fundneCeller = (oj.fundneCeller || []).concat(sti);
    if ((oj.skjulte || []).includes(ord)) oj.fundetSkjulte = (oj.fundetSkjulte || 0) + 1;
    try { add(oj.turn || 0, pts); } catch (e) {}
    try { boom(); } catch (e) {}
    if ((window.players || []).length > 1) oj.turn = ((oj.turn || 0) + 1) % window.players.length;
    oj.sel = [];
    render();
  }

  const knap = lvl => '<button class="btn' + (g.oj.level === lvl ? '' : ' ghost') + '" data-lvl="' + lvl + '" style="padding:6px 10px;border-radius:10px">'
    + navn(lvl) + ' · ' + NIVEAU[lvl].pts + '</button>';

  KINDS.ordjagt = {
    egen: true,
    init() {
      g.oj = g.oj || { level: 0, turn: 0, fundneCeller: [] };
      if (!g.oj.grid) byg();
    },
    render() {
      const oj = g.oj, n = oj.grid.length;
      const fundne = [...(oj.fundne || [])];
      const point = fundne.reduce((a, w) => a + (ordbog().get(w) || 1), 0);
      const alle = oj.skjulte && oj.fundetSkjulte >= oj.skjulte.length;
      const fundneCeller = new Set((oj.fundneCeller || []).map(x => x.join(',')));
      const sel = new Set((oj.sel || []).map(x => x.join(',')));
      return '<div class="card glass"><div class="row" style="justify-content:space-between">'
        + '<span class="tag">🔎 ' + (EN() ? 'Word hunt' : 'Ordjagt') + '</span>'
        + '<span class="tag">' + (EN() ? 'Found ' : 'Fundet ') + fundne.length + ' · ' + point + ' ' + (EN() ? 'points' : 'point') + '</span>'
        + '</div>'
        + '<div class="ojlvl">' + [0, 1, 2, 3].map(knap).join('') + '</div>'
        + '<p class="hint">' + (EN()
          ? 'Find words in the grid – across, down or diagonally. Tap the first and the last letter. The words are not shown.'
          : 'Find ordene i gitteret – vandret, lodret eller diagonalt. Tryk på det første og det sidste bogstav. Ordene vises ikke.') + '</p>'
        + '<div class="ojgrid" style="--n:' + n + '">' + oj.grid.map((række, r) => række.map((b, c) => {
          const key = r + ',' + c;
          return '<button class="ojc' + (fundneCeller.has(key) ? ' fund' : '') + (sel.has(key) ? ' sel' : '') + '" data-r="' + r + '" data-c="' + c + '">' + b + '</button>';
        }).join('')).join('') + '</div>'
        + (fundne.length ? '<div class="ojwords">' + fundne.map(w => '<span class="ojw">' + w + '</span>').join('') + '</div>' : '')
        + (alle ? '<p class="hint" style="color:#ffb703;font-weight:900">' + (EN() ? 'All hidden words found! 🎉' : 'Alle skjulte ord fundet! 🎉') + '</p>' : '')
        + '<div class="row"><button class="btn big green" id="ojny">' + (EN() ? 'New words' : 'Nye ord') + '</button></div>'
        + '</div>';
    },
    bind() {
      const m = document.getElementById('main');
      if (!m) return;
      m.querySelectorAll('[data-lvl]').forEach(b => b.onclick = () => {
        g.oj.level = +b.dataset.lvl;
        byg();
        render();
      });
      m.querySelectorAll('.ojc').forEach(b => b.onclick = () => {
        vaelg(+b.dataset.r, +b.dataset.c);
        render();
      });
      const ny = document.getElementById('ojny');
      if (ny) ny.onclick = () => { byg(); render(); };
    },
  };

  if (!GAMES.some(g => g.id === 'ordjagt')) {
    GAMES.push({
      id: 'ordjagt', grp: '🔤 Ordspil', key: '', kind: 'ordjagt',
      t: 'Ordjagt', d: 'Find så mange ord som muligt – let for børn til ekstremt svært',
      e: '🔎', g: 'linear-gradient(135deg,#0f766e,#f59e0b)', min: 1,
    });
  }
})();

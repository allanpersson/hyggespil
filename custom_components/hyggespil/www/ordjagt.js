/* Ordjagt: find så mange ord som muligt i et bogstavgitter.
 *
 * Let (9×9) → mellem (11×11) → svær (13×13) → ekstrem (15×15).
 * Point: let/mellem = 1, svær = 2, ekstrem = 5.
 * Ordene ligger vandret, lodret og diagonalt – også baglæns.
 */
(function () {
  if (window.__ordjagt) return;
  window.__ordjagt = true;

  /* tom pulje: spillet bruger ordbanken, men forsiden og røgtesten skal se en nøgle */
  if (!Array.isArray(DATA.ordjagt)) DATA.ordjagt = [];

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
    + '.ojw{padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);font-weight:800;font-size:13px}'
    + '.ojw.fund{background:rgba(46,196,182,.28);border-color:#2ec4b6;text-decoration:line-through;opacity:.8}'
    + '.ojlvl{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:4px 0 2px}';
  document.head.appendChild(stil);

  function bank() {
    const alle = window.HSORD || {};
    return (alle[(window.HSLANG || 'da') === 'en' ? 'en' : 'da']) || alle.da || {};
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
    const ord = [];
    for (const w of bland(kilde)) {
      if (ord.length >= lvl.max) break;
      if (placer(gitter, w)) ord.push(w);
    }
    const alf = bogstaver();
    for (let r = 0; r < lvl.n; r++) for (let c = 0; c < lvl.n; c++) {
      if (!gitter[r][c]) gitter[r][c] = alf[(Math.random() * alf.length) | 0];
    }
    g.oj.grid = gitter;
    g.oj.words = ord.map(w => ({ w, pts: lvl.pts, fundet: false }));
    g.oj.sel = [];
    g.oj.fundet = 0;
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

  function ordAf(celler) {
    return celler.map(([r, c]) => g.oj.grid[r][c]).join('');
  }

  function vaelg(r, c) {
    const oj = g.oj;
    if (oj.sel.length >= 2) oj.sel = [];
    if (!oj.sel.length) { oj.sel = [[r, c]]; return; }
    const a = oj.sel[0];
    if (a[0] === r && a[1] === c) { oj.sel = []; return; }
    const sti = vej(a, [r, c]);
    if (!sti) { oj.sel = [[r, c]]; return; }
    const tekst = ordAf(sti), omvendt = [...tekst].reverse().join('');
    const fundet = oj.words.find(o => !o.fundet && (o.w === tekst || o.w === omvendt));
    if (fundet) {
      fundet.fundet = true;
      oj.fundet++;
      oj.fundneCeller = (oj.fundneCeller || []).concat(sti);
      try { add(oj.turn || 0, fundet.pts); } catch (e) {}
      try { boom(); } catch (e) {}
      if ((window.players || []).length > 1) oj.turn = ((oj.turn || 0) + 1) % window.players.length;
      oj.sel = [];
      render();
      return;
    }
    oj.sel = [[r, c]];
  }

  function knap(lvl) {
    return '<button class="btn' + (g.oj.level === lvl ? '' : ' ghost') + '" data-lvl="' + lvl + '" style="padding:6px 10px;border-radius:10px">'
      + navn(lvl) + ' · ' + NIVEAU[lvl].pts + '</button>';
  }

  KINDS.ordjagt = {
    egen: true,
    init() {
      g.oj = g.oj || { level: 0, turn: 0, fundneCeller: [] };
      if (!g.oj.grid) byg();
    },
    render() {
      const oj = g.oj, n = oj.grid.length;
      const fundet = oj.words.filter(o => o.fundet).length;
      const point = oj.words.filter(o => o.fundet).reduce((a, o) => a + o.pts, 0);
      const alle = fundet === oj.words.length;
      const fundne = new Set((oj.fundneCeller || []).map(x => x.join(',')));
      const sel = new Set((oj.sel || []).map(x => x.join(',')));
      return '<div class="card glass"><div class="row" style="justify-content:space-between">'
        + '<span class="tag">🔎 ' + (EN() ? 'Word hunt' : 'Ordjagt') + '</span>'
        + '<span class="tag">' + (EN() ? 'Found ' : 'Fundet ') + fundet + '/' + oj.words.length + ' · ' + point + ' ' + (EN() ? 'points' : 'point') + '</span>'
        + '</div>'
        + '<div class="ojlvl">' + [0, 1, 2, 3].map(knap).join('') + '</div>'
        + '<p class="hint">' + (EN()
          ? 'Find the words in the grid – across, down or diagonally. Tap the first and the last letter.'
          : 'Find ordene i gitteret – vandret, lodret eller diagonalt. Tryk på det første og det sidste bogstav.') + '</p>'
        + '<div class="ojgrid" style="--n:' + n + '">' + oj.grid.map((række, r) => række.map((b, c) => {
          const key = r + ',' + c;
          return '<button class="ojc' + (fundne.has(key) ? ' fund' : '') + (sel.has(key) ? ' sel' : '') + '" data-r="' + r + '" data-c="' + c + '">' + b + '</button>';
        }).join('')).join('') + '</div>'
        + '<div class="ojwords">' + oj.words.map(o => '<span class="ojw' + (o.fundet ? ' fund' : '') + '">' + o.w + ' <b>+' + o.pts + '</b></span>').join('') + '</div>'
        + (alle ? '<p class="hint" style="color:#ffb703;font-weight:900">' + (EN() ? 'All words found! 🎉' : 'Alle ord fundet! 🎉') + '</p>' : '')
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
      id: 'ordjagt', grp: '🔤 Ordspil', key: 'ordjagt', kind: 'ordjagt',
      t: 'Ordjagt', d: 'Find så mange ord som muligt – let for børn til ekstremt svært',
      e: '🔎', g: 'linear-gradient(135deg,#0f766e,#f59e0b)', min: 1,
    });
  }
})();

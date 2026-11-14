/* Hyggespil: to nye quiz-typer – «Græker eller sygdom» og fodboldquiz (4 svarmuligheder).
   Data ligger i gs.js (græker/sygdom) og fb.js (dansk og international fodbold). */
(function () {
  if (window.__quiz) return; window.__quiz = true;
  const esc = window.esc || (s => String(s));

  /* ---- Græker eller sygdom: item = [ord, 0=græsk 1=sygdom, forklaring] ---- */
  KINDS.grsyg = {
    init() { g.ph = 0; g.pick = null; },
    render() {
      const it = g.item || ['?', 0, ''];
      const ord = it[0], type = it[1], note = it[2];
      let o = '<div class="card glass"><div class="q">' + esc(ord) + '</div>'
        + '<p class="hint" style="margin-top:-6px">Er ordet en <b>græker</b> – eller en <b>sygdom</b>?</p>';
      if (g.ph === 0) {
        o += '<div class="row"><button class="btn big" id="gs0">🏛️ Græker</button>'
          + '<button class="btn big" id="gs1">🦠 Sygdom</button></div>';
      } else {
        const ok = g.pick === type;
        o += '<div class="ans" style="font-size:clamp(22px,4vw,34px)">' + (ok ? '✅ Rigtigt!' : '❌ Ikke helt') + '</div>'
          + '<p class="hint">' + (type === 0 ? 'Det er en græsk person eller gud.' : 'Det er navnet på en sygdom.') + '</p>'
          + (note ? '<p class="hint" style="text-align:left">' + esc(note) + '</p>' : '')
          + awardChips(1, -1)
          + '<div class="row" style="margin-top:10px"><button class="btn big green" id="nx">Næste →</button></div>';
      }
      return o + '</div>';
    },
    bind() {
      const $ = id => document.getElementById(id);
      [0, 1].forEach(i => { const b = $('gs' + i); if (b) b.onclick = () => { g.pick = i; g.ph = 1; render(); }; });
    },
  };

  /* ---- Fodboldquiz: item = [spørgsmål, [4 svar], indeks på rigtigt, forklaring] ---- */
  KINDS.mc4 = {
    init() { g.ph = 0; g.pick = null; },
    render() {
      const it = g.item || ['?', ['?'], 0, ''];
      const q = it[0], opts = it[1], a = it[2], note = it[3];
      let o = '<div class="card glass"><div class="q">' + esc(q) + '</div>';
      if (g.ph === 0) {
        o += '<div class="mid">' + opts.map((t, i) =>
          '<button class="btn opt" data-o="' + i + '" style="text-align:left">' + esc(t) + '</button>').join('') + '</div>';
      } else {
        o += '<div class="res">' + opts.map((t, i) =>
          '<span style="' + (i === a ? 'background:#2ec4b6;color:#06221f;font-weight:800' : (i === g.pick ? 'background:#e63946;color:#fff' : '')) + '">'
          + esc(t) + (i === a ? ' ✓' : (i === g.pick ? ' ✗' : '')) + '</span>').join('') + '</div>'
          + (note ? '<p class="hint">' + esc(note) + '</p>' : '')
          + awardChips(1, -1)
          + '<div class="row"><button class="btn big green" id="nx">Næste →</button></div>';
      }
      return o + '</div>';
    },
    bind() {
      document.querySelectorAll('#main [data-o]').forEach(b => {
        b.onclick = () => { g.pick = +b.dataset.o; g.ph = 1; render(); };
      });
    },
  };

  const tilføj = [
    { id: 'grsyg', grp: 'Gæt & quiz', key: 'grsyg', kind: 'grsyg', t: 'Græker eller sygdom',
      d: 'Et ord – er det en græsk person/gud eller en sygdom? (fx «Psoriasis» og «Platon»)',
      e: '🏛️', g: 'linear-gradient(135deg,#0d9488,#7c3aed)', min: 2 },
    { id: 'fbdk', grp: 'Gæt & quiz', key: 'fb_dk', kind: 'mc4', t: 'Dansk fodbold',
      d: 'Superliga, pokal og danske klubbers historie', e: '⚽', g: 'linear-gradient(135deg,#c8102e,#ffd166)', min: 2 },
    { id: 'fbint', grp: 'Gæt & quiz', key: 'fb_int', kind: 'mc4', t: 'International fodbold',
      d: 'VM, EM og Champions League – hvem vandt hvornår?', e: '🌍', g: 'linear-gradient(135deg,#1d4ed8,#22c55e)', min: 2 },
  ];
  tilføj.forEach(x => { if (!GAMES.some(y => y.id === x.id)) GAMES.push(x); });
})();

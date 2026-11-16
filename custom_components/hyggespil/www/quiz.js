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
      [0, 1].forEach(i => { const b = $('gs' + i); if (b) b.onclick = () => { g.pick = i; g.ph = 1; try { window.hsFeedback && window.hsFeedback(i === (g.item || [])[1] ? 'rigtig' : 'forkert'); } catch (e) {} render(); }; });
    },
  };

  /* ---- Fodboldquiz: item = [spørgsmål, [4 svar], indeks på rigtigt, forklaring] ---- */
  /* Tydelige svarkort: to kolonner på tablet, én på telefon, og stor kontrast ved afsløring. */
  const MCSS = '.mc4grid{display:grid;grid-template-columns:1fr;gap:12px;margin:16px 0}'
    + '@media(min-width:560px){.mc4grid{grid-template-columns:1fr 1fr}}'
    + '.mc4opt{display:flex;align-items:center;gap:12px;padding:15px 16px;border-radius:18px;text-align:left;font-size:17px;font-weight:700;'
    + 'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .15s,background .15s}'
    + '.mc4opt:hover{transform:translateY(-2px);background:rgba(255,255,255,.12)}'
    + '.mc4opt .k{flex:0 0 32px;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-weight:900;background:#8f6bff;color:#fff}'
    + '.mc4res{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0}'
    + '@media(min-width:560px){.mc4res{grid-template-columns:1fr 1fr}}'
    + '.mc4res .r{display:flex;align-items:center;gap:10px;padding:13px 15px;border-radius:16px;background:rgba(255,255,255,.05);'
    + 'border:1px solid rgba(255,255,255,.1);opacity:.5;font-weight:700}'
    + '.mc4res .r.korrekt{opacity:1;background:rgba(46,196,182,.22);border-color:#2ec4b6;box-shadow:0 0 26px rgba(46,196,182,.45);animation:mc4Pulse .9s ease-out 2}'
    + '.mc4res .r.fejl{opacity:1;background:rgba(230,57,70,.22);border-color:#e63946;animation:mc4Shake .45s ease-in-out}'
    + '.mc4res .r .k{flex:0 0 30px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.3);font-weight:900}'
    + '@keyframes mc4Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}'
    + '@keyframes mc4Shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(8px)}}';
  if (!document.getElementById('mc4-css')) {
    const s = document.createElement('style'); s.id = 'mc4-css'; s.textContent = MCSS; document.head.appendChild(s);
  }

  KINDS.mc4 = {
    init() { g.ph = 0; g.pick = null; },
    render() {
      const it = g.item || ['?', ['?'], 0, ''];
      /* både korte rækker [q, svar, indeks, note] og objekter {q, o, a, e} */
      const q = Array.isArray(it) ? it[0] : it.q;
      const opts = Array.isArray(it) ? it[1] : it.o;
      const a = Array.isArray(it) ? it[2] : it.a;
      const note = Array.isArray(it) ? it[3] : it.e;
      let o = '<div class="card glass"><div class="q">' + esc(q) + '</div>';
      if (g.ph === 0) {
        o += '<div class="mc4grid">' + opts.map((t, i) =>
          '<button class="mc4opt" data-o="' + i + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(t) + '</span></button>').join('') + '</div>';
      } else {
        o += '<div class="mc4res">' + opts.map((t, i) => {
          const korrekt = i === a, valgt = i === g.pick;
          return '<div class="r' + (korrekt ? ' korrekt' : valgt ? ' fejl' : '') + '">'
            + '<span class="k">' + (korrekt ? '✓' : valgt ? '✗' : 'ABCD'[i]) + '</span><span>' + esc(t) + '</span></div>';
        }).join('') + '</div>'
          + (note ? '<p class="hint">' + esc(note) + '</p>' : '')
          + awardChips(1, -1)
          + '<div class="row"><button class="btn big green" id="nx">Næste →</button></div>';
      }
      return o + '</div>';
    },
    bind() {
      document.querySelectorAll('#main [data-o]').forEach(b => {
        b.onclick = () => {
          g.pick = +b.dataset.o; g.ph = 1;
          const rigtigt = Array.isArray(g.item) ? g.item[2] : (g.item || {}).a;
          try { window.hsFeedback && window.hsFeedback(g.pick === rigtigt ? 'rigtig' : 'forkert'); } catch (e) {}
          render();
        };
      });
    },
  };

  const tilføj = [
    { id: 'grsyg', grp: 'Gæt & quiz', key: 'grsyg', kind: 'grsyg', t: 'Græker eller sygdom',
      d: 'Et ord – er det en græsk person/gud eller en latinsk sygdom?',
      e: '🏛️', g: 'linear-gradient(135deg,#0d9488,#7c3aed)', min: 2 },
    { id: 'fbdk', grp: 'Gæt & quiz', key: 'fb_dk', kind: 'mc4', t: 'Dansk fodbold',
      d: 'Superliga, pokal og danske klubbers historie', e: '⚽', g: 'linear-gradient(135deg,#c8102e,#ffd166)', min: 2 },
    { id: 'fbint', grp: 'Gæt & quiz', key: 'fb_int', kind: 'mc4', t: 'International fodbold',
      d: 'VM, EM og Champions League – hvem vandt hvornår?', e: '🌍', g: 'linear-gradient(135deg,#1d4ed8,#22c55e)', min: 2 },
    { id: 'reality', grp: 'Gæt & quiz', key: 'reality', kind: 'mc4', t: 'Dansk reality',
      d: 'Hvem vandt Paradise Hotel, X Factor og Vild med dans?', e: '📺', g: 'linear-gradient(135deg,#db2777,#f59e0b)', min: 2 },
  ];
  tilføj.forEach(x => { if (!GAMES.some(y => y.id === x.id)) GAMES.push(x); });
})();

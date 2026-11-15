/* Hyggespil: Hangman og Gæt og grimasser. */
(function () {
  if (window.__lege2) return; window.__lege2 = true;
  const esc = window.esc || (s => String(s));

  /* ---------------- Hangman ---------------- */
  const ORD = [
    ['ELEFANT', 'Dyr'], ['KOMPAS', 'Ting'], ['JORDBÆR', 'Frugt'], ['TROMPET', 'Musikinstrument'],
    ['SNEBOLD', 'Vinter'], ['KAFFE', 'Drik'], ['CYKEL', 'Transport'], ['LØVE', 'Dyr'],
    ['REGNBUE', 'Vejr'], ['SKILDPADDE', 'Dyr'], ['PANDEKAGE', 'Mad'], ['GUITAR', 'Musikinstrument'],
    ['FYRTÅRN', 'Bygning'], ['KAKAO', 'Drik'], ['PINGVIN', 'Dyr'], ['BLÆKSPRUTTE', 'Dyr'],
    ['SOMMERFUGL', 'Insekt'], ['JORDSKÆLV', 'Natur'], ['TEATER', 'Sted'], ['VANDFALD', 'Natur'],
  ];
  const ALF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'.split('');
  let hg = null;

  function hgNew() {
    const [ord, hint] = ORD[Math.floor(Math.random() * ORD.length)];
    hg = { ord, hint, gættet: new Set(), fejl: 0, slut: false, vandt: false };
  }

  KINDS.hangman = {
    init() { hgNew(); g.ph = 0; },
    render() {
      const ord = hg.ord, synlig = [...ord].map(c => (c === ' ' || hg.gættet.has(c) ? c : '_')).join(' ');
      let o = '<div class="card glass"><div class="q">🪢 Hangman</div>'
        + '<p class="hint">Kategori: ' + esc(hg.hint) + ' · ' + (6 - hg.fejl) + ' liv tilbage</p>'
        + '<div class="ans" style="letter-spacing:.18em;font-size:clamp(22px,5vw,38px)">' + esc(synlig) + '</div>';
      o += '<div style="display:flex;gap:4px;justify-content:center;margin:10px 0">'
        + Array.from({ length: 6 }, (_, i) => '<span style="width:14px;height:14px;border-radius:50%;background:' + (i < hg.fejl ? '#e63946' : '#2ec4b6') + '"></span>').join('') + '</div>';
      if (hg.slut) {
        o += '<div class="ans">' + (hg.vandt ? '🎉 Rigtigt!' : '💀 Desværre – ordet var ' + esc(ord)) + '</div>';
        if (hg.vandt) o += awardChips(1, -1);
        o += '<div class="row"><button class="btn big green" id="hgigen">Nyt ord</button></div>';
      } else {
        o += '<div class="mid" style="grid-template-columns:repeat(8,1fr)">'
          + ALF.map(c => '<button class="btn' + (hg.gættet.has(c) ? ' ghost' : '') + '" data-b="' + c + '" style="padding:8px 0;border-radius:10px"'
            + (hg.gættet.has(c) ? ' disabled' : '') + '>' + c + '</button>').join('') + '</div>';
      }
      return o + '</div>';
    },
    bind() {
      const igen = document.getElementById('hgigen');
      if (igen) igens();
      function igens() { igen.onclick = () => { hgNew(); render(); }; }
      document.querySelectorAll('#main [data-b]').forEach(b => {
        b.onclick = () => {
          const c = b.dataset.b;
          if (hg.gættet.has(c) || hg.slut) return;
          hg.gættet.add(c);
          if (!hg.ord.includes(c)) hg.fejl++;
          if (hg.fejl >= 6) { hg.slut = true; hg.vandt = false; }
          else if ([...hg.ord].every(ch => ch === ' ' || hg.gættet.has(ch))) { hg.slut = true; hg.vandt = true; boom(); }
          render();
        };
      });
    },
  };

  /* ---------------- Gæt og grimasser ---------------- */
  const GRIM = (DATA.char && DATA.char.length) ? DATA.char : [
    '(Let) Børste tænder', '(Let) Spise en is', '(Let) Køre bil', '(Mellem) Trække i land en fisk',
    '(Mellem) Være en ballon, der springer', '(Mellem) Gå på line', '(Svær) Være en magnet',
    '(Svær) Smelte som en snemand', '(Svær) Spille violin i et orkester',
  ];
  let gg = { kort: null, tid: 0, ur: null, travl: false };

  function ggNyt() {
    gg.kort = GRIM[Math.floor(Math.random() * GRIM.length)];
    gg.tid = 60; gg.travl = false;
    if (gg.ur) { clearInterval(gg.ur); gg.ur = null; }
  }

  KINDS.grimasse = {
    init() { gg = { kort: null, tid: 0, ur: null, travl: false }; ggNyt(); g.ph = 0; },
    render() {
      let o = '<div class="card glass"><div class="q">🎭 Gæt og grimasser</div>'
        + '<p class="hint">Vis kortet til én spiller – de andre gætter. Ingen lyde, kun krop og ansigt.</p>'
        + '<div class="ans" style="font-size:clamp(22px,4.5vw,36px)">' + esc(String(gg.kort || '')) + '</div>';
      if (gg.tid > 0 && gg.ur) o += '<div class="tm" id="tm">⏱ ' + gg.tid + ' sek</div>';
      o += '<div class="row" style="margin-top:10px">'
        + (gg.ur ? '<button class="btn" id="ggstop">Stop</button>' : '<button class="btn big" id="ggstart">Start 60 sek</button>')
        + '<button class="btn ghost" id="ggnyt">Nyt kort</button></div>';
      if (!gg.ur) o += '<p class="hint">Hvem gættede det? Giv et point:</p>' + awardChips(1, -1);
      return o + '</div>';
    },
    bind() {
      const $ = id => document.getElementById(id);
      if ($('ggnyt')) $('ggnyt').onclick = () => { ggNyt(); render(); };
      if ($('ggstart')) $('ggstart').onclick = () => {
        gg.tid = 60;
        gg.ur = setInterval(() => {
          gg.tid--;
          const el = document.getElementById('tm');
          if (el) el.textContent = '⏱ ' + gg.tid + ' sek';
          if (gg.tid <= 0) { clearInterval(gg.ur); gg.ur = null; render(); }
        }, 1000);
        render();
      };
      if ($('ggstop')) $('ggstop').onclick = () => {
        if (gg.ur) { clearInterval(gg.ur); gg.ur = null; }
        render();
      };
    },
  };

  GAMES.push(
    { id: 'hangman', grp: 'Party & leg', key: 'deep', kind: 'hangman', t: 'Hangman',
      d: 'Gæt ordet ét bogstav ad gangen – seks liv', e: '🪢', g: 'linear-gradient(135deg,#0f766e,#f59e0b)', min: 2 },
    { id: 'grimasse', grp: 'Party & leg', key: 'deep', kind: 'grimasse', t: 'Gæt og grimasser',
      d: 'Vis uden lyd – de andre gætter (60 sekunder)', e: '🎭', g: 'linear-gradient(135deg,#db2777,#7c3aed)', min: 2 },
  );
})();

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

  /* ---- galgen: streg for streg, og figuren falder om ved sidste fejl ---- */
  const HG_CSS = '#hgfig{transition:transform 1s cubic-bezier(.6,.05,.9,.4);transform-box:view-box;transform-origin:140px 82px}'
    + 'svg{overflow:visible}'
    + '#hgfig.doed{transform:rotate(82deg) translate(10px,26px)}'
    + '.hgdel{animation:hgInd .45s ease-out both}'
    + '@keyframes hgInd{from{opacity:0;stroke-dasharray:200;stroke-dashoffset:200}to{opacity:1;stroke-dasharray:200;stroke-dashoffset:0}}';
  function hgSvg() {
    const f = hg.fejl;
    const d = (n, s) => (f >= n ? s : '');
    return '<svg class="hgsvg" viewBox="0 0 200 240" style="width:min(240px,64vw);height:auto;display:block;margin:2px auto 6px" aria-label="galge">'
      + '<g stroke="#c9c3e6" stroke-width="6" stroke-linecap="round" fill="none">'
      + '<line x1="16" y1="224" x2="132" y2="224"/><line x1="54" y1="224" x2="54" y2="22"/>'
      + '<line x1="54" y1="22" x2="140" y2="22"/><line x1="140" y1="22" x2="140" y2="44"/>'
      + '</g>'
      + '<g id="hgfig" stroke="#ffd166" stroke-width="6" stroke-linecap="round" fill="none">'
      + d(1, '<circle class="hgdel" cx="140" cy="62" r="18"/>')
      + d(2, '<line class="hgdel" x1="140" y1="80" x2="140" y2="134"/>')
      + d(3, '<line class="hgdel" x1="140" y1="94" x2="116" y2="120"/>')
      + d(4, '<line class="hgdel" x1="140" y1="94" x2="164" y2="120"/>')
      + d(5, '<line class="hgdel" x1="140" y1="134" x2="120" y2="170"/>')
      + d(6, '<line class="hgdel" x1="140" y1="134" x2="160" y2="170"/>')
      + '</g>'
      + '<g stroke="#ffd166" stroke-width="4" fill="none">'
      + d(1, '<line class="hgdel" x1="134" y1="58" x2="134" y2="63"/><line class="hgdel" x1="146" y1="58" x2="146" y2="63"/>')
      + '</g></svg>';
  }

  KINDS.hangman = {
    init() { hgNew(); g.ph = 0; },
    render() {
      const ord = hg.ord, synlig = [...ord].map(c => (c === ' ' || hg.gættet.has(c) ? c : '_')).join(' ');
      let o = '<style>' + HG_CSS + '</style><div class="card glass"><div class="q">🪢 Hangman</div>'
        + '<p class="hint">Kategori: ' + esc(hg.hint) + ' · ' + (6 - hg.fejl) + ' liv tilbage</p>'
        + hgSvg()
        + '<div class="ans" style="letter-spacing:.18em;font-size:clamp(22px,5vw,38px)">' + esc(synlig) + '</div>';
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
      /* figuren får først «doed» efter indsættelsen, så faldet animeres */
      if (hg.slut && !hg.vandt) {
        const fig = document.getElementById('hgfig');
        if (fig) setTimeout(() => fig.classList.add('doed'), 60);
      }
      document.querySelectorAll('#main [data-b]').forEach(b => {
        b.onclick = () => {
          const c = b.dataset.b;
          if (hg.gættet.has(c) || hg.slut) return;
          hg.gættet.add(c);
          if (!hg.ord.includes(c)) hg.fejl++;
          if (hg.fejl >= 6) { hg.slut = true; hg.vandt = false; try { window.hsFeedback && window.hsFeedback('doed'); } catch (e) {} }
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

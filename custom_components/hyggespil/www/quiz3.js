/* Hyggespil: store quiz-familier med en undermenu.
 *
 * Forsiden viser ét kort pr. familie (Musikquiz, Filmquiz). Trykker man på det,
 * åbner en undermenu med årtier, genrer og særlige emner. De enkelte spil ligger
 * stadig i GAMES, men er markeret «skjult», så de ikke fylder forsiden.
 */
(function () {
  if (window.__quiz3) return; window.__quiz3 = true;
  const ANDROID = /^appassets\.androidplatform\.net$/.test(location.hostname) || /[?&]android=1/.test(location.search);

  const musik = [
    ['mus60', 'Musikquiz – 60’erne', 'Gæt kunstneren bag tresserhittene', '🎙️', '#7c3aed,#4c1d95'],
    ['mus70', 'Musikquiz – 70’erne', 'Hits og kunstnere fra 1970’erne', '🕺', '#f59e0b,#b45309'],
    ['mus80', 'Musikquiz – 80’erne', 'Synth, pop og 80’er-hits', '🎸', '#ec4899,#831843'],
    ['mus90', 'Musikquiz – 90’erne', 'Grunge, pop og 90’er-hits', '💿', '#06b6d4,#0e7490'],
    ['mus00', 'Musikquiz – 00’erne', 'Hits og stjerner fra 00’erne', '📱', '#8b5cf6,#312e81'],
    ['mus10', 'Musikquiz – 10’erne', 'Streamingtidens store hits', '🎧', '#f43f5e,#7f1d1d'],
    ['musdk', 'Musikquiz – kun dansk', 'Dansk musik gennem årene', '🇩🇰', '#dc2626,#7f1d1d'],
    ['mgp', 'Musikquiz – MGP', 'Dansk Melodi Grand Prix gennem årene', '🏆', '#eab308,#78350f'],
    ['bmgp', 'Musikquiz – Børne-MGP', 'Børnenes Melodi Grand Prix', '🧒', '#22c55e,#14532d'],
  ];
  const film = [
    ['film80', 'Filmquiz – 80’erne', 'Film og skurke fra 1980’erne', '📼', '#0ea5e9,#0c4a6e'],
    ['film90', 'Filmquiz – 90’erne', 'Blockbusters fra 1990’erne', '🎬', '#a855f7,#4c1d95'],
    ['film00', 'Filmquiz – 00’erne', 'Film fra 2000’erne', '🍿', '#f97316,#7c2d12'],
    ['film10', 'Filmquiz – 10’erne', 'Film og helte fra 2010’erne', '🎥', '#14b8a6,#134e4a'],
    ['filmdk', 'Filmquiz – dansk film', 'Dansk film gennem årene', '🇩🇰', '#ef4444,#7f1d1d'],
    ['harry', 'Filmquiz – Harry Potter', 'Bøgerne og filmene om troldmandsskolen', '⚡', '#6366f1,#1e1b4b'],
    ['kpop', 'Filmquiz – K-pop Demon Hunters', 'Den animerede film om K-pop og dæmoner', '🎤', '#d946ef,#4a044e'],
  ];
  const mere = [
    ['serier', 'Seriequiz', 'TV-serier gennem årene', '📺', '#3b82f6,#1e3a8a', '📺 Serier'],
    ['disney', 'Disneyquiz', 'Disneys klassikere gennem årene', '🏰', '#f472b6,#831843'],
    ['roller', 'Hvem spillede rollen?', 'Hvem spillede figuren?', '🎭', '#fbbf24,#92400e'],
  ];

  const lav = (key, t, d, e, g, grp) => ({
    id: key, key, grp, kind: 'mc4', t, d, e, min: 2,
    g: 'linear-gradient(135deg,' + g + ')', skjult: true,
  });

  const musikSpil = musik.map(([key, t, d, e, g]) => lav(key, t, d, e, g, '🎵 Musikquiz'));
  if (!ANDROID) musikSpil.push({
    id: 'musma', key: 'musma', grp: '🎵 Musikquiz', kind: 'musma',
    t: 'Hør og gæt (Music Assistant)',
    d: 'Afspiller et uddrag – kræver Music Assistant installeret',
    e: '🎧', min: 1, skjult: true, g: 'linear-gradient(135deg,#0ea5e9,#22c55e)',
  });
  const filmSpil = film.map(([key, t, d, e, g]) => lav(key, t, d, e, g, '🎬 Filmquiz'));
  const mereSpil = mere.map(([key, t, d, e, g, grp]) => lav(key, t, d, e, g, grp || '🎬 Filmquiz'));

  const alle = musikSpil.concat(filmSpil, mereSpil);
  alle.forEach(spil => { if (!GAMES.some(y => y.id === spil.id)) GAMES.push(spil); });
  const menuer = [
    {
      id: 'musikquiz', grp: '🎵 Musikquiz', kind: 'menu', t: 'Musikquiz',
      d: 'Vælg årti, dansk musik, MGP eller Børne-MGP',
      e: '🎵', min: 2, g: 'linear-gradient(135deg,#8b5cf6,#db2777)', sub: musikSpil,
    },
    {
      id: 'filmquiz', grp: '🎬 Filmquiz', kind: 'menu', t: 'Filmquiz',
      d: 'Vælg årti, dansk film, Harry Potter eller K-pop',
      e: '🎬', min: 2, g: 'linear-gradient(135deg,#0ea5e9,#7c3aed)', sub: filmSpil,
    },
  ];
  menuer.forEach(m => { if (!GAMES.some(y => y.id === m.id)) GAMES.push(m); });

  /* undermenuen på forsiden */
  const CSS = '.subgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:10px}'
    + '.subcard{display:flex;gap:12px;align-items:center;padding:14px;border-radius:16px;text-align:left;font-weight:800;'
    + 'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);transition:transform .15s,background .15s}'
    + '.subcard:hover{transform:translateY(-2px);background:rgba(255,255,255,.12)}'
    + '.subcard .e{font-size:26px;flex:0 0 34px;text-align:center}'
    + '.subcard .t{font-size:15px}.subcard .d{font-size:12px;opacity:.75;font-weight:600}';
  const stil = document.createElement('style'); stil.textContent = CSS; document.head.appendChild(stil);

  function undermenu(m) {
    const d = document.createElement('div');
    d.className = 'modal';
    d.style.zIndex = '75';
    d.innerHTML = '<div class="mbox" style="width:min(680px,100%);max-height:92vh;overflow:auto">'
      + '<h2 style="margin-top:0">' + m.e + ' ' + m.t + '</h2>'
      + '<p class="hint" style="text-align:left;margin-top:0">' + m.d + '</p>'
      + '<div class="subgrid">' + (m.sub || []).map(s => {
          const n = (window.DATA && window.DATA[s.key] || []).length;
          return '<button class="subcard" data-sub="' + s.id + '"><span class="e">' + s.e + '</span>'
            + '<span><span class="t">' + s.t + '</span><br><span class="d">' + (n ? n + ' i puljen' : s.d) + '</span></span></button>';
        }).join('') + '</div>'
      + '<div class="row" style="margin-top:16px"><button class="btn ghost" id="sub-luk">← Alle spil</button></div></div>';
    document.body.appendChild(d);
    d.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => {
      d.remove();
      window.start(b.dataset.sub);
    });
    d.querySelector('#sub-luk').onclick = () => d.remove();
    d.addEventListener('click', e => { if (e.target === d) d.remove(); });
  }

  /* forsiden kalder hsStart, så menuer får en undermenu i stedet for et spil */
  function snartModal(x, graense) {
    const n = (window.DATA[x.key] || []).length;
    const d = document.createElement('div');
    d.className = 'modal'; d.style.zIndex = '95';
    d.innerHTML = '<div class="mbox" style="width:min(480px,100%)">'
      + '<h2 style="margin-top:0">' + x.e + ' ' + x.t + '</h2>'
      + '<p class="hint" style="text-align:left">Dette spil er på vej. Der er <b>' + n + ' af ' + (graense + 1) +
      '</b> spørgsmål i puljen – det åbner, når der er over ' + graense + '.</p>'
      + '<p class="hint" style="text-align:left">Puljen udvides automatisk af de daglige job, så kig igen om et par dage.</p>'
      + '<div class="row" style="margin-top:14px"><button class="btn big green" id="snart-luk">Okay</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('#snart-luk').onclick = () => d.remove();
    d.addEventListener('click', e => { if (e.target === d) d.remove(); });
  }

  /* Standard for nye spil: «Kommer snart» indtil puljen har over 50 kort. */
  window.hsStart = function (id) {
    const x = (window.GAMES || []).find(g => g.id === id);
    const graense = x ? (x.kommerSnart != null ? x.kommerSnart : (x.ny ? 50 : 0)) : 0;
    if (x && graense && ((window.DATA[x.key] || []).length <= graense)) { snartModal(x, graense); return; }
    if (x && x.kind === 'menu') { undermenu(x); return; }
    if (window.hsAnker) window.hsAnker(id);
    window.start(id);
  };
})();

/* Julespil: fem nye spil under 🎄 Jul.
   De vises som «Kommer snart», indtil puljen har over 50 kort. */
(function () {
  if (window.__julspil) return; window.__julspil = true;

  const G = [
    ['julequiz', 'Julequiz', 'Juletraditioner, mad og nisser', '🎄', '#0f766e,#dc2626'],
    ['julekalender', 'Julekalender-quiz', 'TV-julekalendere gennem årene', '📺', '#7c3aed,#dc2626'],
    ['julesange', 'Julesange', 'Hvem synger – og hvem har skrevet den?', '🎵', '#b91c1c,#f59e0b'],
    ['julefilm', 'Julefilm', 'Fra Alene hjemme til Klaus', '🎬', '#1d4ed8,#dc2626'],
  ];
  const ALLE = G.map(([key, t, d, e, g]) => ({
    id: key, key, grp: '🎄 Jul', kind: 'mc4', t, d, e, min: 2,
    g: 'linear-gradient(135deg,' + g + ')', kommerSnart: 50,
  }));
  ALLE.push({
    id: 'julesjov', key: 'julesjov', grp: '🎄 Jul', kind: 'award',
    t: 'Julesjov', d: 'Sjove juleudfordringer til hele bordet', e: '🎅', min: 2,
    g: 'linear-gradient(135deg,#15803d,#dc2626)', kommerSnart: 50,
  });

  ALLE.forEach(x => { if (!GAMES.some(y => y.id === x.id)) GAMES.push(x); });

})();

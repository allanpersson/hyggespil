/* Gaming: ét samlet kort, der skifter mellem quizzerne og udfordringerne.
   Delspillene ligger stadig i GAMES (skjult), så mixet kan bruge dem. */
(function () {
  if (window.__gamingspil) return; window.__gamingspil = true;

  const G = [
    ['gamingquiz', 'Gamingquiz', 'Spil, figurer og branche', '🎮', '#7c3aed,#06b6d4'],
    ['konsolquiz', 'Konsol-quiz', 'Hvilket år kom konsollen?', '🕹️', '#0ea5e9,#1e1b4b'],
    ['spilnavn', 'Hvilket spil?', 'Vi beskriver – du gætter', '❓', '#f59e0b,#7c2d12'],
    ['gaminghistorie', 'Gaming-historie', 'Milesten fra Pong til i dag', '📜', '#14b8a6,#134e4a'],
  ];
  const ALLE = G.map(([key, t, d, e, g]) => ({
    id: key, key, grp: '🎮 Gaming', kind: 'mc4', t, d, e, min: 2,
    g: 'linear-gradient(135deg,' + g + ')', kommerSnart: 50, skjult: true,
  }));
  ALLE.push({
    id: 'gamingleg', key: 'gamingleg', grp: '🎮 Gaming', kind: 'award',
    t: 'Gaminglege', d: 'Sjove udfordringer for spillere', e: '🕹️', min: 2,
    g: 'linear-gradient(135deg,#7c3aed,#22c55e)', kommerSnart: 50, skjult: true,
  });

  ALLE.forEach(x => { if (!GAMES.some(y => y.id === x.id)) GAMES.push(x); });

  /* Ét samlet Gaming-kort. Antallet tælles af forsiden, når alle puljer er indlæst. */
  const KORT = {
    id: 'gamingmix', key: 'gamingquiz', grp: '🎮 Gaming', kind: 'mix',
    t: 'Gaming', d: 'Quiz og udfordringer fra hele gamingverdenen – skifter hver runde',
    e: '🎮', min: 2, g: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
    antalPuljer: ['gamingquiz', 'konsolquiz', 'spilnavn', 'gaminghistorie', 'gamingleg'],
  };
  const gammelt = GAMES.findIndex(x => x.id === 'gamingmix');
  if (gammelt >= 0) GAMES[gammelt] = KORT; else GAMES.push(KORT);
})();

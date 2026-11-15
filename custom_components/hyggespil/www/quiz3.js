/* Hyggespil: 19 nye quiz-spil – musik, film, serier og roller.
   De bruger samme mc4-visning som fodboldquizzen (store svarkort og tydelig afsløring).
   Puljerne er nye og udvides løbende af de daglige job. */
(function () {
  if (window.__quiz3) return; window.__quiz3 = true;

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

  const tilføj = [];
  for (const [key, t, d, e, g] of musik)
    tilføj.push({ id: key, key, grp: '🎵 Musikquiz', kind: 'mc4', t, d, e, min: 2, g: 'linear-gradient(135deg,' + g + ')' });
  for (const [key, t, d, e, g] of film)
    tilføj.push({ id: key, key, grp: '🎬 Filmquiz', kind: 'mc4', t, d, e, min: 2, g: 'linear-gradient(135deg,' + g + ')' });
  for (const [key, t, d, e, g, grp] of mere)
    tilføj.push({ id: key, key, grp: grp || '🎬 Filmquiz', kind: 'mc4', t, d, e, min: 2, g: 'linear-gradient(135deg,' + g + ')' });

  tilføj.forEach(x => { if (!GAMES.some(y => y.id === x.id)) GAMES.push(x); });
})();

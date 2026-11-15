/* Hyggespil: 19 nye quiz-spil – musik, film, serier og roller.
   De bruger samme mc4-visning som fodboldquizzen (store svarkort og tydelig afsløring).
   Puljerne er nye og udvides løbende af de daglige job. */
(function () {
  if (window.__quiz3) return; window.__quiz3 = true;

  const musik = [
    ['mus60', 'Musikquiz – 60’erne', 'Beatles, Dylan og sommeren 1967', '🎙️', '#7c3aed,#4c1d95'],
    ['mus70', 'Musikquiz – 70’erne', 'ABBA, Queen og disko', '🕺', '#f59e0b,#b45309'],
    ['mus80', 'Musikquiz – 80’erne', 'Michael Jackson, Madonna og synth', '🎸', '#ec4899,#831843'],
    ['mus90', 'Musikquiz – 90’erne', 'Nirvana, Spice Girls og boybands', '💿', '#06b6d4,#0e7490'],
    ['mus00', 'Musikquiz – 00’erne', 'Beyoncé, Rihanna og ringetoner', '📱', '#8b5cf6,#312e81'],
    ['mus10', 'Musikquiz – 10’erne', 'Adele, Ed Sheeran og streaming', '🎧', '#f43f5e,#7f1d1d'],
    ['musdk', 'Musikquiz – kun dansk', 'Gasolin’, Shu-bi-dua og Kim Larsen', '🇩🇰', '#dc2626,#7f1d1d'],
    ['mgp', 'Musikquiz – MGP', 'Dansk Melodi Grand Prix gennem årene', '🏆', '#eab308,#78350f'],
    ['bmgp', 'Musikquiz – Børne-MGP', 'Børnenes Melodi Grand Prix', '🧒', '#22c55e,#14532d'],
  ];
  const film = [
    ['film80', 'Filmquiz – 80’erne', 'E.T., Die Hard og Ghostbusters', '📼', '#0ea5e9,#0c4a6e'],
    ['film90', 'Filmquiz – 90’erne', 'Titanic, Matrix og Jurassic Park', '🎬', '#a855f7,#4c1d95'],
    ['film00', 'Filmquiz – 00’erne', 'Ringenes Herre, Nemo og Avatar', '🍿', '#f97316,#7c2d12'],
    ['film10', 'Filmquiz – 10’erne', 'Inception, Frost og Avengers', '🎥', '#14b8a6,#134e4a'],
    ['filmdk', 'Filmquiz – dansk film', 'Festen, Jagten og Druk', '🇩🇰', '#ef4444,#7f1d1d'],
    ['harry', 'Filmquiz – Harry Potter', 'Hogwarts, Hermione og Dødsregalierne', '⚡', '#6366f1,#1e1b4b'],
    ['kpop', 'Filmquiz – K-pop Demon Hunters', 'HUNTR/X, Saja Boys og «Golden»', '🎤', '#d946ef,#4a044e'],
  ];
  const mere = [
    ['serier', 'Seriequiz', 'Venner, Breaking Bad og Squid Game', '📺', '#3b82f6,#1e3a8a', '📺 Serier'],
    ['disney', 'Disneyquiz', 'Havfruen, Løvernes Konge og Frost', '🏰', '#f472b6,#831843'],
    ['roller', 'Hvem spillede rollen?', 'Skuespillere bag de kendte figurer', '🎭', '#fbbf24,#92400e'],
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

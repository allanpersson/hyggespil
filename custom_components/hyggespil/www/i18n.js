/* Hygge Games: sprog.
 *
 * Dansk er standardsproget. Engelsk er det første ekstra sprog; tysk og fransk
 * kan tilføjes i SPROG uden at ændre spillene. Indholdet ligger i puljer med
 * sprøgsuffiks (fx «tf_en»), så hvert sprog tælles og udvides for sig.
 */
(function () {
  if (window.HSI18N) return;

  const SPROG = {
    da: { navn: 'Dansk', kort: 'DA', html: 'da' },
    en: { navn: 'English', kort: 'EN', html: 'en' },
    de: { navn: 'Deutsch', kort: 'DE', html: 'de', klar: false },
    fr: { navn: 'Français', kort: 'FR', html: 'fr', klar: false },
  };
  let valgt = 'da';
  try {
    const g = localStorage.getItem('hs_lang');
    if (g && SPROG[g] && SPROG[g].klar !== false) valgt = g;
  } catch (e) {}

  const T = {
    da: {
      players: 'Spillere', suggest: 'Foreslå spørgsmål', newEvening: 'Ny aften',
      allGames: '← Alle spil', endGame: '🏁 Afslut spil', play: 'Spillere',
      total: (n) => `${n} spørgsmål, opgaver og kort i alt. Du får ikke samme kort igen, før hele puljen er brugt. Point gemmes, til du starter en ny aften.`,
      about: 'Om spillene', feedback: 'Generel feedback', support: 'Støt',
      coffee: 'Køb en kaffe', language: 'Sprog', settings: 'Indstillinger',
      comingSoon: 'Kommer snart', inPool: (n) => `${n} i puljen`,
      newPool: 'Nyt spil, puljen udvides løbende', playersMin: (n) => `${n}+ spillere`,
      solo: '1 spiller', moreEnglish: 'Flere spil kommer på engelsk.',
      level: 'Niveau', startGame: 'Start spil', cancel: 'Annuller', close: 'Luk',
      correct: 'Rigtigt!', wrong: 'Forkert', next: 'Næste', nextRound: 'Næste runde →', points: 'point',
      menu: 'Menu', close: 'Luk', groups: 'Grupper', running: 'Løbende stilling', continue: 'Fortsæt',
      finished: 'Afsluttet', paused: 'Afbrudt', pointsInGame: 'point i spillet', lessThanMin: 'under 1 min',
      guess: 'Gæt', revealAnswer: 'Afslør svaret! 🥁', showAnswer: 'Vis svaret', skip: 'Spring over',
      nextClue: 'Næste spor', givePoint: 'Giv point', nextNoPoint: 'Næste uden point →',
      reader: 'Oplæser', guessers: 'Gættere', lockBids: 'Lås bud 🔒', true: 'Sandt', false: 'Falsk',
      higher: 'højere', lower: 'lavere', middle: 'midt imellem', unit: 'Enhed', allGuess: 'Alle skriver deres gæt (skjult).',
    },
    en: {
      players: 'Players', suggest: 'Suggest a question', newEvening: 'New evening',
      allGames: '← All games', endGame: '🏁 End game', play: 'Players',
      total: (n) => `${n} questions, tasks and cards in total. You won't see the same card again until the whole pool has been used. Scores are saved until you start a new evening.`,
      about: 'About the games', feedback: 'General feedback', support: 'Support',
      coffee: 'Buy me a coffee', language: 'Language', settings: 'Settings',
      comingSoon: 'Coming soon', inPool: (n) => `${n} in the pool`,
      newPool: 'New game – the pool keeps growing', playersMin: (n) => `${n}+ players`,
      solo: '1 player', moreEnglish: 'More games are coming in English.',
      level: 'Level', startGame: 'Start game', cancel: 'Cancel', close: 'Close',
      correct: 'Correct!', wrong: 'Wrong', next: 'Next', nextRound: 'Next round →', points: 'points',
      menu: 'Menu', close: 'Close', groups: 'Groups', running: 'Running standings', continue: 'Continue',
      finished: 'Finished', paused: 'Paused', pointsInGame: 'points in game', lessThanMin: 'less than 1 min',
      guess: 'Guess', revealAnswer: 'Reveal the answer! 🥁', showAnswer: 'Show answer', skip: 'Skip',
      nextClue: 'Next clue', givePoint: 'Give point', nextNoPoint: 'Next without points →',
      reader: 'Reader', guessers: 'Guessers', lockBids: 'Lock guesses 🔒', true: 'True', false: 'False',
      higher: 'higher', lower: 'lower', middle: 'in between', unit: 'Unit', allGuess: 'Everyone writes a guess (hidden).',
    },
    de: {}, fr: {},
  };

  const GRP = {
    en: {
      '🎲 Random': '🎲 Random', 'Gæt & quiz': 'Guess & Quiz', 'Mysterie & hjernevrid': 'Mystery & Brainteasers',
      'Party & leg': 'Party & Play', 'Hygge & dybde': 'Hygge & Depth', 'Geografi & ord': 'Geography & Words',
      '🧒 Børn & unge': '🧒 Kids & Teens', 'Gæt & kvis': 'Guess & Quiz', '__h': 'More',
      '💀 Dødsspil': '💀 Deadly Games', '🔐 Kodespil': '🔐 Code Games', '🔤 Ordspil': '🔤 Word Games',
      '🧮 Tal & matematik': '🧮 Numbers & Maths', '🎵 Musikquiz': '🎵 Music Quiz', '🎬 Filmquiz': '🎬 Film Quiz',
      '📺 Serier': '📺 Series', '🎄 Jul': '🎄 Christmas', '🎮 Gaming': '🎮 Gaming',
      '🚦 Færdselsloven': '🚦 Traffic Rules', '🌍 Spil fra hele verden': '🌍 Games from Around the World',
    },
  };

  /* Engelske titler og beskrivelser. Nøglen er spillets id. */
  const GAME = {
    en: {
      mixall: ['Everything at once', 'A random question or challenge from all games – changes every round'],
      ffm: ['Bird, fish or in between', 'Two players guess a number – the rest judge higher, lower or in between'],
      est: ['Closest guess', 'Everyone guesses – the closest wins the point'],
      tf: ['True or false', 'Read the statement aloud – true or false?'],
      odd: ['Find the lie', 'Three statements are true, one is false – find the lie'],
      tl: ['What happened first?', 'Two events – which one came first?'],
      mys: ['Who did it?', 'Follow the clues and vote for the culprit'],
      riddle: ['Riddles', 'Classic riddles to solve together'],
      who: ['Who or what am I?', 'Clues one at a time – fewer clues, more points'],
      taboo: ['Forbidden words', 'Explain the word without saying the forbidden words'],
      char: ['Charades', 'Act it out without sound – the others guess'],
      rat: ['Would you rather', 'Two options – the table chooses'],
      lik: ['Most likely to…', 'Point at the person most likely to…'],
      nev: ['Never have I ever…', 'Take a sip if it applies to you'],
      dare: ['Drink challenges', 'Small challenges for the grown-ups'],
      deep: ['Deep conversations', 'Questions that go a little deeper'],
      rec: ['Weird records', 'Guess the record before the answer is revealed'],
      city: ['Which country?', 'A city is shown – which country is it in?'],
      pin: ['Pin the map', 'Place the pin where you think the place is'],
      zip: ['Postal code quiz', 'Danish postal codes – which town?'],
      weird: ['Strange words', 'What does the word mean?'],
      lang: ['Which language?', 'Where does the word come from?'],
      kwho: ['Which animal am I?', 'Animal clues for the youngest'],
      kmove: ['Act like the animal', 'Move like the animal – the others guess'],
      kriddle: ['Kids’ riddles', 'Small riddles for children'],
      kquiz: ['Kids’ quiz', 'Questions for children at their own level'],
      kchar: ['Kids’ charades', 'Act it out – the others guess'],
      kword: ['Words and rhymes', 'Rhymes, words and tongue twisters'],
      krather: ['What would you rather?', 'Two choices for the kids'],
      ktf: ['True or false (kids)', 'True or false for children'],
      kodd: ['What doesn’t belong?', 'Find the one that doesn’t fit'],
      kest: ['Count and guess', 'How many? Guess as a group'],
      klik: ['Most likely (kids)', 'Point at the one most likely to…'],
      mixkids: ['Random kids’ game', 'A random game from all kids’ games'],
      prov: ['Proverbs', 'Danish proverbs – choose or write the ending'],
      provc: ['Proverbs – choose', 'Choose the right ending'],
      provw: ['Proverbs – write', 'Write the missing words'],
      dx: ['Destination: where are we?', 'Guess the place from clues – watch out for decoys'],
      sm: ['The Taskmaster', 'Silly tasks at home – the Taskmaster gives 0–5 points'],
      wheel: ['Word wheel', 'Spin the wheel, guess letters and solve the phrase'],
      sqrl: ['Red light, green light', 'Classic children’s game with a twist'],
      sqglass: ['The glass bridge', 'Choose the right pane – or fall'],
      sqmarb: ['Marbles: odd or even', 'Hide marbles in your hand – odd or even?'],
      sqdal: ['Dalgona challenges', 'Carve the shape without breaking it'],
      sqdil: ['Grim choices', 'Difficult dilemmas with no easy answer'],
      sqwho: ['Who in the family?', 'Point at the family member who…'],
      cifsymbol: ['The Zodiac glyphs', 'Crack the symbols and read the words'],
      cifsvine: ['The grid cipher', 'Each letter is a corner or line in a grid'],
      cifbraille: ['The dot cells', 'Six dots make a letter'],
      ciffarver: ['The colours', 'Each colour is a letter – read the rainbow'],
      cifmorser: ['The Morse pipes', 'Short and long beeps make letters'],
      cifcaesar: ['Caesar’s letter', 'The alphabet is shifted – find the message'],
      cifspejl: ['Mirror writing', 'Read the text backwards'],
      cifkaede: ['The letter chain', 'The shift changes as you go'],
      ordlav: ['Make words', 'Form as many words as you can from the letters'],
      ordkaede: ['Word chain', 'The next word starts with the last letter'],
      ordtrappe: ['Word ladder', 'Change one letter at a time'],
      ordsplit: ['Split the word', 'Find the hidden words'],
      omvendt: ['Backwards', 'Say the word backwards'],
      rim: ['Rhymes', 'Find rhymes against the clock'],
      langst: ['Longest word', 'Who can make the longest word?'],
      stavboks: ['Spelling box', 'Spell the word – letter by letter'],
      staveling: ['Spelling bee', 'Spell the word aloud'],
      talgæt: ['What’s my number?', 'The screen thinks of a number – warm or cold?'],
      hovedregning: ['Mental maths', 'Solve it in your head – no pencil'],
      talrakket: ['Number sequence', 'Which number comes next?'],
      overslag: ['Estimate', 'How many? Estimate without counting'],
      procentleg: ['Percentages', 'How many percent?'],
      sanseprøve: ['The senses test', 'How many sweets are in the jar?'],
      uret: ['Clock & time', 'What time is it – or what time will it be?'],
      bogstavværdi: ['Letter values', 'A=1 … Z=26 – find the word’s value'],
      grsyg: ['Greek or disease?', 'Is the word Greek – or a disease?'],
      fbdk: ['Danish football', 'Danish clubs, players and history'],
      fbint: ['International football', 'Clubs, players and World Cups'],
      reality: ['Danish reality TV', 'Faces and moments from Danish reality shows'],
      musikquiz: ['Music quiz', 'Choose a decade or a theme'],
      filmquiz: ['Film quiz', 'Choose a decade or a theme'],
      julequiz: ['Christmas quiz', 'Christmas questions for the whole family'],
      julekalender: ['Christmas calendar quiz', 'Doors, traditions and Christmas TV'],
      julesange: ['Christmas songs', 'Danish Christmas songs and carols'],
      julefilm: ['Christmas films', 'Christmas films old and new'],
      julesjov: ['Christmas fun', 'Small Christmas challenges'],
      gamingmix: ['Gaming', 'Quiz and challenges from the world of games – changes every round'],
      flaske: ['Spin the bottle', 'The bottle points at…'],
      spk: ['S · P · K', 'Truth, percentage or consequence'],
      hangman: ['Hangman', 'Guess the word before the drawing is complete'],
      grimasse: ['Charades', 'Act it out – no sounds'],
      law: ['Danish laws & rules', 'Everyday rules and traffic law'],
      ftl_bil: ['Traffic law: car', 'Rules for drivers'],
      ftl_cykel: ['Traffic law: bicycle', 'Rules for cyclists'],
      ftl_fod: ['Traffic law: pedestrian', 'Rules for pedestrians'],
      ftl_andre: ['Traffic law: others', 'Rules for other road users'],
      ftl: ['Traffic law: everyone', 'Rules for all road users'],
      shiri: ['Shiritori', 'Japanese word chain'],
      yut: ['Yut Nori', 'Korean board game with sticks'],
      suit: ['Suit Jawa', 'Indonesian hand game'],
      shagai: ['Shagai', 'Mongolian knucklebone game'],
      inuit: ['Inuit winter games', 'Arctic sports in the living room'],
      lot: ['Lotería', 'Mexican picture bingo'],
    },
  };

  /* Spil der kun giver mening på dansk. Skjules på andre sprog. */
  const KUN_DA = new Set([
    'zip', 'law', 'ftl', 'ftl_bil', 'ftl_cykel', 'ftl_fod', 'ftl_andre',
    'fbdk', 'reality', 'julesange', 'ordlav', 'ordkaede', 'ordtrappe', 'ordsplit',
    'rim', 'langst', 'stavboks', 'staveling', 'prov', 'provc', 'provw', 'grsyg',
  ]);

  /* Korte UI-tekster i spil, der ikke selv bruger t(). Kun hele tekstknuder. */
  const MAP = {
    en: {
      'Gæt': 'Guess', 'Afslør svaret! 🥁': 'Reveal the answer! 🥁', 'Næste →': 'Next →',
      'Næste runde →': 'Next round →', 'Vis svaret': 'Show answer', 'Spring over': 'Skip',
      'Næste spor': 'Next clue', 'Giv point': 'Give point', 'Næste uden point →': 'Next without points →',
      'Ingen – næste →': 'Nobody – next →', 'Fortsæt': 'Continue', 'Grupper': 'Groups',
      'Sandt': 'True', 'Falsk': 'False', 'Lås bud 🔒': 'Lock guesses 🔒', 'Afslut spil': 'End game',
      'Alle spil': 'All games', 'Spillere': 'Players', 'Ny aften': 'New evening',
      'Foreslå spørgsmål': 'Suggest a question', 'Start spil': 'Start game', 'Annuller': 'Cancel',
      'Luk': 'Close', 'Tid pr. spørgsmål': 'Time per question', 'Hurtigt-svar-point': 'Quick-answer points',
      'Oplæsning': 'Read aloud', 'Musik': 'Music', 'Deltag': 'Join', 'Nyt rum': 'New room',
      'Ryd buzzere': 'Clear buzzers', 'Luk rum': 'Close room', 'Start runde': 'Start round',
      'Forlad rummet': 'Leave room', 'JEG VED DET!': 'I KNOW IT!', 'Hvem gættede rigtigt?': 'Who guessed right?',
      'Indstillinger': 'Settings', 'Hvad skal indstillingerne gælde for?': 'What should the settings apply to?',
      'Kun «dette spil»': 'This game only', 'Tid pr. spørgsmål': 'Time per question', 'Ingen': 'None',
      'Hurtigt-svar-point': 'Quick-answer points', 'Musik': 'Music', 'Ingen musik': 'No music',
      'Oplæsning': 'Read aloud', 'Opsæt stemme': 'Set up voice', 'Prøv stemmen': 'Test the voice',
      'Hastighed': 'Speed', 'Start spil': 'Start game', 'Luk': 'Close', 'Annuller': 'Cancel',
      'Spil sammen fra hver telefon': 'Play together from each phone', 'Rumkode': 'Room code',
      'Dit navn': 'Your name', 'Deltag': 'Join', 'Nyt rum': 'New room', 'Start runde': 'Start round',
      'Ryd buzzere': 'Clear buzzers', 'Luk rum': 'Close room', 'Forlad rummet': 'Leave room',
      'Vælg en lyd først': 'Choose a sound first', 'Musik gemt på denne enhed': 'Music saved on this device',
    },
  };
  const oversaet = tekst => {
    if (valgt === 'da') return tekst;
    const tabel = MAP[valgt] || {};
    const rent = tekst.trim();
    if (tabel[rent] != null) return tekst.replace(rent, tabel[rent]);
    if (rent.startsWith('Indstillinger til ')) return tekst.replace(rent, 'Settings for ' + rent.slice(17));
    if (rent.startsWith('Kun «') && rent.endsWith('»')) return tekst.replace(rent, 'This game only');
    return tekst;
  };
  const oversat = root => {
    if (valgt === 'da' || !root) return;
    try {
      const gaa = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = gaa.nextNode())) {
        if (!n.nodeValue || !n.nodeValue.trim()) continue;
        const ny = oversaet(n.nodeValue);
        if (ny !== n.nodeValue) n.nodeValue = ny;
      }
      root.querySelectorAll('input[placeholder]').forEach(i => {
        const t2 = oversaet(i.placeholder);
        if (t2 !== i.placeholder) i.placeholder = t2;
      });
    } catch (e) {}
  };
  window.hsOversat = oversat;

  const UI = (k, ...a) => {
    const f = (T[valgt] && T[valgt][k]) || (T.da[k]);
    return typeof f === 'function' ? f(...a) : (f == null ? k : f);
  };
  const navn = (id, felt, fallback) => {
    if (valgt === 'da') return fallback;
    const r = GAME[valgt] && GAME[valgt][id];
    return (r && r[felt === 't' ? 0 : 1]) || fallback;
  };
  const gruppe = g => (GRP[valgt] && GRP[valgt][g]) || g;

  /* Spil med engelsk indhold lige nu. Listen udvides, når puljerne vokser. */
  const EN_KAN = ['ffm', 'est', 'tf', 'odd', 'tl', 'riddle', 'who', 'taboo', 'rat', 'lik', 'nev', 'deep'];
  window.HS_EN_KAN = EN_KAN;
  window.HSI18N = { SPROG, T, GAME, KUN_DA, EN_KAN, valgt };
  window.HSLANG = valgt;
  window.t = UI;
  window.hsNavn = navn;
  window.hsGruppe = gruppe;
  window.hsKunDa = id => KUN_DA.has(id);
  window.hsSprog = l => {
    if (!SPROG[l] || SPROG[l].klar === false) return;
    try { localStorage.setItem('hs_lang', l); } catch (e) {}
    location.reload();
  };
  try { document.documentElement.lang = (SPROG[valgt] || SPROG.da).html; } catch (e) {}
})();

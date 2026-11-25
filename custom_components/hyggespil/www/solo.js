/* Hygge Games: solo.
 *
 * Mange spil kræver ikke en modstander. For dem sænkes mindsteantallet til én,
 * så man kan spille alene – fx en quiz, en gåde eller et ordspil. Spil, hvor
 * pointgivning eller roller kræver flere (Taboo, Gæt og vis, Flaskehalsen …),
 * beholder 2+.
 */
(function () {
  if (window.__solo) return;
  window.__solo = true;

  const SOLO = new Set([
    /* quiz og viden */
    'tf', 'odd', 'tl', 'riddle', 'who', 'rec', 'city', 'weird', 'lang', 'pin', 'dx',
    'wheel', 'est', 'hangman', 'deep',
    /* musik, film, serier */
    'mus60', 'mus70', 'mus80', 'mus90', 'mus00', 'mus10', 'musdk', 'mgp', 'bmgp',
    'film80', 'film90', 'film00', 'film10', 'filmdk', 'harry', 'kpop', 'disney',
    'roller', 'serier',
    /* jul */
    'julequiz', 'julekalender', 'julesange', 'julefilm', 'julesjov',
    /* ord og koder */
    'cifsymbol', 'cifsvine', 'cifbraille', 'ciffarver', 'cifmorser', 'cifcaesar',
    'cifspejl', 'cifkaede', 'ordlav', 'ordkaede', 'ordtrappe', 'ordsplit', 'omvendt',
    'rim', 'langst', 'stavboks', 'staveling',
    /* tal */
    'talgæt', 'hovedregning', 'talrakket', 'overslag', 'procentleg', 'sanseprøve',
    'uret', 'bogstavværdi',
    /* blandet og temaer */
    'gamingmix', 'prov', 'provc', 'provw', 'grsyg', 'reality', 'fbdk', 'fbint',
    /* børnespil der kan spilles alene */
    'kwho', 'kriddle', 'kquiz', 'ktf', 'kodd', 'kest', 'kword', 'klik', 'krather',
  ]);

  try {
    for (const g of (window.GAMES || [])) {
      if (g && SOLO.has(g.id)) g.min = 1;
    }
  } catch (e) {}
})();

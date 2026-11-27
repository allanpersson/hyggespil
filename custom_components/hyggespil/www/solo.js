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
    'wheel', 'est', 'hangman', 'deep', 'law', 'zip', 'mys',
    'ftl', 'ftl_bil', 'ftl_cykel', 'ftl_fod', 'ftl_andre',
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
    /* opgaver og spil, hvor man sagtens kan være én */
    'dare', 'sqdal', 'sqdil', 'rat', 'inuit', 'lot', 'shagai', 'yut',
    /* børnespil der kan spilles alene */
    'kwho', 'kriddle', 'kquiz', 'ktf', 'kodd', 'kest', 'kword', 'klik', 'krather',
  ]);

  /* Nogle spil tilføjes først, når alle filer er læst (fx Færdselsloven og
     verdensspillene). Derfor sættes mindsteantallet både nu og igen, når
     forsiden tegnes, og når et spil startes. */
  function anvend() {
    try {
      for (const g of (window.GAMES || [])) {
        if (g && SOLO.has(g.id)) g.min = 1;
      }
    } catch (e) {}
  }
  anvend();
  window.hsSolo = anvend;
  try {
    const f0 = window.HS_FINISH;
    window.HS_FINISH = function () { f0 && f0(); anvend(); };
  } catch (e) {}
  try {
    const h0 = window.home;
    if (h0) window.home = function () { anvend(); return h0.apply(this, arguments); };
  } catch (e) {}
  try {
    const s0 = window.hsStart;
    if (s0) window.hsStart = function () { anvend(); return s0.apply(this, arguments); };
  } catch (e) {}
  try { setTimeout(anvend, 0); } catch (e) {}
})();

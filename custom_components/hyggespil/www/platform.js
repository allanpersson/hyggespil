/* Hyggespil: fælles platformstjek.
 *
 * Spillet er ét sæt filer, men kører tre steder:
 *   - i Home Assistant (web), hvor sensorer, lys og Music Assistant er tilgængelige
 *   - i den lokale Android-app (appassets), hvor alt er på telefonen
 *   - senere i en iOS-app
 *
 * Alt platformsspecifikt samles her, så de øvrige filer ikke selv gætter.
 * Android-appen kan sætte window.HSA = { android: true, play: true } i sin egen
 * hs-app.js, før filerne herunder indlæses.
 */
(function () {
  const flag = window.HSA || {};
  const android = flag.android === true ||
    location.hostname === 'appassets.androidplatform.net' ||
    /[?&]android=1/.test(location.search);
  const ios = flag.ios === true ||
    /^appassets\.ios/i.test(location.hostname) ||
    /[?&]ios=1/.test(location.search);
  window.HSA = Object.assign({}, flag, { android, ios });
  window.HSPLATFORM = android ? 'android' : ios ? 'ios' : 'web';
  /* Play-udgaven må ikke vise links til køb uden for butikken. */
  window.HSPLAY = flag.play === true;
  /* den rigtige app lægger selv sikkerhedsmargen på WebView'en */
  if (android) { try { document.documentElement.classList.add('hs-native'); } catch (e) {} }
})();

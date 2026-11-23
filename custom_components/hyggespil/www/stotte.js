/* Hyggespil: frivillig støtte – uden reklamer og uden at låse noget op.
 *
 * Der er ingen reklamer og ingen betalte niveauer. Vil man give en skilling,
 * kan man støtte udviklingen; det ændrer ikke spillet.
 *
 * Google Play-udgaven må ikke linke til betaling uden for butikken. Derfor:
 *   - HSPLAY + en betalingsbro  -> knappen kalder broen (Play Billing)
 *   - HSPLAY uden bro           -> kun en tak, ingen link
 *   - ellers (Home Assistant)   -> link til kaffe-siden
 */
(function () {
  if (window.hsStotte) return;

  function dialog() {
    const gammel = document.getElementById('stotte');
    if (gammel) { gammel.remove(); return; }
    const d = document.createElement('div');
    d.className = 'modal'; d.id = 'stotte'; d.style.zIndex = '95';
    const bro = window.HSBETAALING && typeof window.HSBETAALING.kob === 'function';
    let knapper = '';
    if (bro) {
      knapper = '<button class="btn green" id="st-kob">Støt med 25 kr.</button>';
    } else if (!window.HSPLAY) {
      knapper = '<a class="btn green" href="https://buymeacoffee.com/i8B3Mn5" target="_blank" rel="noopener" style="text-decoration:none">Køb en kaffe</a>';
    }
    d.innerHTML = '<div class="mbox" style="max-width:460px">'
      + '<h2 style="margin-top:0">☕ Støt Hyggespil</h2>'
      + '<p class="hint" style="text-align:left">Hyggespil er gratis, uden reklamer, uden konto og uden betalte niveauer. Alt indhold og alle spil er med fra start.</p>'
      + '<p class="hint" style="text-align:left">Vil du alligevel give en skilling til udviklingen, bliver den sat pris på – men det låser intet op og ændrer ikke spillet.</p>'
      + '<div class="row" style="margin-top:14px">' + knapper
      + '<button class="btn ghost" id="st-luk">Ikke nu</button></div>'
      + '<p class="hint" style="font-size:12px;text-align:left;margin-top:10px">Ingen data sendes fra spillet. Købet håndteres af butikken på telefonen.</p></div>';
    document.body.appendChild(d);
    d.querySelector('#st-luk').onclick = () => d.remove();
    const k = d.querySelector('#st-kob');
    if (k) k.onclick = () => { try { window.HSBETAALING.kob('stotte25'); } catch (e) {} d.remove(); };
  }

  window.hsStotte = dialog;
})();

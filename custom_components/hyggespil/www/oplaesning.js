/* Hyggespil: oplæsning af spørgsmål (v1).
 *
 * Læser spørgsmålet højt, når det vises – med enhedens egen stemme (Web Speech API)
 * eller, hvis man udfylder felterne i indstillingerne, via en Home Assistant-højttaler
 * (tjenesten tts.speak). Intet sendes til fremmede tjenester: browserstemmerne ligger
 * på enheden, og HA-tale kører i din egen installation.
 *
 * Slås til/fra i indstillingsboksen før spillet (⚙ undervejs). 🔊 i spillets bjælke
 * læser spørgsmålet igen – tryk én gang mere for at stoppe.
 */
(function () {
  if (window.HSTTS) return;
  const valg = () => (window.HSV ? window.HSV.valg : {});
  let sidst = { tekst: '', tid: 0 };

  /* Spil hvor oplæsning ville afsløre svaret eller ikke giver mening */
  const IKKE = new Set(['secret', 'wheel', 'glass', 'rl', 'marb', 'shiri', 'yut', 'suit', 'lot', 'shagai', 'inuit', 'mix', 'pin', 'hard']);

  function stemmer() {
    try { return (window.speechSynthesis && speechSynthesis.getVoices()) || []; } catch (e) { return []; }
  }
  function bedsteStemme() {
    const liste = stemmer();
    if (!liste.length) return null;
    const ønsket = valg().stemme;
    if (ønsket) { const f = liste.find(s => (s.voiceURI || s.name) === ønsket); if (f) return f; }
    return liste.find(s => /^da/i.test(s.lang)) || liste.find(s => /^(nb|no|sv)/i.test(s.lang)) || null;
  }
  function hassObjekt() {
    try { const el = window.parent.document.querySelector('home-assistant'); return (el && el.hass) || null; } catch (e) { return null; }
  }

  function haTal(tekst) {
    const v = valg(), h = hassObjekt();
    if (!h || !h.callService) return false;
    h.callService('tts', 'speak', {
      entity_id: v.haTts,
      media_player_entity_id: v.haPlayer,
      message: tekst,
    }).catch(() => {});
    return true;
  }

  function tal(tekst, tvang) {
    const v = valg();
    tekst = String(tekst || '').replace(/\s+/g, ' ').trim();
    if (!tekst) return;
    if (!tvang && !v.oplaes) return;
    if (!tvang && v.haTts && v.haPlayer && haTal(tekst)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tekst.slice(0, 600));
      const s = bedsteStemme();
      if (s) u.voice = s;
      u.lang = s ? s.lang : 'da-DK';
      u.rate = Math.min(2, Math.max(0.5, +v.taleRate || 1));
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function stop() { try { speechSynthesis.cancel(); } catch (e) {} }

  /* Den tekst, der står som spørgsmål på skærmen lige nu */
  function spoergsmaal() {
    const main = document.getElementById('main');
    if (!main) return '';
    let kind = '';
    try { const x = window.hsSpil.gm(window.hsSpil.view); kind = x ? x.kind : ''; } catch (e) {}
    if (IKKE.has(kind)) return '';
    const q = main.querySelector('.card .q, .q');
    if (!q) return '';
    const tekst = (q.textContent || '').trim();
    return tekst.length > 1 ? tekst : '';
  }

  function maaskeLaes() {
    const t = spoergsmaal();
    if (!t) return;
    const nu = Date.now();
    if (t === sidst.tekst && nu - sidst.tid < 1500) return;   // ikke samme sætning to gange
    sidst = { tekst: t, tid: nu };
    setTimeout(() => tal(t), 60);
  }

  /* Krog: efter hvert nyt spørgsmål */
  const next0 = window.next;
  if (typeof next0 === 'function') window.next = function () {
    const r = next0.apply(window, arguments);
    maaskeLaes();
    return r;
  };

  /* Krog: spillets bjælke får en højttaler-knap */
  const game0 = window.game;
  window.game = function () {
    const r = game0.apply(window, arguments);
    try {
      const bar = document.querySelector('#main .bar');
      if (bar && !document.getElementById('hsv-lyt')) {
        const b = document.createElement('button');
        b.id = 'hsv-lyt'; b.className = 'btn ghost'; b.title = 'Læs spørgsmålet op';
        b.textContent = '🔊';
        b.onclick = () => {
          if (window.speechSynthesis && speechSynthesis.speaking) { stop(); return; }
          const t = spoergsmaal();
          if (t) tal(t, true);
          else if (window.HSV) window.HSV.dialog();      // ingen tekst: åbn indstillingerne
        };
        bar.appendChild(b);
      }
    } catch (e) {}
    return r;
  };

  /* Stop, når man forlader spillet */
  const go0 = window.go;
  window.go = function (v) {
    const r = go0.apply(window, arguments);
    if (v === 'home') stop();
    return r;
  };

  /* Stemmer ankommer asynkront i nogle browsere – bed om listen med det samme */
  try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}

  window.HSTTS = { tal, stop, stemmer, spoergsmaal, maaskeLaes };
})();

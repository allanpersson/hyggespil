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

  function duk(ned) {
    try { if (window.HSV && window.HSV.musik && window.HSV.musik.duk) window.HSV.musik.duk(ned); } catch (e) {}
  }

  function tal(tekst, tvang) {
    const v = valg();
    tekst = String(tekst || '').replace(/\s+/g, ' ').trim();
    if (!tekst) return;
    if (!tvang && !v.oplaes) return;
    if (!tvang && v.haTts && v.haPlayer && haTal(tekst)) {
      /* Højttaleren kender vi ikke længden på – dæmp musikken i et anslået tidsrum */
      duk(true);
      const ms = Math.max(3000, Math.min(30000, tekst.length / 11 * 1000));
      clearTimeout(tal.timer);
      tal.timer = setTimeout(() => duk(false), ms + 600);
      return;
    }
    if (typeof speechSynthesis === 'undefined') {
      /* Ingen stemme på enheden: prøv højttaleren, ellers vis opsætningsvejledningen */
      if (v.haTts && v.haPlayer && haTal(tekst)) return;
      guide();
      return;
    }
    /* Chrome på Android kan svare "ingen stemmer", indtil listen er hentet – vent og prøv igen */
    if (!stemmer().length && !v.haTts) {
      let forsøg = 0;
      const tjek = () => {
        if (stemmer().length) return;
        if (++forsøg < 4) setTimeout(tjek, 1200);
        else if (!stemmer().length) guide();
      };
      setTimeout(tjek, 600);
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(tekst.slice(0, 600));
      const s = bedsteStemme();
      if (s) u.voice = s;
      u.lang = s ? s.lang : 'da-DK';
      u.rate = Math.min(2, Math.max(0.5, +v.taleRate || 1));
      /* Musikken dæmpes, mens der tales – den fortsætter, så man stadig hører den */
      duk(true);
      u.onend = () => duk(false);
      u.onerror = () => duk(false);
      speechSynthesis.speak(u);
    } catch (e) { duk(false); }
  }

  function visBesked(tekst) {
    try {
      const d = document.createElement('div');
      d.textContent = tekst;
      d.style.cssText = 'position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:70;max-width:440px;' +
        'padding:12px 18px;border-radius:18px;background:#ffb703;color:#1c1442;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.4)';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 6000);
    } catch (e) {}
  }

  /* Opsætning af stemme: viser hvad man skal gøre – og en knap der åbner telefonens taleindstillinger */
  function erWebView() {
    const ua = navigator.userAgent || '';
    return /; wv\)/i.test(ua) || /ReactNativeWebView/.test(ua) || (window.ReactNativeWebView !== undefined) ||
      (/Android/i.test(ua) && /Version\/\d/i.test(ua) && !/Chrome\//.test(ua));
  }

  function guide() {
    if (document.getElementById('hsv-tts-guide')) return;
    const ua = navigator.userAgent;
    const android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
    const webview = erWebView() || typeof speechSynthesis === 'undefined';
    const antal = stemmer().length;
    const trin = android
      ? 'Indstillinger → System → Sprog og input → Tekst-til-tale → vælg en dansk stemme (installér den, hvis den mangler).'
      : ios
        ? 'Indstillinger → Tilgængelighed → Oplæst indhold → Stemmer → Dansk.'
        : 'Windows: Indstillinger → Tid og sprog → Tale. macOS: Systemindstillinger → Tilgængelighed → Oplæst indhold.';
    const overskrift = webview ? '🔊 Appen kan ikke læse op' : '🔊 Slå oplæsning til';
    const forklaring = webview
      ? 'Home Assistant-appens indbyggede browser (WebView) stiller ikke tale til rådighed for spillet – '
        + 'også selv om telefonen har dansk tale installeret. Åbn spillet i Chrome i stedet, så virker oplæsningen.'
      : (antal ? 'Der er stemmer på enheden. Vælg en dansk i listen under ⚙ → Oplæsning – eller brug en Home Assistant-højttaler.'
        : 'Ventede på telefonens stemmer, men fik ingen. Sådan får du lyd på:');
    const o = document.createElement('div');
    o.id = 'hsv-tts-guide'; o.className = 'modal'; o.style.zIndex = '85';
    o.innerHTML = '<div class="mbox" style="max-width:520px">'
      + '<h2 style="margin-top:0">' + overskrift + '</h2>'
      + '<p class="hint" style="text-align:left">' + esc(forklaring) + '</p>'
      + (webview ? '' : '<p class="hint" style="text-align:left;font-size:16px">' + esc(trin) + '</p>')
      + '<p class="hint" style="text-align:left">Har du en Home Assistant-højttaler, kan du i stedet vælge den under ⚙ → Oplæsning.</p>'
      + '<div class="row" style="margin-top:16px">'
      + (webview ? '<button class="btn big green" id="hsv-tts-chrome">Åbn i Chrome</button>' : '')
      + (android && !webview ? '<button class="btn big green" id="hsv-tts-aabn">Åbn taleindstillinger</button>' : '')
      + '<button class="btn" id="hsv-tts-igen">Prøv igen</button>'
      + '<button class="btn ghost" id="hsv-tts-luk">Luk</button></div></div>';
    document.body.appendChild(o);
    const $ = id => o.querySelector('#' + id);
    if ($('hsv-tts-chrome')) $('hsv-tts-chrome').onclick = () => {
      try {
        const url = location.href.replace(/^https?:/, 'https:');
        const sti = url.replace(/^https:\/\//, '');
        location.href = 'intent://' + sti + '#Intent;scheme=https;package=com.android.chrome;' +
          'S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
      } catch (e) { visBesked('Åbn adressen i Chrome: ' + location.href); }
    };
    if ($('hsv-tts-aabn')) $('hsv-tts-aabn').onclick = () => {
      try { location.href = 'intent:#Intent;action=com.android.settings.TTS_SETTINGS;end'; }
      catch (e) { visBesked('Åbn: ' + trin); }
    };
    $('hsv-tts-igen').onclick = () => {
      try { speechSynthesis.getVoices(); } catch (e) {}
      const n = stemmer().length;
      o.remove();
      if (n) { tal('Oplæsning virker nu. God fornøjelse!', true); visBesked('Oplæsning virker – ' + n + ' stemmer fundet.'); }
      else { guide(); }
    };
    $('hsv-tts-luk').onclick = () => o.remove();
    o.addEventListener('click', e => { if (e.target === o) o.remove(); });
  }

  function stop() { try { speechSynthesis.cancel(); } catch (e) {} duk(false); }

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

  window.HSTTS = { tal, stop, stemmer, spoergsmaal, maaskeLaes, guide };
})();

/* Hyggespil: spil sammen fra hver sin telefon.
 *
 * Rummet ligger i Home Assistant (tjenesten hyggespil.rum), så alle telefoner ser
 * samme spil og samme spørgsmål. Kun den spiller, hvis tur det er, kan svare, og
 * det rigtige svar ligger på serveren indtil runden afsløres – ingen telefon kan
 * kigge det ud af sensoren på forhånd.
 *
 * To måder at være med:
 *   1) Tavlen viser spillet, de andre telefoner er buzzere.
 *   2) Fælles quiz: alle har hver sin skærm, og turen går på omgang.
 */
(function () {
  if (window.__rum) return; window.__rum = true;
  const ANDROID = window.HSPLATFORM === 'android';

  const NOEGLE = 'hs_rum', ENHED = 'hs_enhed';
  let enhed = '';
  try { enhed = localStorage.getItem(ENHED) || ''; } catch (e) {}
  if (!enhed) {
    enhed = 'e' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem(ENHED, enhed); } catch (e) {}
  }
  let med = null;
  try { med = JSON.parse(localStorage.getItem(NOEGLE) || 'null'); } catch (e) { med = null; }
  if (med) med.enhed = enhed;
  const gemMed = v => { med = v; try { localStorage.setItem(NOEGLE, JSON.stringify(v)); } catch (e) {} };

  /* privat nøgle: bruges til at låse og åbne spillerens eget kort. Den forlader
     aldrig telefonen – serveren gemmer den og bruger den til at kryptere netop
     dette korts indhold, så de andre telefoner kun ser volapyk. */
  const PRIV = 'hs_privn';
  let noegle = '';
  try { noegle = localStorage.getItem(PRIV) || ''; } catch (e) {}
  if (!noegle) {
    noegle = 'k' + Math.random().toString(36).slice(2, 14);
    try { localStorage.setItem(PRIV, noegle); } catch (e) {}
  }
  function rc4(key, bytes) {
    const s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) s[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) { j = (j + s[i] + key.charCodeAt(i % key.length)) & 255; const t = s[i]; s[i] = s[j]; s[j] = t; }
    let i = 0; j = 0;
    const ud = new Uint8Array(bytes.length);
    for (let n = 0; n < bytes.length; n++) {
      i = (i + 1) & 255; j = (j + s[i]) & 255;
      const t = s[i]; s[i] = s[j]; s[j] = t;
      ud[n] = bytes[n] ^ s[(s[i] + s[j]) & 255];
    }
    return ud;
  }
  function åbn(b64) {
    try {
      const bin = atob(b64);
      const arr = Uint8Array.from(bin, c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder('utf-8').decode(rc4(noegle, arr)));
    } catch (e) { return null; }
  }

  /* puljer der kan bruges i den fælles quiz (samme format: [q, [svar], korrekt, note]) */
  const QUIZ = [
    ['mus60', 'Musikquiz – 60’erne'], ['mus70', 'Musikquiz – 70’erne'], ['mus80', 'Musikquiz – 80’erne'],
    ['mus90', 'Musikquiz – 90’erne'], ['mus00', 'Musikquiz – 00’erne'], ['mus10', 'Musikquiz – 10’erne'],
    ['musdk', 'Musikquiz – kun dansk'], ['mgp', 'Musikquiz – Grand Prix'], ['bmgp', 'Musikquiz – børnenes Grand Prix'],
    ['film80', 'Filmquiz – 80’erne'], ['film90', 'Filmquiz – 90’erne'], ['film00', 'Filmquiz – 00’erne'],
    ['film10', 'Filmquiz – 10’erne'], ['filmdk', 'Filmquiz – dansk film'], ['harry', 'Filmquiz – Troldmandsfilmene'],
    ['kpop', 'Filmquiz – K-pop og dæmoner'], ['serier', 'Seriequiz'], ['disney', 'Tegnefilmsquiz'],
    ['roller', 'Hvem spillede rollen?'], ['fb_dk', 'Dansk fodbold'], ['fb_int', 'International fodbold'],
    ['reality', 'Dansk reality'], ['forklar', 'Forklar ordet (Taboo)'],
  ];

  const CSS = '.rumkode{font-size:clamp(40px,12vw,72px);font-weight:900;letter-spacing:.18em;text-align:center;'
    + 'padding:10px 0;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2)}'
    + '.rumbuzz{width:100%;padding:30px 10px;border-radius:24px;font-size:clamp(22px,6vw,34px);font-weight:900;'
    + 'background:linear-gradient(135deg,#ff3d6e,#c9184a);color:#fff;box-shadow:0 12px 40px rgba(255,61,110,.45);border:0}'
    + '.rumbuzz[disabled]{opacity:.5}'
    + '.rumliste{display:flex;flex-direction:column;gap:8px;margin:10px 0}'
    + '.rumliste .r{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);font-weight:800}'
    + '.rumliste .r.mig{outline:2px solid #ffb703}.rumliste .r .n{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#8f6bff;color:#fff;font-size:14px}'
    + '.rumliste .r .p{margin-left:auto;font-weight:900;color:#ffb703}'
    + '#rumspil{position:fixed;inset:0;z-index:97;display:none;overflow:auto;padding:16px;background:rgba(12,8,32,.97)}'
    + '#rumspil .rp{max-width:720px;margin:0 auto}'
    + '#rumspil .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}'
    + '#rumspil .top .sp{flex:1;font-weight:900;font-size:18px}'
    + '#rumspil .hvem{font-weight:900;font-size:clamp(16px,4vw,22px);padding:8px 14px;border-radius:14px;background:rgba(255,255,255,.08);display:inline-block;margin-bottom:10px}'
    + '#rumspil .hvem.mig{background:rgba(255,183,3,.25);outline:2px solid #ffb703}'
    + '#rumspil .q{font-size:clamp(20px,5vw,32px);font-weight:900;text-align:center;margin:10px 0 14px}'
    + '#rumspil .svar{display:grid;grid-template-columns:1fr;gap:10px;margin:10px 0}'
    + '@media(min-width:560px){#rumspil .svar{grid-template-columns:1fr 1fr}}'
    + '#rumspil .svar button{display:flex;gap:10px;align-items:center;padding:15px;border-radius:16px;font-weight:800;font-size:16px;'
    + 'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);text-align:left}'
    + '#rumspil .svar button .k{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#8f6bff;flex:0 0 30px}'
    + '#rumspil .svar button[disabled]{opacity:.45}'
    + '#rumspil .svar button.korrekt{background:rgba(46,196,182,.25);border-color:#2ec4b6}'
    + '#rumspil .svar button.fejl{background:rgba(230,57,70,.25);border-color:#e63946}'
    + '#rumspil .point{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;justify-content:center}'
    + '#rumspil .point span{padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:800}';
  const stil = document.createElement('style'); stil.textContent = CSS; document.head.appendChild(stil);

  function hass() {
    try { const el = window.parent.document.querySelector('home-assistant'); return (el && el.hass) || null; } catch (e) { return null; }
  }
  function kald(data) {
    const h = hass();
    if (h && h.callService) return h.callService('hyggespil', 'rum', Object.assign({ enhed, noegle }, data));
    if (window.HSRUM) return window.HSRUM.kald(data);
    return Promise.reject(new Error('kræver Home Assistant eller internet'));
  }
  function data() {
    const h = hass();
    if (!h || !h.states) {
      const d = window.HSRUM ? window.HSRUM.data() : null;
      if (!d) return null;
      return {
        kode: d.rum || d.kode || '', aktiv: !!d.rum_aktiv, buzzere: d.rum_buzzere || [],
        spillere: d.rum_spillere || [], tur: d.rum_tur, turNavn: d.rum_tur_navn || '',
        vaert: d.rum_vaert || '', fase: d.rum_fase || 'lobby', spil: d.rum_spil || '',
        spoergsmaal: d.rum_spoergsmaal || null, korrekt: d.rum_korrekt, svar: d.rum_svar,
        privat: d.rum_privat || {},
      };
    }
    const e = h.states['sensor.hyggespil_spil'];
    if (!e || !e.attributes) return { spillere: [] };
    const a = e.attributes;
    return {
      kode: a.rum || '', aktiv: !!a.rum_aktiv, buzzere: a.rum_buzzere || [],
      spillere: a.rum_spillere || [], tur: a.rum_tur, turNavn: a.rum_tur_navn || '',
      vaert: a.rum_vaert || '', fase: a.rum_fase || 'lobby', spil: a.rum_spil || '',
      spoergsmaal: a.rum_spoergsmaal || null, korrekt: a.rum_korrekt, svar: a.rum_svar,
      privat: a.rum_privat || {},
    };
  }
  function erVaert() { const d = data(); return !!d && !!enhed && d.vaert === enhed; }
  function mitNavn() { return med ? med.navn : ''; }
  function erMinTur() { const d = data(); return !!d && d.tur != null && d.spillere[d.tur] && d.spillere[d.tur].enhed === enhed; }
  function biplyd(f) {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = f || 880; g.gain.value = 0.14;
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.12);
    } catch (e) {}
  }
  function toast(t) {
    const b = document.createElement('div');
    b.textContent = t;
    b.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:130;padding:10px 18px;'
      + 'border-radius:20px;background:#2ec4b6;color:#06221f;font-weight:900;box-shadow:0 8px 26px rgba(0,0,0,.4)';
    document.body.appendChild(b); setTimeout(() => b.remove(), 2200);
  }

  /* ---------------- fælles quiz-skærm ---------------- */
  function spilEl() {
    let el = document.getElementById('rumspil');
    if (!el) { el = document.createElement('div'); el.id = 'rumspil'; document.body.appendChild(el); }
    return el;
  }
  function tegnSpil(d) {
    const el = spilEl();
    const vis = d && d.fase && d.fase !== 'lobby' && d.spoergsmaal;
    el.style.display = vis ? 'block' : 'none';
    if (vis) { const dlg = document.querySelector('.modal'); if (dlg && dlg.querySelector('#rum-close')) dlg.remove(); }
    if (!vis) return;
    const q = d.spoergsmaal;
    if (q.slags === 'privat' || d.spil === 'forklar') { tegnForklar(el, d); return; }
    const minTur = erMinTur(), afsloeret = d.fase === 'afsloret';
    const valg = Array.isArray(q.o) ? q.o : null;
    let indhold = '';
    if (q.slags === 'kort') {
      indhold = '<div class="q" style="font-size:clamp(24px,6vw,40px)">' + esc(q.tekst) + '</div>';
    } else if (q.slags === 'hellere') {
      indhold = '<div class="q">' + (window.HSLANG === 'en' ? 'Would you rather…' : 'Hvad ville du helst?') + '</div>'
        + '<div class="svar"><button disabled>A · ' + esc(q.a) + '</button><button disabled>B · ' + esc(q.b) + '</button></div>';
    } else if (q.slags === 'svar') {
      indhold = '<div class="q">' + esc(q.q) + '</div>' + (afsloeret ? '<div class="ans">' + esc(q.a) + '</div>' : '');
    } else {
      indhold = '<div class="q">' + esc(q.q) + '</div><div class="svar">' + (valg || []).map((t, i) => {
        const korrekt = afsloeret && i === d.korrekt, fejl = afsloeret && i === d.svar && i !== d.korrekt;
        return '<button data-s="' + i + '"' + ((!minTur || afsloeret) ? ' disabled' : '') + ' class="' + (korrekt ? 'korrekt' : fejl ? 'fejl' : '') + '">'
          + '<span class="k">' + (korrekt ? '✓' : fejl ? '✗' : 'ABCD'[i]) + '</span><span>' + t + '</span></button>';
      }).join('') + '</div>';
    }
    el.innerHTML = '<div class="rp"><div class="top">'
      + '<div class="sp">' + (function(){try{const gx=(window.gm?gm(d.spil):null);return gx?(window.hsNavn?hsNavn(gx.id,'t',gx.t):gx.t):(window.HSLANG==='en'?'Shared game':'Fælles spil')}catch(e){return window.HSLANG==='en'?'Shared game':'Fælles spil'}})() + '</div>'
      + '<span style="opacity:.7">' + (window.HSLANG === 'en' ? 'Room ' : 'Rum ') + d.kode + '</span>'
      + '<button class="btn ghost" id="rum-aabn">' + (window.HSLANG === 'en' ? 'Room' : 'Rum') + '</button>'
      + (erVaert() ? '<button class="btn ghost" id="rum-luk-spil">' + (window.HSLANG === 'en' ? 'End' : 'Afslut') + '</button>' : '')
      + (med ? '<button class="btn ghost" id="rum-forlad2">' + (window.HSLANG === 'en' ? 'Leave' : 'Forlad') + '</button>' : '')
      + '</div>'
      + '<div class="hvem' + (minTur && !afsloeret ? ' mig' : '') + '">' + (afsloeret
        ? (valg ? (d.svar === d.korrekt ? (window.HSLANG === 'en' ? '✅ Correct' : '✅ Rigtigt svar') : (window.HSLANG === 'en' ? '❌ Wrong' : '❌ Forkert svar')) : (window.HSLANG === 'en' ? 'Answer' : 'Svaret'))
        : (minTur ? (window.HSLANG === 'en' ? '🎯 Your turn' : '🎯 Det er din tur') : '⏳ ' + (window.HSLANG === 'en' ? 'Waiting for ' : 'Det er ') + d.turNavn + (window.HSLANG === 'en' ? '' : 's tur'))) + '</div>'
      + indhold
      + '<div class="point">' + d.spillere.map((p, i) => '<span' + (i === d.tur ? ' style="outline:2px solid #ffb703"' : '') + '>' + p.navn + ': ' + p.point + '</span>').join('') + '</div>'
      + (erVaert() && q.slags === 'svar' && !afsloeret ? '<div class="row" style="margin-top:10px"><button class="btn" id="rum-vis">' + (window.HSLANG === 'en' ? 'Show answer' : 'Vis svaret') + '</button></div>' : '')
      + (erVaert() ? '<div class="row" style="margin-top:14px"><button class="btn big green" id="rum-naeste">' + (window.HSLANG === 'en' ? 'Next →' : 'Næste →') + '</button></div>' : '')
      + '</div>';
    if (minTur && !afsloeret && valg) {
      el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
        kald({ handling: 'svar', svar: +b.dataset.s }).then(() => biplyd(560)).catch(e => toast(e.message));
      });
    }
    const visSvar = document.getElementById('rum-vis');
    if (visSvar) visSvar.onclick = () => kald({ handling: 'svar', svar: 0 }).catch(e => toast(e.message));
    const nx = document.getElementById('rum-naeste');
    if (nx) nx.onclick = naesteRunde;
    const aabn = document.getElementById('rum-aabn');
    if (aabn) aabn.onclick = dialog;
    const luk = document.getElementById('rum-luk-spil');
    if (luk) luk.onclick = () => kald({ handling: 'afslut' }).catch(e => toast(e.message));
    const fl = document.getElementById('rum-forlad2');
    if (fl) fl.onclick = () => kald({ handling: 'forlad' }).then(() => { gemMed(null); el.style.display = 'none'; });
  }

  /* Taboo: kun den spiller, hvis tur det er, kan åbne sit private kort */
  function tegnForklar(el, d) {
    const i = d.spillere.findIndex(p => p.enhed === enhed);
    const mit = (i >= 0) ? åbn(d.privat[String(i)] || '') : null;
    const minTur = i >= 0 && i === d.tur;
    const navn = d.turNavn;
    el.innerHTML = '<div class="rp"><div class="top">'
      + '<div class="sp">🗣️ Forklar ordet</div>'
      + '<span style="opacity:.7">Rum ' + d.kode + '</span>'
      + '<button class="btn ghost" id="rum-aabn">Rum</button>'
      + (erVaert() ? '<button class="btn ghost" id="rum-luk-spil">Afslut</button>' : '')
      + (med ? '<button class="btn ghost" id="rum-forlad2">Forlad</button>' : '')
      + '</div>'
      + '<div class="hvem' + (minTur ? ' mig' : '') + '">' + (minTur
        ? '🎯 Du forklarer – vis ikke telefonen til de andre'
        : '⏳ ' + navn + ' forklarer') + '</div>'
      + (minTur && mit
        ? '<div class="q" style="font-size:clamp(30px,10vw,64px);letter-spacing:.02em">' + mit.w + '</div>'
          + '<p class="hint" style="text-align:center">Du må ikke sige:</p>'
          + '<div class="point">' + (mit.f || []).map(f => '<span style="background:rgba(230,57,70,.25);border:1px solid #e63946">' + f + '</span>').join('') + '</div>'
        : '<div class="q" style="opacity:.8">Lyt og gæt – ordet er hemmeligt for dig' + (minTur ? ' (venter på kortet)' : '') + '</div>')
      + '<div class="point">' + d.spillere.map((p, k) => '<span' + (k === d.tur ? ' style="outline:2px solid #ffb703"' : '') + '>' + p.navn + ': ' + p.point + '</span>').join('') + '</div>'
      + (erVaert() ? '<div class="row" style="margin-top:14px"><button class="btn green" id="rum-giv">Giv point</button>'
        + '<button class="btn big green" id="rum-naeste">Næste →</button></div>' : '')
      + '</div>';
    const nx = document.getElementById('rum-naeste');
    if (nx) nx.onclick = naesteRunde;
    const giv = document.getElementById('rum-giv');
    if (giv) giv.onclick = () => kald({ handling: 'giv' }).then(() => biplyd(640)).catch(e => toast(e.message));
    const aabn2 = document.getElementById('rum-aabn');
    if (aabn2) aabn2.onclick = dialog;
    const luk = document.getElementById('rum-luk-spil');
    if (luk) luk.onclick = () => kald({ handling: 'afslut' }).catch(e => toast(e.message));
  }

  /* ---------------- dialog ---------------- */
  /* ---------- hvilke spil kan spilles i et rum ---------- */
  function slagsAf(it) {
    if (typeof it === 'string') return 'kort';
    if (Array.isArray(it)) return (it.length >= 3 && Array.isArray(it[1])) ? 'quiz' : '?';
    if (!it || typeof it !== 'object') return '?';
    if (it.w != null && Array.isArray(it.f)) return 'privat';
    if (it.s != null && it.t != null) return 'tf';
    if (it.a != null && it.b != null && it.q == null) return 'hellere';
    if (it.q && Array.isArray(it.o)) return 'quiz';
    if (it.o && it.a != null && !it.q) return 'odd';
    if (it.q && Array.isArray(it.a)) return 'to';
    if (it.q && it.a != null) return 'svar';
    return '?';
  }
  function mulige() {
    const ud = [], set = new Set();
    for (const g of (window.GAMES || [])) {
      if (!g || !g.key || g.skjult || g.kind === 'mix' || g.kind === 'menu') continue;
      if (set.has(g.key)) continue;
      let liste = [];try{liste=pool(g.key)}catch(e){}
      if (liste.length < 10) continue;
      if (slagsAf(liste[0]) === '?') continue;
      set.add(g.key);
      ud.push([g.key, (window.hsNavn ? hsNavn(g.id, 't', g.t) : g.t)]);
    }
    return ud.sort((a, b) => a[1].localeCompare(b[1]));
  }

  function naesteRunde(valgtNoegle) {
    const sel = document.getElementById('rum-pulje');
    const d = data();
    const key = valgtNoegle || (sel && sel.value) || (d && d.spil) || 'harry';
    let liste = [];try{liste=pool(key)||[]}catch(e){}
    if (!liste.length) { toast('Puljen er tom'); return; }
    let bag = [];
    try { bag = JSON.parse(localStorage.getItem('hs_rum_bag_' + key) || '[]'); } catch (e) {}
    if (!bag.length) bag = liste.map((_, i) => i).sort(() => Math.random() - 0.5);
    const idx = bag.pop();
    try { localStorage.setItem('hs_rum_bag_' + key, JSON.stringify(bag)); } catch (e) {}
    const it = liste[idx];
    const sl = slagsAf(it);
    let spoergsmaal = null, korrekt = null, privat = {};
    if (sl === 'quiz') {
      const q = Array.isArray(it) ? it[0] : it.q, o = Array.isArray(it) ? it[1] : it.o, a = Array.isArray(it) ? it[2] : it.a;
      spoergsmaal = { slags: 'quiz', q, o: o.map(String) }; korrekt = a;
    } else if (sl === 'tf') {
      spoergsmaal = { slags: 'tf', q: it.s, o: [(window.HSLANG === 'en' ? 'True' : 'Sandt'), (window.HSLANG === 'en' ? 'False' : 'Falsk')] };
      korrekt = it.t ? 0 : 1;
    } else if (sl === 'odd') {
      spoergsmaal = { slags: 'odd', q: (window.HSLANG === 'en' ? 'Which statement is the lie?' : 'Hvilken påstand er løgn?'), o: it.o.map(String) }; korrekt = it.a;
    } else if (sl === 'to') {
      spoergsmaal = { slags: 'to', q: it.q, o: it.a.map(String) }; korrekt = it.c;
    } else if (sl === 'svar') {
      spoergsmaal = { slags: 'svar', q: it.q, a: String(it.a) };
    } else if (sl === 'kort') {
      spoergsmaal = { slags: 'kort', tekst: String(it) };
    } else if (sl === 'hellere') {
      spoergsmaal = { slags: 'hellere', a: String(it.a), b: String(it.b) };
    } else if (sl === 'privat') {
      const antal = d && d.spillere.length ? d.spillere.length : 1;
      const maal = (d && d.fase !== 'lobby') ? (d.tur + 1) % antal : 0;
      privat[maal] = { w: it.w, f: it.f };
      spoergsmaal = { slags: 'privat', q: (window.HSLANG === 'en' ? 'Explain the word – without saying the forbidden words' : 'Forklar ordet – uden at sige de forbudte ord') };
    } else {
      toast('Dette spil kan ikke deles'); return;
    }
    kald({
      handling: (d && d.fase === 'lobby') ? 'start' : 'naeste',
      spil: (sl === 'privat' ? 'forklar' : key),
      spoergsmaal, korrekt, privat,
    }).then(() => biplyd(760)).catch(e => toast(e.message));
  }

  function dialog() {
    const d0 = data() || { spillere: [], buzzere: [], kode: '' };
    const online = !hass();
    if (online && (!window.HSRUM || !window.HSRUM.kan())) { toast('Kræver internet eller Home Assistant'); return; }
    const el = document.createElement('div');
    el.className = 'modal'; el.style.zIndex = '99';
    el.innerHTML = '<div class="mbox" style="width:min(560px,100%);max-height:92vh;overflow:auto">'
      + '<h2 style="margin-top:0">📱 Spil sammen fra hver telefon</h2>'
      + '<p class="hint" style="text-align:left">Én telefon opretter rummet. De andre deltager med koden og får deres egen skærm. Spørgsmålene går på omgang, og kun den, hvis tur det er, kan svare.</p>'
      + (online ? '<p class="hint" style="text-align:left">Rummet virker over internettet via den åbne beskedtjeneste ntfy.sh. Indholdet er krypteret med rumkoden, og der sendes kun kaldenavn og et tilfældigt enheds-id.</p>' : '')
      + '<h3 style="margin:14px 0 6px">① Rummet</h3>'
      + '<div id="rum-kodevis">' + (d0.kode ? '<div class="rumkode">' + d0.kode + '</div>' : '<p class="hint" style="text-align:left">Der er endnu ikke oprettet et rum.</p>') + '</div>'
      + '<div class="row" style="justify-content:flex-start;margin-top:8px"><button class="btn" id="rum-nyt">Nyt rum</button>'
      + '<button class="btn ghost" id="rum-ryd">Ryd buzzere</button>'
      + '<button class="btn ghost" id="rum-luk">Luk rum</button></div>'
      + '<div class="rumliste" id="rum-spillere"></div>'
      + '<h3 style="margin:14px 0 6px">② Fælles quiz (værten starter)</h3>'
      + '<div class="row" style="justify-content:flex-start"><select class="in" id="rum-pulje" style="max-width:260px;text-align:left">'
      + mulige().map(([k, t]) => '<option value="' + k + '">' + t + '</option>').join('') + '</select>'
      + '<button class="btn green" id="rum-start">Start runde</button></div>'
      + '<h3 style="margin:14px 0 6px">③ Din telefon</h3><div id="rum-mig"></div>'
      + '<div class="row" style="margin-top:16px"><button class="btn ghost" id="rum-close">Luk</button></div></div>';
    document.body.appendChild(el);
    const $ = id => el.querySelector('#' + id);

    function tegn() {
      const d = data() || { spillere: [], buzzere: [], kode: '' };
      const vis = $('rum-kodevis');
      if (vis) vis.innerHTML = d.kode
        ? '<div class="rumkode">' + d.kode + '</div>'
        : '<p class="hint" style="text-align:left">Der er endnu ikke oprettet et rum.</p>';
      if (d.kode && $('rum-spillere')) {
        $('rum-spillere').innerHTML = d.spillere.length ? d.spillere.map((p, i) =>
          '<div class="r' + (p.enhed === enhed ? ' mig' : '') + '"><span class="n">' + (i + 1) + '</span>' + p.navn
          + (d.tur === i ? ' <span style="opacity:.7">(tur)</span>' : '') + '<span class="p">' + p.point + ' point</span></div>').join('')
          : '<p class="hint" style="text-align:left">Ingen deltagere endnu.</p>';
      }
      const mig = $('rum-mig');
      if (!mig) return;
      if (med && med.kode) {
        const medI = d.spillere.findIndex(p => p.enhed === enhed);
        mig.innerHTML = '<p class="hint" style="text-align:left">Du er <b>' + med.navn + '</b> i rum <b>' + med.kode + '</b>'
          + (medI < 0 ? ' – venter på at rummet findes…' : '') + '</p>'
          + '<button class="rumbuzz" id="rum-buzz">JEG VED DET!</button>'
          + '<div class="row" style="margin-top:8px"><button class="btn ghost" id="rum-forlad">Forlad rummet</button></div>';
        $('rum-buzz').onclick = () => {
          kald({ handling: 'buzz', kode: med.kode, navn: med.navn })
            .then(() => { biplyd(); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} })
            .catch(() => toast('Kunne ikke sende'));
        };
        $('rum-forlad').onclick = () => { kald({ handling: 'forlad' }); gemMed(null); tegn(); };
        if (medI < 0 && d.kode) kald({ handling: 'deltag', kode: d.kode, navn: med.navn }).catch(() => {});
      } else {
        mig.innerHTML = '<div class="row" style="justify-content:flex-start">'
          + '<input class="in" id="rum-kode" maxlength="9" placeholder="Rumkode" autocomplete="off" style="max-width:150px;text-align:center;text-transform:uppercase">'
          + '<input class="in" id="rum-navn" maxlength="16" placeholder="Dit navn" style="max-width:170px">'
          + '<button class="btn" id="rum-join">Deltag</button></div>';
        $('rum-join').onclick = () => {
          const kode = String($('rum-kode').value || '').trim(), navn = String($('rum-navn').value || '').trim();
          if (!/^\d{3,8}$/.test(kode) && !/^[0-9]{4}-?[A-Za-z]{2}$/.test(kode)) return toast('Skriv koden fra værten');
          if (!navn) return toast('Skriv dit navn');
          gemMed({ kode, navn, enhed });
          const send = (online && window.HSRUM && !window.HSRUM.erVaert())
            ? window.HSRUM.deltag(kode, navn)
            : kald({ handling: 'deltag', kode, navn });
          Promise.resolve(send).then(() => tegn()).catch(e => toast(e.message));
        };
      }
    }
    tegn();

    $('rum-nyt').onclick = () => {
      /* værten er automatisk med – med sit eget spillernavn */
      const navn = (window.players && players[0] && players[0].n) || (window.HSLANG === 'en' ? 'Host' : 'Vært');
      const efter = kode => {
        gemMed({ kode: kode, navn: navn, enhed: enhed });
        kald({ handling: 'deltag', kode: kode, navn: navn })
          .then(() => { biplyd(); setTimeout(tegn, 300); })
          .catch(e => toast(e.message));
      };
      if (online && window.HSRUM) {
        window.HSRUM.opret().then(() => { const d = data() || {}; efter(d.kode || d.rum || ''); }).catch(e => toast(e.message));
      } else {
        const k = String(Math.floor(1000 + Math.random() * 9000));
        kald({ handling: 'opret', kode: k }).then(() => efter(k)).catch(e => toast(e.message));
      }
    };
    $('rum-ryd').onclick = () => kald({ handling: 'ryd' }).then(() => setTimeout(tegn, 250)).catch(e => toast(e.message));
    $('rum-luk').onclick = () => kald({ handling: 'luk' }).then(() => setTimeout(() => el.remove(), 250)).catch(e => toast(e.message));
    $('rum-start').onclick = () => {
      if (!med) return toast('Deltag selv først');
      kald({ handling: 'deltag', kode: (data() || {}).kode || '', navn: med.navn }).finally(naesteRunde);
    };
    $('rum-close').onclick = () => el.remove();
  }

  /* ---------------- altid opdateret ---------------- */
  let sidste = '';
  let sidsteBuzz = 0;
  setInterval(() => {
    const d = data();
    if (!d) return;
    const nøgle = JSON.stringify([d.fase, d.tur, d.korrekt, d.svar, d.spillere.length, d.spil]);
    if (nøgle !== sidste) {
      sidste = nøgle;
      try { tegnSpil(d); } catch (e) {}
    }
    if (d.buzzere.length > sidsteBuzz) { if (sidsteBuzz) biplyd(1000); sidsteBuzz = d.buzzere.length; }
  }, 1200);

  window.hsRum = dialog;
  const home0 = window.home;
  window.home = function () {
    const r = home0.apply(this, arguments);
    try {
      if (!med || !med.kode) return r;
      const m = document.getElementById('main');
      if (!m || document.getElementById('rumbanner')) return r;
      const d = document.createElement('div');
      d.id = 'rumbanner'; d.className = 'card glass';
      d.style.cssText = 'margin:0 0 14px;padding:12px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap';
      d.innerHTML = '<b>📱 ' + (window.HSLANG === 'en' ? 'Room ' : 'Rum ') + med.kode + '</b>'
        + '<span class="hint" style="flex:1">' + (window.HSLANG === 'en' ? 'You are playing together' : 'I spiller sammen') + '</span>'
        + '<button class="btn ghost" id="rum-banner-forlad">' + (window.HSLANG === 'en' ? 'Leave' : 'Forlad') + '</button>';
      m.insertBefore(d, m.firstChild);
      d.querySelector('#rum-banner-forlad').onclick = () => { kald({ handling: 'forlad' }).finally(() => { gemMed(null); render(); }); };
    } catch (e) {}
    return r;
  };
  window.hsRumKan = () => !!(window.HSRUM && window.HSRUM.kan());
})();


/* I et rum kan værten starte et spil direkte fra forsiden – alle telefoner følger med. */
(function () {
  if (!window.hsStart) return;
  const hs0 = window.hsStart;
  window.hsStart = function (id) {
    try {
      if (med && erVaert()) {
        const g = (window.GAMES || []).find(x => x.id === id);
        if (g && g.key && g.kind !== 'mix' && g.kind !== 'menu') {
          let l = [];
          try { l = pool(g.key); } catch (e) {}
          if (l && l.length >= 10) { naesteRunde(g.key); return; }
        }
      }
      if (med && !erVaert()) {
        toast(window.HSLANG === 'en' ? 'You are in a room – the host starts the game' : 'Du er i et rum – værten starter spillet');
        return;
      }
    } catch (e) {}
    return hs0.apply(this, arguments);
  };
})();

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
    const vis = d && d.fase && d.fase !== 'lobby' && (d.spoergsmaal || d.spil === 'forklar');
    el.style.display = vis ? 'block' : 'none';
    /* når runden går i gang, lukkes indstillingsboksen, så den ikke dækker spillet */
    if (vis) { const dlg = document.querySelector('.modal'); if (dlg && dlg.querySelector('#rum-close')) dlg.remove(); }
    if (!vis) return;
    if (d.spil === 'forklar') { tegnForklar(el, d); return; }
    const q = d.spoergsmaal, opts = q.o || [];
    const minTur = erMinTur(), afsloeret = d.fase === 'afsloret';
    const navn = QUIZ.find(x => x[0] === d.spil);
    el.innerHTML = '<div class="rp"><div class="top">'
      + '<div class="sp">' + (navn ? navn[1] : 'Fælles spil') + '</div>'
      + '<span style="opacity:.7">Rum ' + d.kode + '</span>'
      + '<button class="btn ghost" id="rum-aabn">Rum</button>'
      + (erVaert() ? '<button class="btn ghost" id="rum-luk-spil">Afslut</button>' : '')
      + (med ? '<button class="btn ghost" id="rum-forlad2">Forlad</button>' : '')
      + '</div>'
      + '<div class="hvem' + (minTur && !afsloeret ? ' mig' : '') + '">' + (afsloeret
        ? (d.svar === d.korrekt ? '✅ Rigtigt svar' : '❌ Forkert svar')
        : (minTur ? '🎯 Det er din tur' : '⏳ Det er ' + d.turNavn + 's tur')) + '</div>'
      + '<div class="q">' + q.q + '</div>'
      + '<div class="svar">' + opts.map((t, i) => {
        const korrekt = afsloeret && i === d.korrekt;
        const fejl = afsloeret && i === d.svar && i !== d.korrekt;
        return '<button data-s="' + i + '"' + ((!minTur || afsloeret) ? ' disabled' : '') + ' class="' + (korrekt ? 'korrekt' : fejl ? 'fejl' : '') + '">'
          + '<span class="k">' + (korrekt ? '✓' : fejl ? '✗' : 'ABCD'[i]) + '</span><span>' + t + '</span></button>';
      }).join('') + '</div>'
      + '<div class="point">' + d.spillere.map((p, i) => '<span' + (i === d.tur ? ' style="outline:2px solid #ffb703"' : '') + '>' + p.navn + ': ' + p.point + '</span>').join('') + '</div>'
      + (afsloeret && erVaert() ? '<div class="row" style="margin-top:14px"><button class="btn big green" id="rum-naeste">Næste spørgsmål →</button></div>' : '')
      + (!med ? '<p class="hint" style="margin-top:10px">Deltag fra din egen telefon med knappen 📱.</p>' : '')
      + '</div>';
    if (minTur && !afsloeret) {
      el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
        kald({ handling: 'svar', svar: +b.dataset.s }).then(() => biplyd(560)).catch(e => toast(e.message));
      });
    }
    const nx = document.getElementById('rum-naeste');
    if (nx) nx.onclick = naesteRunde;
    const aabn = document.getElementById('rum-aabn');
    if (aabn) aabn.onclick = dialog;
    const luk = document.getElementById('rum-luk-spil');
    if (luk) luk.onclick = () => kald({ handling: 'afslut' }).catch(e => toast(e.message));
    const fl = document.getElementById('rum-forlad2');
    if (fl) fl.onclick = () => kald({ handling: 'forlad' }).then(() => { gemMed(null); el.style.display = 'none'; });
  }

  /* værten vælger en tilfældig opgave fra den valgte pulje */
  function naesteRunde() {
    const sel = document.getElementById('rum-pulje');
    const key = (sel && sel.value) || 'harry';
    const d = data();

    if (key === 'forklar') {
      const liste = (window.DATA && (window.DATA.taboo_en && window.HSLANG === 'en' ? window.DATA.taboo_en : window.DATA.taboo)) || [];
      if (!liste.length) { toast('Taboo-puljen er tom'); return; }
      const it = liste[Math.floor(Math.random() * liste.length)];
      const w = Array.isArray(it) ? it[0] : it.w;
      const f = Array.isArray(it) ? it.slice(1, 4) : (it.f || []);
      const antal = d && d.spillere.length ? d.spillere.length : 1;
      const maal = (d && d.fase !== 'lobby') ? (d.tur + 1) % antal : 0;
      kald({
        handling: (d && d.fase === 'lobby') ? 'start' : 'naeste',
        spil: 'forklar',
        spoergsmaal: { q: 'Forklar ordet – uden at sige de forbudte ord' },
        privat: { [maal]: { w, f } },
      }).then(() => biplyd(760)).catch(e => toast(e.message));
      return;
    }

    const liste = (window.DATA && (window.DATA[key + (window.HSLANG === 'en' ? '_en' : '')] || window.DATA[key])) || [];
    if (!liste.length) { toast('Puljen er tom'); return; }
    let bag = [];
    try { bag = JSON.parse(localStorage.getItem('hs_rum_bag_' + key) || '[]'); } catch (e) {}
    if (!bag.length) bag = liste.map((_, i) => i).sort(() => Math.random() - 0.5);
    const idx = bag.pop();
    try { localStorage.setItem('hs_rum_bag_' + key, JSON.stringify(bag)); } catch (e) {}
    const it = liste[idx];
    const q = Array.isArray(it) ? { q: it[0], o: it[1] } : { q: it.q, o: it.o };
    const korrekt = Array.isArray(it) ? it[2] : it.a;
    kald({
      handling: (d && d.fase === 'lobby') ? 'start' : 'naeste',
      spil: key, spoergsmaal: q, korrekt,
    }).then(() => biplyd(760)).catch(e => toast(e.message));
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
      + QUIZ.map(([k, t]) => '<option value="' + k + '">' + t + '</option>').join('') + '</select>'
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
      if (online && window.HSRUM) {
        window.HSRUM.opret().then(() => { biplyd(); setTimeout(tegn, 300); }).catch(e => toast(e.message));
      } else {
        const k = String(Math.floor(1000 + Math.random() * 9000));
        kald({ handling: 'opret', kode: k }).then(() => { biplyd(); setTimeout(tegn, 300); }).catch(e => toast(e.message));
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
  window.hsRumKan = () => !!(window.HSRUM && window.HSRUM.kan());
})();

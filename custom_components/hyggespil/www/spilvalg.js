/* Hyggespil: spilindstillinger og spænding (v1).
 *
 * Tre ting, som kan sættes FØR et spil starter – og ændres undervejs med tandhjulet:
 *   1) en nedtælling på en selvvalgt tid,
 *   2) ekstra point, hvis svaret kommer hurtigt,
 *   3) et lokalt musikstykke, der spiller de sidste sekunder.
 *
 * Derudover sendes spillets tilstand til Home Assistant, så lys og andre automatiseringer
 * kan følge med (sensor.hyggespil_spil + hændelsen hyggespil_spil_status).
 *
 * Alt gemmes lokalt på enheden (localStorage + IndexedDB). Intet forlader hjemmet.
 */
(function () {
  if (window.HSV) return;
  /* index.html har LS som en global const (ikke window.LS). Brug den, ellers en lille lokal lagerhjælper. */
  const lager = (typeof window !== 'undefined' && window.LS && typeof window.LS.get === 'function') ? window.LS : {
    get(k, d) { try { const v = localStorage.getItem('hs_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('hs_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const aes = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const esc = aes;
  const spillere = () => { try { const h = window.hsSpil; return (h && h.players) || []; } catch (e) { return []; } };
  const STANDARD = { tid: 0, bonus: 0, bonusInden: 10, musikStart: 10, musik: '', musikNavn: '', lyd: true,
    oplaes: true, taleRate: 1, stemme: '', haTts: '', haPlayer: '' };
  /* Indstillinger findes på to niveauer:
     - globalt (valg): gælder alle spil
     - pr. spil (valg_spil): overstyrer de globale for det ene spil
     Enhedens egen højtaler er standard (oplaes: true, ingen HA-højtaler valgt). */
  const NG = 'valg', NPS = 'valg_spil', NSAT = 'indst';
  let globalt = Object.assign({}, STANDARD, (LS && lager.get(NG, {})) || {});
  let prSpil = (LS && lager.get(NPS, {})) || {};
  let valg = Object.assign({}, globalt);
  let aktivtSpil = '', iDialog = false;
  const gemValg = () => {
    try {
      if (iDialog && aktivtSpil) { prSpil[aktivtSpil] = Object.assign({}, valg); lager.set(NPS, prSpil); }
      else { globalt = Object.assign({}, valg); lager.set(NG, globalt); }
    } catch (e) {}
  };
  const anvend = id => {
    if (id) aktivtSpil = id;
    valg = Object.assign({}, globalt, (prSpil[aktivtSpil] || {}));
  };

  /* Spil hvor en nedtælling pr. spørgsmål ikke giver mening (bræt-, terning- og 3D-spil) */
  const UDEN_TID = new Set(['rl', 'glass', 'marb', 'shiri', 'yut', 'suit', 'lot', 'shagai', 'inuit', 'wheel', 'pin', 'provw', 'dx', 'sm', 'hard', 'mix']);

  let spil = null, spilNavn = '', t0 = 0, rest = 0, ur = null, musik = null, musikBlob = null, musikSpiller = null, musikAnmodet = false;
  let bonusBrugt = new Set(), aktiv = false, sidsteSendt = 0, sidstePuls = -1;

  /* ---------------- lyd ---------------- */
  let lydKontekst = null;
  function bipper(frekvens, ms, styrke) {
    if (!valg.lyd) return;
    try {
      lydKontekst = lydKontekst || new (window.AudioContext || window.webkitAudioContext)();
      const o = lydKontekst.createOscillator(), g = lydKontekst.createGain();
      o.type = 'sine'; o.frequency.value = frekvens;
      g.gain.setValueAtTime(0.0001, lydKontekst.currentTime);
      g.gain.exponentialRampToValueAtTime(styrke || 0.18, lydKontekst.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, lydKontekst.currentTime + (ms || 180) / 1000);
      o.connect(g); g.connect(lydKontekst.destination);
      o.start(); o.stop(lydKontekst.currentTime + (ms || 180) / 1000 + 0.02);
    } catch (e) {}
  }

  /* ---------------- musik (IndexedDB, så filen huskes) ---------------- */
  function db(version) {
    return new Promise((res, rej) => {
      const r = indexedDB.open('hs_musik', version || 2);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('filer')) d.createObjectStore('filer');
      };
      r.onsuccess = () => {
        const d = r.result;
        /* en tidligere version af appen kan have oprettet databasen uden lageret */
        if (!d.objectStoreNames.contains('filer')) { const nv = d.version + 1; d.close(); res(db(nv)); return; }
        res(d);
      };
      r.onerror = () => rej(r.error);
    });
  }
  async function gemMusik(blob, navn) {
    const d = await db();
    await new Promise((res, rej) => {
      const t = d.transaction('filer', 'readwrite');
      t.objectStore('filer').put({ blob, navn }, 'spaending');
      t.oncomplete = res; t.onerror = () => rej(t.error);
    });
    musikBlob = blob; valg.musikNavn = navn; gemValg();
  }
  async function hentMusik() {
    if (musikBlob) return musikBlob;
    try {
      const d = await db();
      const post = await new Promise((res, rej) => {
        const t = d.transaction('filer', 'readonly');
        const q = t.objectStore('filer').get('spaending');
        q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
      });
      if (post && post.blob) { musikBlob = post.blob; if (!valg.musikNavn) valg.musikNavn = post.navn || ''; }
    } catch (e) {}
    return musikBlob;
  }
  /* Indbyggede lyde – filerne ligger i www/lyd og er lavet af tools/lav_lyde.py (egne, MIT).
     De sidste fire er loops; resten spiller én gang. */
  const LYDE = [
    ['spaending', 'Dyb spænding'], ['fare', 'Fare på vej'], ['tikken', 'Ur der tikker (loop)'],
    ['langsomt-ur', 'Langsomt ur (loop)'], ['hjerte', 'Hjerteslag (loop)'],
    ['trommer', 'Krigstrommer'], ['sting', 'Drama-sting'], ['whoosh', 'Filmisk whoosh'],
    ['forkert', 'Forkert svar'], ['vinder', 'Sejr'], ['fanfare', 'Fanfare'],
    ['sirene', 'Tid er gået'],
  ];
  const LOOP = new Set(['tikken', 'langsomt-ur', 'hjerte']);
  const MUSIK_VOL = 0.85, DUK_VOL = 0.12;

  async function spilMusik() {
    if (musikSpiller || musikAnmodet) return;
    musikAnmodet = true;
    let kilde = null, loop = true;
    if (valg.musik === 'egen') {
      const blob = await hentMusik();
      if (!blob) { musikAnmodet = false; return; }
      kilde = URL.createObjectURL(blob);
    } else if (valg.musik) {
      kilde = 'lyd/' + valg.musik + '.mp3';
      loop = LOOP.has(valg.musik);
    } else { musikAnmodet = false; return; }
    try {
      musikSpiller = new Audio(kilde);
      musikSpiller.loop = loop; musikSpiller.volume = 0;
      await musikSpiller.play();
      rampTil(volum());
    } catch (e) { musikSpiller = null; musikAnmodet = false; }
  }
  let musikRamp = null, dukket = false, musikFra = false, musikInterval = null;
  function volum() { return dukket ? DUK_VOL : MUSIK_VOL; }
  function rampTil(mål) {
    if (!musikSpiller) return;
    clearInterval(musikRamp);
    musikRamp = setInterval(() => {
      if (!musikSpiller) { clearInterval(musikRamp); return; }
      const nu = musikSpiller.volume;
      const næste = nu + (mål - nu) * 0.25;
      try { musikSpiller.volume = Math.max(0, Math.min(1, næste)); } catch (e) {}
      if (Math.abs(næste - mål) < 0.01) { try { musikSpiller.volume = mål; } catch (e) {} clearInterval(musikRamp); }
    }, 60);
  }
  /* Dæmp musikken mens der læses op – den fortsætter, bare lavere */
  function duk(ned) {
    dukket = !!ned;
    if (musikSpiller) rampTil(volum());
  }
  function stopMusik() {
    musikAnmodet = false;
    clearInterval(musikRamp);
    if (!musikSpiller) return;
    try { musikSpiller.pause(); musikSpiller.currentTime = 0; } catch (e) {}
    musikSpiller = null;
  }
  function musikAktiv() { return !!musikSpiller; }

  /* ---------------- Home Assistant ---------------- */
  function hassObjekt() {
    try { const el = window.parent.document.querySelector('home-assistant'); return (el && el.hass) || null; } catch (e) { return null; }
  }
  let wsForb = null, wsId = 1;
  function wsSend(besked) {
    return new Promise((res, rej) => {
      const klar = wsForb ? Promise.resolve(wsForb) : new Promise((ok, fejl) => {
        let tok = null;
        try { tok = JSON.parse(localStorage.getItem('hassTokens') || '{}').access_token; } catch (e) {}
        if (!tok) { fejl('ingen adgangsnøgle'); return; }
        const sti = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/api/websocket';
        const w = new WebSocket(sti);
        w.onmessage = e => {
          let m = {}; try { m = JSON.parse(e.data); } catch (x) {}
          if (m.type === 'auth_required') w.send(JSON.stringify({ type: 'auth', access_token: tok }));
          else if (m.type === 'auth_ok') { wsForb = w; ok(w); }
          else if (m.type === 'auth_invalid') fejl('adgangsnøgle afvist');
        };
        w.onerror = () => fejl('kunne ikke åbne websocket');
      });
      klar.then(w => {
        const id = wsId++;
        const lyt = e => {
          let m = {}; try { m = JSON.parse(e.data); } catch (x) {}
          if (m.id === id) { w.removeEventListener('message', lyt); m.success ? res(m.result) : rej(m.error); }
        };
        w.addEventListener('message', lyt);
        w.send(JSON.stringify(Object.assign({ id }, besked)));
      }).catch(rej);
    });
  }
  function sendHa(nu) {
    const t = Date.now();
    if (nu !== true && t - sidsteSendt < 1000) return;
    sidsteSendt = t;
    const data = {
      state: aktiv ? 'spiller' : (spil ? 'slut' : 'klar'),
      spil: spil || '',
      spil_navn: spilNavn || '',
      spillere: spillere().map(p => p.n),
      sekunder: Math.max(0, Math.ceil(rest)),
      tid: valg.tid,
      urgency: valg.tid ? Math.min(1, Math.max(0, 1 - rest / valg.tid)) : 0,
      puls: sidstePuls >= 0 ? sidstePuls : 0,
      musik: !!valg.musik,
    };
    const h = hassObjekt();
    if (h && h.callService) { h.callService('hyggespil', 'status', data).catch(() => {}); return; }
    /* uden for panelet (fx lokal test): samme tjeneste over websocket */
    wsSend({ type: 'call_service', domain: 'hyggespil', service: 'status', service_data: data }).catch(() => {});
  }

  /* ---------------- nedtælling ---------------- */
  function urEl() {
    let el = document.getElementById('hsv-ur');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hsv-ur';
      el.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:45;display:none;align-items:center;gap:10px;' +
        'padding:8px 14px 8px 10px;border-radius:30px;background:rgba(28,20,66,.92);border:1px solid rgba(255,255,255,.2);' +
        'box-shadow:0 8px 30px rgba(0,0,0,.45);font-weight:800;font-variant-numeric:tabular-nums';
      el.innerHTML = '<span id="hsv-ring" style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:13px;background:conic-gradient(#4cc9f0 0deg,#2b2358 0deg)">' +
        '<span style="width:26px;height:26px;border-radius:50%;background:#1c1442;display:grid;place-items:center" id="hsv-tal">0</span></span>' +
        '<span id="hsv-tekst" style="font-size:13px;opacity:.9">klar</span>';
      document.body.appendChild(el);
    }
    return el;
  }
  function visUr(vis) { const el = urEl(); el.style.display = vis ? 'flex' : 'none'; }
  function tegnUr() {
    const el = urEl(); if (el.style.display === 'none') return;
    const s = Math.max(0, Math.ceil(rest));
    const andel = valg.tid ? Math.min(1, rest / valg.tid) : 0;
    const farve = rest <= 0 ? '#ff3d6e' : andel < 0.25 ? '#ff5d8f' : andel < 0.55 ? '#ffb703' : '#4cc9f0';
    document.getElementById('hsv-tal').textContent = s;
    document.getElementById('hsv-ring').style.background = 'conic-gradient(' + farve + ' ' + (andel * 360) + 'deg,#2b2358 0deg)';
    document.getElementById('hsv-tekst').textContent = rest <= 0 ? 'Tiden er gået' : (valg.bonus ? 'hurtigt svar: +' + valg.bonus : 'sek');
  }

  function stopUr(behold) {
    if (ur) { clearInterval(ur); ur = null; }
    aktiv = false;
    stopMusik();
    if (!behold) visUr(false);
  }

  function forbered() {
    bonusBrugt = new Set();
    t0 = Date.now();
    rest = valg.tid || 0;
    aktiv = !!(valg.tid && !UDEN_TID.has(spil));
  }

  function startUr() {
    stopUr(true);
    if (!valg.tid || UDEN_TID.has(spil)) { visUr(false); sendHa(true); return; }
    forbered();
    visUr(true); tegnUr(); sendHa(true);
    ur = setInterval(() => {
      rest = valg.tid - (Date.now() - t0) / 1000;
      /* pulsslag: langsomt i starten, hurtigere og kraftigere mod udløb */
      const u = Math.min(1, Math.max(0, 1 - rest / valg.tid));
      sidstePuls = 0.5 + 0.5 * Math.sin((Date.now() / 1000) * (2 + 10 * u) * Math.PI);
      if (rest <= valg.musikStart && rest > 0 && musikSpiller === null && valg.musik && !musikFra) spilMusik();
      if (rest <= 0) {
        stopMusik();
        bipper(180, 420, 0.22); setTimeout(() => bipper(140, 520, 0.2), 260);
        document.getElementById('hsv-ur').animate(
          [{ boxShadow: '0 0 0 0 rgba(255,61,110,.9)' }, { boxShadow: '0 0 0 18px rgba(255,61,110,0)' }],
          { duration: 900, iterations: 2 });
      }
      tegnUr(); sendHa(false);
      if (rest <= 0 && ur) { clearInterval(ur); ur = null; }
    }, 200);
  }

  /* ---------------- hurtigt svar ---------------- */
  const add0 = window.add;
  window.add = function (i, n) {
    try {
      if (aktiv && n > 0 && valg.bonus > 0 && !bonusBrugt.has(i) && valg.tid && rest > 0 &&
          (Date.now() - t0) <= valg.bonusInden * 1000) {
        bonusBrugt.add(i);
        const navn = (spillere()[i] && spillere()[i].n) || 'Spiller';
        visToast(navn + ' svarede hurtigt: +' + valg.bonus + ' point');
        bipper(880, 140, 0.14);
        return add0.call(this, i, n + valg.bonus);
      }
    } catch (e) {}
    return add0.apply(this, arguments);
  };

  function visToast(tekst) {
    const d = document.createElement('div');
    d.textContent = tekst;
    d.style.cssText = 'position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:60;padding:10px 18px;border-radius:20px;' +
      'background:linear-gradient(135deg,#2ec4b6,#80ed99);color:#06221f;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(() => { d.style.transition = 'opacity .5s'; d.style.opacity = '0'; }, 1400);
    setTimeout(() => d.remove(), 2000);
  }

  /* ---------------- indstillingsdialog ---------------- */
  /* Vælger til Home Assistants egne enheder (tts.* og media_player.*), så man ikke skal skrive id'er */
  function enhedsListe(domæne) {
    const h = hassObjekt();
    if (!h || !h.states) return null;
    return Object.keys(h.states)
      .filter(e => e.startsWith(domæne + '.'))
      .sort()
      .map(e => ({
        id: e,
        navn: (h.states[e] && h.states[e].attributes && h.states[e].attributes.friendly_name) || e,
      }));
  }
  function enhedsFelt(id, domæne, nu, tomTekst) {
    const liste = enhedsListe(domæne);
    if (!liste) {
      return '<input class="in" id="' + id + '" placeholder="' + esc(tomTekst) + '" value="' + esc(nu || '') + '" style="max-width:240px">';
    }
    const valgt = nu || '';
    const kendt = liste.some(x => x.id === valgt);
    return '<select class="in" id="' + id + '" style="max-width:260px;text-align:left">' +
      '<option value="">' + esc(tomTekst) + '</option>' +
      (valgt && !kendt ? '<option value="' + esc(valgt) + '" selected>' + esc(valgt) + ' (gemt)</option>' : '') +
      liste.map(x => '<option value="' + esc(x.id) + '"' + (x.id === valgt ? ' selected' : '') + '>' +
        esc(x.navn) + ' – ' + esc(x.id) + '</option>').join('') +
      '</select>';
  }
  const ttsFelt = () => enhedsFelt('hsv-hatts', 'tts', valg.haTts, 'Ingen – brug browserens stemme');
  const højttalerFelt = () => enhedsFelt('hsv-haplayer', 'media_player', valg.haPlayer, 'Ingen højttaler');

  function dialog() {
    return new Promise(res => {
      const o = document.createElement('div');
      o.className = 'modal';
      o.style.zIndex = '70';
      const knap = (v, tekst) => '<button class="btn' + (valg.tid === v ? '' : ' ghost') + '" data-tid="' + v + '" style="padding:8px 14px;border-radius:12px">' + tekst + '</button>';
      const førsteGang = !lager.get(NSAT, false);
      let omfang = førsteGang ? 'alle' : 'spil';
      iDialog = true;
      o.innerHTML = '<div class="mbox" style="width:min(560px,100%)">' +
        '<h2 style="margin:0 0 4px">Indstillinger til ' + esc(spilNavn || 'spillet') + '</h2>' +
        '<p class="hint" style="text-align:left;margin-top:0">Du kan altid ændre det igen med <b>⚙</b> i spillets bjælke.</p>' +
        '<h3 style="margin:14px 0 6px">🎯 Hvad skal indstillingerne gælde for?</h3>' +
        '<div class="row" style="justify-content:flex-start" id="hsv-omfang">' +
        '<button class="btn" data-omfang="spil">Kun «' + esc(spilNavn || 'dette spil') + '»</button>' +
        '<button class="btn ghost" data-omfang="alle">Alle spil</button></div>' +
        '<h3 style="margin:16px 0 6px">⏱️ Tid pr. spørgsmål</h3>' +
        '<div class="row" style="justify-content:flex-start" id="hsv-tid">' + knap(0, 'Ingen') + [30, 45, 60, 90, 120].map(s => knap(s, s + ' sek')).join('') +
        '<input class="in" id="hsv-egen" type="number" min="5" max="600" placeholder="egen" style="width:90px;text-align:center" value="' + (valg.tid && [0, 30, 45, 60, 90, 120].indexOf(valg.tid) < 0 ? valg.tid : '') + '"></div>' +
        '<h3 style="margin:16px 0 6px">⚡ Ekstra point for hurtigt svar</h3>' +
        '<div class="row" style="justify-content:flex-start" id="hsv-bonus">' + [0, 1, 2, 3].map(b => '<button class="btn' + (valg.bonus === b ? '' : ' ghost') + '" data-bonus="' + b + '" style="padding:8px 14px;border-radius:12px">' + (b ? '+' + b : 'Ingen') + '</button>').join('') + '</div>' +
        '<p class="hint" style="text-align:left;margin:6px 0 0">Pointene gives, hvis svaret kommer inden for ' +
        '<input class="in" id="hsv-inden" type="number" min="3" max="300" value="' + valg.bonusInden + '" style="width:70px;text-align:center;padding:4px 8px"> sekunder.</p>' +
        '<h3 style="margin:16px 0 6px">🎵 Spændingsmusik</h3>' +
        '<div class="row" style="justify-content:flex-start">' +
        '<select class="in" id="hsv-musik" style="max-width:280px;text-align:left">' +
        '<option value="">Ingen musik</option>' +
        '<optgroup label="Indbyggede lyde">' +
        LYDE.map(l => '<option value="' + l[0] + '"' + (valg.musik === l[0] ? ' selected' : '') + '>' + esc(l[1]) + '</option>').join('') +
        '</optgroup>' +
        '<option value="egen"' + (valg.musik === 'egen' ? ' selected' : '') + '>Egen fil fra enheden…</option>' +
        '</select>' +
        '<button class="btn ghost" id="hsv-lytmusik" style="padding:8px 14px;border-radius:12px">Prøv lyd</button>' +
        '<label class="btn ghost" id="hsv-vaelefil" style="padding:8px 14px;border-radius:12px;cursor:pointer;display:none">Vælg fil<input type="file" id="hsv-fil" accept="audio/*" style="display:none"></label>' +
        '</div>' +
        '<p class="hint" id="hsv-filnavn" style="text-align:left;margin:6px 0 0">' + (valg.musikNavn ? esc(valg.musikNavn) : '') + '</p>' +
        '<p class="hint" style="text-align:left;margin:6px 0 0">Spiller de sidste ' +
        '<input class="in" id="hsv-start" type="number" min="3" max="120" value="' + valg.musikStart + '" style="width:70px;text-align:center;padding:4px 8px"> sekunder af nedtællingen (kræver en tid). Vælg «Ingen musik» for at slå det helt fra – også midt i spillet med 🎵-knappen.</p>' +
        '<p class="hint" style="text-align:left;margin:2px 0 0;font-size:11px">Lyde fra OpenGameArt (CC0/CC-BY) og egen syntese – kreditering står i <code>lyd/CREDITS.txt</code>.</p>' +
        '<h3 style="margin:16px 0 6px">🔊 Oplæsning af spørgsmål</h3>' +
        '<label style="display:flex;gap:8px;align-items:center;font-weight:700;cursor:pointer">' +
        '<input type="checkbox" id="hsv-oplaes"' + (valg.oplaes ? ' checked' : '') + '> Læs spørgsmålet op, når det vises</label>' +
        '<div class="row" style="justify-content:flex-start;margin-top:8px">' +
        '<select class="in" id="hsv-stemme" style="max-width:230px;text-align:left"></select>' +
        '<input class="in" id="hsv-rate" type="number" min="0.5" max="2" step="0.1" value="' + valg.taleRate + '" title="Talehastighed" style="width:80px;text-align:center">' +
        '<button class="btn ghost" id="hsv-prov" style="padding:8px 12px;border-radius:12px">Prøv</button>' +
        '<button class="btn ghost" id="hsv-opsaet" style="padding:8px 12px;border-radius:12px">Opsæt stemme</button>' +
        '</div>' +
        '<p class="hint" style="text-align:left;margin:6px 0 0">Bruger enhedens egne stemmer – ingen forbindelse til internettet.</p>' +
        '<details style="margin-top:8px"><summary class="hint" style="cursor:pointer">Læs op via en Home Assistant-højttaler i stedet</summary>' +
        '<div class="row" style="justify-content:flex-start;margin-top:8px">' +
        ttsFelt() + højttalerFelt() +
        '</div><p class="hint" style="text-align:left;margin:6px 0 0">Vælg begge for at bruge højttaleren. Ellers læses der op i browseren.</p></details>' +
        '<div class="row" style="margin-top:18px"><button class="btn big green" id="hsv-startspil">Start spil</button>' +
        '<button class="btn ghost" id="hsv-uden">Uden tid</button>' +
        '<button class="btn ghost" id="hsv-tilmenu">← Alle spil</button></div></div>';
      document.body.appendChild(o);
      const $ = id => o.querySelector('#' + id);
      const tegnOmfang = () => o.querySelectorAll('[data-omfang]').forEach(b =>
        b.className = 'btn' + (b.dataset.omfang === omfang ? '' : ' ghost'));
      o.querySelectorAll('[data-omfang]').forEach(b => b.onclick = () => { omfang = b.dataset.omfang; tegnOmfang(); });
      tegnOmfang();
      const opdaterKnapper = () => {
        o.querySelectorAll('[data-tid]').forEach(b => b.className = 'btn' + (+b.dataset.tid === valg.tid ? '' : ' ghost'));
        o.querySelectorAll('[data-bonus]').forEach(b => b.className = 'btn' + (+b.dataset.bonus === valg.bonus ? '' : ' ghost'));
      };
      o.querySelectorAll('[data-tid]').forEach(b => b.onclick = () => { valg.tid = +b.dataset.tid; $('hsv-egen').value = ''; opdaterKnapper(); });
      o.querySelectorAll('[data-bonus]').forEach(b => b.onclick = () => { valg.bonus = +b.dataset.bonus; opdaterKnapper(); });
      $('hsv-egen').oninput = () => { const v = +$('hsv-egen').value; if (v >= 5) { valg.tid = v; opdaterKnapper(); } };
      $('hsv-inden').oninput = () => { const v = +$('hsv-inden').value; if (v >= 3) valg.bonusInden = v; };
      $('hsv-start').oninput = () => { const v = +$('hsv-start').value; if (v >= 3) valg.musikStart = v; };
      /* musik: indbygget lyd, egen fil eller ingen */
      const visFil = () => { $('hsv-vaelefil').style.display = valg.musik === 'egen' ? '' : 'none'; };
      visFil();
      $('hsv-musik').onchange = e => { valg.musik = e.target.value; gemValg(); visFil(); };
      $('hsv-lytmusik').onclick = () => {
        stopMusik();
        const id = valg.musik === 'egen' ? '' : valg.musik;
        if (!id) { visToast('Vælg en lyd først'); return; }
        const a = new Audio('lyd/' + id + '.mp3');
        a.volume = 0.9; a.loop = LOOP.has(id); a.play().catch(() => {});
        setTimeout(() => { try { a.pause(); } catch (e) {} }, 4000);
      };
      /* oplæsning */
      const stemmer = (window.HSTTS && window.HSTTS.stemmer) ? window.HSTTS.stemmer() : [];
      const selv = $('hsv-stemme');
      selv.innerHTML = stemmer.length
        ? stemmer.map(s => '<option value="' + esc(s.voiceURI || s.name) + '"' + ((valg.stemme === (s.voiceURI || s.name)) ? ' selected' : '') + '>' + esc(s.name) + ' (' + esc(s.lang) + ')</option>').join('')
        : '<option value="">Enhedens standardsstemme</option>';
      $('hsv-oplaes').onchange = e => { valg.oplaes = e.target.checked; gemValg(); };
      selv.onchange = e => { valg.stemme = e.target.value; gemValg(); };
      $('hsv-rate').oninput = e => { const v = +e.target.value; if (v >= 0.5 && v <= 2) { valg.taleRate = v; gemValg(); } };
      $('hsv-prov').onclick = () => { if (window.HSTTS) window.HSTTS.tal('Om lidt bliver det din tur. Hvad er Danmarks hovedstad?', true); };
      $('hsv-opsaet').onclick = () => { if (window.HSTTS && window.HSTTS.guide) window.HSTTS.guide(); };
      $('hsv-hatts').onchange = $('hsv-hatts').oninput = e => { valg.haTts = e.target.value.trim(); gemValg(); };
      $('hsv-haplayer').onchange = $('hsv-haplayer').oninput = e => { valg.haPlayer = e.target.value.trim(); gemValg(); };
      $('hsv-fil').onchange = async e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        if (f.size > 8 * 1024 * 1024) { visToast('Filen er over 8 MB - vælg en mindre'); return; }
        await gemMusik(f, f.name);
        valg.musik = 'egen'; gemValg();
        $('hsv-filnavn').textContent = f.name;
        visToast('Musik gemt på denne enhed');
      };
      const gemOmfang = () => {
        try {
          if (omfang === 'alle') {
            globalt = Object.assign({}, valg);
            delete prSpil[aktivtSpil];
            lager.set(NG, globalt); lager.set(NPS, prSpil);
          } else if (aktivtSpil) {
            prSpil[aktivtSpil] = Object.assign({}, valg);
            lager.set(NPS, prSpil);
          }
          lager.set(NSAT, true);
        } catch (e) {}
        iDialog = false;
      };
      const luk = (medTid) => {
        if (!medTid) { valg.tid = 0; }
        gemOmfang(); o.remove();
        if (medTid) bipper(660, 120, 0.12);
        res(true);
      };
      /* Fortryd: luk boksen og gå til spiloversigten uden at starte noget.
         Ankeret sættes, så man lander ved det spil, man trykkede på. */
      const tilMenu = () => {
        gemOmfang(); o.remove(); stopUr(false);
        try { if (spil && window.hsAnker) window.hsAnker(spil); } catch (e) {}
        res(false);
        try { window.go('home'); } catch (e) {}
      };
      $('hsv-startspil').onclick = () => luk(true);
      $('hsv-uden').onclick = () => luk(false);
      $('hsv-tilmenu').onclick = tilMenu;
      o.addEventListener('click', e => { if (e.target === o) luk(true); });
    });
  }

  /* ---------------- kroge i spillet ---------------- */
  const start0 = window.start;
  window.start = function (id) {
    try {
      const fraMenu = !spil;               // kun før et spil - ikke ved "Spil igen"
      spil = id || spil; spilNavn = '';
      try { const x = window.hsSpil && window.hsSpil.gm ? window.hsSpil.gm(spil) : null; spilNavn = x ? x.t : spil; } catch (e) {}
      anvend(spil);                        // spillets egne indstillinger (eller de fælles)
      if (fraMenu) {
        /* Indstillingerne vises kun én gang – ved det første spil.
           Bagefter huskes de, og de ændres med ⚙ i spillets bjælke. */
        if (lager.get(NSAT, false)) {
          if (valg.tid) visToast(valg.tid + ' sek. pr. spørgsmål' + (valg.bonus ? ' · +' + valg.bonus + ' for hurtigt svar' : ''));
          return start0.apply(window, arguments);
        }
        dialog().then(startNu => {
          if (!startNu) return;              // «← Alle spil»: intet spil startes
          if (valg.tid) visToast(valg.tid + ' sek. pr. spørgsmål' + (valg.bonus ? ' · +' + valg.bonus + ' for hurtigt svar' : ''));
          start0.apply(window, arguments);
        });
        return;
      }
    } catch (e) {}
    return start0.apply(window, arguments);
  };

  const next0 = window.next;
  if (typeof next0 === 'function') window.next = function () {
    forbered();                       // gælder med det samme, også før nedtællingen er tegnet
    const r = next0.apply(window, arguments);
    if (spil && valg.tid) setTimeout(startUr, 30);
    return r;
  };

  const go0 = window.go;
  window.go = function (v) {
    const r = go0.apply(window, arguments);
    if (v === 'home') { spil = null; spilNavn = ''; stopUr(false); sendHa(true); }
    return r;
  };

  /* "Afslut spil": stop nedtællingen, når stillingen vises */
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest && e.target.closest('#endg');
    if (t) { stopUr(true); sendHa(true); }
  }, true);

  /* tandhjul i spillets bjælke */
  const game0 = window.game;
  window.game = function () {
    const r = game0.apply(window, arguments);
    try {
      const bar = document.querySelector('#main .bar');
      if (bar && !document.getElementById('hsv-stil')) {
        const b = document.createElement('button');
        b.id = 'hsv-stil'; b.className = 'btn ghost'; b.textContent = '⚙';
        b.title = 'Tid, hurtigt-svar-point og musik';
        b.onclick = () => dialog().then(ok => { if (ok) startUr(); });
        bar.appendChild(b);
      }
      /* musik til/fra med ét tryk – musikken kan altid fravælges midt i spillet */
      if (bar && !document.getElementById('hsv-musikknap')) {
        const m = document.createElement('button');
        m.id = 'hsv-musikknap'; m.className = 'btn ghost';
        const tegn = () => {
          m.textContent = musikAktiv() ? '🎵' : '🔇';
          m.title = musikAktiv() ? 'Sluk musikken' : 'Tænd musikken';
        };
        m.onclick = () => {
          if (musikAktiv()) { musikFra = true; stopMusik(); }
          else if (valg.musik) { musikFra = false; spilMusik(); }
          else visToast('Ingen musik valgt – vælg en under ⚙');
          tegn();
        };
        tegn();
        bar.appendChild(m);
        if (!musikInterval) musikInterval = setInterval(() => {
          const k = document.getElementById('hsv-musikknap');
          if (k) k.textContent = musikAktiv() ? '🎵' : '🔇';
        }, 1200);
      }
    } catch (e) {}
    return r;
  };

  /* offentlig API (til test og til dokumentationen) */
  window.HSV = {
    get valg() { return valg; },
    dialog, startUr, stopUr,
    musik: { gem: gemMusik, hent: hentMusik, spil: spilMusik, stop: stopMusik, duk, aktiv: musikAktiv, lyde: LYDE },
    send: sendHa,
    status: () => ({ spil, spilNavn, rest, aktiv, puls: sidstePuls, musikAktiv: musikAktiv() }),
  };

  /* ved opstart: fortæl Home Assistant, at bordet er klar */
  setTimeout(() => sendHa(true), 800);
})();

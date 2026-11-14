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
  const LS = window.LS;
  const aes = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const esc = aes;
  const spillere = () => { try { const h = window.hsSpil; return (h && h.players) || []; } catch (e) { return []; } };
  const STANDARD = { tid: 0, bonus: 0, bonusInden: 10, musikStart: 10, musikNavn: '', lyd: true };
  let valg = Object.assign({}, STANDARD, (LS && LS.get('valg', {})) || {});
  const gemValg = () => { try { LS.set('valg', valg); } catch (e) {} };

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
  async function spilMusik() {
    if (musikSpiller || musikAnmodet) return;
    musikAnmodet = true;
    const blob = await hentMusik();
    if (!blob) return;
    try {
      musikSpiller = new Audio(URL.createObjectURL(blob));
      musikSpiller.loop = true; musikSpiller.volume = 0;
      await musikSpiller.play();
      let v = 0; const op = setInterval(() => { v = Math.min(1, v + 0.06); try { musikSpiller.volume = Math.min(1, v) * 0.85; } catch (e) {} if (v >= 1) clearInterval(op); }, 90);
    } catch (e) { musikSpiller = null; }
  }
  function stopMusik() {
    musikAnmodet = false;
    if (!musikSpiller) return;
    try { musikSpiller.pause(); musikSpiller.currentTime = 0; } catch (e) {}
    musikSpiller = null;
  }

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
      musik: !!valg.musikNavn,
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
      if (rest <= valg.musikStart && rest > 0 && musikSpiller === null && valg.musikNavn) spilMusik();
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
  function dialog() {
    return new Promise(res => {
      const o = document.createElement('div');
      o.className = 'modal';
      o.style.zIndex = '70';
      const knap = (v, tekst) => '<button class="btn' + (valg.tid === v ? '' : ' ghost') + '" data-tid="' + v + '" style="padding:8px 14px;border-radius:12px">' + tekst + '</button>';
      o.innerHTML = '<div class="mbox" style="width:min(560px,100%)">' +
        '<h2 style="margin:0 0 4px">Indstillinger til ' + esc(spilNavn) + '</h2>' +
        '<p class="hint" style="text-align:left;margin-top:0">Vælges inden spillet starter. Du kan ændre det undervejs med ⚙ i spillets bjælke.</p>' +
        '<h3 style="margin:14px 0 6px">⏱️ Tid pr. spørgsmål</h3>' +
        '<div class="row" style="justify-content:flex-start" id="hsv-tid">' + knap(0, 'Ingen') + [30, 45, 60, 90, 120].map(s => knap(s, s + ' sek')).join('') +
        '<input class="in" id="hsv-egen" type="number" min="5" max="600" placeholder="egen" style="width:90px;text-align:center" value="' + (valg.tid && [0, 30, 45, 60, 90, 120].indexOf(valg.tid) < 0 ? valg.tid : '') + '"></div>' +
        '<h3 style="margin:16px 0 6px">⚡ Ekstra point for hurtigt svar</h3>' +
        '<div class="row" style="justify-content:flex-start" id="hsv-bonus">' + [0, 1, 2, 3].map(b => '<button class="btn' + (valg.bonus === b ? '' : ' ghost') + '" data-bonus="' + b + '" style="padding:8px 14px;border-radius:12px">' + (b ? '+' + b : 'Ingen') + '</button>').join('') + '</div>' +
        '<p class="hint" style="text-align:left;margin:6px 0 0">Pointene gives, hvis svaret kommer inden for ' +
        '<input class="in" id="hsv-inden" type="number" min="3" max="300" value="' + valg.bonusInden + '" style="width:70px;text-align:center;padding:4px 8px"> sekunder.</p>' +
        '<h3 style="margin:16px 0 6px">🎵 Spændingsmusik</h3>' +
        '<div class="row" style="justify-content:flex-start">' +
        '<label class="btn ghost" style="padding:8px 14px;border-radius:12px;cursor:pointer">Vælg lydfil<input type="file" id="hsv-fil" accept="audio/*" style="display:none"></label>' +
        '<span class="hint" id="hsv-filnavn" style="margin:0">' + (valg.musikNavn ? esc(valg.musikNavn) : 'ingen fil valgt') + '</span>' +
        (valg.musikNavn ? '<button class="btn ghost" id="hsv-fjern" style="padding:8px 14px;border-radius:12px">Fjern</button>' : '') +
        '</div>' +
        '<p class="hint" style="text-align:left;margin:6px 0 0">Spiller de sidste ' +
        '<input class="in" id="hsv-start" type="number" min="3" max="120" value="' + valg.musikStart + '" style="width:70px;text-align:center;padding:4px 8px"> sekunder af nedtællingen (kræver en tid). Filen gemmes kun på denne enhed.</p>' +
        '<div class="row" style="margin-top:18px"><button class="btn big green" id="hsv-startspil">Start spil</button>' +
        '<button class="btn ghost" id="hsv-uden">Uden tid</button></div></div>';
      document.body.appendChild(o);
      const $ = id => o.querySelector('#' + id);
      const opdaterKnapper = () => {
        o.querySelectorAll('[data-tid]').forEach(b => b.className = 'btn' + (+b.dataset.tid === valg.tid ? '' : ' ghost'));
        o.querySelectorAll('[data-bonus]').forEach(b => b.className = 'btn' + (+b.dataset.bonus === valg.bonus ? '' : ' ghost'));
      };
      o.querySelectorAll('[data-tid]').forEach(b => b.onclick = () => { valg.tid = +b.dataset.tid; $('hsv-egen').value = ''; opdaterKnapper(); });
      o.querySelectorAll('[data-bonus]').forEach(b => b.onclick = () => { valg.bonus = +b.dataset.bonus; opdaterKnapper(); });
      $('hsv-egen').oninput = () => { const v = +$('hsv-egen').value; if (v >= 5) { valg.tid = v; opdaterKnapper(); } };
      $('hsv-inden').oninput = () => { const v = +$('hsv-inden').value; if (v >= 3) valg.bonusInden = v; };
      $('hsv-start').oninput = () => { const v = +$('hsv-start').value; if (v >= 3) valg.musikStart = v; };
      $('hsv-fil').onchange = async e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        if (f.size > 8 * 1024 * 1024) { visToast('Filen er over 8 MB - vælg en mindre'); return; }
        await gemMusik(f, f.name);
        $('hsv-filnavn').textContent = f.name;
        visToast('Musik gemt på denne enhed');
      };
      if ($('hsv-fjern')) $('hsv-fjern').onclick = async () => {
        try { const d = await db(); const t = d.transaction('filer', 'readwrite'); t.objectStore('filer').delete('spaending'); } catch (e) {}
        musikBlob = null; valg.musikNavn = ''; gemValg(); $('hsv-filnavn').textContent = 'ingen fil valgt';
      };
      const luk = (medTid) => {
        if (!medTid) { valg.tid = 0; }
        gemValg(); o.remove();
        if (medTid) bipper(660, 120, 0.12);
        res(true);
      };
      $('hsv-startspil').onclick = () => luk(true);
      $('hsv-uden').onclick = () => luk(false);
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
      if (fraMenu) {
        dialog().then(() => {
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
        b.onclick = () => dialog().then(() => startUr());
        bar.appendChild(b);
      }
    } catch (e) {}
    return r;
  };

  /* offentlig API (til test og til dokumentationen) */
  window.HSV = {
    get valg() { return valg; },
    dialog, startUr, stopUr,
    musik: { gem: gemMusik, hent: hentMusik, spil: spilMusik, stop: stopMusik },
    send: sendHa,
    status: () => ({ spil, spilNavn, rest, aktiv, puls: sidstePuls }),
  };

  /* ved opstart: fortæl Home Assistant, at bordet er klar */
  setTimeout(() => sendHa(true), 800);
})();

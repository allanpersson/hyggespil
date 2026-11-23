/* Hyggespil: fælles spil fra hver sin telefon – uden Home Assistant.
 *
 * Værten har sandheden: spillerlisten, turen, spørgsmålet og pointene. De andre
 * telefoner sender handlinger og tegner den offentlige tilstand. Alt går gennem
 * ntfy.sh (en åben beskedtjeneste) i to emner pr. rum, og indholdet er krypteret
 * med rumkoden, så tjenesten kun ser volapyk.
 *
 * Der er ingen konto, ingen e-mail og ingen sporing. Kun kaldenavn og et
 * tilfældigt enheds-id forlader telefonen.
 */
(function () {
  if (window.HSRUM) return;

  const BASE = 'https://ntfy.sh';
  /* På en lokal udviklingsserver (tools/serve.js) bruges dens eget lille relay,
     så fælles spil kan prøves uden en ekstern tjeneste. */
  const LOKAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  const ENHED = 'hs_enhed', PRIV = 'hs_privn';
  let enhed = '', noegle = '';
  try { enhed = localStorage.getItem(ENHED) || ''; } catch (e) {}
  if (!enhed) { enhed = 'e' + Math.random().toString(36).slice(2, 10); try { localStorage.setItem(ENHED, enhed); } catch (e) {} }
  try { noegle = localStorage.getItem(PRIV) || ''; } catch (e) {}
  if (!noegle) { noegle = 'k' + Math.random().toString(36).slice(2, 14); try { localStorage.setItem(PRIV, noegle); } catch (e) {} }

  let rum = null;          // værternes lokale sandhed
  let offentlig = null;    // seneste offentlige tilstand
  let kode = '';
  let wsS = null, wsA = null, hjerte = null, synkTimer = null;

  /* ---------- kryptering (samme RC4 som spillet bruger til private kort) ---------- */
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
  const tilBytes = t => new TextEncoder().encode(t);
  const fraBytes = b => new TextDecoder('utf-8').decode(b);
  function krypt(obj) {
    const b = rc4('hsrum|' + kode, tilBytes(JSON.stringify(obj)));
    let s = ''; b.forEach(x => s += String.fromCharCode(x));
    return btoa(s);
  }
  function afkrypt(b64) {
    try {
      const bin = atob(b64);
      const arr = Uint8Array.from(bin, c => c.charCodeAt(0));
      return JSON.parse(fraBytes(rc4('hsrum|' + kode, arr)));
    } catch (e) { return null; }
  }
  function kryptPrivat(spiller, indhold) {
    if (!spiller || !spiller.noegle || !indhold) return '';
    const b = rc4(spiller.noegle, tilBytes(JSON.stringify(indhold)));
    let s = ''; b.forEach(x => s += String.fromCharCode(x));
    return btoa(s);
  }

  const emneS = () => 'hyggespil-' + kode.toLowerCase().replace(/[^a-z0-9]/g, '') + '-s';
  const emneA = () => 'hyggespil-' + kode.toLowerCase().replace(/[^a-z0-9]/g, '') + '-a';
  const kan = () => typeof navigator === 'undefined' || navigator.onLine !== false;

  async function send(topic, objekt) {
    const krop = krypt(objekt);
    if (LOKAL) {
      const r = await fetch('/rum/pub?t=' + encodeURIComponent(topic), { method: 'POST', body: krop });
      if (!r.ok) throw new Error('kunne ikke sende til rummet');
      return;
    }
    const r = await fetch(BASE + '/' + topic, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Title': 'Hyggespil' },
      body: krop,
    });
    if (!r.ok) throw new Error(r.status === 429 ? 'for mange beskeder lige nu – prøv igen om lidt' : 'kunne ikke sende (internettet?)');
  }
  /* Abonnerer på et emne og giver den rå (krypterede) tekst videre. */
  function abonner(topic, cb, vedLuk) {
    if (LOKAL) {
      const es = new EventSource('/rum/sub?t=' + encodeURIComponent(topic));
      es.onmessage = e => cb(e.data);
      es.onerror = () => { try { es.close(); } catch (e) {} setTimeout(() => { if (vedLuk) vedLuk(); }, 2000); };
      return es;
    }
    const w = new WebSocket('wss://ntfy.sh/' + topic + '/ws');
    w.onmessage = e => {
      try { const m = JSON.parse(e.data); if (m.event === 'message' && m.message) cb(m.message); } catch (err) {}
    };
    w.onclose = () => { if (vedLuk) setTimeout(vedLuk, 2000); };
    return w;
  }

  /* ---------- værternes spillogik (samme regler som HA-tjenesten) ---------- */
  function nulstil(valgtKode) {
    rum = {
      kode: valgtKode || (String(Math.floor(1000 + Math.random() * 9000)) + '-' +
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26))),
      aktiv: true, buzzere: [], spillere: [], vaert: enhed, spil: '', fase: 'lobby',
      tur: 0, spoergsmaal: null, korrekt: null, svar: null, privat_raw: {},
    };
    kode = rum.kode;
  }
  const find = id => rum && rum.spillere.find(p => p.enhed === id);
  function offentliggoer() {
    const sp = rum.spillere, tur = sp.length ? rum.tur : null, afsloeret = rum.fase === 'afsloret';
    const privat = {};
    for (let i = 0; i < sp.length; i++) {
      const indhold = rum.privat_raw[String(i)];
      if (indhold) privat[String(i)] = kryptPrivat(sp[i], indhold);
    }
    return {
      kode: rum.kode, rum_aktiv: !!rum.aktiv, rum_buzzere: rum.buzzere.map(b => b.navn),
      rum_spillere: sp.map(p => ({ navn: p.navn, point: p.point || 0, enhed: p.enhed })),
      rum_tur: tur, rum_tur_navn: tur != null ? sp[tur].navn : '', rum_vaert: rum.vaert,
      rum_fase: rum.fase, rum_spil: rum.spil,
      rum_spoergsmaal: (rum.fase === 'spoergsmaal' || rum.fase === 'afsloret') ? rum.spoergsmaal : null,
      rum_korrekt: afsloeret ? rum.korrekt : null,
      rum_svar: afsloeret ? rum.svar : null,
      rum_privat: privat,
    };
  }
  function publicer() {
    if (!rum || !kode) return Promise.resolve();
    const d = offentliggoer();
    offentlig = d;
    return send(emneS(), d);
  }

  function anvend(a) {
    if (!rum) return;
    const navn = String(a.navn || '').slice(0, 24);
    switch (a.handling) {
      case 'deltag': {
        if (!rum.aktiv || !a.enhed || !navn) break;
        if (!find(a.enhed) && rum.spillere.length < 8) {
          const brugte = new Set(rum.spillere.map(p => p.navn));
          let unikt = navn, n = 2;
          while (brugte.has(unikt)) unikt = navn + ' ' + n++;
          rum.spillere.push({ enhed: a.enhed, navn: unikt, point: 0, noegle: String(a.noegle || '').slice(0, 64) });
        }
        break;
      }
      case 'forlad':
        rum.spillere = rum.spillere.filter(p => p.enhed !== a.enhed);
        if (rum.tur >= rum.spillere.length) rum.tur = 0;
        break;
      case 'buzz':
        if (!navn || rum.buzzere.some(b => b.navn === navn)) break;
        rum.buzzere.push({ navn, tid: new Date().toISOString() });
        rum.buzzere = rum.buzzere.slice(-12);
        break;
      case 'ryd': rum.buzzere = []; break;
      case 'luk': rum = null; return;
      case 'start':
        if (!rum.spillere.length || (rum.vaert && a.enhed !== rum.vaert)) break;
        rum.spil = String(a.spil || '');
        rum.fase = 'spoergsmaal'; rum.tur = 0;
        rum.spoergsmaal = a.spoergsmaal || null;
        rum.korrekt = a.korrekt; rum.svar = null;
        rum.privat_raw = a.privat || {};
        rum.spillere.forEach(p => { p.point = 0; });
        break;
      case 'svar': {
        if (rum.fase !== 'spoergsmaal' || !rum.spillere.length) break;
        const aktiv = rum.spillere[rum.tur];
        if (!aktiv || aktiv.enhed !== a.enhed) break;
        rum.svar = a.svar;
        if (a.svar != null && Number(a.svar) === Number(rum.korrekt)) aktiv.point = (aktiv.point || 0) + 1;
        rum.fase = 'afsloret';
        break;
      }
      case 'naeste':
        if (!rum.spillere.length || (rum.vaert && a.enhed !== rum.vaert)) break;
        rum.tur = (rum.tur + 1) % rum.spillere.length;
        rum.spil = String(a.spil || rum.spil || '');
        rum.fase = 'spoergsmaal';
        rum.spoergsmaal = a.spoergsmaal || rum.spoergsmaal;
        rum.korrekt = a.korrekt; rum.svar = null;
        rum.privat_raw = a.privat || {};
        break;
      case 'giv': {
        if (!rum.spillere.length || (rum.vaert && a.enhed !== rum.vaert)) break;
        const idx = a.spiller == null ? rum.tur : Number(a.spiller);
        if (idx >= 0 && idx < rum.spillere.length) rum.spillere[idx].point = (rum.spillere[idx].point || 0) + 1;
        break;
      }
      case 'afslut':
        rum.fase = 'lobby'; rum.spoergsmaal = null; rum.korrekt = null; rum.svar = null;
        rum.spil = ''; rum.privat_raw = {};
        break;
      default: break;
    }
  }

  /* ---------- lytning ---------- */
  function stopSynk() { if (synkTimer) { clearInterval(synkTimer); synkTimer = null; } }
  /* Gæsten beder om den nyeste tilstand, indtil den første er modtaget.
     Det dækker, at websocket-forbindelsen kan være lidt langsommere end join. */
  /* Den offentlige beskedtjeneste har et dagligt loft, så vi sparer på beskederne:
     gæsten spørger kun efter tilstanden ved join, når fanen bliver synlig igen,
     og når en handling er sendt. Værten sender et hjerteslag hvert 25. sekund. */
  function synk() {
    if (!kode) return Promise.resolve();
    return send(emneA(), { kode, enhed, handling: 'sync' }).catch(() => {});
  }
  function startSynk() {
    stopSynk();
    try {
      document.addEventListener('visibilitychange', () => { if (!document.hidden && kode) synk(); });
    } catch (e) {}
  }
  function lytState() {
    if (wsS || !kode) return;
    wsS = abonner(emneS(), tekst => {
      const d = afkrypt(tekst);
      if (d && d.kode === kode) offentlig = d;
    }, () => { wsS = null; if (kode && !rum) lytState(); });
  }
  function lytAktioner() {
    if (wsA || !kode) return;
    wsA = abonner(emneA(), tekst => {
      const a = afkrypt(tekst);
      if (!a || a.kode !== kode) return;
      if (a.handling === 'sync') { publicer(); return; }
      anvend(a);
      publicer().catch(() => {});
    }, () => { wsA = null; if (rum) lytAktioner(); });
  }
  function startHjerte() {
    if (hjerte) return;
    hjerte = setInterval(() => { if (rum) publicer().catch(() => {}); }, 25000);
  }

  /* ---------- offentligt API til rum.js ---------- */
  function kald(data) {
    if (!kan()) return Promise.reject(new Error('der er ingen internetforbindelse'));
    if (rum) { anvend(Object.assign({ enhed, noegle }, data)); return publicer(); }
    if (!kode) return Promise.reject(new Error('opret eller deltag i et rum først'));
    return send(emneA(), Object.assign({ kode, enhed, noegle }, data)).then(() => {
    });
  }
  function data() { return offentlig; }

  window.HSRUM = {
    kan, kald, data,
    get enhed() { return enhed; },
    get kode() { return kode; },
    erVaert() { return !!rum && rum.vaert === enhed; },
    opret(valgtKode) {
      nulstil(valgtKode);
      lytAktioner(); startHjerte();
      return publicer();
    },
    deltag(valgtKode, navn) {
      /* værten deltager i sit eget rum uden at abonnere på sig selv */
      if (rum) { kode = rum.kode; return kald({ handling: 'deltag', navn }); }
      kode = String(valgtKode || '').trim().toUpperCase();
      offentlig = null;
      lytState(); startSynk();
      return kald({ handling: 'deltag', navn }).then(() => synk());
    },
    forlad() {
      const k = kode;
      try { wsS && wsS.close && wsS.close(); } catch (e) {}
      try { wsA && wsA.close && wsA.close(); } catch (e) {}
      wsS = wsA = null;
      if (hjerte) { clearInterval(hjerte); hjerte = null; }
      stopSynk();
      rum = null; offentlig = null; kode = '';
      return k;
    },
    sync() { return kald({ handling: 'sync' }); },
  };
})();

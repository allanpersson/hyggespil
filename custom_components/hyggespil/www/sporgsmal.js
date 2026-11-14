/* Tilføj spørgsmål: sendes til udvikleren (som feedback) – de lander IKKE i spillets puljer.
   Alle forslag går gennem to trin: 1) relevans for spillerne, 2) kilde- og facitkontrol. */
(function () {
  if (window.__sporgsmalLoaded) return;
  window.__sporgsmalLoaded = true;
  const KØ = 'hs_forslag';
  const find = id => document.getElementById(id);
  const kø = () => { try { return JSON.parse(localStorage.getItem(KØ) || '[]') } catch (e) { return [] } };
  const gem = r => { try { localStorage.setItem(KØ, JSON.stringify(r.slice(-40))) } catch (e) { } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function sag(spørgsmål, svar, kilde, alder) {
    const r = (window.HSCFG || {}).repo || '';
    const b = ['**Spørgsmål**', '', spørgsmålsTekst(spørgsmål), '', svar ? '**Svar (det man skal kunne)**: ' + svar : '', kilde ? '**Kilde** (link, bog eller "Vidste du at…"): ' + kilde : '',
      alder ? '**Passer til**: ' + alder : '', '', '_Sendt via ➕ Spørgsmål i Hyggespil. Forslaget bliver først en del af spillet, efter at det er vurderet relevant, og facit er kontrolleret mod kilde._'].filter(x => x !== null).join('\n');
    function spørgsmålsTekst(x) { return x }
    const url = /^[\w.-]+\/[\w.-]+$/.test(r)
      ? 'https://github.com/' + r + '/issues/new?' + new URLSearchParams({ title: 'Forslag: ' + spørgsmålsTekst(spørgsmål).slice(0, 60), body: b }).toString() : null;
    return { url, brødtekst: b };
  }
  const mh = window.modalHTML;
  window.modalHTML = function () {
    const h = mh.apply(this, arguments);
    if (modal !== 'q') return h;
    return `<div class="modal"><div class="mbox" style="max-height:92vh;overflow:auto">
 <h3 style="margin-top:0">➕ Forslag til nyt spørgsmål</h3>
 <p class="hint" style="text-align:left">Godt spørgsmål! Det bliver <b>ikke</b> lagt i spillet her med det samme: forslaget sendes til udvikleren, som først vurderer om det har bred relevans, og derefter kontrollerer svaret mod en kilde. Derfor kan der gå et par dage, før det er med.</p>
 <div class="row"><input class="in" id="fq" placeholder="Selve spørgsmålet" style="font-size:16px;text-align:left"></div>
 <div style="height:8px"></div>
 <div class="row"><input class="in" id="fa" placeholder="Svar (valgfrit)" style="font-size:16px;text-align:left"><input class="in" id="fk" placeholder="Hvor ved du det fra? (valgfrit)" style="font-size:16px;text-align:left"></div>
 <div style="height:8px"></div>
 <p class="hint" style="text-align:left;margin:0 0 4px">Passer det til:</p>
 <div class="row" style="flex-wrap:wrap;gap:6px">
  <button class="btn ghost ftag" data-a="alle">Både børn og voksne</button>
  <button class="btn ghost ftag" data-a="børn 5-9">Børn 5-9</button>
  <button class="btn ghost ftag" data-a="10-16">10-16 år</button>
  <button class="btn ghost ftag" data-a="voksne">Voksne</button></div>
 <p class="hint" id="fqs" style="text-align:left;min-height:1.2em;color:#ffb703"></p>
 <div class="row" style="margin-top:10px"><button class="btn big green" id="fsend">Send forslaget ↗</button><button class="btn ghost" id="fcopyq">Kopiér teksten</button></div>
 <p class="hint" style="text-align:left">Uden GitHub-konto: brug «Kopiér teksten» og send den til udvikleren, eller gem forslaget her på enheden og send det senere.</p>
 <div class="row"><button class="btn ghost" id="flocal">Gem på enheden</button><button class="btn ghost" id="closem">Luk</button></div>
 <p class="hint" style="text-align:left;margin-top:10px">Forslag gemt på denne enhed: <b id="fmængde">${kø().length}</b>${kø().length ? ' · <button class="btn ghost" id="fvis" style="width:auto;height:auto;padding:4px 10px">Vis</button>' : ''}</p>
 <div id="fliste"></div></div></div>`;
  };
  const bm = window.bindModal;
  window.bindModal = function () {
    bm.apply(this, arguments);
    if (modal !== 'q') return;
    const $ = id => find(id);
    const meld = t => { const e = $('fqs'); if (e) e.textContent = t };
    let alder = '';
    document.querySelectorAll('.ftag').forEach(b => b.onclick = () => {
      alder = b.dataset.a;
      document.querySelectorAll('.ftag').forEach(x => x.classList.toggle('sel', x === b));
    });
    const saml = () => {
      const q = ($('fq').value || '').trim();
      if (!q) { $('fq').classList.add('shake'); setTimeout(() => $('fq').classList.remove('shake'), 400); meld('Skriv spørgsmålet først.'); return null }
      return { q, a: ($('fa').value || '').trim(), k: ($('fk').value || '').trim(), alder };
    };
    const kopi = t => { try { navigator.clipboard.writeText(t); return true } catch (e) { return false } };
    if ($('fsend')) $('fsend').onclick = () => {
      const s = saml(); if (!s) return;
      const { url, brødtekst } = sag(s.q, s.a, s.k, s.alder);
      gem({ d: new Date().toISOString().slice(0, 10), q: s.q, sendt: false });
      if (url && window.open(url, '_blank', 'noopener')) meld('Sagen er åbnet i en ny fane – husk at trykke Submit dér.');
      else if (kopi(brødtekst)) meld('Kunne ikke åbne GitHub. Forslaget er kopieret, så du kan sende det selv.');
      else meld('Forslaget er gemt på enheden. Åbn «Vis» for at kopiere det senere.');
      const m = $('fmængde'); if (m) m.textContent = String(kø().length);
    };
    if ($('fcopyq')) $('fcopyq').onclick = () => {
      const s = saml(); if (!s) return;
      meld(kopi(sag(s.q, s.a, s.k, s.alder).brødtekst) ? 'Forslaget er kopieret.' : 'Kunne ikke kopiere – marker teksten selv.');
    };
    if ($('flocal')) $('flocal').onclick = () => {
      const s = saml(); if (!s) return;
      gem({ d: new Date().toISOString().slice(0, 10), q: s.q, a: s.a, k: s.k, alder: s.alder, sendt: false });
      meld('Gemt på denne enhed. Den sendes, når du trykker «Send forslaget».');
      const m = $('fmængde'); if (m) m.textContent = String(kø().length);
    };
    if ($('fvis')) $('fvis').onclick = () => {
      const b = $('fliste');
      b.innerHTML = '<pre style="text-align:left;font-size:12px;white-space:pre-wrap;max-height:220px;overflow:auto">' + esc(kø().map(x => `${x.d}  ${x.q}${x.a ? '  [svar: ' + x.a + ']' : ''}${x.sendt ? '  (sendt)' : ''}`).join('\n')) + '</pre>'
        + '<div class="row"><button class="btn ghost" id="fkopierAlle" style="width:auto;height:auto;padding:6px 12px">Kopiér alle</button><button class="btn ghost" id="fnulstil" style="width:auto;height:auto;padding:6px 12px">Ryd listen</button></div>';
      find('fkopierAlle').onclick = () => {
        const t = kø().map(x => { const s = sag(x.q, x.a, x.k, x.alder); return s.brødtekst }).join('\n\n---\n\n');
        meld(kopi(t) ? 'Alle forslag er kopieret.' : 'Kunne ikke kopiere.');
      };
      find('fnulstil').onclick = () => { try { localStorage.removeItem(KØ) } catch (e) { }; b.innerHTML = ''; meld('Listen er tømt på denne enhed.'); const m = $('fmængde'); if (m) m.textContent = '0' };
    };
  };
  window.hsForslag = kø;
})();

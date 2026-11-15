/* Hyggespil: spil sammen fra hver sin telefon.
 *
 * Én telefon er "tavlen", hvor spillet kører. De andre telefoner åbner samme
 * Hyggespil-panel, vælger «Deltag» og får en stor buzzer-knap. Når nogen trykker,
 * sendes navnet til Home Assistant (tjenesten hyggespil.rum), og tavlen viser
 * rækkefølgen og bipper. Point gives fortsat på tavlen, som man plejer.
 *
 * Alt går gennem Home Assistants egen forbindelse – ingen server udefra.
 */
(function () {
  if (window.__rum) return; window.__rum = true;

  const NOEGLE = 'hs_rum';
  let med = null;                 // {kode, navn} når denne telefon er medspiller
  try { med = JSON.parse(localStorage.getItem(NOEGLE) || 'null'); } catch (e) { med = null; }
  const gemMed = v => { med = v; try { localStorage.setItem(NOEGLE, JSON.stringify(v)); } catch (e) {} };

  const CSS = '.rumkode{font-size:clamp(40px,12vw,72px);font-weight:900;letter-spacing:.18em;text-align:center;'
    + 'padding:10px 0;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2)}'
    + '.rumbuzz{width:100%;padding:34px 10px;border-radius:24px;font-size:clamp(22px,6vw,34px);font-weight:900;'
    + 'background:linear-gradient(135deg,#ff3d6e,#c9184a);color:#fff;box-shadow:0 12px 40px rgba(255,61,110,.45);border:0}'
    + '.rumbuzz:active{transform:scale(.97)}.rumbuzz[disabled]{opacity:.5}'
    + '.rumliste{display:flex;flex-direction:column;gap:8px;margin:10px 0}'
    + '.rumliste .r{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);font-weight:800}'
    + '.rumliste .r:first-child{background:rgba(46,196,182,.25);border-color:#2ec4b6;font-size:1.1em}'
    + '.rumliste .r .n{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#8f6bff;color:#fff;font-size:14px}';
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  function hass() {
    try { const el = window.parent.document.querySelector('home-assistant'); return (el && el.hass) || null; } catch (e) { return null; }
  }
  function kald(data) {
    const h = hass();
    if (!h || !h.callService) return Promise.reject(new Error('kræver Home Assistant'));
    return h.callService('hyggespil', 'rum', data);
  }
  function rumData() {
    const h = hass();
    if (!h || !h.states) return null;
    const e = h.states['sensor.hyggespil_spil'];
    if (!e || !e.attributes) return null;
    return {
      kode: e.attributes.rum || '',
      aktiv: !!e.attributes.rum_aktiv,
      buzzere: e.attributes.rum_buzzere || [],
    };
  }
  function biplyd() {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = 880; g.gain.value = 0.15;
      o.connect(g); g.connect(c.destination); o.start();
      o.stop(c.currentTime + 0.12);
    } catch (e) {}
  }
  function toast(t) {
    const d = document.createElement('div');
    d.textContent = t;
    d.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:120;padding:10px 18px;'
      + 'border-radius:20px;background:#2ec4b6;color:#06221f;font-weight:900;box-shadow:0 8px 26px rgba(0,0,0,.4)';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2200);
  }

  /* ---------------- dialog ---------------- */
  function dialog() {
    const h = hass();
    const d = document.createElement('div');
    d.className = 'modal'; d.style.zIndex = '88';
    const udenHA = !h;
    const r = rumData() || { kode: '', aktiv: false, buzzere: [] };
    d.innerHTML = '<div class="mbox" style="width:min(540px,100%);max-height:92vh;overflow:auto">'
      + '<h2 style="margin-top:0">📱 Spil sammen fra hver telefon</h2>'
      + (udenHA ? '<p class="hint" style="text-align:left">Denne funktion kræver, at spillet kører inde i Home Assistant (panelet), fordi telefonerne deler rummet gennem Home Assistant.</p>' : '')
      + '<p class="hint" style="text-align:left">Én telefon viser spillet, som I plejer. De andre åbner Hyggespil på deres egen telefon, vælger «Deltag» og trykker på den store knap, når de vil svare. Så viser tavlen, hvem der var først.</p>'
      + '<h3 style="margin:14px 0 6px">① Værten (tavlen)</h3>'
      + '<div id="rum-vaert">' + (r.kode
        ? '<div class="rumkode">' + r.kode + '</div>'
        : '<p class="hint" style="text-align:left">Der er endnu ikke oprettet et rum.</p>')
      + '<div class="row" style="margin-top:8px"><button class="btn" id="rum-nyt">Nyt rum</button>'
      + '<button class="btn ghost" id="rum-ryd">Ryd listen</button>'
      + '<button class="btn ghost" id="rum-luk">Luk rum</button></div>'
      + '<div class="rumliste" id="rum-liste"></div></div>'
      + '<h3 style="margin:16px 0 6px">② Medspiller (din telefon)</h3>'
      + '<div id="rum-deltag"></div>'
      + '<div class="row" style="margin-top:16px"><button class="btn ghost" id="rum-close">Luk</button></div></div>';
    document.body.appendChild(d);

    const $ = id => d.querySelector('#' + id);

    function tegn() {
      const rr = rumData() || { kode: '', aktiv: false, buzzere: [] };
      if (rr.kode) {
        const v = $('rum-vaert');
        if (v) v.querySelector('.rumkode') && (v.querySelector('.rumkode').textContent = rr.kode);
        const liste = $('rum-liste');
        if (liste) liste.innerHTML = rr.buzzere.length
          ? rr.buzzere.map((n, i) => '<div class="r"><span class="n">' + (i + 1) + '</span>' + escapeHtml(n) + '</div>').join('')
          : '<p class="hint" style="text-align:left">Ingen har trykket endnu.</p>';
      }
      const del = $('rum-deltag');
      if (!del) return;
      if (med && med.kode) {
        const medI = rr.buzzere.indexOf(med.navn);
        del.innerHTML = '<p class="hint" style="text-align:left">Du er med som <b>' + escapeHtml(med.navn) + '</b> i rum <b>' + escapeHtml(med.kode) + '</b>.</p>'
          + '<button class="rumbuzz" id="rum-buzz"' + (medI >= 0 ? ' disabled' : '') + '>'
          + (medI >= 0 ? '✅ Sendt – du var nr. ' + (medI + 1) : 'JEG VED DET!') + '</button>'
          + '<div class="row" style="margin-top:8px"><button class="btn ghost" id="rum-forlad">Forlad rummet</button></div>';
        $('rum-buzz').onclick = () => {
          kald({ handling: 'buzz', kode: med.kode, navn: med.navn })
            .then(() => { biplyd(); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} tegn(); })
            .catch(() => toast('Kunne ikke sende – tjek forbindelsen'));
        };
        $('rum-forlad').onclick = () => { gemMed(null); tegn(); };
      } else {
        del.innerHTML = '<div class="row" style="justify-content:flex-start">'
          + '<input class="in" id="rum-kode" inputmode="numeric" maxlength="8" placeholder="Rumkode" style="max-width:130px;text-align:center">'
          + '<input class="in" id="rum-navn" maxlength="16" placeholder="Dit navn" style="max-width:170px">'
          + '<button class="btn" id="rum-join">Deltag</button></div>';
        $('rum-join').onclick = () => {
          const kode = String($('rum-kode').value || '').trim(), navn = String($('rum-navn').value || '').trim();
          if (!/^\d{3,8}$/.test(kode)) return toast('Skriv den kode, værten viser');
          if (!navn) return toast('Skriv dit navn');
          if (rr.kode && rr.kode !== kode) return toast('Der findes ikke et rum med den kode');
          gemMed({ kode, navn }); tegn();
        };
      }
    }
    tegn();

    $('rum-nyt').onclick = () => {
      const kode = String(Math.floor(1000 + Math.random() * 9000));
      kald({ handling: 'opret', kode }).then(() => { biplyd(); setTimeout(tegn, 300); }).catch(e => toast(e.message));
    };
    $('rum-ryd').onclick = () => kald({ handling: 'ryd' }).then(() => setTimeout(tegn, 300)).catch(e => toast(e.message));
    $('rum-luk').onclick = () => kald({ handling: 'luk' }).then(() => setTimeout(() => { d.remove(); }, 300)).catch(e => toast(e.message));
    $('rum-close').onclick = () => d.remove();

    let sidste = JSON.stringify(rumData() || {});
    const ur = setInterval(() => {
      if (!document.body.contains(d)) { clearInterval(ur); return; }
      const nu = JSON.stringify(rumData() || {});
      if (nu !== sidste) {
        const før = JSON.parse(sidste).buzzere || [], efter = JSON.parse(nu).buzzere || [];
        sidste = nu;
        if (efter.length > før.length) { biplyd(); toast((efter[efter.length - 1] || '') + ' trykkede!'); }
        tegn();
      }
    }, 1000);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* knap i spillets hoved */
  const render0 = window.render;
  window.render = function () {
    const r = render0.apply(this, arguments);
    try {
      const h = document.querySelector('header');
      if (h && !document.getElementById('rumbtn')) {
        const b = document.createElement('button');
        b.id = 'rumbtn'; b.className = 'btn ghost'; b.textContent = '📱';
        b.title = 'Spil sammen fra hver telefon';
        b.onclick = dialog;
        h.appendChild(b);
      }
    } catch (e) {}
    return r;
  };

  /* bliv ved med at vise buzzer-knappen, når telefonen er med i et rum */
  if (med && med.kode) setTimeout(() => { try { dialog(); } catch (e) {} }, 1200);
})();

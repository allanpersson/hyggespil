/* Hyggespil: hør-og-gæt-quiz via Music Assistant.
 *
 * Afspiller et kort uddrag af en sang på en Music Assistant-højttaler og lader
 * spillerne gætte kunstneren. Kræver at Music Assistant er installeret i Home
 * Assistant og at der er valgt en højttaler i indstillingerne (⚙).
 */
(function () {
  if (window.__musma) return; window.__musma = true;
  const ANDROID = window.HSPLATFORM === 'android';
  if (ANDROID) return;   // Music Assistant findes ikke i den lokale Android-app
  const esc = window.esc || (s => String(s));
  const VALG = () => (window.HSV ? window.HSV.valg : {}) || {};
  let st = {};

  function hass() {
    try { const el = window.parent.document.querySelector('home-assistant'); return (el && el.hass) || null; } catch (e) { return null; }
  }
  function harMA() {
    const h = hass();
    return !!(h && h.services && h.services.music_assistant);
  }
  function stopUr() {
    const h = hass(), v = VALG();
    if (h && h.callService && v.maPlayer) h.callService('media_player', 'media_stop', { entity_id: v.maPlayer }).catch(() => {});
  }
  function afspil(sang) {
    const h = hass(), v = VALG();
    if (!h || !h.callService || !v.maPlayer) return false;
    h.callService('music_assistant', 'play_media', {
      entity_id: v.maPlayer,
      media_id: sang.a + ' ' + sang.t,
      media_type: 'track',
    }).catch(() => {});
    clearTimeout(st.ur);
    st.ur = setTimeout(stopUr, 20000);
    return true;
  }
  const pick = a => a[Math.random() * a.length | 0];
  const sh = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

  KINDS.musma = {
    egen: true,          // spillet vælger selv sin sang (ingen fælles trækning)
    init() {
      const pulje = (DATA.musma || []).filter(x => x && x.t && x.a);
      const it = pick(pulje.length ? pulje : [{ t: '?', a: '?' }]);
      const andre = sh([...new Set(pulje.map(x => x.a).filter(a => a !== it.a))]).slice(0, 3);
      st = { it, valg: sh([it.a].concat(andre)), ph: 0, svar: null, ur: null };
      g.ph = 0;
    },
    render() {
      const it = st.it || { t: '?', a: '?' };
      const v = VALG();
      let o = '<div class="card glass"><div class="q">🎧 Hør og gæt</div>';
      if (!harMA() || !v.maPlayer) {
        o += '<p class="hint" style="text-align:left">Denne quiz kræver at <b>Music Assistant</b> er installeret i Home Assistant, '
          + 'og at der er valgt en højttaler under <b>⚙ → Music Assistant</b>. '
          + 'Uden det kan sangene ikke afspilles.</p>'
          + '<p class="hint" style="text-align:left">Sådan gør du: installer Music Assistant fra HACS/Add-ons, tilføj din musikkilde '
          + '(fx Spotify eller din egen samling), og vælg derefter højttaleren i spillets indstillinger.</p>'
          + '<div class="row"><button class="btn ghost" id="mma-skip">Spring over</button></div>';
        return o + '</div>';
      }
      o += '<p class="hint">Afspiller et uddrag på ' + esc(v.maPlayer) + ' i 20 sekunder.</p>'
        + '<div class="row" style="margin:8px 0"><button class="btn big" id="mma-spil">▶ Afspil uddrag</button>'
        + '<button class="btn ghost" id="mma-stop">Stop</button></div>';
      if (st.ph === 0) {
        o += '<div class="mid" style="grid-template-columns:repeat(2,1fr)">'
          + st.valg.map(a => '<button class="btn" data-mma="' + esc(a) + '" style="padding:14px;border-radius:14px">' + esc(a) + '</button>').join('')
          + '</div><p class="hint">Tryk på den kunstner, du tror, der synger.</p>';
      } else {
        const ok = st.svar === it.a;
        o += '<div class="ans">' + (ok ? '✅ Rigtigt!' : '❌ Det var ' + esc(it.a)) + '</div>'
          + '<p class="hint">«' + esc(it.t) + '» – ' + esc(it.a) + (it.y ? ' (' + it.y + ')' : '') + '</p>'
          + (st.awarded ? '' : awardChips(1, -1))
          + '<div class="row"><button class="btn big green" id="nx">Næste →</button></div>';
      }
      return o + '</div>';
    },
    bind() {
      const $ = id => document.getElementById(id);
      if ($('mma-spil')) $('mma-spil').onclick = () => { afspil(st.it); };
      if ($('mma-stop')) $('mma-stop').onclick = () => stopUr();
      if ($('mma-skip')) $('mma-skip').onclick = () => window.next();
      document.querySelectorAll('#main [data-mma]').forEach(b => {
        b.onclick = () => { st.svar = b.dataset.mma; st.ph = 1; stopUr(); render(); };
      });
    },
  };

  const G = {
    id: 'musma', key: 'musma', grp: '🎵 Musikquiz', kind: 'musma',
    t: 'Hør og gæt (Music Assistant)',
    d: 'Afspiller et uddrag og du gætter kunstneren – kræver Music Assistant',
    e: '🎧', g: 'linear-gradient(135deg,#0ea5e9,#22c55e)', min: 1, skjult: true,
  };
  if (!GAMES.some(x => x.id === 'musma')) GAMES.push(G);
})();

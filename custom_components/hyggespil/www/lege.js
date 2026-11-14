/* Hyggespil: to festlege – Flaskehalsen og S P K.
   Flaskehalsen: man holder knappen inde for at lade op, slipper og flasken snurrer.
   S P K: tre bogstaver, én vælges tilfældigt med lige stor chance. */
(function () {
  if (window.__lege) return; window.__lege = true;
  const esc = window.esc || (s => String(s));

  const st = document.createElement('style');
  st.textContent =
    '.flwrap{position:relative;width:min(88vw,360px);height:min(88vw,360px);margin:10px auto 0}'
    + '.flring{position:absolute;inset:12%;border-radius:50%;border:2px dashed rgba(255,255,255,.14)}'
    + '.flbottle{position:absolute;left:50%;bottom:50%;width:46px;height:130px;margin-left:-23px;transform-origin:50% 100%;z-index:2;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))}'
    + '.flbottle svg{width:100%;height:100%;display:block}'
    + '.flp{position:absolute;left:50%;top:50%;margin:-30px 0 0 -42px;width:84px;display:flex;flex-direction:column;align-items:center;gap:3px;transition:transform .2s}'
    + '.flp span{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#111;font-size:18px;border:2px solid rgba(255,255,255,.5)}'
    + '.flp b{font-size:12px;max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(0,0,0,.35);padding:2px 8px;border-radius:10px}'
    + '.flp.sel span{box-shadow:0 0 0 4px #ffd166,0 0 26px #ffd166;transform:scale(1.12)}'
    + '.flpower{height:16px;border-radius:10px;background:rgba(255,255,255,.12);overflow:hidden;margin:16px auto 0;max-width:340px;border:1px solid rgba(255,255,255,.12)}'
    + '.flpower>div{height:100%;width:0;background:linear-gradient(90deg,#2ec4b6,#ffd166,#ff5d8f);transition:width .06s linear}'
    + '.spkrow{display:flex;gap:12px;justify-content:center;margin:14px 0 4px;flex-wrap:wrap}'
    + '.spk{width:clamp(78px,22vw,104px);height:clamp(104px,29vw,138px);border-radius:20px;display:grid;place-items:center;'
    + 'background:rgba(255,255,255,.08);border:2px solid var(--c);transition:transform .12s,box-shadow .12s;transform-origin:center}'
    + '.spk .b{font-size:clamp(44px,13vw,64px);font-weight:900;line-height:1;color:var(--c)}'
    + '.spk .n{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.85}'
    + '.spk.lys{background:var(--c);box-shadow:0 0 30px var(--c)}'
    + '.spk.lys .b,.spk.lys .n{color:#111}';
  document.head.appendChild(st);

  /* ---------------- Flaskehalsen peger på ---------------- */
  let fl = { vinkel: 0, valgt: null, travl: false, ladning: 0, ur: null };
  const FL_R = 142;

  function flLand() {
    if (!fl.travl) return;
    fl.travl = false;
    const n = Math.max(1, players.length), step = 360 / n;
    const idx = Math.round((((fl.vinkel % 360) + 360) % 360) / step) % n;
    fl.vinkel = idx * step;              // snapper præcist på spilleren
    fl.valgt = idx;
    g.ph = 1;
    render();
  }

  KINDS.flaske = {
    init() { fl = { vinkel: 0, valgt: null, travl: false, ladning: 0, ur: null }; g.ph = 0; },
    render() {
      const n = Math.max(1, players.length), step = 360 / n;
      const chips = players.map((p, i) =>
        '<div class="flp' + (fl.valgt === i ? ' sel' : '') + '" style="transform:rotate(' + (i * step) + 'deg) translateY(-' + FL_R + 'px) rotate(' + (-i * step) + 'deg)' + '">'
        + '<span style="background:' + p.c + '">' + esc((p.n || '?')[0]).toUpperCase() + '</span>'
        + '<b>' + esc(p.n) + '</b></div>').join('');
      const tid = fl.travl ? (2 + fl.ladning * 2).toFixed(2) : '0';
      let o = '<div class="card glass"><div class="q">🍾 Flaskehalsen peger på</div>'
        + '<div class="flwrap"><div class="flring"></div>'
        + '<div class="flbottle" id="flbottle" style="transform:rotate(' + fl.vinkel + 'deg)">'
        + '<svg viewBox="0 0 60 170"><defs>'
        + '<linearGradient id="flg" x1="0" y1="0" x2="1" y2="0">'
        + '<stop offset="0" stop-color="#0e7c6b"/><stop offset=".45" stop-color="#39d6b8"/><stop offset="1" stop-color="#0a5d51"/>'
        + '</linearGradient></defs>'
        + '<rect x="24" y="2" width="12" height="44" rx="5" fill="url(#flg)"/>'
        + '<rect x="20" y="6" width="20" height="9" rx="3" fill="#f4d35e"/>'
        + '<path d="M18 46h24v104a12 12 0 0 1-24 0z" fill="url(#flg)"/>'
        + '<ellipse cx="27" cy="70" rx="4" ry="14" fill="#ffffff55"/>'
        + '<circle cx="30" cy="128" r="7" fill="#ffffff22"/>'
        + '</svg></div>' + chips + '</div>';
      if (g.ph === 0) {
        o += '<div class="flpower"><div id="flbar"></div></div>'
          + '<div class="row" style="margin-top:12px"><button class="btn big" id="flspin">Hold inde og slip</button></div>'
          + '<p class="hint">Jo længere du holder, jo hårdere snurrer flasken. Resten foregår i den virkelige verden.</p>';
      } else {
        o += '<div class="ans" style="font-size:clamp(22px,4.5vw,38px)">👉 ' + esc(players[fl.valgt].n) + '</div>'
          + '<p class="hint">Flaskehalsen peger på ' + esc(players[fl.valgt].n) + '. Resten aftaler I selv.</p>'
          + '<div class="row"><button class="btn big green" id="fligen">Snurr igen</button></div>';
      }
      return o + '</div>';
    },
    bind() {
      const $ = id => document.getElementById(id);
      const knap = $('flspin'), ig = $('fligen');
      if (ig) ig.onclick = () => { g.ph = 0; fl = { vinkel: 0, valgt: null, travl: false, ladning: 0, ur: null }; render(); };
      if (!knap) return;
      let ladeUr = null;
      const stopLad = () => { if (ladeUr) { clearInterval(ladeUr); ladeUr = null; } };
      const start = e => {
        if (e && e.preventDefault) e.preventDefault();
        if (fl.travl) return;
        fl.ladning = 0; fl.valgt = null;
        stopLad();
        ladeUr = setInterval(() => {
          fl.ladning = Math.min(1, fl.ladning + 0.035);
          const b = $('flbar'); if (b) b.style.width = Math.round(fl.ladning * 100) + '%';
        }, 60);
      };
      const slip = () => {
        if (!ladeUr) return;
        stopLad();
        const el = document.getElementById('flbottle');
        const dur = 2 + fl.ladning * 2;
        const ekstra = 540 + Math.round(fl.ladning * 1620) + Math.floor(Math.random() * 360);
        fl.travl = true;
        fl.vinkel += ekstra;
        if (el) {
          el.style.transition = 'transform ' + dur.toFixed(2) + 's cubic-bezier(.12,.85,.15,1)';
          el.style.transform = 'rotate(' + fl.vinkel + 'deg)';
        }
        setTimeout(flLand, dur * 1000 + 220);
      };
      knap.addEventListener('pointerdown', start);
      window.addEventListener('pointerup', slip, { once: true });
      knap.addEventListener('pointercancel', slip, { once: true });
    },
  };

  /* ---------------- S P K ---------------- */
  const SPK = [
    { bogstav: 'S', navn: 'Sandhed', tekst: 'Fortæl noget, du aldrig har fortalt de andre.', farve: '#4cc9f0' },
    { bogstav: 'P', navn: 'Procent', tekst: 'Hvor mange procent af jer tror på det? Gæt og afslør.', farve: '#ffb703' },
    { bogstav: 'K', navn: 'Konsekvens', tekst: 'Vælg en konsekvens – eller få en af de andre.', farve: '#ff5d8f' },
  ];
  let spk = { valgt: null, travl: false, ur: null, blink: 0 };

  KINDS.spk = {
    init() { spk = { valgt: null, travl: false, ur: null, blink: 0 }; g.ph = 0; },
    render() {
      const aktiv = spk.valgt == null ? -1 : spk.valgt;
      const kort = SPK.map((x, i) =>
        '<div class="spk" id="spk' + i + '" style="--c:' + x.farve + ';' + (aktiv === i && !spk.travl ? 'transform:scale(1.12);box-shadow:0 0 0 4px ' + x.farve + ',0 0 40px ' + x.farve : '') + '">'
        + '<div class="b">' + x.bogstav + '</div><div class="n">' + x.navn + '</div></div>').join('');
      let o = '<div class="card glass"><div class="q">S · P · K</div>'
        + '<div class="spkrow">' + kort + '</div>';
      if (spk.valgt == null) {
        o += '<div class="row" style="margin-top:16px"><button class="btn big" id="spktryk"' + (spk.travl ? ' disabled' : '') + '>Tryk!</button></div>'
          + '<p class="hint">Tre bogstaver – én bliver valgt. S = Sandhed, P = Procent, K = Konsekvens.</p>';
      } else {
        const x = SPK[spk.valgt];
        o += '<div class="ans" style="font-size:clamp(26px,6vw,46px);color:' + x.farve + '">' + x.bogstav + ' – ' + x.navn + '</div>'
          + '<div class="row" style="gap:10px"><button class="btn ghost" id="spkigen">Igen</button></div>';
        if (spk.valgt === 0 && (DATA.deep || []).length) {
          const t = DATA.deep[Math.floor(Math.random() * DATA.deep.length)];
          o += '<p class="hint" style="font-size:17px;text-align:left">' + esc(typeof t === 'string' ? t : (t.q || t)) + '</p>';
        } else if (spk.valgt === 2 && (DATA.dare || []).length) {
          const t = DATA.dare[Math.floor(Math.random() * DATA.dare.length)];
          o += '<p class="hint" style="font-size:17px;text-align:left">' + esc(typeof t === 'string' ? t : (t.q || t)) + '</p>';
        } else {
          o += '<p class="hint" style="font-size:17px">' + esc(x.tekst) + '</p>';
        }
      }
      return o + '</div>';
    },
    bind() {
      const $ = id => document.getElementById(id);
      if ($('spkigen')) $('spkigen').onclick = () => { g.ph = 0; spk = { valgt: null, travl: false, ur: null, blink: 0 }; render(); };
      const b = $('spktryk');
      if (!b) return;
      b.onclick = () => {
        if (spk.travl) return;
        spk.travl = true;
        const valg = (() => {
          try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % 3; }
          catch (e) { return Math.floor(Math.random() * 3); }
        })();
        let t = 0, fart = 55, næste = 0;
        const step = () => {
          t++;
          document.querySelectorAll('.spk').forEach((el, i) => {
            el.classList.toggle('lys', i === (t % 3));
            el.style.transform = i === (t % 3) ? 'scale(1.06)' : '';
          });
          fart *= 0.94;
          if (fart < 3) { fart = 3; }
          if (t > 28) {                             // lander efter ca. 1,2 s
            document.querySelectorAll('.spk').forEach((el, i) => el.classList.remove('lys'));
            spk.travl = false; spk.valgt = valg; g.ph = 1;
            render();
            return;
          }
          spk.ur = setTimeout(step, 1000 / fart);
        };
        step();
      };
    },
  };

  GAMES.push(
    { id: 'flaske', grp: 'Party & leg', key: 'deep', kind: 'flaske', t: 'Flaskehalsen peger på',
      d: 'Hold knappen inde, slip og se hvem flasken peger på – resten foregår i virkeligheden',
      e: '🍾', g: 'linear-gradient(135deg,#10b981,#0ea5e9)', min: 2 },
    { id: 'spk', grp: 'Party & leg', key: 'deep', kind: 'spk', t: 'S · P · K',
      d: 'Sandhed, Procent eller Konsekvens – tryk og lad loddet afgøre det',
      e: '🎯', g: 'linear-gradient(135deg,#f59e0b,#ef4444)', min: 2 },
  );
})();

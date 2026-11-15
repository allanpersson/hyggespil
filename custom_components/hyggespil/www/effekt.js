/* Hyggespil: tydelig visuel respons på rigtigt/forkert, død og tid udløbet.
 *
 * Overlayet ligger øverst i billedet i under et sekund og kan bruges af alle spil:
 *   hsFeedback('rigtig' | 'forkert' | 'doed' | 'tid')
 *
 * Rigtige svar fanges automatisk, fordi alle spil kalder boom() eller giver point.
 */
(function () {
  if (window.hsFeedback) return;
  const CSS = '.hsfb{position:fixed;inset:0;display:grid;place-items:center;pointer-events:none;z-index:96}'
    + '.hsfb .b{display:flex;flex-direction:column;align-items:center;gap:8px;animation:hsfbPop .45s cubic-bezier(.2,1.5,.4,1) both}'
    + '.hsfb .e{font-size:clamp(70px,17vw,132px);line-height:1;filter:drop-shadow(0 12px 34px rgba(0,0,0,.55))}'
    + '.hsfb .t{font-size:clamp(17px,3.6vw,26px);font-weight:900;padding:7px 20px;border-radius:999px;color:#08111f;background:#fff;box-shadow:0 8px 30px rgba(0,0,0,.45)}'
    + '.hsfb.rigtig .t{background:#80ed99}.hsfb.forkert .t{background:#ff8fa3}'
    + '.hsfb.doed .t{background:#d9d9e3}.hsfb.tid .t{background:#ffd166}'
    + '.hsfb.forkert .b{animation:hsfbPop .3s ease-out both,hsfbShake .45s .12s ease-in-out both}'
    + '.hsfb.tid .e{animation:hsfbTick .8s ease-in-out both}'
    + '.hsfb.doed .e{animation:hsfbFald .7s cubic-bezier(.6,.05,.9,.4) both}'
    + '@keyframes hsfbPop{from{transform:scale(.35);opacity:0}to{transform:scale(1);opacity:1}}'
    + '@keyframes hsfbShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-14px)}40%{transform:translateX(12px)}60%{transform:translateX(-9px)}80%{transform:translateX(6px)}}'
    + '@keyframes hsfbTick{0%{transform:rotate(-18deg)}25%{transform:rotate(14deg)}50%{transform:rotate(-9deg)}75%{transform:rotate(5deg)}100%{transform:rotate(0)}}'
    + '@keyframes hsfbFald{0%{transform:translateY(-40px) rotate(0);opacity:0}60%{opacity:1}100%{transform:translateY(10px) rotate(70deg)}}';
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  const TYPER = {
    rigtig: { e: '✅', t: 'Rigtigt!', ms: 950 },
    forkert: { e: '❌', t: 'Ikke helt', ms: 950 },
    doed: { e: '💀', t: 'Desværre', ms: 1400 },
    tid: { e: '⏰', t: 'Tiden er gået', ms: 1200 },
  };
  let sidst = 0, sidstType = '';
  window.hsFeedback = function (type) {
    const v = TYPER[type] || TYPER.rigtig;
    const nu = Date.now();
    if (type === sidstType && nu - sidst < 450) return;   // undgå dobbelt fra boom + point
    sidst = nu; sidstType = type;
    const d = document.createElement('div');
    d.className = 'hsfb ' + type;
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<div class="b"><div class="e">' + v.e + '</div><div class="t">' + v.t + '</div></div>';
    document.body.appendChild(d);
    try { if (navigator.vibrate) navigator.vibrate(type === 'rigtig' ? [18] : [12, 40, 12]); } catch (e) {}
    setTimeout(() => d.remove(), v.ms);
  };

  /* Rigtigt svar: alle spil kalder boom() eller giver point */
  const b0 = window.boom;
  if (typeof b0 === 'function') window.boom = function () { window.hsFeedback('rigtig'); return b0.apply(this, arguments); };
  const a0 = window.add;
  if (typeof a0 === 'function') window.add = function (i, n) { if (n > 0) window.hsFeedback('rigtig'); return a0.apply(this, arguments); };
})();

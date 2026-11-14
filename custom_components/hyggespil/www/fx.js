/* fx: Tættest på – årstal uden enhed, vis/skjul gæt, bedre resultatvisning; tydelige regler; quiz-omdøbning */
(function(){
const st=document.createElement('style');
st.textContent='.eyew{position:relative;display:flex;align-items:center}.eyew .in{padding-right:48px;width:100%}.eye{position:absolute;right:6px;width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.14);font-size:18px;line-height:1}.nl{position:relative;height:120px;margin:18px 6px 8px;border-radius:16px;background:rgba(255,255,255,.05)}.nl:before{content:"";position:absolute;left:4%;right:4%;top:60px;height:4px;border-radius:4px;background:rgba(255,255,255,.28)}.nm{position:absolute;transform:translateX(-50%);text-align:center;font-weight:800;font-size:12px;white-space:nowrap}.nm i{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;margin:0 auto 2px;font-style:normal;font-size:14px;color:#111;border:2px solid #fff}.nm.a i{background:#2ec4b6;width:36px;height:36px;font-size:20px}.rkd{margin:10px 0;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.07);border:2px solid transparent}.rkd.w{border-color:#ffb703;box-shadow:0 0 24px rgba(255,183,3,.35)}.rkd .t{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px}.rkd .t .n{flex:1}.rkd .d{font-size:14px;opacity:.85;margin:4px 0 8px}.bar2{height:12px;border-radius:8px;background:rgba(255,255,255,.1);overflow:hidden}.bar2 b{display:block;height:100%;border-radius:8px}.rules{text-align:left;margin:14px auto;padding:14px 18px;border-radius:18px;background:rgba(255,255,255,.08);max-width:560px;font-size:16px;line-height:1.5}.rules b{display:block;margin-bottom:6px;font-size:17px}.rules ol{margin:0;padding-left:22px}.lab{font-size:14px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.8;margin-top:10px}';
document.head.appendChild(st);
const isYear=(v,it)=>Math.abs(v)>=1000&&Math.abs(v)<=2100&&(it.u==='år'||/hvilket år/i.test(it.q||''));
const F=(v,it)=>isYear(v,it)?String(Math.round(v)):fmt(v)+(it.u?' '+it.u:'');
const D=(d,it)=>fmt(d)+(it.u?' '+it.u:isYear(it.a,it)?' år':'');
window.est=function(){
 const it=g.item;let h=`<div class="card glass"><div class="q">${esc(it.q)}</div>`;
 if(!g.reveal)return h+`<div class="est">${players.map((p,i)=>`<div class="p" style="--c:${p.c}"><b>${esc(p.n)}</b><div class="eyew"><input class="in" type="password" autocomplete="off" inputmode="decimal" id="e${i}" placeholder="Gæt"><button type="button" class="eye" title="Vis/skjul" onclick="var i=this.previousElementSibling;i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁️':'🙈'">👁️</button></div></div>`).join('')}</div><p class="hint">Alle skriver deres gæt (skjult). Tryk 👁️ for at tjekke dit eget gæt – og skjul det igen. ${it.u&&!isYear(it.a,it)?'Enhed: '+esc(it.u):''}</p><div class="row"><button class="btn big" id="go">Afslør svaret! 🥁</button></div></div>`;
 const ans=it.a,vals=g.vals,ds=vals.map(z=>Math.abs(z-ans)),md=Math.max(...ds)||1;
 const ord=vals.map((_,i)=>i).sort((a,b)=>ds[a]-ds[b]);
 const lo=Math.min(ans,...vals),hi=Math.max(ans,...vals),sp=(hi-lo)||1,pos=v=>8+84*(v-lo)/sp;
 const nl2=`<div class="nl"><div class="nm a" style="left:${pos(ans)}%;top:36px"><i>🎯</i>${esc(F(ans,it))}</div>${ord.map((i,k)=>`<div class="nm" style="left:${pos(vals[i])}%;top:${k%2?78:-4}px"><i style="background:${players[i].c}">${esc(players[i].n[0]||'?')}</i></div>`).join('')}</div>`;
 const med=['🥇','🥈','🥉'];
 const rows=ord.map((i,k)=>{const d=ds[i],w=g.win.includes(i),fill=Math.max(6,Math.round((1-d/md)*100)),rel=d===0?'Præcis rigtigt! 🎯':(vals[i]<ans?'For lavt med ':'For højt med ')+D(d,it);
  return `<div class="rkd ${w?'w':''}" style="--c:${players[i].c}"><div class="t"><span>${w?'🏆':(med[k]||(k+1)+'.')}</span><span class="n" style="color:${players[i].c}">${esc(players[i].n)}</span><span>${esc(F(vals[i],it))}</span>${w?'<span style="color:#ffb703">+1</span>':''}</div><div class="d">${rel}</div><div class="bar2"><b style="width:${fill}%;background:${players[i].c}"></b></div></div>`}).join('');
 return h+`<div class="ans">${esc(F(ans,it))}</div>${it.n?`<p class="hint">${esc(it.n)}</p>`:''}${nl2}<p class="hint" style="margin-top:0">🎯 = rigtigt svar · cirklerne er gæt</p>${rows}<div class="row"><button class="btn big green" id="nx">Næste →</button></div></div>`;
};

/* ---- tydelige regler for Gæt og vis / Tabu ---- */
const sec0=window.secret;
window.secret=function(){
 let h=sec0.apply(this,arguments);
 const p=players[g.turn];
 if(view==='char'){
  if(!g.shown)h=h.replace('<div class="row"><button class="btn big" id="show">',`<div class="rules"><b>🎬 Sådan spilles Gæt og vis (mimeleg)</b><ol><li><u>${esc(p.n)}</u> er skuespiller og trykker «Vis kort» – <u>kun ${esc(p.n)}</u> må se skærmen.</li><li>Kortet viser et ord eller en handling. ${esc(p.n)} skal <u>vise det uden at sige noget</u> – kun med krop, mimik og bevægelser (ingen lyde, ingen ord, ingen pegen på ting).</li><li>De andre gætter højt. Tryk «Start 60 sek» – I har 60 sekunder.</li><li>Gættede én det rigtigt, trykker I på <u>hans/hendes navn</u>: gætteren og skuespilleren får <b style="display:inline">+1</b> hver.</li><li>Gættede ingen, så tryk «Ingen gættede». Næste spiller bliver skuespiller.</li></ol></div><div class="row"><button class="btn big" id="show">`);
  else h=h.replace('<div class="q" style="font-size:clamp(26px,4vw,42px)">','<div class="lab">Du skal vise (uden lyd):</div><div class="q" style="font-size:clamp(26px,4vw,42px)">')
   .replace('Ingen lyde eller ord – kun krop og ansigt!','Vis det med krop og ansigt – ingen ord, lyde eller pegen. De andre gætter højt.')
   .replace('Hvem gættede det? (gæt og forklarer/skuespiller får hver +1)','Hvem gættede det først? Tryk på hans/hendes navn – gætteren og skuespilleren får +1 hver.');
 }else if(view==='taboo'){
  if(!g.shown)h=h.replace('<div class="row"><button class="btn big" id="show">',`<div class="rules"><b>🚫 Sådan spilles Tabu</b><ol><li><u>${esc(p.n)}</u> er forklarer og trykker «Vis kort» – kun ${esc(p.n)} må se skærmen.</li><li>Kortet viser et ord og nogle <u>forbudte ord</u>. Forklar ordet for de andre, uden at sige selve ordet eller nogen af de forbudte ord.</li><li>De andre gætter højt inden for 60 sekunder (tryk «Start 60 sek»).</li><li>Gættes ordet, trykker I på gætterens navn: gætteren og forklareren får +1 hver. Siger forklareren et forbudt ord, er kortet tabt.</li></ol></div><div class="row"><button class="btn big" id="show">`);
 }
 return h};

/* ---- navne og tekster ---- */
GAMES.forEach(x=>{if(x.grp==='Gæt & kvis')x.grp='Gæt & quiz';
 if(x.id==='char')x.d='Mim ordet uden lyd – de andre gætter hvad det er (60 sek.)';
 if(x.id==='taboo')x.d='Forklar ordet uden at sige de forbudte ord – 60 sek.'});
const r0=window.render;
window.render=function(){r0.apply(this,arguments);
 document.querySelectorAll('.hint').forEach(e=>{if(e.textContent.includes('Du får ikke samme kort igen'))e.textContent=e.textContent.replace(/ Du får ikke samme kort igen[^.]*\./,' Kortene trækkes helt tilfældigt hver gang.')})};
})();

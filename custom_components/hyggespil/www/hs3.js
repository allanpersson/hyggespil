/* Hyggespil v8: Lykkehjulet + Squid Games (rødt lys/grønt lys, glasbro, kugler). (Færdselsloven og kulturspil kommer i egne filer.) */
(function(){
if(window.__hs3)return;window.__hs3=true;
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const GRP_S='💀 Dødsspil';
const st=document.createElement('style');
st.textContent='.tiles{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin:14px 0}.word{display:flex;gap:4px}.tile{width:34px;height:44px;border-radius:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font-weight:900;font-size:22px}.tile.on{background:#fff;color:#1b1340}.tile.pun{background:none;border:0;width:16px}'
+'.kb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}.kb button{width:42px;height:46px;border-radius:10px;font-weight:800;font-size:18px;background:rgba(255,255,255,.16);color:#fff;border:0}.kb button:disabled{opacity:.25}'
+'.cash{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:6px 0}.cash span{padding:6px 12px;border-radius:14px;border:2px solid;font-weight:800}'
+'.rl{height:min(46vh,320px);border-radius:24px;display:grid;place-items:center;font-size:clamp(34px,9vw,72px);font-weight:900;color:#fff;text-align:center;margin:12px 0;transition:background .12s}'
+'.gb{position:relative;overflow:hidden;border-radius:24px;padding:clamp(14px,3vw,26px) 10px 18px;margin:10px auto;max-width:440px;background:linear-gradient(180deg,#04121f 0%,#0a2440 46%,#123a5c 74%,#061726 100%);box-shadow:inset 0 0 70px rgba(0,0,0,.65)}'+
'.gbh{height:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);opacity:.6;margin-bottom:6px}'+
'.gbrow{display:flex;justify-content:center;gap:10px;transform-origin:50% 100%;margin-bottom:clamp(5px,1.4vw,11px)}'+
'.gbt{width:clamp(58px,16vw,84px);height:clamp(26px,6vw,38px);border-radius:7px/14px;display:grid;place-items:center;font-size:10px;font-weight:800;letter-spacing:.06em;color:rgba(255,255,255,.55);cursor:default;'+
'background:linear-gradient(158deg,rgba(214,241,255,.30) 0%,rgba(255,255,255,.07) 44%,rgba(140,205,255,.20) 100%);border:1px solid rgba(214,241,255,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -7px 14px rgba(0,0,0,.28),0 7px 16px rgba(0,0,0,.45)}'+
'.gbt.safe{background:linear-gradient(158deg,rgba(126,240,205,.55),rgba(46,196,182,.28));border-color:#7efcf1;color:#eafffb;box-shadow:0 0 16px rgba(46,220,190,.5),inset 0 1px 0 rgba(255,255,255,.7)}'+
'.gbt.no{background:linear-gradient(160deg,rgba(255,120,120,.30),rgba(60,0,0,.5));border-color:rgba(255,150,150,.5);color:#ffdede;text-decoration:line-through}'+
'.gbt.no::after{content:"";position:absolute;width:0;height:0}'+
'.gbt.cur{outline:2px solid #ffd166;outline-offset:2px;animation:gbr 1.6s infinite}'+
'.gbt.go{animation:fall .9s ease-in forwards}'+
'.gbfall{position:absolute;left:50%;top:44%;transform:translateX(-50%);font-size:clamp(20px,6vw,30px);animation:fall 1.5s ease-in forwards;pointer-events:none}'+
'.gbtur{display:flex;justify-content:center;margin-top:4px}.gbmand{width:16px;height:16px;border-radius:50%;box-shadow:0 0 14px rgba(255,255,255,.55)}'+
'@keyframes gbr{0%,100%{box-shadow:0 0 0 rgba(255,209,102,.0),inset 0 1px 0 rgba(255,255,255,.5)}50%{box-shadow:0 0 22px rgba(255,209,102,.75),inset 0 1px 0 rgba(255,255,255,.6)}}'+
'@keyframes fall{0%{transform:translateY(0) scale(1);opacity:1}20%{transform:translateY(-6px) scale(.97)}100%{transform:translateY(190px) scale(.55) rotate(9deg);opacity:0}}';
document.head.appendChild(st);

/* ================= Lykkehjulet ================= */
const wst=document.createElement('style');
wst.textContent='.wcard{transition:box-shadow .4s}.wturn{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 16px;border-radius:18px;font-weight:900;font-size:clamp(18px,5vw,26px);color:#111;margin:4px 0 8px;animation:wpulse 1.6s ease-in-out infinite}@keyframes wpulse{50%{transform:scale(1.025);filter:brightness(1.15)}}'
+'.wboard{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;margin:12px 0;perspective:700px}.wword{display:flex;gap:4px;flex-wrap:nowrap}'
+'.wt{width:var(--tw);height:calc(var(--tw)*1.3);border-radius:calc(var(--tw)*.2);display:grid;place-items:center;font-weight:900;font-size:calc(var(--tw)*.62);background:linear-gradient(180deg,#16336b,#0b1d44);border:1px solid rgba(255,255,255,.22);color:transparent;box-shadow:inset 0 -3px 6px rgba(0,0,0,.35)}.wt:not(.on){border-style:dashed;border-color:rgba(255,255,255,.34)}'
+'.wt.on{background:linear-gradient(180deg,#fff,#dfe6f5);color:#0b1d44;box-shadow:0 3px 8px rgba(0,0,0,.35)}.wt.flip{animation:wflip .75s cubic-bezier(.3,1.4,.5,1) both}@keyframes wflip{0%{transform:rotateY(90deg) scale(.8)}100%{transform:rotateY(0) scale(1)}}.wt.pun{background:none;border:0;box-shadow:none;color:#fff;width:calc(var(--tw)*.5)}'
+'.wcash{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:6px 0}.wcash span{padding:6px 12px;border-radius:14px;border:2px solid;font-weight:800;opacity:.75}.wcash span.act{opacity:1;transform:scale(1.08);box-shadow:0 0 18px currentColor}'
+'.wwheel{position:relative;width:min(78vw,320px);margin:6px auto}.wwheel svg{width:100%;display:block;filter:drop-shadow(0 8px 14px rgba(0,0,0,.45))}.wptr{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-top:28px solid #ffd166;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6));z-index:2}'
+'.wkb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}.wkb button{width:42px;height:46px;border-radius:10px;font-weight:800;font-size:18px;background:rgba(255,255,255,.16);color:#fff;border:0}.wkb button:disabled{opacity:.22}.wsol{padding:14px;border-radius:16px;background:rgba(255,255,255,.1);font-weight:900;font-size:clamp(20px,5vw,30px);letter-spacing:.06em;text-align:center;margin:10px 0;overflow-wrap:anywhere}';
document.head.appendChild(wst);
/* Animation når en spiller falder på glasbroen */
const gst=document.createElement('style');
gst.textContent='.gb{position:relative;overflow:hidden}'
+'.gbfald{position:absolute;inset:0;display:grid;place-items:center;z-index:3;pointer-events:none;'
+'background:radial-gradient(circle at 50% 55%,rgba(230,57,70,.45),rgba(10,6,30,.15) 70%);animation:gbInd .25s ease-out both}'
+'@keyframes gbInd{from{opacity:0}to{opacity:1}}'
+'.gbfald .fig{position:absolute;top:14%;width:36px;height:36px;border-radius:50%;background:var(--c);'
+'box-shadow:0 0 22px var(--c),0 0 0 3px #fff3;animation:gbFald 1.1s cubic-bezier(.45,0,.9,.6) forwards}'
+'@keyframes gbFald{0%{transform:translateY(0) rotate(0);opacity:1}65%{transform:translateY(300px) rotate(430deg);opacity:1}'
+'100%{transform:translateY(400px) rotate(560deg) scale(.55);opacity:0}}'
+'.gbfald .tekst{font-weight:900;font-size:clamp(20px,4.4vw,32px);color:#fff;text-shadow:0 3px 14px #000,0 0 26px #e63946;'
+'text-align:center;animation:gbTekst .45s .5s both}'
+'@keyframes gbTekst{from{transform:scale(.55);opacity:0}to{transform:scale(1);opacity:1}}'
+'.gbfald .nyt{margin-top:12px;padding:9px 18px;border-radius:30px;background:var(--c,#fff);color:#111;font-weight:900;'
+'font-size:clamp(15px,3vw,20px);box-shadow:0 6px 20px #0006;animation:gbNyt .5s 1.05s both}'
+'@keyframes gbNyt{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}'
+'.gbryste{animation:gbRyst .5s .12s 2}'
+'@keyframes gbRyst{20%{transform:translateX(-7px)}60%{transform:translateX(7px)}100%{transform:none}}'
+'.gbtur2{display:flex;align-items:center;gap:8px;justify-content:center;margin:10px 0 2px;font-weight:800}'
+'.gbtur2 .p{width:22px;height:22px;border-radius:50%;background:var(--c);box-shadow:0 0 0 2px #fff4}';
document.head.appendChild(gst);
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',VOW='AEIOUYÆØÅ',VCOST=250;
/* Lykkehjulet som det danske tv-hjul: 24 felter, tekst der følger hjulet (radialt),
   "KR" ved kanten og et gråt nav. Værdierne er spillets egne (FALLIT/TABT TUR/JOKER). */
const WH=['FALLIT',1500,800,1000,500,600,500,'GRATIS',300,500,800,1000,
          1000,'FALLIT',300,800,500,300,'MIST TUR',600,500,300,500,1000];
const WCOL=['#000000','#7a7d00','#ff6a00','#0093dd','#0a8f3c','#ff6a00','#fff200','#8b1a8b',
            '#0093dd','#fff200','#e3000f','#fff200','#ff6a00','#000000','#e3000f','#0093dd',
            '#fff200','#e3000f','#8b1a8b','#ff6a00','#0a8f3c','#e3000f','#fff200','#0a8f3c'];
const WVIST={'MIST TUR':'TABT TUR','GRATIS':'JOKER'};
const used=new Set();
function ful(e){const m=/«(.+?)»/.exec(e||'');return m?m[1]:null}
/* Postnummerlisten har også spørgsmål, hvor svaret er et posthus eller en beskrivelse.
   Her bruges kun rigtige bynavne – og de officielle navne bevares, fx «Svenstrup J». */
function rensBy(s){
 let x=String(s).trim();
 if(/[0-9:.]/.test(x))return '';
 if(/\b(Posthus|Postboks|Postbutik|Pakkecenter|Postcenter)\b/i.test(x))return '';
 const n=[...x].filter(c=>/[A-Za-zÆØÅæøå]/.test(c)).length;
 if(n<3||n>18)return '';
 return x;
}
window.hsByNavn=rensBy;
function puzzle(){
 const src=[
  ['Ordsprog',()=>{const l=(DATA.prov||[]).map(i=>ful(i.e)).filter(Boolean);return l.length?pick(l):null}],
  ['Dansk by',()=>{
   const rå=window.HSZIPBY&&window.HSZIPBY.length?window.HSZIPBY:(DATA.zip||[]).map(i=>i.o&&i.o[i.a]);
   const l=[...new Set(rå.filter(Boolean).map(rensBy).filter(Boolean))];
   return l.length?pick(l):null}],
  ['Land',()=>{const l=(DATA.city||[]).map(i=>i.o&&i.o[i.a]).filter(Boolean);return l.length?pick(l):null}],
  ['Dyr',()=>{const l=(DATA.kwho||[]).map(i=>i.a).filter(Boolean);return l.length?pick(l):null}],
  ['Hvem eller hvad?',()=>{const l=(DATA.who||[]).map(i=>i.a).filter(Boolean);return l.length?pick(l):null}]];
 for(let t=0;t<60;t++){
  const s=pick(src),txt=s[1]();if(!txt)continue;const u=String(txt).toUpperCase().replace(/\s+/g,' ').trim();
  if(u.length<4||u.length>44||used.has(u))continue;used.add(u);if(used.size>300)used.clear();return {c:s[0],t:u}}
 return {c:'Ordsprog',t:'ØVELSE GØR MESTER'}}
const isLetter=ch=>ABC.includes(ch);
const cnt=(t,l)=>[...t].filter(c=>c===l).length;
const nzs=s=>String(s).toUpperCase().replace(/[^A-ZÆØÅ0-9]/g,'');
function wheelSVG(rot){
 const n=WH.length,R=100,w=360/n;
 /* Som det danske tv-hjul: grå yderkant, farvede felter, gråt nav og radial tekst,
    der følger hjulet (ingen opretning). "KR" står ved kanten på hvert felt. */
 let s='<svg viewBox="-110 -110 220 220">'
  +'<circle r="106" fill="#bfbfbf"/><circle r="102" fill="#7b7b7b"/>'
  +'<g id="wgrp" transform="rotate('+rot+')">';
 const P=(a,r)=>[(r*Math.sin(a*Math.PI/180)).toFixed(2),(-r*Math.cos(a*Math.PI/180)).toFixed(2)];
 for(let i=0;i<n;i++){
  const c=i*w,a0=c-w/2,a1=c+w/2,p0=P(a0,R),p1=P(a1,R),v=WH[i];
  const fill=WCOL[i%WCOL.length];
  s+='<path d="M0 0L'+p0[0]+' '+p0[1]+'A'+R+' '+R+' 0 0 1 '+p1[0]+' '+p1[1]+'Z" fill="'+fill+'" stroke="#6d6d6d" stroke-width="0.6"/>';
  const mørk=(fill==='#000000'||fill==='#8b1a8b'),col=mørk?'#fff':'#111',kant=mørk?'#000':'#fff';
  const label=String(WVIST[v]||v),tegn=Array.from(label),k=tegn.length||1;
  /* Teksten ligger radialt fra kanten og indad (som på referencehjulet) og drejer
     med hjulet. Skriftstørrelsen tilpasses, så både højden og bredden passer i feltet. */
  const rYder=86, rInde=48;
  let fs=Math.min(19,(rYder-rInde)/(k*1.05));
  const rSidst=rYder-(k-1)*fs*1.05;
  const bue=2*Math.PI*Math.max(28,rSidst)/n;      // feltets bredde ved det inderste tegn
  if(0.62*fs>bue*0.78)fs*=bue*0.78/(0.62*fs);
  for(let j=0;j<k;j++){
   const t=tegn[j];if(!/[A-ZÆØÅ0-9]/.test(t))continue;
   const r=rYder-j*fs*1.05;
   s+='<text data-c="'+i+'" data-j="'+j+'" transform="rotate('+c+') translate(0,'+(-r).toFixed(2)+')" text-anchor="middle" font-size="'+fs.toFixed(2)+'" font-weight="900" font-family="Georgia,Times New Roman,serif" fill="'+col+'" stroke="'+kant+'" stroke-width="'+(fs*0.07).toFixed(2)+'" paint-order="stroke" dominant-baseline="central">'+t+'</text>';
  }
  /* ingen "KR"-tekst – den gav visuel støj tæt på tallene */
 }
 s+='</g>';
 /* nav */
 s+='<circle r="44" fill="#bdbdbd" stroke="#6d6d6d" stroke-width="0.8"/>'
  +'<circle r="22" fill="#9a9a9a" stroke="#6d6d6d" stroke-width="0.8"/>'
  +'<circle r="8" fill="#dcdcdc" stroke="#6d6d6d" stroke-width="0.8"/>';
 return s+'</svg>';
}
function tilesHTML(){
 const t=g.pz.t,rv=g.rv,all=g.ph==='done',words=t.split(' '),ml=Math.max.apply(null,words.map(w=>w.length));
 const bredde=Math.min(window.innerWidth,560),avail=bredde-70;
 /* Hold hele svaret på én linje, når det kan lade sig gøre – også når det består af flere ord.
    Er svaret for langt til det, ombrydes der ved mellemrummene i stedet. */
 const antal=[...t].filter(c=>c!==' ').length,mln=words.length;
 const plads=bredde-60-8-(antal-mln)*4-(mln-1)*18;
 const twEns=Math.floor(plads/Math.max(antal,1));
 const tw=twEns>=16?Math.min(40,twEns):Math.max(18,Math.min(40,Math.floor(avail/Math.max(ml,6))-5));
 let k=0;
 return '<div class="wboard" style="--tw:'+tw+'px">'+words.map(w=>'<div class="wword">'+[...w].map(c=>{
  if(!isLetter(c))return '<div class="wt on pun">'+c+'</div>';
  const on=rv.includes(c)||all,fl=on&&((g.nl||[]).includes(c)||all);
  const dl=all?(' style="animation-delay:'+((k++)*0.06).toFixed(2)+'s"'):'';
  return '<div class="wt '+(on?'on':'')+(fl?' flip':'')+'"'+dl+'>'+(on?c:'')+'</div>'}).join('')+'</div>').join('')+'</div>';
}
function cashHTML(){return '<div class="wcash">'+players.map((p,i)=>'<span class="'+(i===g.wt&&g.ph!=='done'?'act':'')+'" style="border-color:'+p.c+';color:'+p.c+'">'+(i===g.wt&&g.ph!=='done'?'▶ ':'')+esc(p.n)+': <b style="color:#fff">'+(g.cash[i]||0)+'</b></span>').join('')+'</div>'}
function nextP(msg){g.wt=(g.wt+1)%players.length;g.ph='spin';g.wv=null;g.msg=msg||''}
function keys(letters,dis){return '<div class="wkb">'+letters.map(l=>'<button data-l="'+l+'" '+((g.rv.includes(l)||(dis&&dis(l)))?'disabled':'')+'>'+l+'</button>').join('')+'</div>'}
KINDS.wheel={
 init(){g.wt=((g.wt==null?-1:g.wt)+1)%players.length;const kp=window.hsWheelPuzzle?window.hsWheelPuzzle(g.wt):null;g.pz=kp?{c:kp.c,t:kp.t}:puzzle();if(kp)g.lv=kp.lv;g.rv=[];g.nl=[];g.cash={};g.ph='spin';g.wv=null;g.msg='';g.won=null;g.wr=g.wr||0;g.sol=''},
 render(){
  const p=players[g.wt],done=g.ph==='done';
  let o='<div class="card glass wcard" style="'+(done?'':'box-shadow:0 0 0 3px '+p.c+',0 0 36px '+p.c+'66')+'">';
  o+='<div class="row"><span class="tag">🎡 Ordhjulet</span><span class="tag">Kategori: '+esc(g.pz.c)+' · '+[...g.pz.t].filter(isLetter).length+' bogstaver</span></div>';
  if(!done)o+='<div class="wturn" style="background:linear-gradient(135deg,'+p.c+',#fff8)">🎤 '+esc(p.n)+'s tur</div>';
  o+=tilesHTML()+cashHTML();
  if(g.msg)o+='<p class="hint" style="font-size:16px">'+g.msg+'</p>';
  const cons=[...ABC].filter(l=>!VOW.includes(l)),vow=[...VOW];
  if(g.ph==='spin'){
   const can=(g.cash[g.wt]||0)>=VCOST&&vow.some(v=>!g.rv.includes(v));
   o+='<div class="wwheel"><div class="wptr"></div>'+wheelSVG(g.wr)+'</div><div class="row"><button class="btn big" id="wspin">🎡 Snurr hjulet</button>'+(can?'<button class="btn" id="wvow">Køb vokal ('+VCOST+')</button>':'')+'<button class="btn green" id="wsolve">🧩 Jeg kan løse den</button></div>';
  }else if(g.ph==='spinning'){
   o+='<div class="wwheel"><div class="wptr"></div>'+wheelSVG(g.wr)+'</div><p class="hint">Hjulet snurrer…</p>';
  }else if(g.ph==='pick'){o+='<p class="hint">Hjulet stoppede på <b style="font-size:1.3em">'+g.wv+'</b> – vælg en konsonant (du får '+g.wv+' pr. forekomst).</p>'+keys(cons);}
  else if(g.ph==='vowel'){o+='<p class="hint">Vælg en vokal (koster '+VCOST+' – og turen, hvis den ikke er i ordet).</p>'+keys(vow)+'<div class="row"><button class="btn ghost" id="wback">Fortryd</button></div>';}
  else if(g.ph==='free'){o+='<p class="hint"><b>GRATIS bogstav!</b> Vælg frit en vokal eller konsonant.</p>'+keys([...ABC]);}
  else if(g.ph==='solve'){o+='<p class="hint">'+esc(p.n)+': skriv løsningen – eller sig den højt, og vis så løsningen til dommerne.</p><div class="est"><div class="p" style="--c:'+p.c+'"><input class="in" id="wsin" placeholder="Skriv løsningen" autocomplete="off" value="'+esc(g.sol||'')+'"></div></div><div class="row"><button class="btn big green" id="wcheck">✅ Tjek løsningen</button></div><div class="row"><button class="btn ghost" id="wshow">👁️ Jeg sagde den højt – vis løsningen</button><button class="btn ghost" id="wback">Fortryd</button></div>';}
  else if(g.ph==='judge'){o+='<div class="wsol">'+esc(g.pz.t)+'</div><p class="hint">Dommere (de andre): sagde '+esc(p.n)+' præcis denne løsning?</p><div class="row"><button class="btn big green" id="wok">✅ Rigtigt</button><button class="btn big red" id="wno">❌ Forkert</button></div>';}
  else if(done){o+='<div class="wsol">'+esc(g.pz.t)+'</div><p class="hint">🏆 '+esc(players[g.won].n)+' løste gåden og får +3 point! (Kontanter i runden: '+(g.cash[g.won]||0)+')</p><div class="row"><button class="btn big green" id="nx">Næste gåde →</button></div>';}
  g.nl=[];
  return o+'</div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  /* Tilpas brikkerne til den virkelige bredde: hele svaret på én linje, når det kan være der.
     Er svaret for langt, ombrydes det ved mellemrummene, så hvert ord stadig står på én linje. */
  const tilpas=()=>{
   const board=document.querySelector('.wboard');
   if(!board)return;
   const ord=[...board.querySelectorAll('.wword')].filter(w=>w.children.length);
   if(!ord.length)return;
   const antal=ord.reduce((a,w)=>a+w.children.length,0),mellemrum=ord.length;
   const plads=board.clientWidth-4;
   let tw=Math.floor((plads-(antal-mellemrum)*4-(mellemrum-1)*18)/Math.max(antal,1));
   if(tw<16){
    const ml=Math.max(...ord.map(w=>w.children.length));
    tw=Math.floor((plads-(ml-1)*4)/Math.max(ml,1));
   }
   tw=Math.max(11,Math.min(40,tw));
   board.style.setProperty('--tw',tw+'px');
  };
  tilpas();
  const guess=(l,cost,val)=>{
   if(g.rv.includes(l))return;g.rv.push(l);const n=cnt(g.pz.t,l);
   if(cost)g.cash[g.wt]=(g.cash[g.wt]||0)-cost;
   if(n>0){g.nl=[l];if(val)g.cash[g.wt]=(g.cash[g.wt]||0)+n*val;g.ph='spin';g.msg='✅ '+n+'× '+l+(val?' = +'+(n*val):'')+'. Du fortsætter!';
    if([...g.pz.t].filter(isLetter).every(c=>g.rv.includes(c))){g.ph='solve';g.msg='Alle bogstaver er afsløret – løs gåden!'}
   }else nextP('❌ Ingen '+l+'. Næste spiller.');
   render();};
  const win=()=>{g.won=g.wt;g.ph='done';g.msg='';add(g.wt,3);boom();render()};
  if($('wspin'))$('wspin').onclick=()=>{
   const idx=rnd(WH.length),w=360/WH.length,cur=((g.wr%360)+360)%360,need=((-(idx*w)-cur)%360+360)%360,target=g.wr+360*(4+rnd(3))+need;
   g.ph='spinning';g.msg='';const from=g.wr;g.wr=target;render();
   const grp=$('wgrp');
   if(grp){const t0=performance.now(),D=3600,ease=x=>1-Math.pow(1-x,3.2);
    const step=now=>{const e=document.getElementById('wgrp');if(!e)return;const k=Math.min(1,(now-t0)/D);e.setAttribute('transform','rotate('+(from+(target-from)*ease(k)).toFixed(2)+')');if(k<1)requestAnimationFrame(step)};
    grp.setAttribute('transform','rotate('+from+')');requestAnimationFrame(step)}
   const myPz=g.pz;
   setTimeout(()=>{
    if(view!=='wheel'||g.pz!==myPz&&false||g.ph!=='spinning')return;
    const v=WH[idx];
    if(v==='FALLIT'){g.cash[g.wt]=0;nextP('💥 FALLIT! '+esc(players[g.wt].n)+' mister alle kontanter og turen.')}
    else if(v==='MIST TUR')nextP('⏭️ Mist tur!');
    else if(v==='GRATIS'){g.ph='free';g.msg='🎁 GRATIS!'}
    else{g.wv=v;g.ph='pick';g.msg=''}
    render()},3700)};
  if($('wvow'))$('wvow').onclick=()=>{g.ph='vowel';g.msg='';render()};
  if($('wback'))$('wback').onclick=()=>{g.ph='spin';render()};
  if($('wsolve'))$('wsolve').onclick=()=>{g.ph='solve';g.msg='';g.sol='';render()};
  if($('wshow'))$('wshow').onclick=()=>{g.ph='judge';render()};
  if($('wsin')){$('wsin').focus();$('wsin').oninput=()=>{g.sol=$('wsin').value};$('wsin').onkeydown=e=>{if(e.key==='Enter')$('wcheck').click()}}
  if($('wcheck'))$('wcheck').onclick=()=>{const v=$('wsin').value;if(!v.trim()){$('wsin').classList.add('shake');return}
   if(nzs(v)===nzs(g.pz.t))win();else{g.sol='';nextP('❌ «'+esc(v)+'» er ikke den rigtige løsning. Næste spiller.');render()}};
  if($('wok'))$('wok').onclick=win;
  if($('wno'))$('wno').onclick=()=>{nextP('❌ Forkert løsning. Næste spiller.');render()};
  document.querySelectorAll('.wkb button').forEach(b=>b.onclick=()=>{const l=b.dataset.l;
   if(g.ph==='pick')guess(l,0,g.wv);else if(g.ph==='vowel')guess(l,VCOST,0);else if(g.ph==='free')guess(l,0,0)});
 }
};
DATA.wheel=Array.from({length:400},(_,i)=>'hjul'+i);

/* ================= Dødsspils-leg ================= */
KINDS.rl={
 init(){g.rs='idle';g.rw=[]},
 render(){
  if(g.rs==='idle')return '<div class="card glass"><div class="q">🔴🟢 Rødt lys, grønt lys</div><p class="hint" style="text-align:left">Alle står i den ene ende af rummet. Er skærmen <b style="color:#2ec4b6">GRØN</b>, må I gå mod mållinjen. Bliver den <b style="color:#ff5d8f">RØD</b>, skal alle stå helt stille – bevæger du dig, er du ude. Spillet varer 60 sekunder; den, der rører mållinjen først, vinder. Én (ikke i gang) er dommer og siger, hvem der er ude.</p><div class="row"><button class="btn big" id="rlgo">▶ Start spillet</button></div></div>';
  if(g.rs==='run')return '<div class="card glass"><div class="rl" id="rlbox" style="background:#2ec4b6">GRØNT LYS</div><div class="hint" id="rlt">60</div></div>';
  return '<div class="card glass"><div class="q">⏱️ Tiden er gået!</div><p class="hint">Hvem nåede mållinjen uden at blive taget? (+2 point til hver)</p>'+awardChips(2,-1)+'<div class="row" style="margin-top:12px"><button class="btn ghost" id="nx">Ingen – næste spil →</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if(!$('rlgo'))return;
  $('rlgo').onclick=()=>{g.rs='run';render();
   let col='G',until=Date.now()+rnd(3000)+2500;const end=Date.now()+60000;
   const beep=f=>{try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),gn=a.createGain();o.frequency.value=f;o.connect(gn);gn.connect(a.destination);gn.gain.value=.15;o.start();setTimeout(()=>{o.stop();a.close()},220)}catch(e){}};
   clearInterval(tid);
   tid=setInterval(()=>{
    const b=document.getElementById('rlbox'),t=document.getElementById('rlt');if(!b){clearInterval(tid);return}
    const now=Date.now();
    if(now>=end){clearInterval(tid);g.rs='end';render();return}
    if(now>=until){col=col==='G'?'R':'G';until=now+(col==='G'?rnd(3500)+2000:rnd(2500)+1500);b.style.background=col==='G'?'#2ec4b6':'#e63946';b.textContent=col==='G'?'GRØNT LYS':'RØDT LYS – STÅ STILLE!';beep(col==='G'?660:220)}
    t.textContent=Math.ceil((end-now)/1000);
   },100);
  };
 }
};
function gbNew(){const n=players.length;return {safe:Array.from({length:8},()=>rnd(2)),known:0,order:shuffle(players.map((_,i)=>i)),cur:0,out:[],fin:[],pos:0,msg:''}}
const gbHTML=b=>{ // broen ses fra den lave side: man starter hos fjern og går ned mod os
 let h='<div class="gb'+(b.fald?' gbryste':'')+'"><div class="gbh"></div>'; for(let i=7;i>=0;i--){const s=8-i,k=i<b.known,cur=(i===b.known&&b.cur<b.order.length);
  h+='<div class="gbrow" style="transform:scale('+s/8+')">';
  for(let j=0;j<2;j++){const god=k?(b.safe[i]===j):(cur&&b.val===j);
   h+='<div class="gbt'+(k?(b.safe[i]===j?' safe':' no'):'')+(cur&&!k&&b.val===j?' go':'')+(cur&&!k?' cur':'')+'">'+(k&&b.safe[i]===j?'✓':'')+'</div>'}
  h+='</div>'}
 h+='<div class="gbtur">'+(b.cur<b.order.length?'<span class="gbmand" style="background:'+players[b.order[b.cur]].c+'"></span>':'')+'</div>';
 if(b.fald){
  const næste=b.cur<b.order.length?players[b.order[b.cur]]:null;
  h+='<div class="gbfald" style="--c:'+b.fald.c+'"><div class="fig"></div>'
   +'<div><div class="tekst">💥 '+esc(b.fald.n)+' faldt!</div>'
   +(næste?'<div class="nyt" style="--c:'+næste.c+'">▶ Nu går turen videre til '+esc(næste.n)+'</div>':'')
   +'</div></div>';
 }
 h+='</div>';
 return h};
KINDS.glass={
 init(){g.gb=gbNew();g.gdone=false},
 render(){
  const b=g.gb,inde=b.cur<b.order.length,p=inde?players[b.order[b.cur]]:null;
  let o='<div class="card glass"><div class="q">🌉 Glasbroen</div>'+gbHTML(b);
  o+='<p class="hint" style="text-align:left">Broen ses fra den side, vi står på – spillerne starter oppe i den fjerne ende og skal hele vejen ned til os. 8 par glasfliser – kun den ene i hvert par bærer.'+(inde?' <b>'+esc(p.n)+'</b> står ved flise nr. '+(b.known+1)+' af 8.':'')+'</p>';
  if(b.msg)o+='<p class="hint" style="font-size:16px">'+b.msg+'</p>';
  if(p){o+='<div class="row"><button class="btn big" id="gl0"'+(b.fald?' disabled':'')+'>⬅️ Venstre flise</button><button class="btn big" id="gl1"'+(b.fald?' disabled':'')+'>Højre flise ➡️</button></div>'}
  else{const f=b.fin;o+='<div class="ans" style="font-size:clamp(20px,3.5vw,30px)">'+(f.length?'🏆 Kom over: '+f.map(i=>esc(players[i].n)).join(', ')+' (+2 hver)':'Ingen kom over broen i denne omgang.')+'</div><div class="row"><button class="btn big green" id="nx">Ny bro →</button></div>'}
  return o+'</div>';
 },
 bind(){
  const $=id=>document.getElementById(id),b=g.gb;
  [0,1].forEach(s=>{const el=$('gl'+s);if(!el)return;el.onclick=()=>{
   const pi=b.order[b.cur];b.val=s;render();               // viser springet, mens flisen knuser
   setTimeout(()=>{
    const ok=b.safe[b.known]===s;
    if(ok){b.known++;b.val=null;b.msg='✅ '+esc(players[pi].n)+' har flisen under fødderne – ét skridt nærmere os';
     if(b.known>=8){b.fin.push(pi);add(pi,2);boom();b.cur++;b.msg='🏃 '+esc(players[pi].n)+' nåede ned og over!';
      while(b.cur<b.order.length){const q=b.order[b.cur];b.fin.push(q);add(q,2);b.cur++}}   // de sidste følger den afslørede vej
    }else{const faldt=players[pi];
     b.fald={n:faldt.n,c:faldt.c};
     b.msg='💥 '+esc(faldt.n)+' faldt! Flisen er afsløret for de næste.';
     b.known++;b.val=null;b.out.push(pi);b.cur++;
     if(b.known>=8)b.cur=b.order.length;
     setTimeout(()=>{b.fald=null;render()},1900)   // vis faldet, og lad derefter den nye spiller tage over
    }
    render()},520)}});
 }
};
KINDS.marb={
 init(){g.ma=((g.ma==null?-1:g.ma)+1)%players.length;g.md=(g.ma+1)%players.length;g.mph=0;g.mn=null;g.mg=null},
 render(){
  const a=players[g.ma],d=players[g.md];
  let o='<div class="card glass"><div class="q">🔮 Kugler: lige eller ulige?</div><div class="row"><span class="tag" style="background:'+a.c+';color:#111">Holder kuglerne: '+esc(a.n)+'</span><span class="tag" style="background:'+d.c+';color:#111">Gætter: '+esc(d.n)+'</span></div>';
  if(g.mph===0)return o+'<p class="hint">'+esc(a.n)+': skriv skjult, hvor mange kugler (1–5) du holder i hånden. Skærmen må kun ses af dig.</p><div class="est"><div class="p" style="--c:'+a.c+'"><b>'+esc(a.n)+'</b><input class="in" id="mn" type="password" inputmode="numeric" placeholder="1–5"></div></div><div class="row"><button class="btn big" id="mlock">Lås 🔒</button></div></div>';
  if(g.mph===1)return o+'<p class="hint">'+esc(d.n)+': er antallet lige eller ulige?</p><div class="row"><button class="btn big" id="me">Lige</button><button class="btn big" id="mu">Ulige</button></div></div>';
  const even=g.mn%2===0,right=(g.mg==='e')===even;
  return o+'<div class="ans">'+g.mn+' kugler – '+(even?'lige':'ulige')+'</div><p class="hint">'+esc(d.n)+' gættede '+(g.mg==='e'?'lige':'ulige')+' – '+(right?'<b>rigtigt!</b> '+esc(d.n)+' vinder '+g.mn+' kugler (point).':'<b>forkert.</b> '+esc(a.n)+' vinder '+g.mn+' kugler (point).')+'</p><div class="row"><button class="btn big green" id="nx">Næste duel →</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('mlock'))$('mlock').onclick=()=>{const n=parseInt($('mn').value,10);if(!(n>=1&&n<=5)){$('mn').classList.add('shake');return}g.mn=n;g.mph=1;render()};
  ['e','u'].forEach(k=>{const id=k==='e'?'me':'mu';if($(id))$(id).onclick=()=>{g.mg=k;g.mph=2;const even=g.mn%2===0,right=(k==='e')===even;add(right?g.md:g.ma,g.mn);boom();render()}});
 }
};
GAMES.push(
{id:'wheel',grp:'Gæt & kvis',key:'wheel',kind:'wheel',t:'Ordhjulet',d:'Snurr hjulet, gæt bogstaver, køb vokaler og løs gåden – inspireret af tv-programmet',e:'🎡',g:'linear-gradient(135deg,#f9d423,#ff4e50,#7209b7)',min:2},
{id:'sqrl',grp:GRP_S,key:'sqrl',kind:'rl',t:'Rødt lys, grønt lys',d:'Gå, når skærmen er grøn – stå stille, når den er rød',e:'🔴',g:'linear-gradient(135deg,#e63946,#2ec4b6)',min:2},
{id:'sqglass',grp:GRP_S,key:'sqglass',kind:'glass',t:'Glasbroen',d:'Vælg rigtig glasflise – den, der falder, hjælper de næste',e:'🌉',g:'linear-gradient(135deg,#00b4d8,#023e8a)',min:2},
{id:'sqmarb',grp:GRP_S,key:'sqmarb',kind:'marb',t:'Kugler: lige eller ulige',d:'Gæt, om modstanderen holder et lige eller ulige antal kugler',e:'🔮',g:'linear-gradient(135deg,#6a4c93,#1982c4)',min:2},
{id:'sqdal',grp:GRP_S,key:'sqdal',kind:'award',t:'Dalgona-udfordringer',d:'Præcisions- og nerveopgaver – uden at knække!',e:'🍪',g:'linear-gradient(135deg,#ffb703,#fb8500)',min:2},
{id:'sqdil',grp:GRP_S,key:'sqdil',alder:18,kind:'choice',t:'Dystre valg',d:'Hårde dilemmaer fra dødsspillet – hvor lander I?',e:'💀',g:'linear-gradient(135deg,#240b36,#c31432)',min:2},
{id:'sqwho',grp:GRP_S,key:'sqwho',alder:18,kind:'cards',t:'Hvem i familien?',d:'Dystre spørgsmål om, hvem i jeres kreds der gør hvad i dødsspillet – peg!',e:'👆',g:'linear-gradient(135deg,#0b132b,#6a040f)',min:2});

DATA.sqdal=[
'Skær en lille stjerne ud af en skive ost (eller en kiks) med en nål eller tandstikker uden at knække den. 90 sekunder. Stormesteren dømmer.',
'Skær et hjerte ud af en skive agurk med en kniv (voksen hjælper) uden at gennembryde skiven. 60 sekunder.',
'Byg et tårn af 10 kiks uden at nogen knækker. Den, der tabte først, er ude.',
'Hold en tændstik/tandstik lodret på fingerspidsen i 30 sekunder uden at tabe den.',
'Træk en tråd gennem et nåleøje med den ene hånd bundet bag ryggen på 60 sekunder.',
'Del en æggeblomme fra hviden uden at sprække blommen – på 60 sekunder (kun hænder).',
'Gå 10 skridt med en skefuld vand uden at spilde en dråbe, mens de andre prøver at få dig til at grine.',
'Stable fem mønter på hinanden (et tårn) på 45 sekunder.',
'Skriv dit navn på et ark papir med bind for øjnene, så det kan læses. 30 sekunder.',
'Hold din hånd helt stille over et glas vand (flad hånd) i 45 sekunder, mens der blæses let på den.',
'Spis en kiks uden at bruge hænderne og uden at miste krummer i 60 sekunder.',
'Byg en bro mellem to glas af kort/papir, der kan holde en tændstikæske i 5 sekunder.',
'Tegn en perfekt lige linje på 20 cm med frihånd. Stormesteren måler.',
'Slå en tændstik/tændstikæske ud af en kant med et enkelt, præcist fingertip – mod uret, 20 sekunder.'
];
DATA.sqdil=[
{a:'Vinde 250 millioner kroner, men aldrig mere se dem, du holder af',b:'Gå hjem uden penge med hele familien i behold'},
{a:'Selv gå ud i første runde, så din bedste ven kommer videre',b:'Lade din bedste ven gå ud, så du selv kommer videre'},
{a:'Vælge, hvem af dine søskende der skal ud i næste runde',b:'Selv gå ud i næste runde uden at kunne stemme'},
{a:'Spille videre og vinde alt – men aldrig kunne stole på nogen igen',b:'Stoppe nu og leve et almindeligt, men trygt liv'},
{a:'Være den sidste overlevende i dødsspillet',b:'Være den, der får hele gælden slettet, men aldrig må tale om det'},
{a:'Vide præcis, hvilken runde du bliver elimineret i',b:'Ikke vide det, men have en lille chance for at vinde'},
{a:'Forråde en fremmed for at redde din familie',b:'Stå ved din moral og tage chancen sammen med din familie'},
{a:'Sidde som den, der bestemmer reglerne, uden at kunne stoppe spillet',b:'Være en af deltagerne og have en lille chance'},
{a:'Dele præmien lige med dem, der er tilbage',b:'Tage hele præmien, men ingen må vide, hvordan du fik den'},
{a:'Miste al din hukommelse om spillet og vinde pengene',b:'Huske alt og leve med det, men have halvdelen af pengene'},
{a:'Springe over en runde ved at ofre en, du kender godt',b:'Spille runden, men have 50 % risiko for at falde ud'},
{a:'Få at vide, hvem der svigter dig, og ikke kunne gøre noget',b:'Ikke få det at vide og stole blindt på alle'},
{a:'Få et sekund ekstra i hver runde, men aldrig sove i spillet',b:'Sove roligt, men have et sekund mindre i hver runde'},
{a:'Spille som hold med dem, du kender, og tabe sammen',b:'Spille alene og have en chance for at vinde'},
{a:'Kunne forlade spillet når som helst uden penge',b:'Kunne ikke forlade spillet, men have 50 % chance for den store præmie'},
{a:'Vælge dit eget kaldenavn i spillet',b:'Vælge navnet på den, du frygter mest'},
{a:'Være den første, der bliver tilbudt en genvej til målet',b:'Være den sidste, der får hele sandheden at vide'},
{a:'Alle i dit liv ser dig vinde',b:'Ingen ser dig vinde – men du får præmien'},
{a:'Spille hele spillet i skjul som iagttager',b:'Spille midt i det og risikere det hele'},
{a:'Vinde præmien og aldrig kunne fortælle det til nogen',b:'Tabe, men kunne fortælle alle, hvad der skete'}
];
DATA.sqwho=[
'Hvis I alle var med i dødsspillet, og kun én af jer kunne overleve: Hvem klarer den? Tæl til tre og peg!',
'Hvem i jeres kreds ville forråde de andre først for at vinde pengene? Peg!',
'Hvem af jer ville klare Glasbroen bedst? Peg på tre!',
'Hvem af jer ville blive elimineret allerførst i Rødt lys, grønt lys? Peg!',
'Hvem i familien ville man helst have på sit hold i et dødsspil? Peg!',
'Hvem i familien ville man aldrig have på sit hold i et dødsspil? Peg!',
'Hvem af jer ville tabe kuglespillet, fordi vedkommende ikke kan lyve? Peg!',
'Hvem ville mest sandsynligt tage et sidste, desperat valg for at redde de andre? Peg!',
'Hvem af jer ville vinde præmien og så forsvinde fra jorden bagefter? Peg!',
'Hvem af jer er mest sandsynlig til at gå videre uden at kigge sig tilbage? Peg!',
'Hvem i familien ville I vælge til at tage den dårlige beslutning for alle? Diskutér i 30 sekunder, stem så!',
'Hvem ville være den sidste, I ville sende ud i dødsspillet? Peg!',
'Hvem af jer ville være en god Frontmand/Vagt, og hvem ville være tvunget til at spille? Peg på begge!',
'Hvem i jeres kreds ville ændre mening, så snart pengene er på bordet? Peg!',
'Hvem af jer ville give op først? Peg!'
];
DATA.sqrl=DATA.sqrl||['rl'];DATA.sqglass=['gl'];DATA.sqmarb=['mb'];
window.hsDeathGame={GRP_S};

/* ================= Færdselsloven (4 spil) – vises først, når puljen har kildetjekkede spørgsmål ================= */
const GRP_F='🚦 Færdselsloven';
const FTL=[
 {id:'ftl_bil',sub:'ftl',key:'ftl_bil',kind:'choice',t:'Færdselsloven: bil',d:'Regler og teori for bilister – kontrolleret mod selve loven',e:'🚗',g:'linear-gradient(135deg,#0077b6,#00b4d8)',min:2},
 {id:'ftl_cykel',sub:'ftl',key:'ftl_cykel',kind:'choice',t:'Færdselsloven: cykel',d:'Regler og teori for cyklister – kontrolleret mod selve loven',e:'🚲',g:'linear-gradient(135deg,#2ec4b6,#80ed99)',min:2},
 {id:'ftl_fod',sub:'ftl',key:'ftl_fod',kind:'choice',t:'Færdselsloven: fodgænger',d:'Regler og teori for fodgængere – kontrolleret mod selve loven',e:'🚶',g:'linear-gradient(135deg,#ffb703,#fb8500)',min:2}];
const FTL_HID={id:'ftl_andre',grp:'__h',sub:'ftl',key:'ftl_andre',kind:'choice',t:'Færdselsloven: øvrige trafikanter',d:'',e:'🛵',g:'',min:2};
const FTL_ALL={id:'ftl',key:'ftl_all',kind:'mix',t:'Færdselsloven: alle trafikanter',d:'Alle fire områder i ét – bil, cykel, fodgænger og øvrige trafikanter (knallert, motorcykel, bus, lastbil, traktor, ridende m.fl.) blandet',e:'🚦',g:'linear-gradient(135deg,#e63946,#ffb703,#2ec4b6)',min:2};
const h3=window.home;
window.home=function(){
 const r=h3.apply(this,arguments);
 try{const m=document.getElementById('main');
  m.querySelectorAll('button.gc').forEach(b=>{if(/start\('ftl'\)/.test(b.getAttribute('onclick')||'')){const n=['ftl_bil','ftl_cykel','ftl_fod','ftl_andre'].reduce((s,k)=>s+((DATA[k]||[]).length),0),ps=b.querySelector('.ps');if(ps)ps.textContent=n+' i puljen'}});
 }catch(e){}
 return r};
const f1=window.HS_FINISH;
window.HS_FINISH=function(){
 f1&&f1();
 try{
  const has=k=>Array.isArray(DATA[k])&&DATA[k].length>0;
  const add=x=>{if(!GAMES.find(a=>a.id===x.id))GAMES.push(x)};
  let any=false;
  FTL.forEach(x=>{if(has(x.key)){add(Object.assign({grp:GRP_F},x));any=true}});
  if(has('ftl_andre')){add(FTL_HID);any=true}
  if(any){DATA.ftl_all=['ftl'];add(Object.assign({grp:GRP_F},FTL_ALL))}
  ['ftl_bil','ftl_cykel','ftl_fod','ftl_andre'].forEach(k=>{window.hsShuf.add(k);CHOICE_BUILD[k]=window.hsMcb});
 }catch(e){console.error('HS ftl',e)}
};
})();

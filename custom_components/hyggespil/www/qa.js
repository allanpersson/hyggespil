(function(){
const f0=window.HS_FINISH;
const RP=[['slaveoprev','slaveoprør'],['besudelsen','besættelsen'],['Forbuddet mod at arbejde i kirketiden','Tvungen konfirmation af alle unge']];

/* ---- Grænseløs: minimumsniveau = smag egen sæd, rimming, spanking, finger i røven. Alt ligger på eller over det niveau (samtykkende voksne). Format: TYPE+POINT[+køn]|tekst. S=solo, D=med partner ({K} kvinde, {M} mand, {X} vilkårlig anden – kun én gang pr. tekst), G=alle/begge (gensidige handlinger). m/k efter point = kun til en mand/kvinde der udfører det. Hver handling findes kun én gang (enten som D eller som G), så den ikke kommer til den anden bagefter. ---- */
const XH=[
'S4m|Smag din egen sæd, og beskriv smagen i detaljer.',
'S4k|Smag din egen fugt på dine fingre, og beskriv smagen i detaljer.',
'S4|Stik en våd finger ind i din egen røv, og hold den der i 30 sekunder.',
'S5|Stik en våd finger ind i din egen røv, og smag på den bagefter.',
'S5m|Onanér, til du kommer, og smag derefter din egen sæd.',
'S5k|Stik to fingre ind i dig selv, og stik så en i din egen røv, og smag på fingrene bagefter.',
'S5|Stik en dildo eller buttplug ind i din egen røv, og lad den sidde i 5 minutter.',
'D4|Spank {X} 20 gange på bar røv, så hårdt som vedkommende kan tåle.',
'D5|Brug en strap-on, dildo eller buttplug i røven på {X} i 2 minutter.',
'D5|Hav analsex med {X} i 3 minutter.',
'D5|Sæt dig i ansigtet på {X}, og bliv der i 2 minutter, mens vedkommende slikker dig overalt.',
'D5|Giv {X} oralsex, og bliv ved, indtil vedkommende kommer.',
'D5|Bind {X} fast, og tease vedkommende i 5 minutter med hænder og mund uden at lade vedkommende komme, helt nøgne.',
'D5|Lad {X} binde dine øjne og hænder, og tag imod alt vedkommende gør ved dig i 3 minutter uden at røre tilbage.',
'D5|Lad {X} bruge dig, som vedkommende vil, i 3 minutter, mens du kun må sige ja og mere.',
'D5m|Slik {K} mellem benene, til hun kommer.',
'D5m|Slik {K} i røven, mens du fingrer hende forfra, i 2 minutter.',
'D5m|Kom på {K}s mave eller bryster, og lad hende smage på det bagefter.',
'D5m|Kom på {K}s ansigt, og lad hende beholde det der i 60 sekunder.',
'D5k|Giv {M} et blowjob, til han kommer, og synk det.',
'D5k|Giv {M} deepthroat, så dybt du kan, i 2 minutter.',
'D5k|Giv {M} et blowjob, lad ham komme i din mund, og del det med et kys.',
'D5k|Giv {M} en titfuck, til han kommer.',
'D5k|Giv {M} et blowjob, og kys ham derefter dybt, så han smager sig selv.',
'G4|Alle: Spank personen til højre for dig 20 gange på bar røv.',
'G5|Alle: Stik en våd finger ind i røven på personen til højre for dig, og hold den der i 60 sekunder.',
'G5|Alle: Rim personen til højre for dig, mens du samtidig har en finger i vedkommendes røv, i 2 minutter.',
'G5|Alle: Lav 69 med personen til højre for dig i 3 minutter.',
'G5|Alle: Hav sex med personen til højre for dig i en stilling, I vælger sammen, i mindst 5 minutter.'
];
const XRX=/^([SDG])([2-5])([mk]?)\|(.+)$/;
function xp(s){const m=XRX.exec(String(s));return m?{t:m[1],p:+m[2],g:m[3],x:m[4]}:null}

window.HS_FINISH=function(){f0&&f0();try{(DATA.law||[]).forEach(i=>{RP.forEach(p=>{if(i.q)i.q=i.q.split(p[0]).join(p[1]);if(i.e)i.e=i.e.split(p[0]).join(p[1]);i.o=i.o.map(o=>o.split(p[0]).join(p[1]))})})}catch(e){console.error('HS qa',e)}
 try{DATA.xh=XH.slice()}catch(e){}};
const x0=window.HS_EXTRA;
window.HS_EXTRA=function(x){x0&&x0(x);try{DATA.xh=(DATA.xh||[]).filter(s=>xp(s))}catch(e){}};

/* ---- spillernes køn (vises i Spillere-vinduet) ---- */
const mh=window.modalHTML;
window.modalHTML=function(){let h=mh.apply(this,arguments);
 if(modal==='pl')players.forEach((p,i)=>{h=h.replace('<button data-del="'+i+'">','<select data-g="'+i+'" style="background:#2a2060;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:6px"><option value="">Køn?</option><option value="k"'+(p.g==='k'?' selected':'')+'>Kvinde</option><option value="m"'+(p.g==='m'?' selected':'')+'>Mand</option></select><button data-del="'+i+'">')});
 return h};
const mb=window.bindModal;
window.bindModal=function(){mb.apply(this,arguments);if(modal==='pl')document.querySelectorAll('[data-g]').forEach(s=>s.onchange=()=>{players[+s.dataset.g].g=s.value||undefined;save()})};

/* ---- Grænseløs som eget spil ---- */
const rnd=n=>Math.random()*n|0;
function elig(it,turn){const o=xp(it);if(!o)return null;const me=players[turn];
 if(o.t==='G'){const who=players.map((_,i)=>i).filter(i=>!o.g||players[i].g===o.g);return who.length?{o,who}:null}
 if(o.g&&me.g!==o.g)return null;
 if(o.t==='D'){const tk=/\{([KMX])\}/.exec(o.x),k=tk?tk[1]:'X';const need=k==='K'?'k':k==='M'?'m':null;
  const cand=players.map((_,i)=>i).filter(i=>i!==turn&&(!need||players[i].g===need));return cand.length?{o,cand}:null}
 return {o}}
KINDS.hard={
 init(){g.turn=(g.turn+1)%players.length;let e=null;
  for(let k=0;k<200;k++){e=elig(g.item,g.turn);if(e)break;g.item=window.draw(view,pool(gm(view).key))}
  if(!e)e={o:{t:'S',p:4,x:'Stik en våd finger ind i din egen røv, og hold den der i 30 sekunder.'}};
  g.hx=e;g.hp=e.cand?e.cand[rnd(e.cand.length)]:null;g.hsel=[]},
 render(){
  const e=g.hx,o=e.o,me=players[g.turn];
  const px=players.length===2&&o.t==='G'?o.x.replace(/^Alle/,'Begge').replace(/personen til højre for dig/g,'hinanden'):o.x;
  const txt=px.split(/\{[KMX]\}/).map(esc).join('<b style="color:'+(g.hp!=null?players[g.hp].c:'#fff')+'">'+(g.hp!=null?esc(players[g.hp].n):'')+'</b>');
  const star='🔥'.repeat(o.p);
  const who=o.t==='G'?'<p class="hint">Hvem gjorde det? Vælg alle, der gennemførte – hver får '+o.p+' point.</p><div class="row">'+e.who.map(i=>'<div class="chip aw '+(g.hsel.includes(i)?'sel':'')+'" data-hs="'+i+'" style="--c:'+players[i].c+'">'+esc(players[i].n)+'</div>').join('')+'</div>':'';
  const btn=o.t==='G'?'<button class="btn big green" id="hgo">Bekræft (+'+o.p+' til hver valgt)</button>':'<button class="btn big green" id="hdone">✅ Gennemført (+'+o.p+(o.t==='D'?' til begge':'')+')</button>';
  const hint=players.every(p=>p.g)?'':'<p class="hint">Tip: Vælg køn under 👥 Spillere, så udfordringer med køn rammer de rigtige.</p>';
  return '<div class="card glass big-card"><div><div class="row"><span class="tag" style="background:'+me.c+';color:#111">'+(o.t==='G'?'Begge/alle – start: ':'Tur: ')+esc(me.n)+'</span><span class="tag">'+star+' '+o.p+' point</span></div>'
   +'<div class="q" style="font-size:clamp(22px,3.6vw,34px)">'+txt+'</div>'
   +who+'<div class="row" style="margin-top:14px">'+btn+'<button class="btn ghost" id="hpas">🙅 Pas (0 point)</button></div>'+hint+'</div></div>'},
 bind(){
  const e=g.hx,o=e.o,$=id=>document.getElementById(id);
  if($('hdone'))$('hdone').onclick=()=>{add(g.turn,o.p);if(o.t==='D'&&g.hp!=null)add(g.hp,o.p);boom();next()};
  if($('hgo'))$('hgo').onclick=()=>{g.hsel.forEach(i=>add(i,o.p));if(g.hsel.length)boom();next()};
  if($('hpas'))$('hpas').onclick=()=>next();
  document.querySelectorAll('[data-hs]').forEach(c=>c.onclick=()=>{const i=+c.dataset.hs;g.hsel=g.hsel.includes(i)?g.hsel.filter(z=>z!==i):g.hsel.concat(i);render()})}
};
const r0=window.render;
window.render=function(){const x=GAMES.find(a=>a.id==='xh');if(x&&x.kind!=='hard'){x.kind='hard';x.t='Grænseløs';x.d='Ekstremt grove seksuelle udfordringer for voksne – point efter sværhedsgrad'}return r0.apply(this,arguments)};

/* retter stavefejl i mysteriernes tekst, uanset hvor de genereres */
let mv;const FX=[['spørgt','spurgt']];const fx=s=>typeof s==='string'?FX.reduce((a,p)=>a.split(p[0]).join(p[1]),s):s;
Object.defineProperty(window,'HS_MYS',{configurable:true,get(){return mv},set(f){mv=function(){const m=f.apply(this,arguments);try{m.story=m.story.map(fx);m.s=fx(m.s);m.c=m.c.map(fx)}catch(e){}return m}}});
})();

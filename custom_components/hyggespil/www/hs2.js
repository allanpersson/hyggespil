/* Hyggespil v7: 1) grupper + løbende sæson, 2) random-mix, 3) børn & unge (alder), 4) ordsprog, 5) destination, 6) stormester.
   Data ligger i k1.js (børn), pv.js (ordsprog), dx.js (destinationer) og sm.js (stormester). */
(function(){
if(window.__hs2)return;window.__hs2=true;
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const GRP_K='🧒 Børn & unge',GRP_X='🔞 XXX',GRP_R='🎲 Random';
const CS=['#ff5d8f','#ffb703','#2ec4b6','#8f6bff'];
const st=document.createElement('style');
st.textContent='.ssr{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.06);margin:6px 0}.ssr b{min-width:90px}.ssr .chip{cursor:pointer}';
document.head.appendChild(st);

/* ================= 1) Grupper + løbende sæson ================= */
const GK='groups';
const getG=()=>{let o=LS.get(GK,null);if(!o||!Array.isArray(o.list)||!o.list.length){o={cur:'g0',list:[{id:'g0',name:'Standard',players:null,hist:[],nights:0}]};LS.set(GK,o)}return o};
const curG=o=>o.list.find(x=>x.id===o.cur)||o.list[0];
const nn=n=>(n||0)+(window.HSLANG==='en'?(n===1?' evening':' evenings'):(n===1?' aften':' aftener'));
window.hsGroupId=curG(getG()).id;
players.forEach(p=>{if(p.t==null)p.t=p.s||0});save();

const add0=window.add;
window.add=function(i,n){const r=add0.apply(this,arguments);try{const p=players[i];if(p){p.t=(p.t||0)+n;save()}}catch(e){}return r};

function switchTo(id){
 const o=getG(),c=curG(o),n=o.list.find(x=>x.id===id);if(!n||c.id===id)return;
 c.players=JSON.parse(JSON.stringify(players));
 o.cur=id;LS.set(GK,o);window.hsGroupId=id;
 players=JSON.parse(JSON.stringify(n.players||[]));
 players.forEach(p=>{if(p.t==null)p.t=p.s||0});save();
 clearInterval(tid);g={};view='home';modal=null;MIX=null;render();scrollTo(0,0);
}
function recordEvening(){
 try{const o=getG(),c=curG(o);
  if(players.some(p=>p.s>0)){c.hist=c.hist||[];c.hist.unshift({d:new Date().toLocaleDateString('da-DK'),r:players.map(p=>[p.n,p.s])});c.hist=c.hist.slice(0,30);c.nights=(c.nights||0)+1;LS.set(GK,o)}
 }catch(e){}
}
const ask1=window.ask;
window.ask=function(text,yes){
 if(/^Nulstil alle point/.test(text))return ask1.call(this,text,function(){recordEvening();return yes.apply(this,arguments)});
 return ask1.apply(this,arguments);
};

function grpHTML(){
 const o=getG(),c=curG(o);
 const rows=o.list.map(x=>{const ps=x.id===o.cur?players:(x.players||[]);const names=ps.map(p=>esc(p.n)).join(', ')||'<i>ingen spillere endnu</i>';
  return '<div class="rsr"><div class="rst"><b>'+esc(x.name)+(x.id===o.cur?' ✅':'')+'</b><small>'+names+' · '+nn(x.nights)+'</small></div>'+(x.id===o.cur?'':'<button class="btn green" data-gs="'+x.id+'">Skift hertil</button><button class="btn ghost" data-gd="'+x.id+'" title="Slet gruppen">✕</button>')+'</div>'}).join('');
 const tot=players.slice().sort((a,b)=>(b.t||0)-(a.t||0)).map((p,i)=>{const top=i===0&&(p.t||0)>0;return '<div class="rk '+(top?'w':'')+'"><span>'+(top?'👑':(i+1)+'.')+'</span><span class="n" style="color:'+p.c+'">'+esc(p.n)+'</span><span>'+(p.t||0)+'</span></div>'}).join('');
 const hist=(c.hist||[]).slice(0,5).map(h=>'<small style="display:block;opacity:.8;text-align:left">'+esc(h.d)+': '+h.r.map(r=>esc(r[0])+' '+r[1]).join(' · ')+'</small>').join('');
 return '<div class="modal"><div class="mbox" style="max-height:90vh;overflow:auto"><h2 style="margin-top:0">👨‍👩‍👧 Grupper &amp; løbende spil</h2>'
 +'<p class="hint" style="text-align:left">Hver gruppe har egne spillere, egne point og en <b>løbende stilling</b>, der fortsætter fra aften til aften (indtil du starter en ny sæson). Skift frit imellem grupper – fx en familiesæson over flere uger og en gæsteaften indimellem. «Ny aften» nulstiller kun aftenens point.</p>'
 +'<div class="rsm">'+rows+'</div>'
 +'<div class="pl"><input class="in" id="gn" placeholder="Navn på ny gruppe, fx Gæster" maxlength="24" style="font-size:17px"><button class="btn" id="gadd" style="border-radius:14px;width:auto;height:auto">Opret</button></div>'
 +'<h3 style="margin:16px 0 6px">🏆 Løbende stilling – '+esc(c.name)+'</h3>'+(tot||'<p class="hint">Ingen spillere endnu.</p>')+(hist?'<p class="hint" style="margin-bottom:2px">Seneste aftener:</p>'+hist:'')
 +'<div class="row" style="margin-top:14px"><button class="btn ghost" id="gseason">Ny sæson (nulstil total)</button><button class="btn green" id="closem">Luk</button></div></div></div>';
}
function bindGrp(){
 const $=id=>document.getElementById(id);
 document.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>switchTo(b.dataset.gs));
 document.querySelectorAll('[data-gd]').forEach(b=>b.onclick=()=>{const o=getG(),x=o.list.find(z=>z.id===b.dataset.gd);
  ask('Slet gruppen «'+(x?x.name:'')+'» med spillere og point?',()=>{o.list=o.list.filter(z=>z.id!==b.dataset.gd);LS.set(GK,o);render()})});
 const addG=()=>{const n=$('gn').value.trim();if(!n)return;const o=getG(),id='g'+Date.now();o.list.push({id,name:n,players:[],hist:[],nights:0});LS.set(GK,o);switchTo(id)};
 $('gadd').onclick=addG;$('gn').onkeydown=e=>{if(e.key==='Enter')addG()};
 $('gseason').onclick=()=>window.hsHold({title:'Ny sæson?',text:'Den løbende total og aftenhistorikken nulstilles for denne gruppe. Spillerne bliver.',keep:'Annuller',label:'Hold nede for at nulstille',yes:()=>{players.forEach(p=>p.t=0);const o=getG(),c=curG(o);c.hist=[];c.nights=0;LS.set(GK,o);save();render()}});
}

/* ================= Alder i Spillere-dialogen ================= */
const mh=window.modalHTML;
window.modalHTML=function(){
 if(modal==='grp')return grpHTML();
 let h=mh.apply(this,arguments);
 if(modal==='pl'){
  h=h.replace('maxlength="16">','maxlength="16"><input class="in" id="npa" type="number" inputmode="numeric" min="1" max="120" placeholder="Alder" title="Alder (bruges til børnespil)" style="font-size:17px;width:92px">');
  players.forEach((p,i)=>{h=h.replace('<button data-del="'+i+'">','<input type="number" inputmode="numeric" min="1" max="120" data-age="'+i+'" value="'+(p.age||'')+'" placeholder="Alder" title="Alder" style="width:74px;background:#2a2060;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:6px"><button data-del="'+i+'">')});
  h=h.replace('<p class="hint">Mindst 2 spillere.','<p class="hint">Skriv alder, hvis børn spiller med – så får hvert barn spørgsmål på sit eget niveau, og niveauet følger med, hvis barnet svarer rigtigt (eller forkert) for ofte.<br>Mindst 2 spillere.');
 }
 return h;
};
const mb=window.bindModal;
window.bindModal=function(){
 mb.apply(this,arguments);
 if(modal==='pl'){
  const $=id=>document.getElementById(id);
  document.querySelectorAll('[data-age]').forEach(inp=>inp.onchange=()=>{const v=parseInt(inp.value,10);players[+inp.dataset.age].age=(v>0&&v<121)?v:undefined;save()});
  const np=$('np'),npa=$('npa');
  const addp=()=>{const v=np.value.trim();if(!v)return;const a=parseInt(npa&&npa.value,10);players.push({n:v,c:COLORS[players.length%COLORS.length],s:0,t:0,age:(a>0&&a<121)?a:undefined});save();render()};
  $('addp').onclick=addp;np.onkeydown=e=>{if(e.key==='Enter')addp()};if(npa)npa.onkeydown=e=>{if(e.key==='Enter')addp()};
 }
 if(modal==='grp')bindGrp();
};
const kidAge=()=>{const a=players.map(p=>p.age).filter(x=>x>0);return a.length?Math.min.apply(null,a):8};

/* ================= 2) Random-mix ================= */
let MIX=null;
const inMode=(mode,x)=>x.kind!=='mix'&&(mode==='mixall'?(x.grp!==GRP_X&&x.grp!==GRP_K&&x.grp!==GRP_R&&x.grp!=='💀 Dødsspil'):mode==='mixkids'?x.grp===GRP_K:mode==='mixxxx'?x.grp===GRP_X:mode==='gamingmix'?['gamingquiz','konsolquiz','spilnavn','gaminghistorie','gamingleg'].includes(x.id):x.sub===mode);
const eligible=mode=>GAMES.filter(x=>inMode(mode,x)&&players.length>=x.min&&(x.id!=='ffm'||players.length>=3)&&pool(x.key).length>0&&(mode!=='mixall'||!window.hsFit||window.hsFit(x)!=='no')&&(mode!=='gamingmix'||pool(x.key).length>50));
const n0=window.next;
window.next=function(){
 if(MIX&&g){const el=eligible(MIX),pk=el.length>2?el.filter(x=>x.id!==g.lastMix):el,x=pk.length?pick(pk):null;if(x){view=x.id;g.lastMix=x.id;g.mixmode=MIX;g.fb=false}}
 return n0.apply(this,arguments);
};
const s0=window.start;
window.start=function(id){const x=gm(id);MIX=(x&&x.kind==='mix')?id:null;return s0.apply(this,arguments)};
const go0=window.go;
window.go=function(){MIX=null;return go0.apply(this,arguments)};
const gm0=window.game;
window.game=function(){const r=gm0.apply(this,arguments);try{if(MIX){const t=document.querySelector('.bar .tag');if(t&&!t.dataset.mx){t.dataset.mx='1';t.textContent=(MIX==='prov'||MIX==='ftl'?'':'🎲 ')+t.textContent}}}catch(e){}return r};
const bg0=window.bindGame;
window.bindGame=function(){const r=bg0.apply(this,arguments);if(MIX){const a=document.getElementById('again');if(a){const m=MIX;a.onclick=()=>start(m)}}return r};
window.hsMix={set:m=>{MIX=m||null},get:()=>MIX};
const XM={id:'mixxxx',grp:GRP_X,key:'mixxxx',kind:'mix',t:'Random 🔞',d:'Tilfældig udfordring eller spørgsmål fra alle 🔞-spil – skifter spil hver runde',e:'🎲',g:'linear-gradient(135deg,#7b2ff7,#f107a3)',min:2};
function syncXMix(){const has=GAMES.some(a=>a.grp===GRP_X&&a.kind!=='mix'),i=GAMES.findIndex(a=>a.id==='mixxxx');if(has&&i<0)GAMES.push(XM);else if(!has&&i>=0)GAMES.splice(i,1)}
GAMES.unshift({id:'mixall',grp:GRP_R,key:'mixall',kind:'mix',t:'Alt i ét – random',d:'Et tilfældigt spørgsmål eller en leg fra ALLE spil (undtagen 🔞 og børn). Spillet skifter hver runde.',e:'🎲',g:'linear-gradient(135deg,#f72585,#7209b7,#4361ee)',min:2});

/* ================= Rendering: gruppeknap, sæsonbjælke, hints ================= */
const r0=window.render;
window.render=function(){
 syncXMix();if(view==='home')MIX=null;
 const r=r0.apply(this,arguments);
 try{const h=document.querySelector('header');
  window.hsGrupper=()=>{modal='grp';render()}; window.hsGruppeNavn=()=>curG(getG()).name;
 }catch(e){}
 return r;
};
const h0=window.home;
window.home=function(){
 const r=h0.apply(this,arguments);
 try{
  const m=document.getElementById('main');if(!m)return r;
  const c=curG(getG()),tot=players.slice().sort((a,b)=>(b.t||0)-(a.t||0));
  const line=tot.some(p=>(p.t||0)>0)?tot.map(p=>'<b style="color:'+p.c+'">'+esc(p.n)+'</b> '+(p.t||0)).join(' · '):'ingen point endnu';
  m.insertAdjacentHTML('afterbegin','<div class="rsr" id="ssn" style="margin-bottom:14px"><div class="rst"><b>👨‍👩‍👧 '+esc(c.name)+' – '+t('running')+'</b><small>'+line+' · '+nn(c.nights)+'</small></div><button class="btn ghost" id="ssnb">'+t('groups')+'</button></div>');
  document.getElementById('ssnb').onclick=()=>{modal='grp';render()};
  const hid=[...m.querySelectorAll('.grp')].find(e=>e.textContent.trim()==='__h');
  if(hid){const gr=hid.nextElementSibling;if(gr&&gr.classList.contains('grid'))gr.remove();hid.remove()}
  const kh=[...m.querySelectorAll('.grp')].find(e=>/Børn/.test(e.textContent));
  kh.insertAdjacentHTML('afterend',`<p class="hint" style="text-align:left;margin:4px 0 8px">🧒 Børnespil følger den enkelte spiller: hvert barn får spørgsmål på sit eget niveau, som bliver sværere, når barnet svarer rigtigt, og lettere, når det kniber. 👥 Spillernavne og aldre gemmes kun på denne enhed.</p>`)
  m.querySelectorAll('button.gc').forEach(b=>{const mt=/start\('(mix\w+)'\)/.exec(b.getAttribute('onclick')||'');if(!mt)return;const ps=b.querySelector('.ps');if(ps)ps.textContent='Fra '+eligible(mt[1]).length+' spil'});
 }catch(e){console.warn('HS2 home',e)}
 return r;
};

/* ================= 3) Børn & unge ================= */
const KG=[
['kwho','who','🐾','Hvilket dyr er jeg?','Spor ét ad gangen – jo færre spor, jo flere point','linear-gradient(135deg,#43e97b,#38f9d7)'],
['kmove','award','🕺','Gør som dyret','Lav dyrelyde og bevægelser – tjen point','linear-gradient(135deg,#f9d423,#ff4e50)'],
['kriddle','qa','🧩','Børnegåder','Små gåder – først med svaret får point','linear-gradient(135deg,#0ead69,#2ec4b6)'],
['kquiz','choice','🧠','Børnequiz','Fire svar – kun ét er rigtigt','linear-gradient(135deg,#4361ee,#4cc9f0)'],
['kchar','secret','🎬','Gæt og vis (børn)','Spil det uden lyd – de andre gætter','linear-gradient(135deg,#ffb703,#fb8500)'],
['kword','award','🔤','Ord og rim','Rim, ord og tunge-tvistere – hvem er hurtigst?','linear-gradient(135deg,#f72585,#7209b7)'],
['krather','choice','🍭','Hvad ville du helst?','Skøre valg – hvor lander holdet?','linear-gradient(135deg,#ffb703,#ff5d8f)'],
['ktf','choice','✅','Sandt eller falsk (børn)','Er det sandt? Træk navnet til svaret','linear-gradient(135deg,#2ec4b6,#80ed99)'],
['kodd','choice','🔍','Hvad hører ikke til?','Find den, der ikke passer ind','linear-gradient(135deg,#f15bb5,#8f6bff)'],
['kest','est','🎯','Tæl og gæt','Alle gætter et tal – nærmest vinder','linear-gradient(135deg,#8f6bff,#4cc9f0)'],
['klik','cards','👆','Mest sandsynlig (børn & unge)','Tæl til tre og peg på hinanden – med børnevenlige spørgsmål','linear-gradient(135deg,#4cc9f0,#3a0ca3)']];
const KIDSET=new Set(KG.map(k=>k[0]));
KG.forEach(k=>GAMES.push({id:k[0],grp:GRP_K,key:k[0],kind:k[1],t:k[3],d:k[4],e:k[2],g:k[5],min:2}));
GAMES.push({id:'mixkids',grp:GRP_K,key:'mixkids',kind:'mix',t:'Random børnespil',d:'Tilfældig leg eller opgave fra alle børnespil – tilpasset alderen',e:'🎲',g:'linear-gradient(135deg,#43e97b,#4361ee)',min:2});
const mcb=it=>({q:it.q||'Hvilken af disse hører IKKE til?',zones:it.o.map((t,i)=>({id:'o'+i,l:esc(t),e:'ABCD'[i],c:CS[i%4]})),cor:'o'+it.a});
['provc','kquiz','kodd'].forEach(k=>CHOICE_BUILD[k]=mcb);
CHOICE_BUILD.ktf=it=>({q:it.s,zones:[{id:'t',l:'Sandt',e:'✅',c:'#2ec4b6'},{id:'f',l:'Falsk',e:'❌',c:'#ff5d8f'}],cor:it.t?'t':'f'});

/* trækning: aldersfilter for børnespil + fjern alderspræfiks + bland svar (installeres efter qb.js) */
const SHUF=new Set(['provc','kquiz','kodd']);window.hsShuf=SHUF;window.hsMcb=(...a)=>mcb(...a);
const ageOf=i=>typeof i==='string'?+((/^(\d+)\|/.exec(i)||[0,0])[1]):(i&&i.age)||0;
function post(gk,it){
 if(typeof it==='string'){const m=/^(\d+)\|([\s\S]*)$/.exec(it);return m?m[2]:it}
 if(SHUF.has(gk)&&it&&Array.isArray(it.o)&&typeof it.a==='number'){const c=JSON.parse(JSON.stringify(it)),ok=c.o[c.a];c.o=shuffle(c.o);c.a=c.o.indexOf(ok);return c}
 return it;
}
let installed=false;
function installDraw(){
 if(installed)return;installed=true;const d1=window.draw;
 window.draw=function(gk,list){
  let l=list;
  if(KIDSET.has(gk)){
   /* niveauets vindue er alder-3 … alder. Er der under 5 punkter, fyldes der op til 5 fra de NÆRMESTE alderstrin (først lettere, så sværere) – aldrig hele puljen. */
   const a=window.__hsAge||kidAge(),tiers=[...new Set(list.map(ageOf))].sort((x,y)=>x-y);
   let t=list.filter(i=>{const v=ageOf(i);return v<=a&&v>=a-3});
   for(const v of tiers.filter(v=>v<a-3).reverse().concat(tiers.filter(v=>v>a))){if(t.length>=5)break;t=t.concat(list.filter(i=>ageOf(i)===v).slice(0,5-t.length))}
   if(t.length)l=t}
  return post(gk,d1.call(this,gk,l));
 };
}
const f0=window.HS_FINISH;
window.HS_FINISH=function(){f0&&f0();installDraw()};

/* ================= 4) Ordsprog ================= */
GAMES.push(
{id:'prov',grp:'Gæt & kvis',key:'prov',kind:'mix',t:'Ordsprog',d:'Danske ordsprog: vælg den rigtige slutning – eller skriv de manglende ord. Spillet skifter tilfældigt mellem de to typer.',e:'📜',g:'linear-gradient(135deg,#c9184a,#6a4c93)',min:2},
{id:'provc',grp:'__h',sub:'prov',key:'prov',kind:'choice',t:'Ordsprog – vælg rigtigt',d:'',e:'📜',g:'',min:2},
{id:'provw',grp:'__h',sub:'prov',key:'provw',kind:'provw',t:'Ordsprog – skriv ordene',d:'',e:'✍️',g:'',min:2},
{id:'dx',grp:'Geografi & ord',key:'dx',kind:'dx',t:'Destination: hvor er vi?',d:'Gæt stedet ud fra spor – men pas på snydesporene, der leder dig forkert',e:'🧭',g:'linear-gradient(135deg,#00b4d8,#023e8a)',min:2},
{id:'sm',grp:'Party & leg',key:'sm',kind:'sm',t:'Opgavemesteren',d:'Skøre opgaver i hjemmet – Stormesteren giver 0–5 point',e:'🎩',g:'linear-gradient(135deg,#ffd166,#e63946)',min:2});

const nz=s=>String(s).toLowerCase().replace(/[.,!?;:"'«»()\-–]/g,'').replace(/\s+/g,' ').trim();
const EYE=`onclick="var i=this.previousElementSibling;i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁️':'🙈'"`;
KINDS.provw={
 init(){g.rv=false;g.vals=[];g.ok=[]},
 render(){
  const it=g.item;let o='<div class="card glass"><div class="tag">✍️ Skriv de manglende ord</div><div class="q">'+esc(it.q)+'</div>';
  if(!g.rv)return o+'<div class="est">'+players.map((p,i)=>`<div class="p" style="--c:${p.c}"><b>${esc(p.n)}</b><div class="eyew"><input class="in" type="password" autocomplete="off" autocapitalize="none" id="pw${i}" placeholder="Dit svar"><button type="button" class="eye" title="Vis/skjul" ${EYE}>👁️</button></div></div>`).join('')+'</div><p class="hint">Alle skriver det manglende i hemmelighed. Tryk 👁️ for at tjekke dit eget svar.</p><div class="row"><button class="btn big" id="pwgo">Afslør svaret! 🥁</button></div></div>';
  return o+'<div class="ans" style="font-size:clamp(24px,4vw,40px)">'+esc(it.w.split('|')[0])+'</div><p class="hint">'+esc(it.e||'')+'</p><p class="hint">✅ giver 1 point. Tryk på et navn for at rette, hvis I er enige om, at svaret var rigtigt eller forkert.</p><div class="est">'+players.map((p,i)=>`<div class="p" data-pk="${i}" style="--c:${p.c};cursor:pointer;${g.ok[i]?'box-shadow:0 0 24px '+p.c:'opacity:.7'}"><b>${g.ok[i]?'✅ ':'❌ '}${esc(p.n)}</b><div style="font-size:20px;font-weight:800">${esc(g.vals[i]||'')}</div></div>`).join('')+'</div><div class="row"><button class="btn big green" id="pwdone">Giv point &amp; næste →</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id),it=g.item;
  if($('pwgo'))$('pwgo').onclick=()=>{
   const v=players.map((_,i)=>$('pw'+i).value.trim());
   if(v.some(x=>!x)){players.forEach((_,i)=>{if(!v[i])$('pw'+i).classList.add('shake')});return}
   const acc=it.w.split('|').map(nz);g.vals=v;g.ok=v.map(x=>acc.includes(nz(x)));g.rv=true;render();
  };
  document.querySelectorAll('[data-pk]').forEach(c=>c.onclick=()=>{const i=+c.dataset.pk;g.ok[i]=!g.ok[i];render()});
  if($('pwdone'))$('pwdone').onclick=()=>{let any=false;players.forEach((p,i)=>{if(g.ok[i]){add(i,1);any=true}});if(any)boom();next()};
 }
};

/* ================= 5) Destination ================= */
KINDS.dx={
 init(){g.cl=1;g.ans=false},
 render(){
  const it=g.item,cl=it.c.map(s=>({t:s.replace(/^~/,''),d:s[0]==='~'})),pts=Math.max(1,6-g.cl),n=g.ans?cl.length:g.cl;
  let o='<div class="card glass"><div class="tag">🧭 Hvor er vi? – '+g.cl+' af '+cl.length+' spor</div><div class="mid">'
   +cl.slice(0,n).map((c,i)=>'<div class="opt glass">'+((g.ans&&c.d)?'🪤':'🔎')+' Spor '+(i+1)+': '+esc(c.t)+((g.ans&&c.d)?' <b style="color:#ffb703">(snydespor)</b>':'')+'</div>').join('')+'</div>';
  if(g.ans)return o+'<div class="ans" style="font-size:clamp(26px,4.5vw,44px)">'+esc(it.a)+'</div>'+(it.e?'<p class="hint" style="text-align:left">🪤 '+esc(it.e)+'</p>':'')+'<p class="hint">Hvem gættede det? ('+pts+' point – '+g.cl+' spor brugt)</p>'+awardChips(pts,-1)+'<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Ingen – næste sted →</button></div></div>';
  return o+'<p class="hint">Pas på: nogle spor er <b>snyd</b> – sande, men vildledende, så de peger på et helt andet sted. Brug din viden! Jo færre spor, jo flere point ('+pts+' nu). Sig gættet højt.</p><div class="row">'+(g.cl<cl.length?'<button class="btn" id="clue">Næste spor</button>':'')+'<button class="btn green" id="shans">Vis svaret</button></div></div>';
 }
};

/* ================= 6) Stormester ================= */
const SML={hurtigst:'⚡ Hurtigst vinder',flest:'🔢 Flest vinder',længst:'📏 Længst/højest vinder',præcis:'🎯 Tættest på vinder',bedst:'🎩 Stormesterens smag afgør',pris:'🎁 Præmieopgave – bedste ting vinder'};
const smComp=()=>players.map((_,i)=>i).filter(i=>players.length<3||i!==g.sm);
KINDS.sm={
 init(){g.sm=((g.sm==null?-1:g.sm)+1)%players.length;g.sc={}},
 render(){
  const it=g.item,j=players[g.sm],two=players.length<3;
  const head='<div class="row"><span class="tag" style="background:'+j.c+';color:#111">🎩 '+(two?'Læser opgaven: ':'Stormester: ')+esc(j.n)+'</span><span class="tag">'+(SML[it.k]||'')+'</span>'+(it.m?'<span class="tag">⏱ '+it.m+' sek</span>':'')+'</div>';
  const task='<div class="q" style="font-size:clamp(20px,3.2vw,30px)">'+esc(it.t)+'</div>'+(it.r?'<p class="hint" style="text-align:left">📜 '+esc(it.r)+'</p>':'');
  if(g.ph===0)return '<div class="card glass">'+head+task+'<p class="hint">'+(two?'I dømmer hinanden – bliv enige om pointene.':'Stormesteren læser opgaven højt. Ingen må starte, før Stormesteren siger til. Stormesterens afgørelse er endelig.')+'</p><div class="row"><button class="btn big" id="smgo">▶ Start opgaven</button><button class="btn ghost" id="skip">Ny opgave</button></div></div>';
  if(g.ph===1)return '<div class="card glass">'+head+task+'<div class="tm" id="tm">'+(it.m?'⏱ '+it.m+' sek':'')+'</div><div class="row"><button class="btn big green" id="smdone">✅ Alle er færdige – til bedømmelse</button></div></div>';
  return '<div class="card glass">'+head+task+'<p class="hint">'+(two?'Bliv enige om pointene.':'Stormester '+esc(j.n)+' giver point.')+' <b>5</b> = bedst, <b>1</b> = dårligst, <b>0</b> = opgav eller snød. Ikke valgt = 0.</p>'
   +smComp().map(i=>'<div class="ssr"><b style="color:'+players[i].c+'">'+esc(players[i].n)+'</b>'+[0,1,2,3,4,5].map(v=>'<div class="chip '+(g.sc[i]===v?'sel':'')+'" data-sc="'+i+'|'+v+'" style="--c:'+players[i].c+'">'+v+'</div>').join('')+'</div>').join('')
   +'<div class="row" style="margin-top:12px"><button class="btn big green" id="smpts">Giv point &amp; næste →</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id),it=g.item;
  if($('smgo'))$('smgo').onclick=()=>{g.ph=1;if(it.m){g.tend=Date.now()+it.m*1000;clearInterval(tid);tid=setInterval(tick,250)}render()};
  if($('smdone'))$('smdone').onclick=()=>{clearInterval(tid);g.tend=null;g.ph=2;render()};
  document.querySelectorAll('[data-sc]').forEach(c=>c.onclick=()=>{const p=c.dataset.sc.split('|').map(Number);g.sc[p[0]]=p[1];render()});
  if($('smpts'))$('smpts').onclick=()=>{let any=false;smComp().forEach(i=>{const v=g.sc[i]||0;if(v>0){add(i,v);any=true}});if(any)boom();next()};
 }
};
window.hsKids={KG,kidAge,eligible};
})();

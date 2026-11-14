/* Hyggespil v9: alderstilpasning.
   - Er der en mindreårig (under 18) i gruppen, vises 🔞 slet ikke (og låses, hvis den var åben).
   - Børn (t.o.m. 14 år) får børnespørgsmål på deres eget niveau i de spil, der kan tilpasses (ADAPT), og i Lykkehjulet (børneord).
   - Hvert barn har sit eget niveau = alder + automatisk tilpasning (svarer barnet rigtigt på 4 af 5, stiger niveauet 2 år; højst 1 af 5: 2 år ned).
   - Fælles-spørgsmålsspil: spillerne deles i klasser (børn med højst 2 års niveauforskel; voksne for sig). Er der flere klasser, går
     runderne på skift, og kun rundens klasse svarer. I tur-spil får hver spiller kort på sit eget niveau.
   - Spil, der ikke kan tilpasses, flyttes nederst og nedtones. Er alle i gruppen under 18, står børnespillene øverst. */
(function(){
if(window.__hs5)return;window.__hs5=true;
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const GRP_K='🧒 Børn & unge',KID_MAX=14;
const isMinor=p=>!!p&&p.age>0&&p.age<18;
const isKid=p=>!!p&&p.age>0&&p.age<=KID_MAX;
const anyMinor=()=>players.some(isMinor),anyKid=()=>players.some(isKid),allMinor=()=>players.length>0&&players.every(isMinor);
const idx=f=>players.map((_,i)=>i).filter(i=>f(players[i]));
const ADAPT={est:['kest'],ffm:['kest'],tf:['ktf'],odd:['kodd'],riddle:['kriddle'],who:['kwho'],char:['kchar'],rat:['krather'],lik:['klik'],dare:['kmove','kword']};
/* ---------- niveau pr. spiller: alder + automatisk tilpasning ----------
   players[i].lv={o,h}: o = forskydning i år (trin på 2), h = de seneste svar (1 = rigtigt, 0.8 = rigtigt på et ja/nej-spørgsmål, 0 = forkert).
   4 «point» i de seneste 5 svar -> sværere; højst 1 rigtigt af 5 -> lettere. Gælder børn (voksenpuljerne har ingen sværhedsgrader). */
const STEP=2,WIN=5,LV_MIN=3,LV_MAX=16;
const FACTG=new Set(['est','ffm','tf','odd','riddle','who']);   // her går et barn videre til voksenspørgsmål, når niveauet er over KID_MAX
const lev=p=>isKid(p)?Math.max(LV_MIN,Math.min(LV_MAX,p.age+((p.lv&&p.lv.o)||0))):null;
const lvTxt=p=>{const L=lev(p);return p.age+' år'+(L!==p.age?' · niveau '+L+' år':'')};
function toast(t){try{let w=document.getElementById('lvts');if(!w){w=document.createElement('div');w.id='lvts';document.body.appendChild(w)}
 const d=document.createElement('div');d.className='lvt';d.textContent=t;w.appendChild(d);setTimeout(()=>d.remove(),5200)}catch(e){}}
function rec(i,ok,binary){
 const p=players[i];if(!isKid(p)||!g||!g.lv)return;
 if(g.part?!g.part.includes(i):(g.lv.solo&&g.lv.i!==i))return;
 const L=p.lv&&Array.isArray(p.lv.h)?p.lv:(p.lv={o:0,h:[]});
 L.h.push(ok?(binary?.8:1):0);
 if(L.h.length>=WIN){
  const pts=L.h.reduce((a,b)=>a+b,0),right=L.h.filter(v=>v>0).length;
  if(pts>=WIN-1&&p.age+L.o+STEP<=LV_MAX){L.o+=STEP;L.h=[];toast('📈 '+p.n+' er for skrap! Sværere spørgsmål fra nu af (niveau '+lev(p)+' år)')}
  else if(right<=1&&p.age+L.o-STEP>=LV_MIN){L.o-=STEP;L.h=[];toast('🎯 Spørgsmålene til '+p.n+' bliver lidt lettere (niveau '+lev(p)+' år)')}
  else L.h.shift();
 }
 save();
}
const near=(v,it)=>v!=null&&Math.abs(v-it.a)<=Math.abs(it.a)*.15;
const UNIVERSAL=new Set(['pin','sm','sqrl','sqglass','sqmarb','sqdal','yut','suit','lot','shagai','inuit','shiri']);
function fit(x){
 if(!x||!anyMinor())return 'std';
 if(x.grp===GRP_K)return 'kids';
 if(x.id==='nev')return 'no';
 if(x.id==='dare')return 'adapt';
 if(!anyKid())return 'std';
 if(ADAPT[x.id]||x.id==='wheel')return 'adapt';
 if(UNIVERSAL.has(x.id)||/^mix/.test(x.id))return 'uni';
 return 'no';
}
window.hsFit=fit;
const st=document.createElement('style');
st.textContent='.gc.dimx{opacity:.45;filter:saturate(.35);transform:scale(.93)}.gc.dimx:hover{opacity:.8}.grp.dimh{opacity:.6}.grid.adl .gc{transform:scale(.97);opacity:.9}.lvb{margin:8px 0;padding:10px 14px;border-radius:16px;font-weight:800;text-align:center;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25)}.lvb small{display:block;font-weight:600;opacity:.85;margin-top:2px}.gc .ab{display:inline-block;margin-top:4px;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,.22);font-size:11px;font-weight:800}#lvts{pointer-events:none;position:fixed;left:0;right:0;bottom:22px;z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 4vw}.lvt{max-width:92vw;padding:12px 18px;border-radius:18px;background:#1d1447;color:#fff;font-weight:800;text-align:center;border:1px solid rgba(255,255,255,.35);box-shadow:0 8px 30px rgba(0,0,0,.5);animation:lvt 5.2s ease both}@keyframes lvt{0%{opacity:0;transform:translateY(20px)}8%{opacity:1;transform:translateY(0)}88%{opacity:1}100%{opacity:0}}.lvr{cursor:pointer;white-space:nowrap;font-size:12px;font-weight:800;padding:4px 8px;border-radius:10px;background:rgba(255,255,255,.16)}';
document.head.appendChild(st);

/* ---------- hvem er runden til? ---------- */
const SHARED=new Set(['choice','qa','who','est']),TURN=new Set(['cards','award','secret']);
function levelFor(x){
 const n=players.length;if(!n||!anyMinor())return null;
 const kidsGame=x.grp===GRP_K;
 if(!kidsGame&&!ADAPT[x.id])return null;
 /* kq = spilleren får børnespørgsmål (et barn, hvis niveau er vokset fra børnepuljerne, får voksenspørgsmål i faktaspil) */
 const grown=p=>isKid(p)&&!kidsGame&&FACTG.has(x.id)&&lev(p)>KID_MAX;
 const mk=(i,part,solo)=>{const p=players[i],k=isKid(p);return {i,kid:k,kq:k&&!grown(p),minor:isMinor(p),age:p.age||null,lvl:k?lev(p):null,part:part||null,solo:!!solo}};
 if(TURN.has(x.kind))return mk(((g.turn==null?-1:g.turn)+1)%n,null,true);
 if(x.kind==='ffm'){const r=(g.r==null?0:(g.r+1)%n),a=(r+1)%n,b=(r+2)%n,ka=isKid(players[a]),kb=isKid(players[b]);
  return mk(ka&&kb?(lev(players[a])<=lev(players[b])?a:b):kb?b:a,null,true)}
 if(SHARED.has(x.kind)){
  g.rc=(g.rc==null?-1:g.rc)+1;
  if(!anyKid())return null;
  /* Klasser: børn, hvis niveau ligger højst 2 år fra hinanden, deler runde; voksne (og børn på voksenniveau) er én klasse.
     Er der flere klasser, går runderne på skift, og kun rundens klasse svarer. I børnespil er de voksne med i alle runder. */
  const kids=idx(p=>isKid(p)&&!grown(p)).sort((a,b)=>lev(players[a])-lev(players[b])),ads=idx(p=>!isKid(p)||grown(p));
  const cl=[];let cur=null,base=0;
  kids.forEach(i=>{const L=lev(players[i]);if(!cur||L-base>STEP){cur=[];cl.push(cur);base=L}cur.push(i)});
  if(ads.length&&!kidsGame)cl.push(ads);
  if(!cl.length)return null;
  const c=cl[g.rc%cl.length],t=c[Math.floor(g.rc/cl.length)%c.length];
  return mk(t,cl.length>1?(kidsGame?c.concat(ads):c):null);
 }
 return null;
}
const oldestKid=()=>{const a=players.filter(isKid).map(lev);return a.length?Math.max.apply(null,a):null};
function installDraw(){
 const d1=window.draw;
 window.draw=function(gk,list){
  let lv=null;const x=gm(gk);
  try{lv=x?levelFor(x):null}catch(e){lv=null}
  if(g){g.lv=lv?{i:lv.i,kid:lv.kid,kq:lv.kq,minor:lv.minor,age:lv.age,lvl:lv.lvl,solo:lv.solo}:null;g.part=lv&&lv.part?lv.part:null;g.pvals=null;g.pwin=null}
  if(!lv)return d1.call(this,gk,list);
  try{
   if(x.grp===GRP_K){window.__hsAge=lv.kid?lv.lvl:oldestKid();return d1.call(this,gk,list)}
   if(lv.kq||(gk==='dare'&&lv.minor&&!lv.kid)){const ks=ADAPT[gk].filter(k=>pool(k).length);
    if(ks.length){const k=pick(ks);window.__hsAge=lv.kid?lv.lvl:lv.age;return d1.call(this,k,pool(k))}}
   return d1.call(this,gk,list);
  }finally{window.__hsAge=null}
 };
}
const f0=window.HS_FINISH;
window.HS_FINISH=function(){f0&&f0();try{installDraw();installLate()}catch(e){console.error('HS5 install',e)}};

/* «Find løgnen» med børn = «Hvad hører ikke til?» */
const CSo=['#ff5d8f','#ffb703','#2ec4b6','#8f6bff'];
CHOICE_BUILD.odd=it=>it.age!=null?window.hsMcb(it):{q:'Hvilken påstand er LØGN?',zones:it.o.map((t,i)=>({id:'o'+i,l:esc(t),e:'ABCD'[i],c:CSo[i]})),cor:'o'+it.a};

/* Sættes først på, når ALLE filer er indlæst (fx.js/qb.js indlæses efter denne fil og ville ellers overskrive dem). */
const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' og '+a[a.length-1];
function installLate(){
/* ---------- kun rundens klasse svarer (børn + voksne i samme gruppe) ---------- */
const bh0=window.boardHTML;
window.boardHTML=function(b){
 try{if(g&&g.part&&b&&b.judges){const x=gm(view);if(x&&x.kind==='choice')b.judges=b.judges.filter(i=>g.part.includes(i))}}catch(e){}
 return bh0.apply(this,arguments)};
const est0=window.est;
window.est=function(){
 if(!(g&&g.part))return est0.apply(this,arguments);
 const P0=players,v0=g.vals,w0=g.win;
 try{players=g.part.map(i=>P0[i]);g.vals=g.pvals||[];g.win=g.pwin||[];return est0.apply(this,arguments)}
 finally{players=P0;g.vals=v0;g.win=w0}
};
const og=window.onGo;
window.onGo=function(){
 const x=gm(view);
 if(x&&x.kind==='est'&&g&&g.part&&!g.reveal){
  const el=k=>document.getElementById('e'+k);
  const vals=g.part.map((_,k)=>parseNum(el(k).value));
  if(vals.includes(null)){g.part.forEach((_,k)=>{if(vals[k]===null)el(k).classList.add('shake')});return}
  const ans=g.item.a,ds=vals.map(z=>Math.abs(z-ans));let win;
  if(vals.length===1){const yr=Math.abs(ans)>=1000&&Math.abs(ans)<=2100&&(g.item.u==='år'||/hvilket år/i.test(g.item.q||''));win=ds[0]<=(yr?5:Math.abs(ans)*.1)?[0]:[]}
  else{const md=Math.min.apply(null,ds);win=ds.map((d,k)=>d===md?k:-1).filter(k=>k>=0)}
  g.pvals=vals;g.pwin=win;win.forEach(k=>add(g.part[k],1));g.reveal=true;
  try{g.part.forEach((i,k)=>rec(i,near(vals[k],g.item)))}catch(e){}
  if(win.length)boom();return render();
 }
 const pre=!!(g&&g.reveal),r=og.apply(this,arguments);
 /* registrér rigtigt/forkert for de børn, runden var tilpasset (styrer niveauet) */
 try{if(x&&g&&g.lv&&g.reveal&&!pre){
  if(x.kind==='choice'&&g.b&&g.b.correct0!=null){const bin=g.b.zones.length<=2;g.b.judges.forEach(i=>{if(g.assign[i])rec(i,g.assign[i]===g.b.correct0,bin)})}
  else if(x.kind==='est'&&g.vals)players.forEach((_,i)=>rec(i,near(g.vals[i],g.item)));
 }}catch(e){}
 return r;
};
const bg0=window.bindGame;
window.bindGame=function(){const r=bg0.apply(this,arguments);
 try{const x=gm(view);if(g&&g.part&&x&&(x.kind==='qa'||x.kind==='who'))document.querySelectorAll('#main [data-award]').forEach(c=>{if(!g.part.includes(+c.dataset.award))c.remove()})}catch(e){}
 try{const x=gm(view);
  if(g&&g.lv&&x&&!g.done){
   const hook=(el,f)=>{if(!el||el.dataset.lvh)return;el.dataset.lvh='1';const o=el.onclick;el.onclick=function(){try{f()}catch(e){}return o&&o.apply(this,arguments)}};
   const chips=[...document.querySelectorAll('#main [data-award]')],skip=document.getElementById('skip'),K=x.kind;
   if(K==='qa'||K==='who'){
    chips.forEach(c=>hook(c,()=>rec(+c.dataset.award,true)));
    if(g.ans)hook(skip,()=>players.forEach((_,i)=>rec(i,false)));
   }else if(K==='award'){
    chips.forEach(c=>hook(c,()=>{if(+c.dataset.award===g.lv.i)rec(g.lv.i,true)}));
    hook(skip,()=>rec(g.lv.i,false));
   }else if(K==='secret'&&g.shown){
    chips.forEach(c=>hook(c,()=>rec(g.lv.i,true)));
    hook(skip,()=>rec(g.lv.i,false));
   }
  }}catch(e){}
 return r};
/* alder ændret i Spillere-dialogen -> niveauet begynder forfra; et tilpasset niveau vises og kan nulstilles */
const bm0=window.bindModal;
window.bindModal=function(){const r=bm0.apply(this,arguments);
 try{if(modal==='pl')document.querySelectorAll('[data-age]').forEach(inp=>{const i=+inp.dataset.age,p=players[i];if(!p)return;
  inp.addEventListener('change',()=>{if(players[i]&&players[i].lv){delete players[i].lv;save()}});
  if(isKid(p)&&p.lv&&p.lv.o){const s=document.createElement('span');s.className='lvr';s.textContent='niveau '+lev(p)+' ↺';s.title='Niveauet er tilpasset automatisk ud fra svarene. Tryk for at nulstille til alderen.';
   s.onclick=()=>{delete p.lv;save();render()};inp.after(s)}})}catch(e){}
 return r};

/* ---------- banner: hvem er runden tilpasset ---------- */
const gm0=window.game;
window.game=function(){const r=gm0.apply(this,arguments);
 try{
  if(g&&g.lv&&!g.done&&view!=='home'&&players[g.lv.i]&&!document.getElementById('lvb')){
   const bar=document.querySelector('#main .bar'),p=players[g.lv.i],L=g.lv;let h='';
   if(g.part){const names=list(g.part.map(i=>esc(players[i].n)));
    h=L.kq?'🧒 Børnerunde – niveau: '+esc(p.n)+' ('+lvTxt(p)+')<small>Kun '+names+' svarer i denne runde. De andre hepper!</small>'
          :'🧑 Voksenrunde<small>Kun '+names+' svarer i denne runde. De andre hepper!</small>';
    if(g.part.length===1&&gm(view).kind==='est')h=h.replace('</small>',' Point, hvis gættet er inden for 10 % af svaret.</small>')}
   else if(L.kq)h='🧒 Tilpasset '+esc(p.n)+' ('+lvTxt(p)+')';
   else if(L.minor&&!L.kid&&view==='dare')h='🧒 Tilpasset '+esc(p.n)+' ('+p.age+' år)';
   else if(anyKid()&&gm(view).grp!==GRP_K)h='🧑 Voksenniveau – '+esc(p.n);
   if(bar&&h)bar.insertAdjacentHTML('afterend','<div class="lvb" id="lvb">'+h+'</div>');
  }
 }catch(e){}
 return r};

/* ---------- 🔞 vises aldrig, når en mindreårig er med ---------- */
const r0=window.render;
window.render=function(){
 const r=r0.apply(this,arguments);
 try{const xb=document.getElementById('xbtn');
  if(xb&&anyMinor()){if(/🔓/.test(xb.textContent)){xb.click();return r}xb.remove()}
 }catch(e){}
 return r};

/* ---------- forsiden: børnespil øverst, ikke-tilpassede spil nederst og nedtonet ---------- */
const h0=window.home;
window.home=function(){const r=h0.apply(this,arguments);
 try{
  if(!anyMinor())return r;
  const m=document.getElementById('main');
  const secs=[...m.querySelectorAll('.grp')].map(h=>{let n=h.nextElementSibling;const extra=[];while(n&&!n.classList.contains('grid')&&!n.classList.contains('grp')){extra.push(n);n=n.nextElementSibling}return {h,extra,grid:n&&n.classList.contains('grid')?n:null}});
  const gid=b=>(/start\('([\w]+)'\)/.exec(b.getAttribute('onclick')||'')||[])[1];
  const no=[];let kidsSec=null;
  secs.forEach(s=>{if(!s.grid)return;if(/Børn/.test(s.h.textContent))kidsSec=s;
   [...s.grid.querySelectorAll('button.gc')].forEach(b=>{const f=fit(gm(gid(b)));
    if(f==='no')no.push(b);
    else if(f==='adapt'){const d=b.querySelector('.d');if(d&&!b.querySelector('.ab'))d.insertAdjacentHTML('afterend','<div class="ab">🧒 tilpasses alderen</div>')}})});
  if(no.length){
   const foot=[...m.children].reverse().find(e=>e.tagName==='P');
   const w=document.createElement('div');
   w.innerHTML='<div class="grp dimh">Voksenspil – kan ikke tilpasses børn</div><p class="hint" style="text-align:left;margin:4px 0 8px">Disse spil er skrevet til voksne og kan ikke tilpasses alderen. De kan stadig spilles.</p><div class="grid"></div>';
   const gr=w.querySelector('.grid');no.forEach(b=>{b.classList.add('dimx');gr.appendChild(b)});
   [...w.children].forEach(c=>foot?m.insertBefore(c,foot):m.appendChild(c));
  }
  secs.forEach(s=>{if(s.grid&&!s.grid.querySelector('button.gc')){s.h.remove();s.extra.forEach(e=>e.remove());s.grid.remove()}});
  if(allMinor()&&kidsSec&&kidsSec.grid.isConnected){
   const first=m.querySelector('.grp');
   if(first&&first!==kidsSec.h)[kidsSec.h].concat(kidsSec.extra,[kidsSec.grid]).forEach(e=>m.insertBefore(e,first));
   secs.forEach(s=>{if(s!==kidsSec&&s.grid&&s.grid.isConnected)s.grid.classList.add('adl')});
  }
 }catch(e){console.warn('HS5 home',e)}
 return r};
}

/* ---------- Lykkehjulet: børneord ---------- */
const KW={
 'Dyr':['HUND','KAT','HEST','KO','GRIS','FÅR','GED','HØNE','AND','GÅS','MUS','RÆV','ULV','BJØRN','LØVE','TIGER','ABE','ZEBRA','GIRAF','ELEFANT','KROKODILLE','PINGVIN','DELFIN','HVAL','HAJ','SÆL','UGLE','SOMMERFUGL','MARIEHØNE','EDDERKOP','SNEGL','FRØ','SKILDPADDE','KANIN','EGERN','PINDSVIN','FLAGERMUS','KÆNGURU','PAPEGØJE','FLODHEST','NÆSEHORN','ISBJØRN','BLÆKSPRUTTE','SØHEST','PÅFUGL','STRUDS','KAMEL','LEOPARD','GORILLA'],
 'Mad':['ÆBLE','PÆRE','BANAN','JORDBÆR','APPELSIN','GULEROD','AGURK','TOMAT','KARTOFFEL','PANDEKAGE','RUGBRØD','HAVREGRØD','SPAGHETTI','PIZZA','PØLSE','FRIKADELLE','LEVERPOSTEJ','IS','KAGE','BOLLE','MÆLK','OST','ÆG','VANDMELON','CHOKOLADE','POPCORN','RISENGRØD','FLØDEBOLLE','ÆBLESKIVE','LAGKAGE'],
 'Ting':['BOLD','CYKEL','BAMSE','DUKKE','BOG','BLYANT','SAKS','STOL','BORD','SENG','LAMPE','TANDBØRSTE','RYGSÆK','PARAPLY','GUMMISTØVLER','HUE','VANTER','SKO','UR','NØGLE','SPEJL','TELEFON','COMPUTER','FJERNSYN','KØLESKAB','STØVSUGER','TRAMPOLIN','GYNGE','RUTSJEBANE','BALLON','LOMMELYGTE','SKATEBOARD','LØBEHJUL'],
 'Transport':['BIL','BUS','TOG','FLY','SKIB','TRAKTOR','LASTBIL','BRANDBIL','AMBULANCE','HELIKOPTER','MOTORCYKEL','FÆRGE','RAKET','UBÅD','LUFTBALLON','GRAVEMASKINE','POLITIBIL'],
 'Natur og vejr':['SOL','MÅNE','STJERNE','SKY','REGN','SNE','REGNBUE','TRÆ','BLOMST','SKOV','STRAND','HAV','SØ','BJERG','VULKAN','VANDFALD','TORDEN','LYN','SNEMAND','EFTERÅR','SOMMER','VINTER','FORÅR'],
 'Job':['LÆGE','LÆRER','BAGER','BRANDMAND','POLITIBETJENT','PILOT','KOK','FRISØR','TANDLÆGE','LANDMAND','DYRLÆGE','ASTRONAUT','MALER','TØMRER','FISKER','POSTBUD','BUSCHAUFFØR','SYGEPLEJERSKE'],
 'Eventyr':['PRINSESSE','DRAGE','TROLD','HEKS','RIDDER','SØRØVER','HAVFRUE','ENHJØRNING','TRYLLESTAV','SKATTEKISTE','SPØGELSE','KÆMPE','SLOT','FE','DEN GRIMME ÆLLING','PRINSESSEN PÅ ÆRTEN','FYRTØJET','KEJSERENS NYE KLÆDER','DEN LILLE HAVFRUE','SNEDRONNINGEN','TOMMELISE','KLODS-HANS','DEN STANDHAFTIGE TINSOLDAT','SVINEDRENGEN','NATTERGALEN']
};
const usedW=new Set();
window.hsWheelPuzzle=function(pi){
 const p=players[pi];if(!isKid(p))return null;
 const a=lev(p),ok=w=>{const L=w.replace(/[ -]/g,'').length;return a<=7?(L<=6&&!/ /.test(w)):a<=10?(L>=3&&L<=10&&!/ /.test(w)):L>=6};
 for(let t=0;t<60;t++){const c=pick(Object.keys(KW)),l=KW[c].filter(w=>ok(w)&&!usedW.has(w));if(!l.length)continue;
  const w=pick(l);usedW.add(w);if(usedW.size>120)usedW.clear();return {c,t:w,lv:{i:pi,kid:true,kq:true,minor:true,age:p.age,lvl:a,solo:true}}}
 return null;
};
window.hsAgeMode={isMinor,isKid,anyMinor,anyKid,allMinor,fit,levelFor,ADAPT,lev,rec};
})();

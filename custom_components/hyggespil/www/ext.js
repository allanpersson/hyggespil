/* Hyggespil udvidelser v6 (nattens udgivelse 2026-11-16): ren tilfældig trækning, validering, pakker, nye spil, offline-kort, 🔞 */
(function(){
const VM=((document.currentScript||{}).src||'').match(/v=([^&]+)/),VER=VM?VM[1]:'6';
const st=document.createElement('style');
st.textContent='.map{position:relative;height:min(60vh,460px);border-radius:20px;overflow:hidden;margin:10px 0;border:1px solid var(--line);background:#0b1030}.mapb{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;z-index:2}.mapb button{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.16);font-size:20px;font-weight:800}.xbtn{font-size:18px;padding:8px 14px}';
document.head.appendChild(st);
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const pick=a=>a[Math.random()*a.length|0];
function shufOpts(arr,ai){const idx=sh(arr.map((_,i)=>i));return {arr:idx.map(i=>arr[i]),a:idx.indexOf(ai)}}
window.addEventListener('error',e=>console.error('HS fejl:',e.message));

/* ---- pakker (kompakte rækker) ---- */
const RAW={};
window.PACK=function(k,rows){(RAW[k]=RAW[k]||[]).push.apply(RAW[k],rows)};
const EXP={
 num:r=>({q:r[0],a:r[1],u:r[2]||'',n:r[3]||''}),
 tf:r=>({s:r[0],t:!!r[1],e:r[2]||''}),
 odd:r=>({o:[r[0],r[1],r[2],r[3]],a:r[4],e:r[5]||''}),
 rather:r=>({a:r[0],b:r[1]}),
 riddle:r=>({q:r[0],a:r[1]}),
 who:r=>({a:r[0],c:r.slice(1,6)}),
 taboo:r=>({w:r[0],f:r.slice(1,4)}),
 tl:r=>({q:(window.HSLANG==='en'?'What happened first?':'Hvad skete først?'),a:[r[0]+' ('+r[1]+')',r[2]+' ('+r[3]+')'],c:r[1]<r[3]?0:1,e:r[4]||''}),
 weird:r=>({q:'Hvad betyder «'+r[0]+'» ('+r[1]+')?',o:[r[2],r[3],r[4],r[5]],a:0}),
 geo:r=>({c:r[0],la:r[1],lo:r[2]}),
 rec:r=>({q:r[0],v:r[1],u:r[2]||'',e:r[3]||''})
};
const PLAIN=['never','likely','dare','deep','char','xr','xs','xh','xq','xn','julesjov','gamingleg'];
const ok=(...a)=>a.every(Boolean);
const S=x=>typeof x==='string'&&x.trim().length>1;
const N=x=>typeof x==='number'&&isFinite(x);
const A4=o=>Array.isArray(o)&&o.length===4&&o.every(S)&&new Set(o).size===4;
const VAL={
 num:i=>ok(i&&S(i.q),N(i.a)),
 tf:i=>ok(i&&S(i.s),typeof i.t==='boolean'),
 odd:i=>ok(i&&A4(i.o),Number.isInteger(i.a),i.a>=0,i.a<4),
 rather:i=>ok(i&&S(i.a),S(i.b)),
 riddle:i=>ok(i&&S(i.q),S(i.a)),
 who:i=>ok(i&&S(i.a),Array.isArray(i.c),i.c.length>=3,i.c.every(S)),
 taboo:i=>ok(i&&S(i.w),Array.isArray(i.f),i.f.length>=2,i.f.every(S)),
 tl:i=>ok(i&&S(i.q),Array.isArray(i.a),i.a.length===2,i.a.every(S),i.c===0||i.c===1),
 mys:i=>ok(i&&S(i.t),S(i.s),Array.isArray(i.c),i.c.length>=3,Array.isArray(i.p),i.p.length>=3,Number.isInteger(i.a),i.a>=0,i.a<i.p.length),
 city:i=>ok(i&&S(i.q),A4(i.o),i.a===0),zip:i=>ok(i&&S(i.q),A4(i.o),i.a===0),weird:i=>ok(i&&S(i.q),A4(i.o),i.a===0),lang:i=>ok(i&&S(i.q),A4(i.o),i.a===0),
 geo:i=>ok(i&&S(i.c),N(i.la),N(i.lo),Math.abs(i.la)<=90,Math.abs(i.lo)<=180),
 rec:i=>ok(i&&S(i.q),N(i.v),i.v>0)
};
PLAIN.forEach(k=>VAL[k]=i=>S(i));
function key(i){try{if(typeof i==='string')return i;if(i.q!==undefined&&i.o===undefined&&i.p===undefined)return JSON.stringify([i.q,i.a,i.v]);return JSON.stringify(i)}catch(e){return Math.random()+''}}
/* Skjulte kontroltegn fra importeret tekst (fx \u0013 i stedet for en tankestreg)
   ville blive vist som en tom boks. De rettes til en tankestreg ved indlæsning. */
const KONTROL=/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g;
function rens(x){
 if(typeof x==='string')return x.replace(KONTROL,' – ').replace(/ +– +/g,' – ');
 if(Array.isArray(x)){for(let n=0;n<x.length;n++)x[n]=rens(x[n]);return x}
 if(x&&typeof x==='object'){for(const q in x)if(Object.prototype.hasOwnProperty.call(x,q))x[q]=rens(x[q]);return x}
 return x;
}
function cleanAll(){
 const rep={};
 for(const k in VAL){if(!Array.isArray(DATA[k]))continue;const seen=new Set(),out=[];
  for(let i of DATA[k]){i=rens(i);let good=false;try{good=VAL[k](i)}catch(e){}if(!good){rep[k]=(rep[k]||0)+1;continue}const id=key(i);if(seen.has(id)){rep[k+'(dup)']=(rep[k+'(dup)']||0)+1;continue}seen.add(id);out.push(i)}
  DATA[k]=out}
 if(Object.keys(rep).length)console.warn('HS: frasorteret',rep);
}
let fin=false;
function expand(){
 const add=(k,a)=>{DATA[k]=(DATA[k]||[]).concat(a)};
 for(const k in RAW){const rows=RAW[k];
  if(EXP[k])add(k,rows.map(EXP[k]));
  else if(PLAIN.includes(k))add(k,rows);
  else if(k==='city'){const by={};rows.forEach(r=>{(by[r[2]]=by[r[2]]||new Set()).add(r[1])});const all=[...new Set(rows.map(r=>r[1]))];
   add(k,rows.map(r=>{const w=sh([...by[r[2]]].filter(c=>c!==r[1])).slice(0,3);for(const c of sh(all)){if(w.length>=3)break;if(c!==r[1]&&!w.includes(c))w.push(c)}return {q:'I hvilket land ligger '+r[0]+'?',o:[r[1]].concat(w),a:0}}))}
  else if(k==='zip'){const towns=[...new Set(rows.map(r=>r[1]))];
   add(k,rows.map(r=>{const near=sh(rows.filter(x=>x[1]!==r[1]&&x[0][0]===r[0][0]).map(x=>x[1]));const w=[...new Set(near)].slice(0,3);for(const c of sh(towns)){if(w.length>=3)break;if(c!==r[1]&&!w.includes(c))w.push(c)}return {q:'Hvilken by hører postnummer '+r[0]+' til?',o:[r[1]].concat(w),a:0}}))}
  else if(k==='lang'){const langs=[...new Set(rows.map(r=>r[1]))];
   add(k,rows.map(r=>({q:'Hvilket sprog stammer «'+r[0]+'» fra?',o:[r[1]].concat(sh(langs.filter(l=>l!==r[1])).slice(0,3)),a:0,e:'«'+r[0]+'»: '+r[2]+' ('+r[1]+')'})))}
  delete RAW[k]}
}
window.HS_FINISH=function(){if(fin)return;fin=true;try{expand();genMys();cleanAll();console.log('HS puljer',Object.fromEntries(Object.keys(VAL).map(k=>[k,(DATA[k]||[]).length])))}catch(e){console.error('HS finish',e)}};
window.HS_EXTRA=function(x){try{for(const k in x){if(k[0]==='_'||!Array.isArray(x[k]))continue;DATA[k]=(DATA[k]||[]).concat(x[k])}cleanAll()}catch(e){console.error('HS extra',e)}};

/* ---- mysterier genereres (logisk løsbare ved udelukkelse) ---- */
function genMys(){
 const NAMES=['Anna','Bo','Camilla','Dennis','Eva','Frederik','Gitte','Henrik','Ida','Jens','Karen','Lars','Mette','Niels','Ole','Pia','Rasmus','Signe','Thomas','Ulla','Viggo','Yrsa','Mads','Nanna','Poul','Rikke','Søren','Tine','Victor','Bent'];
 const COL=['rød','blå','grøn','gul','sort','hvid','lilla','orange','lyserød','grå'];
 const ITM=['en paraply','en stor taske','et vinglas','et sjal','et kamera','en stok','en tallerken','en cykelhjelm','en lommelygte','en avis'];
 const PLC=['køkkenet','haven','stuen','entreen','kælderen','altanen','garagen','badeværelset','loftet','spisestuen'];
 const CASES=[['Kagen forsvandt','fra køkkenbordet midt i festen'],['Den dyre rødvinsflaske er væk','fra vinkælderen'],['Chokoladeæsken er tom','og ingen vil tage skylden'],['Guldbroschen er forsvundet','fra kommoden'],['Nøglen til kælderen er væk','lige før gæsterne skulle ned'],['Sparegrisen er tømt','natten før fødselsdagen'],['Fjernbetjeningen er forsvundet','lige som filmen skulle starte'],['Lysene blev slukket','midt i middagen'],['Julegaven er åbnet','dagen før juleaften'],['Den sidste ostebid er væk','fra ostebrættet'],['Hundens bamse er forsvundet','og hunden er meget ked af det'],['Kaffemaskinen er sat ud af drift','lige før morgenmaden'],['Familiens fotoalbum er væk','fra reolen'],['Tryllestaven er væk','fra børnefødselsdagen'],['Pizzaen er spist','før gæsterne nåede frem'],['Vinsmagningens bedste flaske er tom','og ingen ved hvorfor'],['Fødselsdagskagens lys er blæst ud','før ønsket'],['Naboens havetrold er flyttet','og står nu i vores stue'],['Pengene til pizzaaftenen er væk','fra krukken'],['Det sidste stykke kage er stjålet','selvom der stod navn på']];
 const out=[];
 for(let n=0;n<240;n++){
  const nm=[];for(const c of sh(NAMES)){if(!nm.some(x=>x[0]===c[0]))nm.push(c);if(nm.length===4)break}
  if(nm.length<4)continue;
  const col=sh(COL).slice(0,4),itm=sh(ITM).slice(0,4),plc=sh(PLC).slice(0,4),cs=pick(CASES);
  const g=Math.random()*4|0,others=[0,1,2,3].filter(i=>i!==g),types=sh(['c','p','i','n']);
  const clue=(t,i)=>t==='c'?'Et vidne er sikker på, at den skyldige ikke gik i '+col[i]+' tøj.':t==='p'?'Kameraet viser, at den skyldige ikke befandt sig i '+plc[i]+'.':t==='i'?'Gerningspersonen havde ikke '+itm[i]+' med sig.':'Den skyldiges navn starter ikke med '+nm[i][0]+'.';
  const cl=others.map((o,k)=>clue(types[k],o));
  const t4=types[3];const conf=t4==='c'?'Til sidst bekræftes det, at den skyldige var iført '+col[g]+' tøj.':t4==='p'?'Til sidst bekræftes det, at den skyldige var i '+plc[g]+'.':t4==='i'?'Til sidst bekræftes det, at den skyldige havde '+itm[g]+' med.':'Til sidst bekræftes det, at den skyldiges navn starter med '+nm[g][0]+'.';
  const list=nm.map((x,i)=>x+' ('+col[i]+' tøj, i '+plc[i]+', med '+itm[i]+')').join(' · ');
  out.push({t:cs[0],s:cs[0]+' '+cs[1]+'. Mistænkte: '+list+'.',c:cl.concat([conf]),p:nm,a:g,e:'Det var '+nm[g]+' – de tre andre kunne udelukkes af sporene.'});
 }
 DATA.mys=(DATA.mys||[]).concat(out);
}

/* ---- ren tilfældig trækning (ingen udelukkelse) + blanding af svar ---- */
const YR=/\s*\(([^()]*\d[^()]*)\)\s*$/;
function recItem(it){
 const nice=(x,p)=>Number(x.toPrecision(p));
 const sd=String(it.v).replace(/[^0-9]/g,'').replace(/^0+/,'').replace(/0+$/,'').length||1,p=Math.min(4,Math.max(2,sd));
 const vals=[it.v];
 for(const f of sh([.2,.3,.4,.5,.6,.7,1.4,1.5,2,2.5,3,4,5,8,10])){let x=nice(it.v*f,p);if(Number.isInteger(it.v)){x=Math.round(x);if(x<1)continue}
  if(x>0&&vals.every(y=>Math.abs(y-x)/Math.max(y,x)>.12))vals.push(x);if(vals.length>=4)break}
 let m=5;while(vals.length<4){vals.push(nice(it.v*m,p));m++}
 const r=shufOpts(vals.map(v=>fmt(v)+(it.u?' '+it.u:'')),0);
 return {q:it.q,o:r.arr,a:r.a,e:it.e||''}}
function norm(gk,it){
 if(!it||typeof it!=='object')return it;
 if(gk==='rec')return recItem(it);
 if(!['tl','odd','mys','city','zip','weird','lang'].includes(gk))return it;
 const c=JSON.parse(JSON.stringify(it));
 if(gk==='tl'&&Array.isArray(c.a)){
  const yrs=c.a.map(s=>{const m=String(s).match(YR);return m?m[1]:''});
  c.a=c.a.map(s=>String(s).replace(YR,''));
  const e0=c.c===0?0:1,l0=1-e0;
  c.e=c.a[e0]+(yrs[e0]?' ('+yrs[e0]+')':'')+' skete før '+c.a[l0]+(yrs[l0]?' ('+yrs[l0]+')':'')+'.'+(c.e?' '+c.e:'');
  if(Math.random()<.5){c.a=[c.a[1],c.a[0]];c.c=1-c.c}
  return c}
 if(Array.isArray(c.p)&&typeof c.a==='number'){const r=shufOpts(c.p,c.a);c.p=r.arr;c.a=r.a}
 else if(Array.isArray(c.o)&&typeof c.a==='number'){const r=shufOpts(c.o,c.a);c.o=r.arr;c.a=r.a}
 return c}
const LAST={};
window.draw=function(gk,list){
 let it,t=0;const last=LAST[gk];
 do{it=list[Math.random()*list.length|0]}while(list.length>1&&idOf(it)===last&&++t<6);
 LAST[gk]=idOf(it);return norm(gk,it)};

/* ---- fejlsikring: et defekt kort springes over ---- */
const _game=window.game;let fails=0;
window.game=function(){try{_game();fails=0}catch(e){console.error('HS spilfejl',view,e,g&&g.item);if(fails++<6){window.next()}else{fails=0;window.go('home')}}};

/* ---- nye spil ---- */
const CS=['#ff5d8f','#ffb703','#2ec4b6','#8f6bff'];
const mc=it=>({q:it.q,zones:it.o.map((t,i)=>({id:'o'+i,l:esc(t),e:'ABCD'[i],c:CS[i%4]})),cor:'o'+it.a});
['city','zip','weird','lang','rec'].forEach(k=>CHOICE_BUILD[k]=mc);
GAMES.push(
{id:'rec',grp:'Gæt & kvis',key:'rec',kind:'choice',t:'Skøre rekorder',d:'Guinness-rekorder – hvad er tallet?',e:'🏆',g:'linear-gradient(135deg,#f9d423,#ff4e50)',min:2},
{id:'city',grp:'Geografi & ord',key:'city',kind:'choice',t:'I hvilket land ligger byen?',d:'Skæve byer – træk navnet til det rigtige land',e:'🌍',g:'linear-gradient(135deg,#06d6a0,#118ab2)',min:2},
{id:'pin',grp:'Geografi & ord',key:'geo',kind:'pin',t:'Sæt knappenålen',d:'Placér landet på en 3D-globus uden navne – tættest på vinder',e:'📍',g:'linear-gradient(135deg,#ef476f,#ffd166)',min:2},
{id:'zip',grp:'Geografi & ord',key:'zip',kind:'choice',t:'Postnummer-quiz',d:'Danske postnumre – hvilken by er det?',e:'📮',g:'linear-gradient(135deg,#e63946,#457b9d)',min:2},
{id:'weird',grp:'Geografi & ord',key:'weird',kind:'choice',t:'Mærkelige ord',d:'Danske og engelske ord – gæt betydningen',e:'🤪',g:'linear-gradient(135deg,#9d4edd,#ff9e00)',min:2},
{id:'lang',grp:'Geografi & ord',key:'lang',kind:'choice',t:'Hvilket sprog?',d:'Alverdens ord – gæt sproget',e:'🗣️',g:'linear-gradient(135deg,#f72585,#4361ee)',min:2});

/* ---- offline verdenskort (ingen navne, ingen eksterne tjenester) ---- */
const hav=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b[0]-a[0]),dn=r(b[1]-a[1]);const h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
function svgMap(box,onClick){
 const NS='http://www.w3.org/2000/svg',ASP=145/360;
 const svg=document.createElementNS(NS,'svg');let vb={x:0,y:5,w:360,h:145};
 svg.setAttribute('style','width:100%;height:100%;display:block;touch-action:none;cursor:crosshair;background:#0b1030');
 let gr='';for(let x=30;x<360;x+=30)gr+='M'+x+' 0V180';for(let y=30;y<180;y+=30)gr+='M0 '+y+'H360';
 svg.innerHTML=`<path d='${gr}' stroke='rgba(255,255,255,.07)' stroke-width='1' vector-effect='non-scaling-stroke' fill='none'/><path d='${window.WORLD||''}' fill='#2b3380' stroke='#7b88ff' stroke-width='1' vector-effect='non-scaling-stroke' stroke-linejoin='round'/><g></g>`;
 const lay=svg.lastChild,marks=[];
 const clamp=()=>{vb.w=Math.min(360,Math.max(10,vb.w));vb.h=vb.w*ASP;vb.x=Math.min(Math.max(vb.x,0),360-vb.w);vb.y=Math.min(Math.max(vb.y,0),180-vb.h)};
 const apply=()=>{clamp();svg.setAttribute('viewBox',vb.x+' '+vb.y+' '+vb.w+' '+vb.h);marks.forEach(m=>m.setAttribute('r',m._b*vb.w/360))};
 const xy=(cx,cy)=>{const m=svg.getScreenCTM();if(!m)return {x:0,y:0};const p=new DOMPoint(cx,cy).matrixTransform(m.inverse());return {x:p.x,y:p.y}};
 const zoomAt=(f,cx,cy)=>{const p=xy(cx,cy),nw=Math.min(360,Math.max(10,vb.w*f)),k=nw/vb.w;vb.x=p.x-(p.x-vb.x)*k;vb.y=p.y-(p.y-vb.y)*k;vb.w=nw;apply()};
 const ptrs=new Map();let moved=0,ld=0;
 const d2=()=>{const a=[...ptrs.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
 svg.addEventListener('pointerdown',e=>{try{svg.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;if(ptrs.size===2)ld=d2()});
 svg.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;moved+=Math.abs(dx)+Math.abs(dy);p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===1){const m=svg.getScreenCTM();if(m&&moved>6){vb.x-=dx/m.a;vb.y-=dy/m.a;apply()}}
  else if(ptrs.size===2){const a=[...ptrs.values()],nd=d2();if(ld>0&&nd>0)zoomAt(ld/nd,(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);ld=nd;moved=99}});
 const up=e=>{if(ptrs.size===1&&moved<8&&onClick){const q=xy(e.clientX,e.clientY);onClick(q.y>0?90-q.y:0,q.x-180)}ptrs.delete(e.pointerId)};
 svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',e=>ptrs.delete(e.pointerId));
 svg.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY>0?1.25:.8,e.clientX,e.clientY)},{passive:false});
 box.innerHTML='';box.appendChild(svg);
 const bt=document.createElement('div');bt.className='mapb';bt.innerHTML="<button type='button' data-z='in'>+</button><button type='button' data-z='out'>−</button><button type='button' data-z='all'>⌂</button>";box.appendChild(bt);
 bt.onclick=e=>{const z=e.target.dataset&&e.target.dataset.z;if(!z)return;const r=svg.getBoundingClientRect();if(z==='all'){vb={x:0,y:5,w:360,h:145};apply()}else zoomAt(z==='in'?.6:1.6,r.left+r.width/2,r.top+r.height/2)};
 apply();
 return {
  mark(lat,lon,col,base){const c=document.createElementNS(NS,'circle');c.setAttribute('cx',lon+180);c.setAttribute('cy',90-lat);c.setAttribute('fill',col);c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','2');c.setAttribute('vector-effect','non-scaling-stroke');c._b=base||2.4;c.setAttribute('r',c._b*vb.w/360);lay.appendChild(c);marks.push(c);return c},
  move(c,lat,lon){c.setAttribute('cx',lon+180);c.setAttribute('cy',90-lat)},
  line(a,b,col){const l=document.createElementNS(NS,'line');l.setAttribute('x1',a[1]+180);l.setAttribute('y1',90-a[0]);l.setAttribute('x2',b[1]+180);l.setAttribute('y2',90-b[0]);l.setAttribute('stroke',col);l.setAttribute('stroke-width','2');l.setAttribute('stroke-dasharray','6 6');l.setAttribute('vector-effect','non-scaling-stroke');lay.insertBefore(l,lay.firstChild)},
  fit(pts){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[1]+180);x1=Math.max(x1,p[1]+180);y0=Math.min(y0,90-p[0]);y1=Math.max(y1,90-p[0])});const w=Math.max((x1-x0)*1.5,(y1-y0)*1.5/ASP,40);vb.w=Math.min(360,w);vb.h=vb.w*ASP;vb.x=(x0+x1)/2-vb.w/2;vb.y=(y0+y1)/2-vb.h/2;apply()}
 };
}
KINDS.pin={
 init(){g.pi=0;g.pins=[];g.cur=null;g.ph=0;g.dist=[];g.win=[]},
 render(){
  const it=g.item;
  if(!window.WORLD&&!window.globeReady)return `<div class='card glass'><div class='q'>Kortdata mangler (world.js).</div><div class='row'><button class='btn' id='nx'>Næste land →</button></div></div>`;
  if(g.ph===0){const p=players[g.pi];return `<div class='card glass'><div class='row'><span class='tag' style='background:${p.c};color:#111'>📍 ${esc(p.n)} sætter sin pin (${g.pi+1}/${players.length})</span></div><div class='q'>Hvor ligger ${esc(it.c)}?</div><div id='map' class='map'></div><p class='hint'>Globussen har ingen navne. Træk for at dreje den, knib/scroll for at zoome, og tryk for at placere knappenålen. Kun ${esc(p.n)} kigger – giv derefter skærmen videre.</p><div class='row'><button class='btn big' id='pinlock' disabled>Lås pin 🔒</button></div></div>`}
  const rk=players.map((_,i)=>i).sort((a,b)=>g.dist[a]-g.dist[b]);
  return `<div class='card glass'><div class='q'>📍 ${esc(it.c)}</div><div id='map' class='map'></div><div class='res'>${rk.map(i=>`<span style='border:2px solid ${players[i].c}'>${g.win.includes(i)?'🏆 ':''}${esc(players[i].n)}: ${fmt(Math.round(g.dist[i]))} km fra landets midte${g.win.includes(i)?' (+1)':''}</span>`).join('')}</div><p class='hint'>Den grønne knappenål viser landets omtrentlige midte. Træk for at dreje globussen.</p><div class='row'><button class='btn big green' id='nx'>Næste land →</button></div></div>`},
 bind(){
  const box=document.getElementById('map');if(!box||(!window.WORLD&&!window.globeReady))return;const it=g.item;
   const svgMap2=(b,cb)=>(window.globeReady&&window.globeMap&&window.globeMap(b,cb))||svgMap(b,cb);
   if(!window.globeReady&&!window.globeError&&window.__map3dLoaded&&(g.gw||0)<25){g.gw=(g.gw||0)+1;box.innerHTML="<div style='display:grid;place-items:center;gap:12px;height:100%;color:#fff;font-weight:700'><div>🌍 Indlæser 3D-globus…</div><button type='button' class='btn ghost' onclick='g.gw=999;render()'>Brug 2D-kort</button></div>";setTimeout(()=>{if(document.getElementById('map')===box)render()},400);return}
  if(g.ph===0){
   let mk=null;const btn=document.getElementById('pinlock'),p=players[g.pi];
   const api=svgMap2(box,(lat,lon)=>{g.cur=[lat,lon];if(mk)api.move(mk,lat,lon);else mk=api.mark(lat,lon,p.c,2.6);btn.disabled=false});
   btn.onclick=()=>{if(!g.cur)return;g.pins[g.pi]=g.cur;g.cur=null;g.pi++;
    if(g.pi>=players.length){const ans=[it.la,it.lo];g.dist=g.pins.map(q=>hav(q,ans));const md=Math.min(...g.dist);g.win=g.dist.map((d,i)=>d===md?i:-1).filter(i=>i>=0);g.win.forEach(i=>add(i,1));g.ph=1;boom()}
    render()}
  }else{
   const api=svgMap2(box,null),ans=[it.la,it.lo];
   g.pins.forEach((q,i)=>api.line(q,ans,players[i].c));
   g.pins.forEach((q,i)=>api.mark(q[0],q[1],players[i].c,2.4));
   api.mark(ans[0],ans[1],'#2ec4b6',3.2);api.fit([ans].concat(g.pins))}
 }
};

/* ---- 🔞 XXX: låses op med en kode, brugeren selv vælger på hver enhed ----
   Der er ingen fælles kode. I localStorage (hs_xlock) gemmes kun et tilfældigt salt og SHA-256 af salt+kode.
   Låsen skjuler sektionen i spillet; den er ikke en teknisk beskyttelse af teksterne (se SECURITY.md). */
var XG=[
{id:'xr',grp:'🔞 XXX',key:'xr',kind:'award',t:'Romantik',d:'Kys, massage, dans og kærlige ord',e:'💞',g:'linear-gradient(135deg,#ff758c,#ff7eb3)',min:2},
{id:'xs',grp:'🔞 XXX',key:'xs',kind:'award',t:'Sexy udfordringer',d:'Flirt, berøring og tøj af',e:'🔥',g:'linear-gradient(135deg,#f12711,#f5af19)',min:2},
{id:'xh',grp:'🔞 XXX',key:'xh',kind:'award',t:'Grænseløs',d:'Hård kant – altid frivilligt, altid ret til at sige pas',e:'😈',g:'linear-gradient(135deg,#7b2ff7,#f107a3)',min:2},
{id:'xq',grp:'🔞 XXX',key:'xq',kind:'cards',t:'Intime spørgsmål',d:'Ærlige svar om lyst og fantasi',e:'💋',g:'linear-gradient(135deg,#c31432,#240b36)',min:1},
{id:'xn',grp:'🔞 XXX',key:'xn',kind:'cards',t:'Jeg har aldrig 🔞',d:'Tag en tår, hvis det passer på dig',e:'🍑',g:'linear-gradient(135deg,#fc4a1a,#f7b733)',min:1}];
let unlocked=false;
const XK='hs_xlock',XRE=/^\d{4,8}$/;
/* Aldersport: 🔞-afsnittet kræver en bekræftelse på, at man er fyldt 18,
   FØR man kan vælge eller bruge en kode. Bekræftelsen gemmes kun på enheden
   (fødselsår + tidspunkt) og følger ikke med en backup. */
const XVOKSEN='hs_voksen';
/* Kan slås helt fra i en butiksudgave: window.HSA = { udenVoksen: true } */
const UDEN_VOKSEN=!!(window.HSA&&window.HSA.udenVoksen);
const voksenOK=()=>{try{const v=JSON.parse(localStorage.getItem(XVOKSEN)||'null');
 return !!(v&&Number.isInteger(v.aar)&&(new Date().getFullYear()-v.aar)>=18)}catch(e){return false}};
const gemVoksen=aar=>{try{localStorage.setItem(XVOKSEN,JSON.stringify({aar:aar,t:new Date().toISOString()}))}catch(e){}};
function aldersport(fortsæt){
 const år=new Date().getFullYear();
 const d=document.createElement('div');d.className='modal';d.style.zIndex='90';
 const da=(window.HSLANG||'da')==='da';
 d.innerHTML=`<div class='mbox'><h2 style='margin-top:0'>🔞 ${da?'For voksne (18+)':'For adults (18+)'}</h2>
 <p class='hint' style='text-align:left'>${da?'Afsnittet indeholder spil og spørgsmål for voksne. For at beskytte børn skal du bekræfte din alder, før du kan vælge eller bruge en kode.':'This section contains games and questions for adults. To protect children, confirm your age before you can choose or use a code.'}</p>
 <p class='hint' style='text-align:left'>${da?'Bekræftelsen gemmes kun på denne enhed og kan fjernes ved at rydde appens data.':'The confirmation is stored only on this device and can be removed by clearing the app’s data.'}</p>
 <label class='hint' for='xalder' style='display:block;text-align:left;margin-top:8px'>${da?'Skriv dit fødselsår (4 cifre)':'Enter your year of birth (4 digits)'}</label>
 <input class='in' id='xalder' inputmode='numeric' maxlength='4' autocomplete='off' placeholder='${da?'Fx 1985':'e.g. 1985'}'>
 <p class='hint' id='xamsg' style='min-height:1.2em'></p>
 <div class='row'><button class='btn red' id='xaok'>${da?'Bekræft alder':'Confirm age'}</button><button class='btn ghost' id='xano'>${da?'Jeg er under 18':'I am under 18'}</button></div></div>`;
 document.body.appendChild(d);
 const i=d.querySelector('#xalder'),m=t=>{d.querySelector('#xamsg').textContent=t};
 const go=()=>{const aar=Number(i.value);
  if(!/^\d{4}$/.test(i.value)||aar<1900||aar>år){m(da?'Skriv et gyldigt fødselsår.':'Enter a valid year of birth.');return}
  if(år-aar<18){i.value='';m(da?'Du skal være fyldt 18 for at bruge dette afsnit.':'You must be 18 or older to use this section.');return}
  gemVoksen(aar);d.remove();fortsæt()};
 d.querySelector('#xaok').onclick=go;
 i.onkeydown=e=>{if(e.key==='Enter')go()};
 d.querySelector('#xano').onclick=()=>{d.remove();if(window.toast)toast('🔞-afsnittet er kun for voksne og er stadig låst.')};
 i.focus()}

const xHash=(salt,v)=>window.hsSha256(salt+'\u0001'+v);
const xSalt=()=>{const a=new Uint8Array(16);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<16;i++)a[i]=Math.random()*256|0}return [...a].map(b=>b.toString(16).padStart(2,'0')).join('')};
const xStore=()=>{try{const s=JSON.parse(localStorage.getItem(XK)||'null');return s&&s.s&&s.k?s:null}catch(e){return null}};
const xSave=v=>{const s=xSalt();localStorage.setItem(XK,JSON.stringify({s,k:xHash(s,v)}))};
function setLock(on){
 unlocked=on;
 if(on){XG.forEach(x=>{if(!GAMES.find(a=>a.id===x.id))GAMES.push(x)})}
 else{for(let i=GAMES.length-1;i>=0;i--)if(GAMES[i].grp==='🔞 XXX')GAMES.splice(i,1);if(!gm(view)){view='home';g={}}}
 render()}
function gate(){
 if(UDEN_VOKSEN)return;
 if(!voksenOK())return aldersport(gate);
 const isNew=!xStore();
 while(players.length<2)players.push({n:'Spiller '+(players.length+1),c:(window.COLORS||['#4cc9f0','#ff5d8f'])[players.length%2],s:0,t:0});
 const d=document.createElement('div');d.className='modal';
 d.innerHTML=`<div class='mbox'><h2 style='margin-top:0'>🔞 Kun for voksne</h2>
 <p class='hint' style='text-align:left'>Kun for samtykkende voksne (18+). Alt er frivilligt – man må altid sige «pas», og stop betyder stop.</p>
 <p class='hint' style='text-align:left'>${isNew?'Vælg selv en kode på 4–8 cifre til denne enhed. Den gemmes kun som en kontrolsum i browseren her og sendes ingen steder hen.':'Indtast den kode, du har valgt på denne enhed.'}</p>
 <input class='in' id='xc' type='password' inputmode='numeric' autocomplete='off' maxlength='8' placeholder='${isNew?'Vælg kode (4–8 cifre)':'Kode'}'>
 ${isNew?"<div style='height:8px'></div><input class='in' id='xc2' type='password' inputmode='numeric' autocomplete='off' maxlength='8' placeholder='Gentag koden'>":''}
 <p class='hint' id='xmsg' style='min-height:1.2em'></p>
 <div class='row'><button class='btn red' id='xok'>${isNew?'Gem kode og åbn':'Åbn'}</button><button class='btn ghost' id='xno'>Annuller</button></div>
 ${isNew?'':"<div class='row' style='margin-top:10px'><button class='btn ghost' id='xreset' style='font-size:13px'>Glemt koden eller vil skifte? Nulstil</button></div>"}</div>`;
 document.body.appendChild(d);
 const i=d.querySelector('#xc'),i2=d.querySelector('#xc2'),msg=t=>{d.querySelector('#xmsg').textContent=t;i.classList.add('shake');setTimeout(()=>i.classList.remove('shake'),400)};
 const go=()=>{const v=i.value.trim();
  if(isNew){
   if(!XRE.test(v))return msg('Koden skal være 4–8 cifre.');
   if(i2.value.trim()!==v){i2.value='';return msg('De to koder er ikke ens.')}
   xSave(v);d.remove();setLock(true)}
  else{const s=xStore();if(s&&xHash(s.s,v)===s.k){d.remove();setLock(true)}else{i.value='';msg('Forkert kode.')}}};
 d.querySelector('#xok').onclick=go;
 [i,i2].forEach(el=>{if(el)el.onkeydown=e=>{if(e.key==='Enter')go()}});
 d.querySelector('#xno').onclick=()=>d.remove();
 const rs=d.querySelector('#xreset');
 if(rs)rs.onclick=()=>{d.remove();ask('Nulstil 🔞-koden på denne enhed? Du vælger en ny bagefter.',()=>{try{localStorage.removeItem(XK)}catch(e){}gate()})};
 i.focus()}
/* 🔞 ligger i menu-knappen, så toppen er rolig. Skjules for mindreårige. */
window.hsVoksenSynlig=()=>{
 if(UDEN_VOKSEN)return false;
 try{return !(window.players||[]).some(p=>p&&typeof p.age==='number'&&p.age<18)}catch(e){return true}
};
window.hsVoksen=()=>{if(!window.hsVoksenSynlig())return;unlocked?setLock(false):gate()};
/* husk at mind om at vælge kode, hvis enheden allerede har data men ingen kode */
window.hsKodeMangler=()=>!xStore();

/* ---- første gangs start: egen 🔞-kode + to spillere – ingen data fra udvikleren følger med ---- */
const FMT='hs_forst';
/* «første gang» styres af et eget mærke – 🔞-koden er valgfri og må ikke være
   adgangsbillet til at komme i gang. */
const frisk=()=>{try{return localStorage.getItem(FMT)!=='ja'}catch(e){return true}};
function ensureSetup(){
 if(!frisk()||typeof players==='undefined'||typeof save!=='function')return;
 /* På en helt ny enhed åbner forsiden «Spillere»-boksen, fordi der endnu ikke er
    to spillere. Velkomsten skal have pladsen i stedet, ellers ser man aldrig
    navnefelterne og aldersinformationen. */
 const åben=document.querySelector('.modal');
 if(åben){
  let kunSpillere=false;
  try{kunSpillere=(typeof modal!=='undefined'&&modal==='pl')}catch(e){}
  if(!kunSpillere)return;
  åben.remove();
  try{modal=null}catch(e){}
 }
 /* sæt to spillere op – uden nogen data fra udvikleren */
 const C=window.COLORS||['#4cc9f0','#ff5d8f','#ffb703'];
 while(players.length<2)players.push({n:'Spiller '+(players.length+1),c:C[players.length%C.length],s:0,t:0});
 save();
 const d=document.createElement('div');d.className='modal';
 const da=(window.HSLANG||'da')==='da';
 d.innerHTML=`<div class="mbox" style="max-height:92vh;overflow:auto">
 <h2 style="margin-top:0">🃏 ${da?'Velkommen til Hygge Games':'Welcome to Hygge Games'}</h2>
 <p class="hint" style="text-align:left">${da?'Spillet kører helt hos dig selv: spillernavne, aldre, point og egne spørgsmål gemmes kun i browseren på denne enhed og forlader den aldrig. Ingen data fra udviklerens eget spil følger med.':'Everything runs on your own device: player names, ages, scores and your own questions are stored only in this browser and never leave it. No data from the developer’s game is included.'}</p>
 <h3 style="margin:14px 0 6px">${da?'Hvem spiller med?':'Who is playing?'}</h3>
 <p class="hint" style="text-align:left">${da?'To spillere er sat op i forvejen – du kan skrive navnene her eller ændre dem senere under 👥 Spillere.':'Two players are set up already – edit the names here or later under 👥 Players.'}</p>
 <input class="in" id="fn1" maxlength="16" placeholder="Spiller 1">
 <div style="height:6px"></div>
 <input class="in" id="fn2" maxlength="16" placeholder="Spiller 2">
 <p class="hint" id="fmsg" style="min-height:1.2em;color:#ffb703"></p>
 <div class="row" style="margin-top:16px"><button class="btn big green" id="fok">Start spillet</button></div>
 <div class="card" style="margin-top:16px;padding:12px;text-align:left">
  <div style="font-weight:900">🔞 ${da?'Afsnittet for voksne er slået fra':'The adults section is turned off'}</div>
  <p class="hint" style="margin:6px 0 0">${da?'Vil du bruge det, skal du først bekræfte, at du er fyldt 18 år. Derefter vælger du selv en kode på 4–8 cifre; der findes ingen fælles kode.':'To use it, confirm that you are 18 or older. Then choose your own 4–8 digit code; there is no shared code.'}</p>
  <div class="row" style="margin-top:10px"><button class="btn ghost" id="fx">${da?'Opsæt 🔞-kode':'Set up 🔞 code'}</button></div>
 </div></div>`;
 document.body.appendChild(d);
 d.querySelector('#fn1').value=(players[0]&&players[0].n)||'Spiller 1';
 d.querySelector('#fn2').value=(players[1]&&players[1].n)||'Spiller 2';
 const gem=()=>{
  const msg=t=>{const el=d.querySelector('#fmsg');if(el){el.textContent=t||''}};
  const n1=String(d.querySelector('#fn1').value||'').trim(),n2=String(d.querySelector('#fn2').value||'').trim();
  if(!n1||!n2){msg('Skriv navne på begge spillere.');return false}
  if(players[0])players[0].n=n1;if(players[1])players[1].n=n2;save();
  localStorage.setItem(FMT,'ja');
  d.remove();render();return true};
 d.querySelector('#fok').onclick=gem;
 d.querySelector('#fx').onclick=()=>{if(gem())gate()};
 d.querySelector('#fn1').focus()}
const _render2=window.render;
window.render=function(){const r=_render2.apply(this,arguments);try{if(frisk())ensureSetup()}catch(e){}return r};
/* åbn start-boksen selvom render-kæden vrisser: når dokumentet er læst, eller 400 ms efter at filen er kørt */
(function(){
 const prov=()=>{try{if(frisk())ensureSetup()}catch(e){console.warn('HS startboks',e)}};
 if(document.readyState==='complete')setTimeout(prov,50);
 else document.addEventListener('DOMContentLoaded',function(){setTimeout(prov,60)});
 setTimeout(prov,400);
})();

/* ---- indlæs kortdata og datapakker (synkront, før start) ---- */
['i18n','platform','hs-cfg','world','p1','p2','p3','p4','p5','p6','p7','p8','p9','map3d','resume','vf2','hs2','hs3','hs4','hs5','k1','pv','dx','sm','c1','w1','t1','gs','fb','reality','musik','film','quiz','quiz3','musikma','jul','julspil','gaming','gamingspil','en','ordbank','lege','lege2','ex_daily','effekt','feedback','stotte','sporgsmal','backup','spilvalg','ordjagt','solo','rum-online','rum','oplaesning'].forEach(n=>document.write('<script src="'+n+'.js?v='+VER+'"></scr'+'ipt>'));
})();

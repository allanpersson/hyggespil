/* Hyggespil: 🔐 Kodespil – otte krypteringslege inspireret af Zodiac-morderens breve og beslægtede chiffer.
   Kontrakt (index.html): DATA-puljer, GAMES, KINDS, g, players, view, esc, add, next, render, boom, draw, pool.

   Vigtigt for korrekt-hed: I puljerne står KUN klarteksten (danske ord/sætninger). Selve chifferet
   (glyfer, byrgitter, punktceller, farver, morsepib, skift) genereres af koden her, så facit aldrig
   kan afvige fra det viste. window.c1Selvtest() kører encode→decode på ALLE ord og returnerer antal fejl.

   Alderstilpasning (jf. hs5): hvert puljeelement har age = mindste alder (5-16). Dette modul installerer
   sin egen wrapper om window.draw (via HS_FINISH-kæden), som – når der er børn med – bruger
   window.hsAgeMode.lev(spiller) (alder + automatisk niveautilpasning) som mål-alder og vælger elementer
   fra vinduet [mål-4 .. mål], præcis som hs2 gør det for børnepuljerne. Uden hs5 i nærheden bruges
   spillerens bare alder; kun teenagere => niveau 13; kun voksne => niveau 16. Spillenes id'er
   registreres i hs5's ADAPT, så de mærkes «🧒 tilpasses alderen» i stedet for at blive nedtonet.  */
(function(){
if(window.__c1)return;window.__c1=true;

/* ---- globals: i browseren eksisterer de allerede (data.js/index.html); i node opretes de her,
   så registreringen af DATA/GAMES/KINDS ikke kræver DOM. Bare navne bruger window-/globalThis-bindingen. ---- */
if(typeof DATA==='undefined')globalThis.DATA={};
if(typeof KINDS==='undefined')globalThis.KINDS={};
if(typeof GAMES==='undefined')globalThis.GAMES=[];
try{window.DATA=window.DATA||DATA;window.KINDS=window.KINDS||KINDS;window.GAMES=window.GAMES||GAMES}catch(e){}
function c1esc(s){try{return esc(s)}catch(e){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}}
const c1nz=s=>String(s).toUpperCase().replace(/[^A-ZÆØÅ ]/g,'').replace(/\s+/g,' ').trim();
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',AI={};[...ALPHA].forEach((c,i)=>{AI[c]=i});
const GRP='🔐 Kodespil';

/* ================= 1) Zodiac-glyfer: SVG-tegn genereret ud fra en parameterliste (44 design) ================= */
function symSVG(p){
 const K='stroke="#f4c95d" stroke-width="3.2" fill="none" stroke-linecap="round"',D='fill="#f4c95d"',f=v=>v.toFixed(1);
 let s='<svg viewBox="0 0 64 64">';
 if(p.r)s+='<circle cx="32" cy="32" r="19" '+K+'/>';
 if(p.t>=0){const a=p.t*Math.PI/4,r1=p.r?20:9,r2=p.r?27:15;
  s+='<line x1="'+f(32+Math.cos(a)*r1)+'" y1="'+f(32+Math.sin(a)*r1)+'" x2="'+f(32+Math.cos(a)*r2)+'" y2="'+f(32+Math.sin(a)*r2)+'" '+K+'/>'}
 const m=p.m;
 if(m==='plus')s+='<line x1="25" y1="32" x2="39" y2="32" '+K+'/><line x1="32" y1="25" x2="32" y2="39" '+K+'/>';
 else if(m==='x')s+='<line x1="26" y1="26" x2="38" y2="38" '+K+'/><line x1="38" y1="26" x2="26" y2="38" '+K+'/>';
 else if(m==='bar')s+='<line x1="21" y1="19" x2="43" y2="19" '+K+'/>';
 else if(m==='slash')s+='<line x1="23" y1="43" x2="41" y2="23" '+K+'/>';
 else if(m==='back')s+='<line x1="23" y1="23" x2="41" y2="43" '+K+'/>';
 else if(m==='dots')s+='<circle cx="25" cy="41" r="2.6" '+D+'/><circle cx="39" cy="41" r="2.6" '+D+'/>';
 else if(m==='tri')s+='<path d="M32 18L40 31H24Z" '+K+'/>';
 else if(m==='arc')s+='<path d="M21 42A11 11 0 0 0 43 42" '+K+'/>';
 else if(m==='cup')s+='<path d="M21 24A11 11 0 0 1 43 24" '+K+'/>';
 else if(m==='vex')s+='<path d="M24 25L32 40L40 25" '+K+'/>';
 if(p.d)s+='<circle cx="32" cy="32" r="3" '+D+'/>';
 return s+'</svg>'}
const GLYPHS=(function(){
 const mks=['none','plus','x','bar','slash','back','dots','tri','arc','cup','vex'],
 comb=[{r:1,d:0,t:-1},{r:1,d:1,t:3},{r:0,d:1,t:0},{r:0,d:0,t:5}],out=[],seen=new Set();
 for(const m of mks)for(const c of comb){const p={r:c.r,d:c.d,t:c.t,m:m},s=symSVG(p);
  if(!seen.has(s)){seen.add(s);out.push(p)}}
 return out})();
const SYM={};[...ALPHA].forEach((c,i)=>{SYM[c]=symSVG(GLYPHS[i%GLYPHS.length])});

/* ================= 2) Gridskrift (pigpen/murers byrgitter) ================= */
const VF1='ABCDEFGHI',VF2='JKLMNOPQR',VX='STUVWXYZ';
function vineSVG(ch){
 const K='stroke="#7fe3d5" stroke-width="3.2" fill="none" stroke-linecap="round"',D='fill="#7fe3d5"';
 let s='<svg viewBox="0 0 64 64">',i1=VF1.indexOf(ch),i2=VF2.indexOf(ch),x=VX.indexOf(ch);
 if(i1>=0||i2>=0){const idx=i1>=0?i1:i2,col=idx%3,row=(idx/3)|0,b=[6,24,42,60];
  if(row>0)s+='<line x1="'+b[col]+'" y1="'+b[row]+'" x2="'+b[col+1]+'" y2="'+b[row]+'" '+K+'/>';
  if(row<2)s+='<line x1="'+b[col]+'" y1="'+b[row+1]+'" x2="'+b[col+1]+'" y2="'+b[row+1]+'" '+K+'/>';
  if(col>0)s+='<line x1="'+b[col]+'" y1="'+b[row]+'" x2="'+b[col]+'" y2="'+b[row+1]+'" '+K+'/>';
  if(col<2)s+='<line x1="'+b[col+1]+'" y1="'+b[row]+'" x2="'+b[col+1]+'" y2="'+b[row+1]+'" '+K+'/>';
  if(i2>=0)s+='<circle cx="'+(b[col]+b[col+1])/2+'" cy="'+(b[row]+b[row+1])/2+'" r="3" '+D+'/>'}
 else if(x>=0){const dv=x>=4,t=x%4;
  if(t===0)s+='<path d="M20 24L32 44L44 24" '+K+'/>';
  else if(t===1)s+='<path d="M24 20L44 32L24 44" '+K+'/>';
  else if(t===2)s+='<path d="M20 40L32 20L44 40" '+K+'/>';
  else s+='<path d="M40 20L20 32L40 44" '+K+'/>';
  if(dv)s+='<circle cx="32" cy="32" r="3" '+D+'/>'}
 else if(ch==='Æ')s+='<line x1="20" y1="20" x2="44" y2="44" '+K+'/><line x1="44" y1="20" x2="20" y2="44" '+K+'/>';
 else if(ch==='Ø')s+='<line x1="20" y1="20" x2="44" y2="44" '+K+'/><line x1="44" y1="20" x2="20" y2="44" '+K+'/><circle cx="32" cy="32" r="3" '+D+'/>';
 else if(ch==='Å')s+='<line x1="20" y1="46" x2="44" y2="18" '+K+'/>';
 return s+'</svg>'}
const VINE={};[...ALPHA].forEach(c=>{VINE[c]=vineSVG(c)});

/* ================= 3) Punktskrift: 2x3 celler, prikker 1-6 ================= */
const BR={A:'1',B:'12',C:'14',D:'145',E:'15',F:'124',G:'1245',H:'125',I:'24',J:'245',
 K:'13',L:'123',M:'134',N:'1345',O:'135',P:'1234',Q:'12345',R:'1235',S:'234',T:'2345',
 U:'136',V:'1236',W:'2456',X:'1346',Y:'1456',Z:'1356','Æ':'1246','Ø':'12346','Å':'2346'};
function brlSVG(ch){
 let s='<svg viewBox="0 0 48 64">',p=BR[ch]||'';
 for(let n=1;n<=6;n++){const on=p.indexOf(''+n)>=0,x=16+(n>3?18:0),y=14+((n<=3?n:n-3)-1)*18;
  s+='<circle cx="'+x+'" cy="'+y+'" r="'+(on?6:3.4)+'" fill="'+(on?'#ff8ac2':'rgba(255,255,255,.22)')+'"/>'}
 return s+'</svg>'}
const BRL={};[...ALPHA].forEach(c=>{BRL[c]=brlSVG(c)});

/* ================= 4) Farver: hvert bogstav = en ensfarvet firkant (først-tilfælde-nøgle) ================= */
const COLPAL=['#ff4d4d','#ff9f1c','#ffd60a','#b5e48c','#2ec4b6','#0ead69','#4cc9f0','#4361ee','#7b2cbf','#9d4edd',
 '#f15bb5','#ff5d8f','#d90429','#a5673f','#e0c097','#adb5bd','#f8f9fa','#06d6a0','#ef476f','#118ab2','#8338ec','#3a86ff','#fb8500','#80ed99'];

/* ================= 5) Morse ================= */
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',
 K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',
 W:'.--',X:'-..-',Y:'-.--',Z:'--..','Æ':'.-.-','Ø':'---.-','Å':'....-'};
const morsInner=t=>{let o='';for(const c of t)o+=c==='.'?'<b class="c1d"></b>':'<b class="c1s"></b>';return o};

/* ================= 6+8) Skift-hjælpere (Caesar og bogstavkæder) ================= */
function shL(c,n){const i=AI[c];return i===undefined?c:ALPHA[((i+n)%29+29)%29]}
const KEDR=[{n:'+1, +2, +1, +2 …',f:i=>i%2?2:1},{n:'+1, +2, +3, +4 …',f:i=>i%29+1},{n:'+2, -2, +2, -2 …',f:i=>i%2?-2:2}];

/* ================= puljer: KUN klartekst + mindstealder ================= */
const W=a=>a.map(r=>({w:r[0],age:r[1]}));
DATA.cifsym=W([['BOLD',5],['SOL',5],['KAGE',5],['MUS',6],['HUND',6],['FISK',6],['UGLE',7],['ÆBLE',8],
 ['PARAPLY',10],['SKATTEKISTE',12],['SOMMERFUGL',13],['NØGLEN LIGGER I SKUFFEN',14],['MØRKET FALDER OVER SKOVEN',16]]);
DATA.cifvine=W([['KAT',5],['MUS',5],['BOLD',6],['HUND',6],['KAGE',6],['AND',7],['FUGL',7],['ÆBLE',8],['BANAN',9],
 ['PARAPLY',10],['GUMMISTØVLER',11],['BLOMSTERHAVE',12],['POSTBUDET ER TOMT',13],['VI MØDES VED BÅLET',14],['BESKEDEN FRA ZODIAK',16]]);
DATA.cifbrl=W([['SOL',5],['KAT',5],['MUS',5],['BOLD',6],['HUND',6],['KAGE',6],['UGLE',7],['ÆBLE',8],['CYKEL',9],
 ['PARAPLY',10],['TRAMPOLIN',11],['LYSET BRÆNDER I STUEN',14],['NØGLEN LIGGER I SKUFFEN',16]]);
DATA.cifcol=W([['BOLD',5],['KAGE',5],['SNE',5],['FISK',6],['MØTTE',6],['UGLE',7],['HEST',7],['ISBJØRN',8],
 ['PARAPLY',9],['BRILLER',10],['KØLESKAB',11],['BAMSER I KASSEN',12],['SOL OG MÅNE',14],['MØRKET FALDER OVER SKOVEN',16]]);
DATA.cifmors=W([['SNE',5],['KAT',5],['BOLD',6],['HUND',6],['KAGE',6],['FISK',6],['UGLE',7],['BAMSE',6],['CYKEL',8],
 ['IS MED CHOKOLADE',11],['MÆLK MED KAKAO',12],['VI SKAL TÆNDE BÅLET',14],['POSTBUDET ER TOMT',15]]);
DATA.cifcaes=W([['KAGE',5],['BOLD',5],['SOL',5],['HUND',6],['FISK',6],['ÆBLE',7],['PARAPLY',9],['TRAMPOLIN',11],
 ['SKATTEKISTE',12],['VI MØDES VED BÅLET',13],['KATTEN SOVER I SOFAEN',14],['NØGLEN LIGGER I SKUFFEN',15],['MØRKET FALDER OVER SKOVEN',16]]);
DATA.cifspjl=W([['SOL',5],['KAT',5],['BIL',5],['KAGE',6],['HUND',6],['FISK',7],['BOLD',7],['ISKAGE',8],['UGLE',8],
 ['PARAPLY',10],['SOMMERFUGL',12],['SKATTEKISTE',13],['VI SKAL LØBE HJEM',15],['SPEJLET VENDER ALT OM',16]]);
DATA.cifked=W([['SNE',5],['BRØD',5],['MÆLK',6],['BAMSE',6],['CYKEL',7],['RYGSÆK',8],['FISKEDAM',9],['TELESKOP',11],
 ['TRAMPOLIN',12],['POSTBUDET ER TOMT',13],['VI MØDES VED BÅLET',14],['KAGEN STÅR PÅ KOMMODEN',15],['DEN HEMMELIGE DØR ER BAG BOGHYLDEN',16]]);
const C1KEYS=['cifsym','cifvine','cifbrl','cifcol','cifmors','cifcaes','cifspjl','cifked'];

/* ================= fælles visning: ord-grupper af <i>-elementer med token i data-c1 ================= */
function c1words(plain,el,wrapCls){
 let h='',open=false,li=0;
 for(const ch of plain){
  if(ch===' '){if(open){h+='</span>';open=false}h+='<i class="c1ws" data-c1="_"></i>';continue}
  if(!open){h+='<span class="c1wd'+(wrapCls?' '+wrapCls:'')+'">';open=true}
  h+=el(ch,li++)}
 if(open)h+='</span>';
 return h}
function c1decodeHtml(html,map){
 const toks=(html.match(/data-c1="([^"]*)"/g)||[]).map(t=>t.slice(9,-1));
 return toks.map(t=>{const L=map[t];if(L===undefined)throw new Error('ukendt token «'+t+'»');return L}).join('')}
function c1items(html){
 const out=[];const re=/<i class="c1t[^"]*" data-c1="([^"]*)"(?: style="([^"]*)")?>([\s\S]*?)<\/i>/g;let m;
 while((m=re.exec(html)))out.push({tok:m[1],style:m[2]||'',inner:m[3]});
 return out}
const c1dist=p=>[...new Set(p.replace(/ /g,'').split(''))];

/* ================= alder: mål-alder for runden (bruges kun i browseren, i draw-wrapperen) ================= */
let c1Target=16;
function c1IsKid(p){try{const m=window.hsAgeMode;if(m&&m.isKid)return m.isKid(p)}catch(e){}return !!p&&p.age>0&&p.age<=14}
function c1Level(){
 try{
  if(!players||!players.length)return 16;
  const kids=players.filter(c1IsKid),minors=players.filter(p=>!c1IsKid(p)&&p&&p.age>0&&p.age<18);
  if(!kids.length)return minors.length?13:16;
  let mx=5;
  kids.forEach(p=>{let l=null;
   try{const m=window.hsAgeMode;if(m&&m.lev)l=m.lev(p)}catch(e){}
   if(!(l>0))l=Math.max(5,Math.min(16,p.age||8));
   if(l>mx)mx=l});
  return Math.min(16,mx)
 }catch(e){return 16}}
function c1Filter(list){
 const a=c1Level();
 let t=list.filter(it=>it.age<=a&&it.age>=a-4);
 if(t.length<5){const tiers=[...new Set(list.map(it=>it.age))].sort((x,y)=>x-y);
  for(const v of tiers.filter(v=>v<a).reverse().concat(tiers.filter(v=>v>a))){if(t.length>=5)break;
   t=t.concat(list.filter(i=>i.age===v).slice(0,5-t.length))}}
 if(!t.length)t=list;
 return t}
function installDraw(){
 if(installDraw.done)return;installDraw.done=true;
 const d0=window.draw;
 window.draw=function(gk,list){
  try{const x=gm(gk);if(x&&C1KEYS.indexOf(x.key)>=0&&list&&list.length&&list[0]&&list[0].w!=null)list=c1Filter(list)}
  catch(e){}
  return d0.apply(this,arguments)}}
try{const f0=window.HS_FINISH;window.HS_FINISH=function(){f0&&f0();installDraw()}}catch(e){installDraw()}

/* ================= lydklo (kun ved klik, aldrig ved load) ================= */
let actx=null;
function c1tone(ms){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
 actx=actx||new A();const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=720;
 o.connect(g);g.connect(actx.destination);const t=actx.currentTime;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.02);
 g.gain.exponentialRampToValueAtTime(.0001,t+ms/1000);o.start(t);o.stop(t+ms/1000+.05)}catch(e){}}

/* ================= spilmotoren: ét design pr. chifter ================= */
function mkEngine(def){
 const cfg=def.cfg;
 return{
  init(){
   c1Target=c1Level();
   let it=g.item;
   if(!it||it.w==null)it=pick(DATA[def.key]||[]);
   const ci={plain:c1nz(it.w),lvl:c1Target,it:it,age:it.age,band:c1Target<=7?0:c1Target<=10?1:c1Target<=13?2:3,
    done:false,solved:false,bad:'',k:0,iv:'',map:{'_':' '},shr:{}};
   ci.dist=c1dist(ci.plain).length;
   ci.k=Math.max(1,Math.min(ci.dist,[4,3,2,1][ci.band]));
   ci.pts=cfg.pts;
   cfg.build&&cfg.build(ci);
   g.ci=ci;
  },
  render(){
   const ci=g.ci;
   if(!ci||!ci.plain)return '<div class="card glass"><div class="q">'+def.e+' '+c1esc(def.t)+'</div><div class="row"><button class="btn big green" id="nx">Næste runde →</button></div></div>';
   const wd=ci.plain.split(' ').length,bst=ci.plain.replace(/ /g,'').length;
   let o='<div class="card glass c1card">';
   o+='<div class="row"><span class="tag">'+def.e+' '+c1esc(def.t)+'</span><span class="tag">'+wd+' ord · '+bst+' bogstaver</span>'
    +(ci.lvl<=14?'<span class="tag">👶 niveau '+ci.lvl+' år</span>':'')+'</div>';
   o+='<p class="hint c1ins">'+cfg.ins+'</p>';
   o+='<div class="c1msg">'+(cfg.view?cfg.view(ci):ci.html)+'</div>';
   if(!ci.done){
    const key=cfg.key?cfg.key(ci):'';
    if(key)o+=key;
    if(cfg.meta)o+='<p class="hint">'+cfg.meta(ci)+'</p>';
    o+='<div class="c1inrow"><input class="in" id="c1in" placeholder="'+(wd>1?'Skriv hele sætningen':'Skriv dit gæt')
     +'" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="90" value="'+c1esc(ci.iv||'')+'"></div>';
    o+='<div class="row"><button class="btn green" id="c1ok">✅ Tjek gæt</button>';
    if(cfg.hintable&&cfg.hintable(ci))o+='<button class="btn" id="c1hint">💡 Hint</button>';
    o+='<button class="btn ghost" id="c1rev">👁️ Se svaret</button></div>';
    if(ci.bad)o+='<p class="hint" style="color:#ff9db1">❌ «'+c1esc(ci.bad)+'» er ikke hemmeligheden. Prøv igen!</p>';
   }else{
    o+='<div class="ans" style="font-size:clamp(20px,4.6vw,34px)">'+c1esc(ci.plain)+'</div>';
    if(cfg.plainView)o+='<div class="c1msg">'+cfg.plainView(ci)+'</div>';
    if(ci.solved)o+='<p class="hint">🎉 Rigtigt! Hvem gættede det? (<b>'+ci.pts+'</b> point)</p>'
     +awardChips(ci.pts,-1)+'<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Ingen – næste kode →</button></div>';
    else o+='<p class="hint">Ingen fik den gættet – næste brev?</p><div class="row"><button class="btn big green" id="nx">Næste runde →</button></div>';
   }
   return o+'</div>';
  },
  bind(){
   const ci=g.ci,$=id=>document.getElementById(id);
   if(!ci||ci.done||!$('c1ok'))return;
   const inp=$('c1in'),chk=()=>{
    const v=inp?inp.value:'';
    if(!c1nz(v)){if(inp)inp.classList.add('shake');return}
    if(c1nz(v)===ci.plain){ci.done=true;ci.solved=true;boom();render()}
    else{ci.bad=v;ci.iv='';render()}};
   $('c1ok').onclick=chk;
   if(inp){inp.onkeydown=e=>{if(e.key==='Enter')chk()};inp.oninput=()=>{ci.iv=inp.value}}
   $('c1rev').onclick=()=>{ci.done=true;ci.solved=false;render()};
   const hb=$('c1hint');if(hb&&cfg.hint)hb.onclick=()=>{cfg.hint(ci);render()};
   cfg.bind&&cfg.bind(ci,$);
  }
 }
}

/* ---- de otte chifter ---- */
const DEF=[
 ['cifsymbol','cifsym','Zodiac-glyferne','Kryptiske glyfer som i Zodiac-morderens breve – find bogstaverne bag tegnene og læs ordet','🔣','linear-gradient(135deg,#b45309,#f4c95d)',
  {pts:2,
   ins:'🔣 Hvert bogstav er byttet ud med en mystisk glyf – cirkler, krydser og streger. Nøglen nedenfor viser et par af tegnene. Tryk <b>💡 Hint</b> for at kende flere.',
   build(ci){ci.html=c1words(ci.plain,L=>{ci.map[''+AI[L]]=L;return '<i class="c1t c1sym" data-c1="'+AI[L]+'">'+SYM[L]+'</i>'});ci.plain_html=c1words(ci.plain,L=>L)},
   key(ci){return '<div class="c1key"><span class="c1keyt">🔑 Kendte tegn:</span>'+c1dist(ci.plain).slice(0,ci.k).map(L=>'<span class="c1kp">'+SYM[L]+'<b>'+L+'</b></span>').join('')+'</div>'},
   hintable:ci=>ci.k<ci.dist,hint:ci=>{ci.k++},
   plainView:ci=>ci.plain_html}],
 ['cifsvine','cifvine','Gridskriften','Murers hemmelige skrifttegn: bogstavet gemmer sig i stregene fra det bur, det står i','🧱','linear-gradient(135deg,#0ead69,#2ec4b6)',
  {pts:2,
   ins:'🧱 I gridskrift er hvert bogstav et hjørne, en side eller et kors af et usynligt bur. Nøglen viser et par bogstaver – find resten. <b>💡 Hint</b> afslører flere.',
   build(ci){ci.html=c1words(ci.plain,L=>{ci.map[''+AI[L]]=L;return '<i class="c1t c1v" data-c1="'+AI[L]+'">'+VINE[L]+'</i>'})},
   key(ci){return '<div class="c1key"><span class="c1keyt">🔑 Kendte tegn:</span>'+c1dist(ci.plain).slice(0,ci.k).map(L=>'<span class="c1kp">'+VINE[L]+'<b>'+L+'</b></span>').join('')+'</div>'},
   hintable:ci=>ci.k<ci.dist,hint:ci=>{ci.k++}}],
 ['cifbraille','cifbrl','Punkt-cellerne','Punktskrift som hemmeligt sprog: to kolonner med tre prikker danner hvert bogstav','📳','linear-gradient(135deg,#f15bb5,#9d4edd)',
  {pts:2,
   ins:'📳 Hver celle har 6 pladser: 1-3 op ad venstre side, 4-6 op ad højre. Tændte (lyserøde) prikker giver ét bogstav. Nøglen viser et par celler.',
   build(ci){ci.html=c1words(ci.plain,L=>{ci.map[''+AI[L]]=L;return '<i class="c1t c1brl" data-c1="'+AI[L]+'">'+BRL[L]+'</i>'})},
   key(ci){return '<div class="c1key"><span class="c1keyt">🔑 Kendte celler:</span>'+c1dist(ci.plain).slice(0,ci.k).map(L=>'<span class="c1kp">'+BRL[L]+'<b>'+L+'</b></span>').join('')+'</div><p class="hint">Pladser: 1-2-3 i venstre kolonne (oppefra), 4-5-6 i højre.</p>'},
   hintable:ci=>ci.k<ci.dist,hint:ci=>{ci.k++}}],
 ['ciffarver','cifcol','Farverne','Den mindste kode: hvert bogstav har fået sin egen farve – læs regnbuen','🎨','linear-gradient(135deg,#ff0a54,#ffd60a,#4361ee)',
  {pts:1,
   ins:'🎨 Hver farvede firkant er ét bogstav, og samme bogstav har altid samme farve. Nøglen viser de første farver – hu, hvad ordet er?',
   build(ci){ci.c={};
    ci.html=c1words(ci.plain,L=>{let i=ci.c[L];if(i===undefined){i=c1dist(ci.plain).indexOf(L);ci.c[L]=i;ci.map[''+i]=L}
     return '<i class="c1t c1sq" data-c1="'+i+'" style="background:'+COLPAL[i]+'"></i>'})},
   key(ci){return '<div class="c1key"><span class="c1keyt">🔑 Farvenøgle:</span>'+c1dist(ci.plain).slice(0,ci.k).map(L=>'<span class="c1kp"><i class="c1smq" style="background:'+COLPAL[ci.c[L]]+'"></i><b>'+L+'</b></span>').join('')+'</div>'},
   hintable:ci=>ci.k<ci.dist,hint:ci=>{ci.k++}}],
 ['cifmorser','cifmors','Morse-pibene','Korte pib og lange streger – klik for at afspille koden, også med lyd','📡','linear-gradient(135deg,#14213d,#fca311)',
  {pts:2,
   ins:'📡 Morse: <b>.</b> er et kort pib, <b>−</b> er en lang streg. Tryk ▶ for at se koden løbe, eller 🔊 for at høre den.',
   build(ci){ci.html=c1words(ci.plain,L=>{const t=MORSE[L];ci.map[t]=L;return '<i class="c1t c1m" data-c1="'+t+'">'+morsInner(t)+'</i>'})},
   view(ci){return ci.html+'<div class="row c1mrow"><button class="btn" id="c1pl">▶ Afspil visuelt</button><button class="btn ghost" id="c1snd">🔊 Med lyd</button></div>'},
   key(ci){return '<div class="c1key"><span class="c1keyt">🔑 Korte tegn:</span>'+c1dist(ci.plain).slice(0,ci.k).map(L=>'<span class="c1kp"><i class="c1m">'+morsInner(MORSE[L])+'</i><b>'+L+'</b></span>').join('')+'</div>'},
   hintable:ci=>ci.k<ci.dist,hint:ci=>{ci.k++},
   bind(ci,$){
    let timers=[];
    const play=withSound=>{
     timers.forEach(clearTimeout);timers=[];
     const tiles=[...(document.querySelectorAll('#main .c1t.c1m')||[])];
     let at=0;
     tiles.forEach(t=>{
      [...t.children].forEach(b=>{
       const dur=b.classList.contains('c1d')?110:300;
       timers.push(setTimeout(()=>{b.classList.add('lit');if(withSound)c1tone(dur);
        timers.push(setTimeout(()=>b.classList.remove('lit'),Math.max(70,dur-20)))},at));
       at+=dur+70});
      at+=300})};
    if($('c1pl'))$('c1pl').onclick=()=>play(false);
    if($('c1snd'))$('c1snd').onclick=()=>play(true);
   }}],
 ['cifcaesar','cifcaes','Cæsars brev','Klassikeren: hvert bogstav er skubbet det samme antal plader frem i alfabetet','🏛️','linear-gradient(135deg,#e63946,#ffb703)',
  {pts:1,
   ins:'🏛️ Cæsar-koden: alle bogstaver er flyttet det samme antal pladser frem i alfabetet (…X, Y, Z, Æ, Ø, Å – og forfra på A). Nøglen viser hvor langt der er skubbet.',
   build(ci){ci.n=3+(ci.plain.length*7)%26;
    ci.html=c1words(ci.plain,L=>{const t=shL(L,ci.n);ci.map[t]=L;return '<i class="c1t c1til" data-c1="'+t+'">'+t+'</i>'})},
   key(ci){let o='<div class="c1key">🔑 Skift: <b>'+ci.n+'</b> plader frem i alfabetet</div>';
    if(ci.band===0)o+='<div class="c1strip"><div class="r">'+[...ALPHA].map(c=>'<span class="l">'+c+'</span>').join('')+'</div><div class="r c1r2">'+[...ALPHA].map(c=>'<span class="l">'+shL(c,ci.n)+'</span>').join('')+'</div></div>';
    return o},
   meta:ci=>ci.band===0?'Bogstaverne i stregen under nøglen viser, hvad hvert bogstav bliver til.':''}],
 ['cifspejl','cifspjl','Spejlbrev','Koden, der kun kan læses i spejl – se, om dine øjne kan vendes','🪞','linear-gradient(135deg,#4cc9f0,#c77dff)',
  {pts:1,
   ins:'🪞 Teksten er spejlvendt, som når den ses i en spejl-væg. Læs den bagfra – bogstavformerne er vendt om. Prøv at holde skærmen op mod et vindue!',
   build(ci){ci.mode=ci.band%2===0?'w':'l';
    ci.html=c1words(ci.plain,L=>{ci.map[L]=L;return '<i class="c1t c1til'+(ci.mode==='l'?' c1lm':'')+'" data-c1="'+L+'">'+L+'</i>'},ci.mode==='w'?'c1mirw':'')},
   view(ci){return '<div class="c1mirror"></div>'+ci.html+'<div class="c1mirror"></div>'},
   meta:ci=>ci.mode==='w'?'Hele ordet er vendt – læs fra højre mod venstre i spejlet.':'Kun hvert bogstav er vendt – ordet læses stadig fra venstre mod højre.',
   hintable:()=>false,hint:null}],
  ['cifkaede','cifked','Bogstavkæden','Hvert bogstav er skubbet efter en hemmelig regel (+1, +2 …) – find mønsteret i kæden','⛓️','linear-gradient(135deg,#80ed99,#4361ee)',
  {pts:3,
   ins:'⛓️ I kæden er bogstaverne skubbet efter en regel, der skifter undervejs. Tryk på <b>?</b> under et bogstav for at se, hvor meget det er skubbet – find så reglen!',
   build(ci){ci.rule=KEDR[ci.plain.length%3];ci.enc=[];ci.sh=[];
    ci.html=c1words(ci.plain,(L,i)=>{const s=ci.rule.f(i),t=shL(L,s);
     ci.enc[i]=t;ci.sh[i]=s;ci.map[i+':'+t]=L;
     const shown=ci.shr[i]||ci.revealAll||ci.band<=1;
     return '<span class="c1lk"><i class="c1t c1til" data-c1="'+i+':'+t+'">'+t+'</i><i class="c1shq" data-k="'+i+'">'+(shown?(s>=0?'+':'')+s:'?')+'</i></span>'})},
   key(ci){return ci.band<=1?'<div class="c1key">🔑 Reglen er: <b>'+ci.rule.n+'</b></div>':'<div class="c1key">🔑 Reglen er skjult – find den selv (tryk på ? under bogstaverne)</div>'},
   hintable:ci=>ci.band>1&&!ci.revealAll,hint:ci=>{ci.revealAll=true},
   bind(ci,$){document.querySelectorAll('#main .c1shq').forEach(b=>b.onclick=()=>{const i=+b.dataset.k;ci.shr[i]=!ci.shr[i];render()})}}]
];

/* ---- registrér: KINDS, GAMES + hs5-tilpasning ---- */
DEF.forEach(def=>{
 const id=def[0],key=def[1];
 KINDS[id]=mkEngine({id:id,key:key,t:def[2],d:def[3],e:def[4],cfg:def[6]});
 GAMES.push({id:id,grp:GRP,key:key,kind:id,t:def[2],d:def[3],e:def[4],g:def[5],min:2});
})
try{const AD=window.hsAgeMode&&window.hsAgeMode.ADAPT;
 if(AD)DEF.forEach(def=>{if(!AD[def[0]])AD[def[0]]=[def[1]]})}catch(e){}

/* ---- CSS (én stylesheet, ligesom hs3.js) ---- */
try{
 const st=document.createElement('style');
 st.textContent='.c1ins{font-size:14px;text-align:left;margin:10px 0 12px;line-height:1.45}'
 +'.c1msg{display:flex;flex-wrap:wrap;gap:10px 14px;justify-content:center;align-items:center;margin:12px 0}'
 +'.c1wd{display:flex;gap:5px;align-items:flex-end}.c1ws{width:16px}'
 +'.c1t{display:inline-grid;place-items:center;font-style:normal}'
 +'.c1sym{width:clamp(34px,9vw,48px)}.c1sym svg,.c1v svg,.c1brl svg{width:100%;display:block}'
 +'.c1v{width:clamp(30px,8.2vw,42px)}.c1brl{width:clamp(24px,6.6vw,32px)}'
 +'.c1sq{width:clamp(34px,9vw,46px);height:clamp(34px,9vw,46px);border-radius:10px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.28),0 4px 10px rgba(0,0,0,.3)}'
 +'.c1til{width:clamp(30px,8vw,40px);height:clamp(38px,10vw,50px);border-radius:9px;background:linear-gradient(180deg,#1c2c63,#0b1d44);border:1px solid rgba(255,255,255,.25);font-weight:900;font-size:clamp(17px,4.6vw,24px);color:#dfe9ff;box-shadow:inset 0 -3px 6px rgba(0,0,0,.35)}'
 +'.c1mirw{transform:scaleX(-1)}.c1lm{transform:scaleX(-1)}'
 +'.c1mirror{height:3px;flex-basis:100%;max-width:420px;margin:2px auto;border-radius:3px;background:linear-gradient(90deg,transparent,#9be7ff,transparent)}'
 +'.c1m{display:inline-flex;gap:4px;align-items:center;padding:7px 9px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}'
 +'.c1d{width:12px;height:12px;border-radius:50%;background:#fca311}.c1s{width:30px;height:12px;border-radius:6px;background:#fca311}'
 +'.c1m .lit{background:#ffe066;box-shadow:0 0 14px #ffd166}.c1mrow{margin-top:2px}'
 +'.c1lk{display:inline-flex;flex-direction:column;align-items:center;gap:3px}'
 +'.c1shq{font-size:11px;font-weight:800;padding:1px 8px;border-radius:10px;background:rgba(255,255,255,.16);cursor:pointer;border:0;color:#fff}'
 +'.c1key{display:flex;flex-wrap:wrap;gap:8px 10px;justify-content:center;align-items:center;margin:10px 0;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.22)}'
 +'.c1keyt{font-weight:800;font-size:13px;opacity:.85}.c1kp{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 6px;border-radius:12px;background:rgba(0,0,0,.25)}'
 +'.c1kp svg{width:30px;display:block}.c1kp b{font-size:18px;color:#fff}'
 +'.c1smq{width:26px;height:26px;border-radius:8px;display:inline-block;box-shadow:inset 0 0 0 2px rgba(255,255,255,.28)}'
 +'.c1strip{display:grid;gap:5px;justify-content:center;margin:8px auto 0;max-width:520px}'
 +'.c1strip .r{display:flex;flex-wrap:wrap;gap:3px 5px;justify-content:center}.c1strip .l{width:15px;text-align:center;font-size:12px;font-weight:800}'
 +'.c1strip .c1r2 .l{color:#ffb703}'
 +'.c1inrow{display:flex;justify-content:center;margin:12px 0 8px}.c1inrow input{max-width:460px;width:100%}'
 +'@media (max-width:380px){.c1wd{gap:3px}.c1msg{gap:8px 10px}.c1ws{width:10px}}';
 document.head.appendChild(st);
}catch(e){}

/* ================= SELVTEST: encode→decode for ALLE ord – kører i både browser og node ================= */
window.c1Selvtest=function(verbose){
 const errs=[];const T=(c,m)=>{if(!c)errs.push(m)};
 /* tabeller */
 T(GLYPHS.length>=40,'glyf-listen har kun '+GLYPHS.length+' design (krav: 40+)');
 [...ALPHA].forEach(c=>{T(SYM[c],'sym mangler '+c);T(VINE[c],'vine mangler '+c);T(BRL[c],'brl mangler '+c);
  T(MORSE[c],'morsemangler '+c)});
 T(new Set([...ALPHA].map(c=>SYM[c])).size===ALPHA.length,'sym-glyfer er ikke alle unikke');
 T(new Set([...ALPHA].map(c=>VINE[c])).size===ALPHA.length,'vine-fragmenter er ikke alle unikke');
 T(new Set([...ALPHA].map(c=>BRL[c])).size===ALPHA.length,'braille-celler er ikke alle unikke');
 T(new Set([...ALPHA].map(c=>MORSE[c])).size===ALPHA.length,'morsetegn er ikke alle unikke');
 T(new Set(COLPAL).size===COLPAL.length,'farvepaletten har ens farver');
 /* skift */
  for(let n=-30;n<=30;n++)T(shL(shL('Æ',n),-n)==='Æ','caesar-skift '+n+' er ikke reversibel');

 T(shL('Å',1)==='A','alfabetet skal løbe i ring');
 T(shL('Z',1)==='Æ','Æ skal følge efter Z');
 /* puljer + encode→decode gennem den faktiske visning */
 DEF.forEach(def=>{
  const key=def[1],cfg=def[6],arr=DATA[key]||[];
  T(arr.length>=12,'pulje '+key+' har '+arr.length+' elementer (krav: >=12)');
  let kid=0,mid=0,gr=0;
  arr.forEach(it=>{
   T(it&&typeof it.w==='string'&&it.w.length>=2,'ugyldigt element i '+key);
   T(typeof it.age==='number'&&it.age>=5&&it.age<=16,'manglende/ugyldig age i '+key+': '+JSON.stringify(it));
   if(!it||typeof it.w!=='string')return;
   if(it.age<=9)kid++;else if(it.age<=13)mid++;else gr++;
   T(c1nz(it.w)===it.w,'klartekst ikke normaliseret i '+key+': «'+it.w+'»');
   const L=c1nz(it.w).replace(/ /g,'').length;
   if(key==='cifcol')T(L<=COLPAL.length,'for mange forskellige bogstaver i '+key+' til farvepalet: '+it.w);
   const ci={plain:c1nz(it.w),lvl:12,band:1,map:{'_':' '},k:2,shr:{},dist:c1dist(it.w).length};
   try{
    cfg.build&&cfg.build(ci);
    const back=c1decodeHtml(ci.html,ci.map);
    T(back===ci.plain,'afkod != klartekst i '+key+': «'+it.w+'» blev «'+back+'»');
    const re={plain:ci.plain,lvl:ci.lvl,band:ci.band,map:{'_':' '},k:ci.k,shr:{}};
    cfg.build&&cfg.build(re);
    T(re.html===ci.html,'visningen er ikke deterministisk/konstrueret fra koden i '+key+': '+it.w);
    /* facit må aldrig dukke op i det krypterede udstillings-HTML */
    const shown=ci.html.replace(/<[^>]*>/g,'');
    T(!new RegExp('\\b'+it.w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b').test(shown)||key==='cifspjl','klartekst lækker i chiffer-HTML: '+key+' '+it.w);
   }catch(e){errs.push('selvtest-kørsfejl i '+key+' «'+it.w+'»: '+(e&&e.message))}
  });
  T(kid>0&&mid>0&&gr>0,'pulje '+key+' mangler aldersdækning (børn/unge/voksen): '+kid+'/'+mid+'/'+gr);
 });
 if(verbose)return errs;
 return errs.length;
};

/* i browseren: log selvtesten (fejl = 0) uden at generere støj */
try{if(typeof document!=='undefined'&&!document.__c1ranTest){document.__c1ranTest=true;
 const n=window.c1Selvtest();if(n)console.error('c1 selvtest: '+n+' fejl',window.c1Selvtest(true))}}catch(e){}
})();

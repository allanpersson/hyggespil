/* Hyggespil t1: kategorien 「🧮 Tal & matematik」 med otte hyggelige bordspil – aldrig en skoleprøve:
   talgæt (varmt/koldt-gætterier), hovedregning (lynstykker i tre niveauer), talrakket (hvilket tal
   kommer næst?), overslag (tæl ord i en tekst), procentleg, sanseprøve (slik i glasset), ur & tid
   og bogstavværdi.

   VIGTIGT FOR KORREKTHED: intet facit er skrevet ind i hånden. Hvert puljeelement bærer kun
   operander, en regel, et indhold (tekst/antal) eller et klokkeslæt – selve svaret beregnes hver
   gang af t1svaret(). window.t1Selvtest() genberegner facit for ALLE puljeelementer og sammenligner
   med det gemte a0, genoptæller det viste indhold (SVG-godterier, tekstord, markerede forekomster,
   procent-pletter), verificerer talrækker mod deres regler og afprøver talgætes varme-logik med
   replay-simulering. Returnerer antal fejl (0 = alt er rigtigt). Kan køre i node med DOM-stubs.

   AKTIVERING: læg 't1' ind i fil-listen i ext.js – efter hs5.

   ALDER: hvert element er mærket age = 5 (børn 5-9), 10 (unge 10-16) eller 17 (voksen).
   Som c1.js installerer modulet sin egen draw-wrapper via HS_FINISH-kæden: når der er børn i
   gruppen, bruges window.hsAgeMode.lev(spiller) (alder + automatisk tilpasning) til at vælge
   elementer fra det passerende aldersvindue; uden hs5 bruges spillerens bare alder, kun teenagere
   => 13, kun voksne => 17. Spillene registreres i hs5's ADAPT, så de bliver mærket
   «🧒 tilpasses alderen», og rigtige/forkerte svar meldes tilbage med hsAgeMode.rec(). */
(function(){
if(window.__t1)return;window.__t1=true;

/* ---- globals: i browseren eksisterer de allerede (data.js/index.html); i node opretes de her,
   så registreringen af DATA/GAMES/KINDS ikke kræver DOM. ---- */
if(typeof DATA==='undefined')globalThis.DATA={};
if(typeof KINDS==='undefined')globalThis.KINDS={};
if(typeof GAMES==='undefined')globalThis.GAMES=[];
try{window.DATA=window.DATA||DATA;window.KINDS=window.KINDS||KINDS;window.GAMES=window.GAMES||GAMES}catch(e){}
function t1esc(s){try{return esc(s)}catch(e){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}}
function t1num(s){try{return parseNum(s)}catch(e){s=String(s).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');const v=parseFloat(s);return isNaN(v)?null:v}}
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const pad2=n=>(n<10?'0':'')+n;
/* deterministisk Byg-RNG: puljerne bliver de samme hver gang (draws «set»-historik kan huske dem) */
function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const BR=(function(){const r=rng32(20261114);return{i:function(lo,hi){return lo+Math.floor(r()*(hi-lo+1))}}})();
const GRP='🧮 Tal & matematik';
const ALPHA29=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'];
function bvValue(w){w=String(w).toUpperCase();let s=0;for(const c of w){const i=ALPHA29.indexOf(c);if(i<0)return null;s+=i+1}return s||null}

/* ================= ur- og talformater (beregnet facit, ingen lommer) ================= */
const fmtKlok=m=>'kl. '+pad2(Math.floor(m/60)%24)+':'+pad2(m%60);
const fmtVar=m=>{const t=Math.floor(m/60),f=m%60;return t?(f?t+' t '+f+' min':t+' timer'):m+' min'};
function parseKlok(s){
 s=String(s==null?'':s).toLowerCase().replace(/\s+/g,'').replace(/^kl[:.]?/,'').replace(/\./g,':').replace(/,/g,':');
 if(!s)return null;
 let m=/^(\d{1,2}):(\d{1,2})$/.exec(s);
 if(m){const h=+m[1],mi=+m[2];return h<24&&mi<60?h*60+mi:null}
 m=/^(\d{1,2})$/.exec(s);
 if(m)return +m[1]<24?+m[1]*60:null;
 return null;
}
function parseMin(s){
 s=String(s==null?'':s).toLowerCase().replace(/\s+/g,'').replace(/timer/g,'t').replace(/minutter/g,'m').replace(/min/g,'m');
 let m;
 if(m=/^(\d{1,3})t(\d{1,2})m?$/.exec(s))return +m[1]*60+ +m[2];
 if(m=/^(\d{1,3})t$/.exec(s))return +m[1]*60;
 if(m=/^(-?\d+)m$/.exec(s))return +m[1];
 if(/^-?\d+$/.test(s))return +s;
 return null;
}

/* ================= FACIT-MOTOREN: ét svar, ALDRIG hårdkodet ================= */
function t1seqArr(it){                                  /* talrakke: tallene + det skjulte svar */
 const a=[];let v=0;
 switch(it.op){
  case 'pl':for(let i=0;i<=it.n;i++)a.push(it.a+i*it.d);break;
  case 'g':for(let i=0;i<=it.n;i++)a.push(Math.round(it.a*Math.pow(it.f,i)));break;
  case 'fib':a.push(it.x,it.y);while(a.length<=it.n)a.push(a[a.length-1]+a[a.length-2]);break;
  case 'al':v=it.a;a.push(v);for(let i=1;i<=it.n;i++){v+=i%2?it.d1:it.d2;a.push(v)}break;
  case 'kv':for(let i=0;i<=it.n;i++)a.push((it.s+i)*(it.s+i));break;
  case 'plg':v=it.a;a.push(v);for(let i=1,d=it.d;i<=it.n;i++,d+=it.e){v+=d;a.push(v)}break;
  case 'dob':v=it.a;a.push(v);for(let i=1;i<=it.n;i++){v=2*v+it.c;a.push(v)}break;
 }
 return a;
}
function regTekst(it){
 switch(it.op){
  case 'p':return it.x+' + '+it.y;case 'm':return it.x+' − '+it.y;case 'g':return it.x+' · '+it.y;
  case 'd':return it.x+' : '+it.y;case 'mg':return it.x+' · '+it.y+' + '+it.z;
  case 'pg':return it.z+' · ('+it.x+' + '+it.y+')'}
 return ''
}
function t1bogMestIdx(it){let bi=0,bv=-1;it.ws.forEach((w,i)=>{const v=bvValue(w);if(v>bv){bv=v;bi=i}});return bi}
function t1svaret(it){                                  /* kaldes hver eneste gang – aldrig a0 */
 if(!it||!it.k)return null;
 switch(it.k){
  case 't1reg':switch(it.op){
   case 'p':return it.x+it.y;case 'm':return it.x-it.y;case 'g':return it.x*it.y;
   case 'd':return it.y&&it.x%it.y===0?it.x/it.y:null;case 'mg':return it.x*it.y+it.z;
   case 'pg':return (it.x+it.y)*it.z}
   return null;
  case 't1rak':{const a=t1seqArr(it);return a.length&&a.length===it.n+1?a[it.n]:null}
  case 't1est':return it.words?it.mode==='ord'?it.words.filter(w=>w===it.ord).length:it.words.length:null;
  case 't1proc':return it.mode==='af'?it.p*it.n/100:it.f*100/it.cnt;
  case 't1sans':return it.n;
  case 't1ur':return it.mode==='om'?(it.h*60+it.m+it.d)%1440:(it.h2*60+it.m2-it.h1*60-it.m1+1440)%1440;
  case 't1bog':return it.mode==='mest'?Math.max.apply(null,it.ws.map(bvValue)):bvValue(it.w);
 }
 return null;
}
function t1regel(it){
 switch(it.op){
  case 'pl':return 'læg '+it.d+' til hver gang';
  case 'g':return 'gange med '+it.f+' hver gang';
  case 'fib':return 'læg de to sidste tal sammen';
  case 'al':return 'skift mellem +'+it.d1+' og +'+it.d2;
  case 'kv':return 'kvadrater: '+it.s+'·'+it.s+', '+(it.s+1)+'·'+(it.s+1)+' …';
  case 'plg':return 'stigende spring: +'+it.d+', +'+(it.d+it.e)+', +'+(it.d+2*it.e)+' …';
  case 'dob':return 'doble op og læg '+it.c+' til'}
 return ''
}
function t1hint(it){
 switch(it.k){
  case 't1reg':{const a=t1svaret(it);if(a==null)return 'Prøv at dele regnestykket op.';
   return 'Facit er '+(a%2===0?'lige':'ulige')+' og ligger mellem '+(Math.floor(a/10)*10)+' og '+(Math.floor(a/10)*10+10)}
  case 't1rak':return 'Reglen er: '+t1regel(it);
  case 't1est':return it.mode==='ord'?('Peg på hvert ord og tæl langsomt – hvor mange gange gemmer «'+it.ord+'» sig?'):('Tæl i grupper af fem i stedet for én ad gangen');
  case 't1proc':return it.mode==='af'?('Start med 10 % af '+it.n+' = '+(it.n/10)+' og gang op til '+it.p+' %'):('Hver plet er '+(100/it.cnt)+' % af det hele');
  case 't1sans':return 'Saml øjnene i grupper af ti og gang op';
  case 't1ur':return it.mode==='mellem'?'Rund op til næste hele time – læg bagefter de løse minutter til':'Læg minutterne til og husk at uret løber videre fra 59 til 00';
  case 't1bog':return it.mode==='mest'?'Tel kun værdierne af de to ord med flest bogstaver':it.mode==='lig'?('Facitordet har '+it.w.length+' bogstaver og starter med '+it.w[0]+' = '+(ALPHA29.indexOf(it.w[0])+1)):('Det første bogstav alene er værd '+(ALPHA29.indexOf(it.w[0])+1));
 }
 return 'Gæt løs!'
}

/* ================= PULJE 1: talgæt – KUN intervaller; tallet genereres hver runde af koden ================= */
DATA.t1tal=[
 {q:'1–20',lo:1,hi:20,age:5},{q:'1–30',lo:1,hi:30,age:5},{q:'5–50',lo:5,hi:50,age:5},
 {q:'1–100',lo:1,hi:100,age:10},{q:'20–200',lo:20,hi:200,age:10},{q:'1–150',lo:1,hi:150,age:10},
 {q:'1–1000',lo:1,hi:1000,age:17},{q:'100–2000',lo:100,hi:2000,age:17},{q:'1–5000',lo:1,hi:5000,age:17}
].map(x=>(x.k='t1tal',x.pts=2,x));
const T1TEMP=[['🔥','BRÆNDER','#ff3d3d'],['🥵','VARM','#ff7b00'],['🌡️','LUNKEN','#ffd60a'],['❄️','KOLD','#4cc9f0'],['🧊','ISKOLD','#90e0ef']];
function t1tempIdx(d,best){if(best==null||d===best)return 2;if(d<best)return d*2<best?0:1;return d>best*3?4:d>best*1.6?3:2}
function t1tgPts(n,range){const hard=range>1000?5:range>100?4:3;return Math.max(1,Math.min(4,hard-((n-1)/2|0)))}

/* ================= PULJE 2: hovedregning (opbygget af operander) ================= */
DATA.t1reg=(function(){
 const out=[],seen=new Set();
 function push(op,x,y,z,age){
  const it={k:'t1reg',op:op,x:x,y:y,age:age,pts:age<=9?1:age<=16?2:3};
  if(z!=null)it.z=z;
  const a=t1svaret(it);
  if(a==null||!Number.isInteger(a))return;
  const cap=age<=9?25:age<=16?250:1200;
  if(a>cap||a<-(age<=16?1:250))return;
  it.q=regTekst(it);
  if(seen.has(it.q))return;
  seen.add(it.q);it.a0=a;out.push(it)}
 for(let i=0;i<18;i++)push('p',BR.i(2,15),BR.i(2,15),null,5);
 for(let i=0;i<16;i++){const y=BR.i(2,12);push('m',y+BR.i(1,12),y,null,5)}
 for(let i=0;i<12;i++)push('g',BR.i(2,6),BR.i(2,6),null,5);
 for(let i=0;i<10;i++)push('p',BR.i(12,79),BR.i(11,48),null,10);
 for(let i=0;i<10;i++)push('m',BR.i(40,99),BR.i(11,39),null,10);
 for(let i=0;i<14;i++)push('g',BR.i(3,14),BR.i(3,9),null,10);
 for(let i=0;i<8;i++){const q=BR.i(3,9),y=BR.i(3,9);push('d',q*y,y,null,10)}
 for(let i=0;i<8;i++)push('mg',BR.i(3,9),BR.i(4,9),BR.i(2,9),10);
 for(let i=0;i<10;i++)push('g',BR.i(13,29),BR.i(4,19),null,17);
 for(let i=0;i<6;i++)push('m',BR.i(10,99),BR.i(35,160),null,17);
 for(let i=0;i<6;i++){const y=BR.i(6,25);push('d',BR.i(6,40)*y,y,null,17)}
 for(let i=0;i<8;i++)push('mg',BR.i(11,29),BR.i(4,9),BR.i(2,19),17);
 for(let i=0;i<6;i++)push('pg',BR.i(10,40),BR.i(10,40),BR.i(4,9),17);
 return out})();

/* ================= PULJE 3: talrakket (reglen genererer hele rækken) ================= */
DATA.t1rak=(function(){
 const out=[],seen=new Set();
 function push(spec){
  spec.k='t1rak';
  const a=t1seqArr(spec);
  if(a.length!==spec.n+1)return;
  const last=a[a.length-1];
  if(!Number.isInteger(last)||last>4000)return;
  for(let i=1;i<a.length;i++)if(a[i]<=a[i-1])return;
  spec.q=a.slice(0,spec.n).join(' · ')+' · ?';
  if(seen.has(spec.q))return;
  seen.add(spec.q);spec.a0=last;out.push(spec)}
 for(let i=0;i<10;i++)push({op:'pl',a:BR.i(1,6),d:BR.i(1,5),n:4,age:5,pts:1});
 for(let i=0;i<6;i++)push({op:'g',a:BR.i(1,2),f:2,n:4,age:5,pts:1});
 push({op:'kv',s:1,n:4,age:5,pts:1});
 for(let i=0;i<4;i++)push({op:'al',a:BR.i(1,5),d1:BR.i(2,4),d2:BR.i(1,3),n:4,age:5,pts:1});
 for(let i=0;i<3;i++)push({op:'fib',x:BR.i(1,2),y:BR.i(2,4),n:4,age:5,pts:1});
 for(let i=0;i<8;i++)push({op:'pl',a:BR.i(2,9),d:BR.i(4,9),n:5,age:10,pts:2});
 for(let i=0;i<8;i++)push({op:'g',a:BR.i(2,3),f:BR.i(2,3),n:5,age:10,pts:2});
 for(let i=0;i<8;i++)push({op:'fib',x:BR.i(2,6),y:BR.i(3,7),n:5,age:10,pts:2});
 for(let i=0;i<4;i++)push({op:'kv',s:BR.i(2,4),n:5,age:10,pts:2});
 for(let i=0;i<8;i++)push({op:'al',a:BR.i(2,9),d1:BR.i(3,9),d2:BR.i(3,9),n:5,age:10,pts:2});
 for(let i=0;i<6;i++)push({op:'pl',a:BR.i(3,15),d:BR.i(7,17),n:6,age:17,pts:3});
 for(let i=0;i<3;i++)push({op:'g',a:BR.i(2,4),f:3,n:6,age:17,pts:3});
 push({op:'g',a:2,f:4,n:5,age:17,pts:3});
 for(let i=0;i<5;i++)push({op:'fib',x:BR.i(4,11),y:BR.i(5,13),n:5,age:17,pts:3});
 for(let i=0;i<4;i++)push({op:'kv',s:BR.i(5,9),n:5,age:17,pts:3});
 for(let i=0;i<5;i++)push({op:'plg',a:BR.i(1,5),d:BR.i(1,4),e:BR.i(1,3),n:6,age:17,pts:3});
 for(let i=0;i<4;i++)push({op:'dob',a:BR.i(2,6),c:BR.i(1,7),n:6,age:17,pts:3});
 for(let i=0;i<4;i++)push({op:'al',a:BR.i(3,12),d1:BR.i(11,19),d2:BR.i(2,8),n:6,age:17,pts:3});
 return out})();

/* ================= PULJE 4: overslag – facit tælles FRA TEKSTENS EGET INDHOLD ================= */
const T1ORD=['SOL','SKY','REGN','VIND','BÅD','KYST','GRUS','TRÆ','BLAD','BLOMST','STI','HUND','KAT','HEST','GRIS','KO','GED','HØNE','AND','MUS','RÆV','ULV','BJØRN','HVAL','DELFIN','UGLE','SVANE','PAPIR','BLYANT','BOG','TASKE','KAGE','BOLLE','MÆLK','SUKKER','SMØR','OST','ÆBLE','PÆRE','BANAN','JORDBÆR','HIMMEL','HAV','BJERG','FJORD','SKOV','ENG','SNE','IS','STOL','BORD','LAMPE','DØR','VINDUE','TAG'];
DATA.t1est=(function(){
 const out=[];
 function push(mode,age){
  const it={k:'t1est',mode:mode,age:age,pts:age<=9?1:age<=16?2:3};
  const n=age<=9?BR.i(18,30):age<=16?BR.i(40,64):BR.i(70,105);
  const ord=new Array(n).fill(null);
  if(mode==='ord'){
   it.ord=T1ORD[BR.i(0,T1ORD.length-1)];
   const occ=BR.i(age<=9?3:age<=16?5:8,age<=9?6:age<=16?9:14);
   let lagt=0,tryk=0;
   while(lagt<occ&&tryk<300){tryk++;const p=BR.i(0,n-1);if(!ord[p]){ord[p]=it.ord;lagt++}}
   if(lagt<occ)return;
   for(let j=0;j<n;j++)if(!ord[j])ord[j]=T1ORD[(j*7+BR.i(0,T1ORD.length-1))%T1ORD.length];
  }else{
   for(let j=0;j<n;j++)ord[j]=T1ORD[(j*11+BR.i(0,T1ORD.length-1))%T1ORD.length];
  }
  it.words=ord;
  const a=t1svaret(it);
  if(a==null||!Number.isInteger(a))return;
  it.q=(mode==='ord'?'Overslag: hvor mange «'+it.ord+'» gemmer sig?':'Overslag: hvor mange ord i alt?')+' ('+age+') nr '+(out.length+1);
  it.a0=a;out.push(it)}
 for(let i=0;i<4;i++)push('ord',5);
 for(let i=0;i<3;i++)push('antal',5);
 for(let i=0;i<4;i++)push('ord',10);
 for(let i=0;i<3;i++)push('antal',10);
 for(let i=0;i<4;i++)push('ord',17);
 for(let i=0;i<3;i++)push('antal',17);
 return out})();

/* ================= PULJE 5: procentleg – pct/produkt beregnes og er altid et heltal ================= */
DATA.t1proc=(function(){
 const out=[];
 function push(it){
  it.k='t1proc';
  const a=t1svaret(it);
  if(a==null||!Number.isInteger(a)||a<1||a>1900)return;
  it.q=(it.mode==='grid'?'Procent: '+it.f+' blå af '+it.cnt+' pletter':it.mode==='del'?'Procent: '+it.f+' ud af '+it.cnt:'Procent: '+it.p+' % af '+it.n)+' nr '+(out.length+1);
  it.a0=a;out.push(it)}
 function grid(age){const ks=age<=9?[4,5,10]:age<=16?[10,20,25]:[20,25,40,50];const cnt=ks[BR.i(0,ks.length-1)];
  for(let t=0;t<40;t++){const f=BR.i(1,cnt-1);if((100*f)%cnt===0){push({mode:'grid',cnt:cnt,f:f,age:age,pts:age<=9?1:age<=16?2:3});return}}}
 function del(age){const bs=age<=9?[4,5,10]:age<=16?[10,20,25,50]:[20,25,40,50];const cnt=bs[BR.i(0,bs.length-1)];
  for(let t=0;t<40;t++){const f=BR.i(1,cnt-1);if((100*f)%cnt===0&&f!==cnt/2){push({mode:'del',cnt:cnt,f:f,age:age,pts:age<=9?1:age<=16?2:3});return}}}
 function af(age){const ps=age<=9?[10,50]:age<=16?[10,20,25,50,75]:[5,15,35,40,60,85];
  for(let t=0;t<60;t++){const p=ps[BR.i(0,ps.length-1)],n=BR.i(1,12)*20;
   if((p*n)%100===0){push({mode:'af',p:p,n:n,age:age,pts:age<=9?1:age<=16?2:3});return}}}
 for(let i=0;i<4;i++)grid(5);
 for(let i=0;i<4;i++)af(5);
 for(let i=0;i<4;i++)grid(10);
 for(let i=0;i<4;i++)del(10);
 for(let i=0;i<5;i++)af(10);
 for(let i=0;i<3;i++)grid(17);
 for(let i=0;i<3;i++)del(17);
 for(let i=0;i<5;i++)af(17);
 return out})();

/* ================= PULJE 6: sanseprøve – glasset tegner NOSTEMT så mange stykker som facit ================= */
const T1GL=[{em:'🍬',b:'slik i glasset'},{em:'🫐',b:'blåbær i skålen'},{em:'⭐',b:'stjerner på tallerkenen'},{em:'🟢',b:'ærter i posen'}];
DATA.t1sans=(function(){
 const out=[];
 for(let bi=0;bi<3;bi++){const age=[5,10,17][bi];
  for(let t=0;t<4;t++){const g=T1GL[(bi*7+t)%T1GL.length];
   const n=age<=9?BR.i(8,18):age<=16?BR.i(16,45):BR.i(40,88);
   out.push({k:'t1sans',em:g.em,b:g.b,n:n,seed:700+out.length*37,age:age,pts:age<=9?1:age<=16?2:3,a0:n,
    q:'Sanseprøve: '+g.b+' med '+n})}}
 return out})();

/* ================= PULJE 7: ur og tid – begge svar beregnes i minutter ================= */
DATA.t1ur=(function(){
 const out=[];
 function push(it){
  it.k='t1ur';
  const a=t1svaret(it);
  if(a==null||!Number.isInteger(a))return;
  if(it.mode==='mellem'?(a<1||a>1439):!(a>=0&&a<=1439))return;
  it.q=(it.mode==='mellem'?'Fra '+fmtKlok(it.h1*60+it.m1)+' til '+fmtKlok(it.h2*60+it.m2):'Om '+it.d+' min fra '+fmtKlok(it.h*60+it.m))+' nr '+(out.length+1);
  it.a0=a;out.push(it)}
 const M5=[0,30];
 for(let i=0;i<4;i++){const h1=BR.i(1,9);push({mode:'mellem',h1:h1,m1:M5[BR.i(0,1)],h2:h1+BR.i(1,3),m2:M5[BR.i(0,1)],age:5,pts:1})}
 for(let i=0;i<4;i++)push({mode:'om',h:BR.i(1,10),m:M5[BR.i(0,1)],d:[15,30,45,60][BR.i(0,3)],age:5,pts:1});
 for(let i=0;i<5;i++){const h1=BR.i(7,16),m1=BR.i(0,11)*5,slut=h1*60+m1+BR.i(35,190);push({mode:'mellem',h1:h1,m1:m1,h2:Math.floor(slut/60)%24,m2:slut%60,age:10,pts:2})}
 for(let i=0;i<5;i++)push({mode:'om',h:BR.i(8,20),m:BR.i(0,11)*5,d:BR.i(2,19)*5,age:10,pts:2});
 for(let i=0;i<5;i++){const s1=BR.i(0,1439),gap=BR.i(35,480);push({mode:'mellem',h1:Math.floor(s1/60),m1:s1%60,h2:Math.floor((s1+gap)/60)%24,m2:(s1+gap)%60,age:17,pts:3})}
 for(let i=0;i<5;i++){const s=BR.i(0,1439);push({mode:'om',h:Math.floor(s/60),m:s%60,d:BR.i(15,165),age:17,pts:3})}
 return out})();

/* ================= PULJE 8: bogstavværdi – alle værdier summeres af koden (A=1 … Å=29) ================= */
const T1BANK={
 5:['SOL','KAT','MUS','BOLD','HUND','KAGE','SNE','BIL','TRÆ','PÆRE','MÆLK','BRØD','FUGL','SKO','TAND','NÆSE','REGN','BANAN'],
 10:['PARAPLY','SKOLEBOG','BLYANT','RYGSÆK','KØKKEN','SNEKOP','SOLBRIL','TELEFON','FISKEDAM','VINTER','SOMMER','BLOMST'],
 17:['SOMMERFUGL','TANDBØRSTE','KIRSEBÆRTRÆ','SKATTEJÆGER','BIBLIOTEK','SOLSTRENGET','SOLBRILLER','FJENDSKAB','TRAMPOLIN','BØRNEHAVE','SKOLEHJEMMET','HISSESMØREGRØD']};
DATA.t1bog=(function(){
 const out=[],seen=new Set();
 const mk=it=>{if(seen.has(it.q))return;seen.add(it.q);it.a0=t1svaret(it);if(it.a0!=null)out.push(it)};
 for(const age of[5,10,17]){const bank=T1BANK[age],pts=age<=9?2:3;
  for(let i=0;i<4;i++)mk({k:'t1bog',mode:'værdi',w:bank[i%bank.length],age:age,pts:pts,q:'BV:'+bank[i%bank.length]});
  for(let i=0;i<3;i++){
   for(let s=i,t=0;t<30;t++,s++){
    const l=bank.length,ws=[bank[s%l],bank[(s+4)%l],bank[(s+7)%l]];
    const vs=ws.map(bvValue),mx=Math.max.apply(null,vs);
    if(vs.filter(v=>v===mx).length===1&&mx-Math.max.apply(null,vs.filter((v,j)=>j!==vs.indexOf(mx)))>=4){
     mk({k:'t1bog',mode:'mest',ws:ws,age:age,pts:pts,q:'BM'+s+':'+ws.join('/')});break}}
  }
  for(let i=0;i<2;i++)mk({k:'t1bog',mode:'lig',w:bank[(i*5+2)%bank.length],age:age,pts:pts,v:bvValue(bank[(i*5+2)%bank.length]),q:'BL'+age+'-'+i+':'+bank[(i*5+2)%bank.length]});
 }
 return out})();

/* ================= INDHOLDS-BYGERE: alt det viste genereres fra puljen – facit medfører automatisk ================= */
function t1dotsHTML(it){const r=rng32((it.cnt+1)*97+it.f*13+7);
 const idx=[...Array(it.cnt).keys()];
 for(let i=it.cnt-1;i>0;i--){const j=(r()*i)|0;const tmp=idx[i];idx[i]=idx[j];idx[j]=tmp}
 return '<div class="t1grid">'+idx.map(i=>'<i class="'+(i<it.f?'t1dot t1dotf':'t1dot t1dotg')+'"></i>').join('')+'</div>'}
function t1urSVG(h,m){const ha=((h%12)+m/60)*30,ma=m*6;
 let s='<svg viewBox="0 0 100 100" class="t1clock"><circle cx="50" cy="50" r="46" class="t1skive"/>';
 for(let i=0;i<12;i++)s+='<line x1="50" y1="8" x2="50" y2="14" class="t1tal" transform="rotate('+i*30+' 50 50)"/>';
 s+='<line x1="50" y1="50" x2="50" y2="27" class="t1time" transform="rotate('+ha.toFixed(1)+' 50 50)"/>';
 s+='<line x1="50" y1="50" x2="50" y2="17" class="t1minut" transform="rotate('+ma+' 50 50)"/>';
 return s+'<circle cx="50" cy="50" r="3" class="t1navn"/></svg>'}
function t1glass(it){const r=rng32(it.seed),fs=it.n<=20?30:it.n<=45?24:19;
 let s='<svg viewBox="0 0 180 240" class="t1svg"><rect class="t1la" x="34" y="14" width="112" height="16" rx="8"/>'+
  '<path class="t1glas" d="M42 36 h96 v186 a12 12 0 0 1 -12 12 h-72 a12 12 0 0 1 -12 -12 z"/>';
 for(let i=0;i<it.n;i++){const x=50+r()*80,y=64+r()*(186-fs);
  s+='<text class="t1gl" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-size="'+fs+'">'+it.em+'</text>'}
 return s+'</svg>'}
function t1tælrækker(it){let s='<div class="t1rows">';
 for(let k=0;k<it.n;k+=10){
  s+='<div class="t1rad"><i>'+Math.min(k+10,it.n)+'</i>';
  for(let j=k;j<Math.min(k+10,it.n);j++)s+='<span class="t1c">'+it.em+'</span>';
  s+='</div>'}
 return s+'</div><p class="hint t1taellen">Tæl med: 10 ad gangen – i alt '+it.n+'.</p>'}
const t1low=w=>String(w).toLowerCase();
function t1tekstHTML(it,reveal){
 const W=it.words;
 if(it.mode==='ord'&&reveal){
  let s='<div class="t1tekst">';
  for(let k=0;k<W.length;k++)s+=W[k]===it.ord?'<b class="t1w t1hi">'+t1low(W[k])+'</b>':'<span class="t1w">'+t1low(W[k])+'</span>';
  return s+'</div>'}
 if(it.mode==='antal'&&reveal){
  let s='<div class="t1tekst">';
  for(let k=0;k<W.length;k++){
   if(k%10===0)s+='<div class="t1linje"><i class="t1i">'+Math.min(k+10,W.length)+'&nbsp;</i>';
   s+='<span class="t1w">'+t1low(W[k])+'</span>';
   if(k%10===9||k===W.length-1)s+='</div>'}
  return s+'</div>'}
 return '<div class="t1tekst">'+W.map(w=>'<span class="t1w">'+t1low(w)+'</span>').join('')+'</div>'}
function t1alphaHTML(){
 return '<div class="t1alpha">'+ALPHA29.map((c,i)=>'<b>'+c+'<small>'+(i+1)+'</small></b>').join('')+'</div>'}
function t1wordTiles(w){return '<div class="t1seq">'+[...w].map(c=>'<i>'+t1esc(c)+'</i>').join('')+'</div>'}
function t1facitTekst(it){
 switch(it.k){
  case 't1reg':return it.q+' = '+t1svaret(it);
  case 't1rak':return t1seqArr(it)[it.n]+'';
  case 't1proc':return it.mode==='af'?t1svaret(it)+'':t1svaret(it)+' %';
  case 't1ur':return it.mode==='om'?fmtKlok(t1svaret(it)):fmtVar(t1svaret(it))+' ('+t1svaret(it)+' min)';
  case 't1bog':return t1svaret(it)+''}
 return ''+t1svaret(it)}
function t1nedbrydning(it){
 switch(it.k){
  case 't1rak':return 'Reglen var: '+t1regel(it)+' → '+t1seqArr(it).join(' · ');
  case 't1proc':return it.mode==='af'?(it.p+' % af '+it.n+' = '+it.n+' · '+it.p+' : 100 = '+t1svaret(it)):(it.f+' · 100 : '+it.cnt+' = '+t1svaret(it)+' %');
  case 't1ur':{const s1=it.mode==='om'?it.h*60+it.m:it.h1*60+it.m1,s2=it.mode==='om'?t1svaret(it):it.h2*60+it.m2;
   return it.mode==='om'?(fmtKlok(s1)+' + '+it.d+' min = '+fmtKlok(s2)):(s2<s1?'Fra '+fmtKlok(s1)+' hen over midnat til '+fmtKlok(s2)+' = '+t1svaret(it)+' min':'Fra '+fmtKlok(s1)+' til '+fmtKlok(s2)+' = '+t1svaret(it)+' min = '+fmtVar(t1svaret(it)))}
  case 't1bog':{const a=t1svaret(it),w=it.mode==='mest'?it.ws[t1bogMestIdx(it)]:it.w;
   return [...w].map(c=>c+'='+(ALPHA29.indexOf(c)+1)).join(' + ')+' = '+a}
 }
 return ''}

/* ================= ALDERSTILPASNING (eget niveau som c1 – uden at røre hs5) ================= */
function t1IsKid(p){try{const m=window.hsAgeMode;if(m&&m.isKid)return m.isKid(p)}catch(e){}return !!p&&p.age>0&&p.age<=14}
function t1Level(){
 try{
  if(typeof players==='undefined'||!players||!players.length)return 17;
  const kids=players.filter(t1IsKid),minors=players.filter(p=>!t1IsKid(p)&&p&&p.age>0&&p.age<18);
  if(!kids.length)return minors.length?13:17;
  let mx=5;
  kids.forEach(p=>{let l=null;
   try{const m=window.hsAgeMode;if(m&&m.lev)l=m.lev(p)}catch(e){}
   if(!(l>0))l=Math.max(5,Math.min(16,p.age||8));
   if(l>mx)mx=l});
  return Math.min(16,mx)
 }catch(e){return 17}}
function t1Filter(list,L){
 if(L==null)L=t1Level();
 const hi=a=>a<=9?9:a<=16?16:99,mid=a=>a<=9?7:a<=16?13:25;
 let m=list.filter(x=>x.age!=null&&x.age<=L&&hi(x.age)>=L);
 if(!m.length)m=[...list].sort((a,b)=>Math.abs(mid(a.age)-L)-Math.abs(mid(b.age)-L)).slice(0,Math.min(6,list.length));
 return m.length?m:list}
function installDraw(){
 if(installDraw.done)return;installDraw.done=true;
 const d0=window.draw;
 window.draw=function(gk,list){
  try{if(T1P[gk]&&list&&list.length&&list[0]&&list[0].age!=null)list=t1Filter(list)}
  catch(e){}
  return d0.apply(this,arguments)}}
try{const f0=window.HS_FINISH;window.HS_FINISH=function(){f0&&f0();installDraw()}}catch(e){installDraw()}
/* rigtige/forkerte svar meldes tilbage til hs5's niveaustyring (anlægger midlertidigt en runde) */
function t1rec(i,ok){try{
 const A=window.hsAgeMode;if(!A||!A.rec||!A.isKid)return;
 if(typeof players==='undefined'||!players[i]||!A.isKid(players[i]))return;
 if(typeof g==='undefined'||!g)return;
 const p=players[i],prev=g.lv;
 g.lv={i:i,kid:true,kq:false,minor:!!A.isMinor&&A.isMinor(p),age:p.age||null,lvl:A.lev(p),solo:true};
 A.rec(i,!!ok);
 g.lv=prev}catch(e){}}

/* ================= SPILMOTOREN: ét design, otte spil (view-afbrydelse som w1.js) ================= */
const T1P={
 'talgæt':{key:'t1tal',e:'🌡️',t:'Hvilket tal er tænkt?',d:'Skærmen tænker et tal – I gætter, og varmen viser vejen',g2:'#ff7b00,#ffd60a'},
 'hovedregning':{key:'t1reg',e:'⚡',t:'Hovedregning',d:'Lynhurtige stykker i tre niveauer – ingen lommer!',g2:'#4361ee,#4cc9f0'},
 'talrakket':{key:'t1rak',e:'🪜',t:'Talrækket',d:'Hvilket tal kommer næst? Reglen gemmer sig i mønsteret',g2:'#8f6bff,#f15bb5'},
 'overslag':{key:'t1est',e:'📖',t:'Overslag',d:'Hvor mange ord gemmer teksten? Skærmen tæller facit',g2:'#0ead69,#80ed99'},
 'procentleg':{key:'t1proc',e:'💯',t:'Procentleg',d:'Hvor mange procent? Pletter, dele og procenter af tal',g2:'#ff5d8f,#8f6bff'},
 'sanseprøve':{key:'t1sans',e:'🍬',t:'Sanseprøven',d:'Hvor mange stykker er der i glasset? Øjnene gætter, skærmen ved det',g2:'#f15bb5,#ff9e4a'},
 'uret':{key:'t1ur',e:'🕐',t:'Ur & tid',d:'Hvor længe er der? Hvad viser uret om lidt?',g2:'#118ab2,#4cc9f0'},
 'bogstavværdi':{key:'t1bog',e:'💎',t:'Bogstavværdi',d:'A=1 … Å=29 – find ordets værdi eller det bedste ord',g2:'#ffb703,#06d6a0'}};
const T1INS={
 'talgæt':'🌡️ Tryk <b>Vis det hemmelige tal</b>, husk det og gem det igen. Nu gætter I højt på skift og skriver gættet: skærmen melder <b>varmt eller koldt</b>. Færrest gæt vinder!',
 'hovedregning':'⚡ Regn på hovedet – uden blyant og uden lommer. Hvem ved det først? Skriv svaret og tryk Tjek.',
 'talrakket':'🪜 Tallene følger én hemmelig regel. Hvilket tal kommer efter spørgsmålstegnet? Skriv det i feltet.',
 'overslag':'📖 Skøn uden at tælle efter – skriv jeres bud hemmeligt. Facit tælles af skærmen fra teksten, så I selv kan kontrollere det.',
 'procentleg':'💯 Skøn eller udregn: hvor mange procent? Skriv tallet uden %-tegn.',
 'sanseprøve':'🍬 Kig godt: hvad tror I, der er i glasset? Skriv jeres bud hemmeligt. Ved afsløring tæller skærmen op 10 og 10, så alle kan være dommer.',
 'uret':'🕐 Skriv svar i <b>minutter</b> (fx 95 eller 1t35) eller et klokkeslæt som <b>hh:mm</b>, hvis I skal finde et tidspunkt.',
 'bogstavværdi':'💎 Bogstavværdier: A=1, B=2 … Z=26, Æ=27, Ø=28, Å=29. Læg sammen – uden lommer.'};
const t1ageTag=it=>'<span class="tag">'+(it.age<=9?'🧒 5-9 år':it.age<=16?'🎓 10-16 år':'🍷 voksen')+'</span>';
function t1head(st){const M=T1P[view]||{e:'🧮',t:'Tal & matematik'};
 return '<div class="row"><span class="tag">'+M.e+' '+t1esc(M.t)+'</span>'+t1ageTag(st.it)+
  (st.lvl<=16?'<span class="tag">👶 niveau '+st.lvl+' år</span>':'')+'</div><p class="hint t1ins">'+T1INS[view]+'</p>'}
function t1qHTML(it){
 switch(it.k){
  case 't1reg':return '<div class="t1q">'+t1esc(it.q)+'</div>';
  case 't1rak':{const a=t1seqArr(it);return '<div class="t1seq">'+a.slice(0,it.n).map(v=>'<i>'+v+'</i>').join('')+'<i class="t1sp">?</i></div>'}
  case 't1proc':
   if(it.mode==='grid')return '<div class="t1q">Hvilken procentdel af pletterne er <b>blå</b>?</div>'+t1dotsHTML(it);
   if(it.mode==='del')return '<div class="t1q">'+it.f+' ud af '+it.cnt+' – hvor mange procent er det?</div>';
   return '<div class="t1q">'+it.p+' % af '+it.n+' – hvad bliver det til?</div>';
  case 't1ur':
   if(it.mode==='om')return '<div class="t1clocks">'+t1urSVG(it.h,it.m)+'</div><div class="t1q">Hvad viser uret om <b>'+it.d+'</b> minutter?</div>';
   return '<div class="t1clocks">'+t1urSVG(it.h1,it.m1)+'<span class="t1pil">➜</span>'+t1urSVG(it.h2,it.m2)+'</div><div class="t1q">Hvor lang tid er der<small>Skriv svaret i minutter</small></div>';
  case 't1bog':return t1wordTiles(it.w)+t1alphaHTML();
 }
 return ''}
function t1quizRender(st){
 const it=st.it;let o=t1qHTML(it);
 if(!st.done){
  const ph=it.k==='t1ur'&&it.mode==='om'?'kl. 14:35':'Skriv svaret';
  o+='<div class="t1inrow"><input class="in" id="t1in" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="'+ph+'" value="'+t1esc(st.in||'')+'"></div>';
  o+='<div class="row"><button class="btn green" id="t1ok">✅ Tjek</button>'+
   ((it.age<=9||st.fails>=1)&&!st.hint?'<button class="btn" id="t1hint">💡 Hint</button>':'')+
   '<button class="btn ghost" id="t1rev">👁️ Se facit</button></div>';
  if(st.hint)o+='<p class="hint">💡 '+t1esc(st.hint)+'</p>';
  if(st.err)o+='<p class="hint t1bad">❌ '+t1esc(st.err)+'</p>';
  o+='<p class="hint">Rigtigt svar: +'+st.pts+' point.</p>';
 }else{
  o+='<div class="ans">'+t1esc(t1facitTekst(it))+'</div><p class="hint t1ned">'+'🧮 '+t1esc(t1nedbrydning(it))+'</p>';
  if(st.solved)o+='<p class="hint">🎉 Rigtigt! Hvem havde det? <b>+'+st.pts+' point</b> (flere kan få point)</p>'+awardChips(st.pts,-1)+
   '<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Ingen – næste opgave →</button></div>';
  else o+='<div class="row"><button class="btn big green" id="nx">Næste opgave →</button></div>';
 }
 return o}
function t1tgRender(st){
 const it=st.it;let o='';
 if(!st.done){
  o+=st.shown?'<div class="ans">'+st.svar+'</div><p class="hint">Husk tallet – og lad vær med at hviske!</p><div class="row"><button class="btn ghost" id="t1hide">🙈 Gem igen</button></div>'
       :'<div class="row"><button class="btn big" id="t1show">🙈 Vis det hemmelige tal</button></div>';
  if(st.hist.length)o+='<div class="t1hist">'+st.hist.map(h=>'<span class="t1tmp" style="background:'+T1TEMP[h.t][2]+'">'+h.g+' · '+T1TEMP[h.t][1]+'</span>').join('')+'</div>';
  else o+='<p class="hint">Interval: <b>'+it.lo+'–'+it.hi+'</b> · første gæt melder udgangspunktet.</p>';
  o+='<div class="t1inrow"><input class="in" id="t1in" inputmode="numeric" autocomplete="off" placeholder="Skriv årets gæt" value="'+t1esc(st.in||'')+'"></div>';
  o+='<div class="row"><button class="btn green" id="t1ok">🌡️ Vurdier gættet</button><button class="btn ghost" id="t1rev">🏳️ Giv op – vis tallet</button></div>';
  if(st.err)o+='<p class="hint t1bad">❌ '+t1esc(st.err)+'</p>';
 }else{
  o+='<div class="ans">'+st.svar+'</div>';
  if(st.solved)o+='<p class="hint">🎉 Ramt efter '+st.hist.length+' gæt! <b>+'+st.pts+' point</b></p>'+awardChips(st.pts,-1)+
   '<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Næste tal →</button></div>';
  else o+='<p class="hint">Tallet var '+st.svar+' – bedre held næste gang.</p><div class="row"><button class="btn big green" id="nx">Næste tal →</button></div>';
 }
 return o}
function t1bidRender(st){
 const it=st.it;let o='';
 if(it.k==='t1sans'){
  const sp=it.b.indexOf(' ');
  o+='<div class="t1q">Hvor mange '+t1esc(it.b.slice(0,sp))+' er der '+t1esc(it.b.slice(sp))+'?</div>'+t1glass(it);
 }else if(it.mode==='ord'){
  o+='<div class="t1q">Hvor mange gange gemmer «<b>'+t1esc(it.ord)+'</b>» sig i teksten?</div>'+t1tekstHTML(it,false);
 }else{
  o+='<div class="t1q">Hvor mange ord står der i teksten?</div>'+t1tekstHTML(it,false);
 }
 if(!st.reveal){
  o+='<div class="est">'+players.map((p,i)=>'<div class="p" style="--c:'+p.c+'"><b>'+t1esc(p.n)+'</b><input class="in" type="password" autocomplete="off" inputmode="numeric" id="t1b'+i+'" placeholder="bud (skjult)"></div>').join('')+'</div>';
  o+='<div class="row"><button class="btn big" id="t1las">🔒 Lås og afslør facit 🥁</button></div>';
 }else{
  const a=t1svaret(it);
  o+='<div class="ans">'+a+(it.k==='t1est'&&it.mode==='ord'?' gange':'')+'</div>';
  o+='<p class="hint">Facit er talt direkte fra indholdet – optællingen nedenfor viser hvert enkelt, så I selv kan være dommer.</p>';
  if(it.k==='t1sans')o+=t1glass(it)+t1tælrækker(it);
  else if(it.mode==='antal')o+=t1tekstHTML(it,true);
  else o+='<p class="hint">De fremhævede ord i teksten ovenfor er facit.</p>';
  o+='<div class="t1res">'+players.map((p,i)=>'<span class="t1p" style="--c:'+p.c+'">'+
   (st.win.indexOf(i)>=0?'🏆 ':'')+(st.near.indexOf(i)>=0?'👍 ':'')+t1esc(p.n)+': <b>'+st.vals[i]+'</b>'+
   (st.win.indexOf(i)>=0?' +2':st.near.indexOf(i)>=0?' +1':'')+'</span>').join('')+'</div>';
  o+='<p class="hint">🏆 tættest +2 · 👍 inden for 20 % +1</p>';
  o+='<div class="row"><button class="btn big green" id="nx">Næste runde →</button></div>';
 }
 return o}
function t1bvRender(st){
 const it=st.it;let o=t1alphaHTML();
 if(it.mode==='mest'){
  o+='<div class="t1q">Hvilket af de tre ord er <b>mest</b> værd?</div>';
  o+='<div class="t1wordrow">'+it.ws.map((w,i)=>'<button class="t1word'+(st.pick===i?' valgt':'')+'" data-t1w="'+i+'">'+t1esc(w)+'</button>').join('')+'</div>';
  if(!st.done)o+='<div class="row"><button class="btn big" id="t1go">Afslør værdierne 💎</button><button class="btn ghost" id="t1rev">Giv op</button></div>';
  else{
   const mi=t1bogMestIdx(it);
   o+='<div class="t1fa">'+it.ws.map((w,i)=>'<span class="'+(i===mi?'t1korrekt':'')+'">'+t1esc(w)+' = '+bvValue(w)+'</span>').join('')+'</div>';
   o+='<p class="hint">Bedste ord: <b>'+t1esc(it.ws[mi])+'</b> ('+bvValue(it.ws[mi])+')'+
    (st.pick==null?' – ingen havde valgt':(st.pick===mi?' – rigtigt valgt! 🎉':' – I valgte '+t1esc(it.ws[st.pick])+', desværre'))+'</p>';
   if(st.pick===mi)o+=awardChips(st.pts,-1)+'<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Ingen – næste →</button></div>';
   else o+='<div class="row"><button class="btn big green" id="nx">Næste ordvalg →</button></div>';
  }
 }else{
  o+='<div class="t1q">Hvilket dansk ord er værdi præcis <b>'+it.v+'</b> point?</div>';
  o+='<p class="hint">Tænk i hovedet, sig det højt og skriv det i feltet – skærmen lægger bogstaverne sammen for jer.</p>';
  if(st.prove&&st.prove.length)o+='<div class="t1fa">'+st.prove.map(p=>'<span class="'+(p.v===it.v?'t1korrekt':'')+'">'+t1esc(p.w)+' = '+p.v+'</span>').join('')+'</div>';
  if(!st.done){
   o+='<div class="t1inrow"><input class="in" id="t1in" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="Skriv et ord" value="'+t1esc(st.in||'')+'"></div>';
   o+='<div class="row"><button class="btn green" id="t1ok">🔤 Tjek ord</button><button class="btn ghost" id="t1rev">Se et facitord</button></div>';
   if(st.err)o+='<p class="hint t1bad">❌ '+t1esc(st.err)+'</p>';
  }else{
   o+='<div class="ans">'+t1esc(it.w)+' = '+bvValue(it.w)+'</div><p class="hint t1ned">'+'🧮 '+t1esc(t1nedbrydning(it))+'</p>';
   if(st.solved)o+='<p class="hint">🎉 Præcis! Dommeren godkender ordet. <b>+'+st.pts+' point</b> – flere kan nå det!</p>'+
    '<div class="row">'+players.map((p,i)=>'<div class="chip aw" data-t1aw="'+i+'" data-t1pts="'+st.pts+'" style="--c:'+p.c+'">'+t1esc(p.n)+' +'+st.pts+'</div>').join('')+'</div>'+
    '<div class="row" style="margin-top:12px"><button class="btn big green" id="nx">Færdig – næste →</button></div>';
   else o+='<div class="row"><button class="btn big green" id="nx">Næste orden →</button></div>';
  }
 }
 return o}
function t1quizTjek(st){
 const it=st.it,raw=st.in||'';
 let v=it.k==='t1ur'?(it.mode==='om'?parseKlok(raw):parseMin(raw)):t1num(raw);
 if(v===null){st.err=it.k==='t1ur'&&it.mode==='om'?'Skriv et klokkeslæt, fx 14:35':'Skriv et tal, fx '+(it.k==='t1ur'?'95':'42');return render()}
 if(v===t1svaret(it)){st.done=true;st.solved=true;st.err='';boom();return render()}
 st.fails++;st.err='«'+raw+'» er desværre ikke rigtigt. Prøv igen!';st.in='';render();
}
function t1tgTjek(st){
 const raw=st.in||'',v=t1num(raw);
 if(v===null||!Number.isInteger(v)){st.err='Skriv et helt tal, fx 42';return render()}
 const it=st.it;
 if(v<it.lo||v>it.hi){st.err='Tallet ligger mellem '+it.lo+' og '+it.hi+' – prøv igen!';return render()}
 const d=Math.abs(v-st.svar);
 st.hist.push({g:v,t:t1tempIdx(d,st.best)});
 st.best=st.best===null?d:Math.min(st.best,d);
 st.in='';st.err='';
 if(d===0){st.done=true;st.solved=true;st.pts=t1tgPts(st.hist.length,it.hi-it.lo);boom()}
 render();
}
function t1lasBud(st){
 const f=i=>document.getElementById('t1b'+i);
 const vals=players.map((_,i)=>{const el=f(i);return t1num(el?el.value:'')});
 if(vals.some(v=>v===null)){players.forEach((_,i)=>{const el=f(i);if(el&&vals[i]===null)el.classList.add('shake')});return}
 const a=t1svaret(st.it);
 if(a===null)return;
 const ds=vals.map(v=>Math.abs(v-a)),mn=Math.min.apply(null,ds),tol=Math.max(2,Math.ceil(a*0.2));
 st.vals=vals;
 st.win=ds.map((d,i)=>d===mn?i:-1).filter(i=>i>=0);
 st.near=ds.map((d,i)=>i).filter(i=>st.win.indexOf(i)<0&&ds[i]<=tol);
 st.win.forEach(i=>{add(i,2);t1rec(i,true)});
 st.near.forEach(i=>{add(i,1);t1rec(i,false)});
 players.forEach((_,i)=>{if(st.win.indexOf(i)<0&&st.near.indexOf(i)<0)t1rec(i,false)});
 st.reveal=true;boom();render();
}
function t1bvOrdTjek(st){
 const w=String(st.in||'').toUpperCase().replace(/[^A-ZÆØÅ]/g,'');
 if(!w){st.err='Skriv et ord (kun bogstaver)';return render()}
 const v=bvValue(w);
 if(st.prove.length>=40)st.prove.shift();
 st.prove.push({w:w,v:v});st.in='';st.err='';
 if(v===t1svaret(st.it)){st.done=true;st.solved=true;boom()}
 render();
}
KINDS.t1={
 init(){
  const it=g.item,st={it:it,done:false,solved:false,fails:0,in:'',err:'',hint:'',lvl:17,pts:2,reveal:false};
  try{st.lvl=t1Level()}catch(e){}
  if(it){
   st.pts=it.pts||2;
   if(it.k==='t1tal'){st.svar=it.lo+rnd(it.hi-it.lo+1);st.hist=[];st.best=null;st.shown=false}
   if(it.k==='t1est'||it.k==='t1sans'){st.reveal=false;st.win=[];st.near=[];st.vals=null}
   if(it.k==='t1bog'&&it.mode==='mest')st.pick=null;
   if(it.k==='t1bog'&&it.mode==='lig')st.prove=[];
  }
  g.t1=st;
 },
 render(){
  const st=g.t1;
  if(!st||!st.it)return '<div class="card glass"><div class="q">🧮 Der er tomt i puljen – vælg et andet spil</div><div class="row"><button class="btn big green" id="nx">Til menuen →</button></div></div>';
  const it=st.it;
  let o='<div class="card glass t1card">'+t1head(st);
  if(it.k==='t1tal')o+=t1tgRender(st);
  else if(it.k==='t1est'||it.k==='t1sans')o+=t1bidRender(st);
  else if(it.k==='t1bog'&&it.mode!=='værdi')o+=t1bvRender(st);
  else o+=t1quizRender(st);
  return o+'</div>';
 },
 bind(){
  const st=g.t1;if(!st||!st.it||g.done)return;
  const $=id=>document.getElementById(id);
  const inp=$('t1in');
  if(inp){inp.oninput=()=>{st.in=inp.value};inp.onkeydown=e=>{if(e.key==='Enter'){const b=$('t1ok');if(b)b.onclick(null)}}}
  if($('t1ok'))$('t1ok').onclick=()=>{
   if(st.it.k==='t1tal')t1tgTjek(st);
   else if(st.it.k==='t1bog'&&st.it.mode==='lig')t1bvOrdTjek(st);
   else t1quizTjek(st)};
  if($('t1hint'))$('t1hint').onclick=()=>{st.hint=t1hint(st.it);render()};
  if($('t1rev'))$('t1rev').onclick=()=>{st.done=true;st.solved=false;players.forEach((_,i)=>t1rec(i,false));render()};
  if($('t1show'))$('t1show').onclick=()=>{st.shown=true;render()};
  if($('t1hide'))$('t1hide').onclick=()=>{st.shown=false;render()};
  if($('t1las'))$('t1las').onclick=()=>t1lasBud(st);
  if($('t1go'))$('t1go').onclick=()=>{st.done=true;render()};
  document.querySelectorAll('#main .t1word').forEach(b=>{b.onclick=()=>{st.pick=+b.dataset.t1w;render()}});
  document.querySelectorAll('#main [data-t1aw]').forEach(b=>{b.onclick=()=>{add(+b.dataset.t1aw,+b.dataset.t1pts||2);boom()}});
 }
};

/* ================= REGISTRERING: GAMES + hs5-ADAPT (mærkes «tilpasses alderen») ================= */
Object.keys(T1P).forEach(id=>{const M=T1P[id];
 GAMES.push({id:id,grp:GRP,key:M.key,kind:'t1',t:M.t,d:M.d,e:M.e,g:'linear-gradient(135deg,'+M.g2+')',min:2})});
try{const AD=window.hsAgeMode&&window.hsAgeMode.ADAPT;
 if(AD)Object.keys(T1P).forEach(id=>{if(!AD[id])AD[id]=[T1P[id].key]})}catch(e){}
/* rigtige svar via point-chips ⇒ barnets niveau stiger; afsløret uden svar ⇒ det kan falde */
try{const bg0=window.bindGame;
 if(typeof bg0==='function')window.bindGame=function(){const r=bg0.apply(this,arguments);
  try{if(g&&g.t1&&!g.done)document.querySelectorAll('#main [data-award],#main [data-t1aw]').forEach(c=>{
   if(c.dataset.t1rec)return;c.dataset.t1rec='1';
   const o=c.onclick;
   c.onclick=function(){const i=+(c.dataset.award!=null?c.dataset.award:c.dataset.t1aw);if(i>=0)t1rec(i,true);return o&&o.apply(this,arguments)}})}
  catch(e){}
  return r}}catch(e){}

/* ================= CSS (én stylesheet, responsiv ned til 380px) ================= */
try{
 const stl=document.createElement('style');
 stl.textContent=
 '.t1ins{text-align:left;font-size:14px;line-height:1.45;margin:10px 0 12px}'+
 '.t1q{font-size:clamp(19px,3.6vw,30px);font-weight:800;line-height:1.35;text-align:center;margin:10px 0 14px}'+
 '.t1q small{display:block;font-size:13px;font-weight:600;color:var(--mut)}'+
 '.t1seq{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}'+
 '.t1seq i{font-style:normal;min-width:clamp(42px,12vw,62px);padding:10px 6px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid var(--line);font-weight:900;font-size:clamp(16px,4.2vw,24px);text-align:center}'+
 '.t1seq .t1sp{background:linear-gradient(135deg,#ffb703,#ff5d8f);color:#111;border:0}'+
 '.t1grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:440px;margin:10px auto}'+
 '.t1dot{width:clamp(18px,4.8vw,26px);height:clamp(18px,4.8vw,26px);border-radius:50%;display:inline-block}'+
 '.t1dotf{background:#4cc9f0;box-shadow:0 0 10px rgba(76,201,240,.5)}'+
 '.t1dotg{background:#58607a}'+
 '.t1clocks{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;margin:8px 0}'+
 '.t1clock{width:clamp(92px,26vw,130px);height:clamp(92px,26vw,130px)}'+
 '.t1skive{fill:rgba(255,255,255,.10);stroke:rgba(255,255,255,.35);stroke-width:2}'+
 '.t1tal{stroke:rgba(255,255,255,.5);stroke-width:2}'+
 '.t1time{stroke:#fff;stroke-width:4.5;stroke-linecap:round}'+
 '.t1minut{stroke:#ffb703;stroke-width:3;stroke-linecap:round}'+
 '.t1navn{fill:#fff}.t1pil{font-size:24px}'+
 '.t1svg{width:min(70vw,280px);height:auto;display:block;margin:6px auto}'+
 '.t1glas{fill:rgba(200,235,255,.10);stroke:rgba(220,245,255,.6);stroke-width:3}'+
 '.t1la{fill:rgba(220,245,255,.28);stroke:rgba(220,245,255,.5);stroke-width:2}'+
 '.t1gl{font-size:20px}'+
 '.t1tekst{display:flex;flex-wrap:wrap;gap:4px 9px;justify-content:center;font-size:clamp(13px,3.4vw,18px);font-weight:600;background:rgba(0,0,0,.22);border:1px dashed var(--line);padding:14px;border-radius:16px;margin:10px 0;line-height:1.8}'+
 '.t1w{white-space:nowrap}'+
 '.t1hi{background:#ffb703;color:#111;border-radius:6px;padding:0 4px}'+
 '.t1linje{display:flex;flex-basis:100%;flex-wrap:wrap;gap:4px 9px;align-items:baseline}'+
 '.t1i{font-style:normal;font-size:11px;opacity:.6;font-weight:800}'+
 '.t1res{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}'+
 '.t1p{background:rgba(255,255,255,.08);border:2px solid var(--c);border-radius:16px;padding:8px 14px;font-weight:700}'+
 '.t1hist{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}'+
 '.t1tmp{padding:6px 12px;border-radius:20px;font-weight:800;color:#111;font-size:15px}'+
 '.t1wordrow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px 0}'+
 '.t1word{padding:12px 16px;border-radius:16px;font-weight:800;font-size:clamp(15px,3.8vw,20px);background:rgba(255,255,255,.12);border:2px solid var(--line);color:#fff}'+
 '.t1word.valgt{border-color:#ffb703;box-shadow:0 0 16px rgba(255,183,3,.5)}'+
 '.t1fa{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;font-weight:700}'+
 '.t1fa span{background:rgba(255,255,255,.1);padding:6px 12px;border-radius:14px}'+
 '.t1korrekt{outline:2px solid #80ed99}'+
 '.t1bad{color:#ff9db1!important}'+
 '.t1ned{margin:6px 0 2px}'+
 '.t1inrow{display:flex;justify-content:center;margin:12px 0 8px}'+
 '.t1inrow input{max-width:420px;width:100%}'+
 '.t1alpha{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:8px 0}'+
 '.t1alpha b{background:rgba(255,255,255,.1);border-radius:9px;padding:3px 6px;font-size:12px;font-weight:800}'+
 '.t1alpha small{color:#ffb703;margin-left:3px;font-weight:900}'+
 '.t1rows{margin:8px auto;max-width:420px}'+
 '.t1rad{display:flex;gap:7px;align-items:center;justify-content:center;margin:2px 0;font-size:clamp(15px,4vw,20px)}'+
 '.t1rad i{font-style:normal;font-size:11px;opacity:.6;min-width:30px;text-align:right;font-weight:800}'+
 '.t1c{display:inline-block}'+
 '.t1taellen{margin-top:6px}'+
 '@media (max-width:380px){.t1seq i{min-width:38px;padding:8px 4px}.t1grid{gap:6px}.t1tekst{gap:3px 6px;padding:10px}.t1clock{width:88px;height:88px}.t1hist{gap:6px}}';
 document.head.appendChild(stl);
}catch(e){}

/* ================= SELVTEST: genberegner ALT – kører i både browser og node ================= */
window.t1Selvtest=function(verbose){
 const E=[];let N=0;
 const ok=(c,m)=>{N++;if(!c)E.push(m)};
 const antal=(s,k)=>(((String(s)).match(new RegExp(k,'g')))||[]).length;
 /* --- registrering og motor --- */
 ok(KINDS.t1&&KINDS.t1.init&&KINDS.t1.render&&KINDS.t1.bind,'KINDS.t1-motoren mangler');
 const IDS=Object.keys(T1P);
 IDS.forEach(id=>{
  const x=Array.isArray(GAMES)?GAMES.find(y=>y.id===id):null;
  ok(!!x,'spillet er ikke registreret i GAMES: '+id);
  if(x){ok(x.grp===GRP,id+': forkert kategori');ok(x.min===2,id+': skal kunne spilles fra 2 spillere');
   ok(x.kind==='t1',id+': ukendt kind');ok(x.key===T1P[id].key,id+': forkert puljenøgle')}});
 try{const A=window.hsAgeMode&&window.hsAgeMode.ADAPT;if(A)IDS.forEach(id=>ok(!!A[id],'hs5-ADAPT mangler: '+id))}catch(e){}
 /* --- fælles krav til alle puljer: facit genberegnes for ethvert element --- */
 const KRAV={t1tal:9,t1reg:35,t1rak:18,t1est:15,t1proc:20,t1sans:12,t1ur:18,t1bog:18};
 for(const key in KRAV){
  const arr=DATA[key]||[];
  ok(arr.length>=KRAV[key],key+': pulje på '+arr.length+' (krav mindst '+KRAV[key]+')');
  ok(!arr.some((x,i)=>arr.some((y,j)=>j>i&&x.q===y.q)),key+': alle opgaver har unik q');
  [5,10,17].forEach(b=>ok(arr.some(x=>x.age===b),key+': mangler aldersband '+b+' år'));
  arr.forEach(it=>{
   ok(it.k===key,key+': k-felt fejl på '+it.q);
   ok(typeof it.pts==='number'&&it.pts>0,key+': point fastsat: '+it.q);
   if(it.a0===undefined)return;
   let a=null;
   try{a=t1svaret(it)}catch(e){E.push(key+': facit-kørselsfejl: '+it.q+' '+(e&&e.message));return}
   ok(a!==null&&Number.isFinite(a),key+': facit kunne ikke beregnes: '+it.q);
   ok(a===it.a0,key+': genberegnet facit != gemt: '+it.q+' ('+a+' vs '+it.a0+')');
   ok(t1svaret(it)===a,key+': facit er ikke deterministisk: '+it.q);
   ok(Number.isInteger(a),key+': facit skal være heltal: '+it.q);
   try{const h=t1hint(it);ok(typeof h==='string'&&h.length>6,key+': manglende hint: '+it.q)}catch(e){E.push(key+': hint fejlede: '+it.q+' '+(e&&e.message))}
  });
 }
 /* --- aldersfiltret trækning --- */
 ok(t1Filter(DATA.t1reg,7).every(x=>x.age===5),'barn på 7 skal trække børnestykker');
 ok(t1Filter(DATA.t1reg,13).every(x=>x.age===10),'13-årige skal trække unge-stykker');
 ok(t1Filter(DATA.t1reg,17).every(x=>x.age===17),'voksne skal trække voksenstykker');
 ok(t1Filter(DATA.t1reg,16).length>0,'vinduet 10-16 år må ikke være tomt');
 ok(t1Filter(DATA.t1bog,6).every(x=>x.age===5),'bogstavværdi til de mindste');
 /* --- 1) talgæt: intervaller, varme-regler og replay-simulering --- */
 [1,2,5,10,37].forEach(b=>{let sidst=-1;
  for(let d=0;d<=b*4+12;d++){const t=t1tempIdx(d,b);ok(t>=sidst,'varmen skal stige monotont med afstanden (bedste '+b+', gæt '+d+')');sidst=t}});
 ok(t1tempIdx(1,10)===0&&t1tempIdx(9,10)===1&&t1tempIdx(11,10)===2&&t1tempIdx(20,10)===3&&t1tempIdx(40,10)===4,'varme-ordene sidder forkert');
 ok(t1tgPts(1,50)===3&&t1tgPts(1,1000)===4&&t1tgPts(1,5000)===4&&t1tgPts(5,50)===1&&t1tgPts(20,5000)===1,'point for få gæt skal følge intervallets sværhedsgrad');
 const t1replayOK=(x,hist)=>{let b=null;for(const h of hist){const d=Math.abs(x-h.g);if(t1tempIdx(d,b)!==h.t)return false;b=b===null?d:Math.min(b,d)}return true};
 (DATA.t1tal||[]).forEach(it=>{
  ok(it.lo>=1&&it.hi>it.lo&&it.hi<=9999,'talgæt-interval er ugyldigt: '+it.q);
  for(let w=0;w<2;w++){
   const r=rng32(999+w*7717+it.hi*13+it.lo);
   const s=it.lo+Math.floor(r()*(it.hi-it.lo+1));
   let best=null;const hist=[];
   const steps=Math.min(50,it.hi-it.lo+1);
   for(let i=0;i<steps;i++){
    const gg=it.lo+Math.floor(r()*(it.hi-it.lo+1)),d=Math.abs(gg-s);
    hist.push({g:gg,t:t1tempIdx(d,best)});
    best=best===null?d:Math.min(best,d);
    if(d===0)break}
   ok(t1replayOK(s,hist),'varme-meldingerne lyver for det tænkte tal: '+it.q);
   let cnt=0;for(let v=it.lo;v<=it.hi;v++)if(t1replayOK(v,hist))cnt++;
   ok(cnt>=1&&cnt<=it.hi-it.lo+1,'replay-mængden er meningsløs: '+it.q)}
  if(it.hi-it.lo<=29){                       /* systematisk gennemgang skal kunne isolere tallet */
   const s=it.lo+((it.hi-it.lo)*7+3)%(it.hi-it.lo+1);
   let best2=null;const hist2=[];
   for(let gg=it.lo;gg<=it.hi;gg++){const d=Math.abs(gg-s);hist2.push({g:gg,t:t1tempIdx(d,best2)});best2=best2===null?d:Math.min(best2,d);if(d===0)break}
   let c2=0;for(let v=it.lo;v<=it.hi;v++)if(t1replayOK(v,hist2))c2++;
   ok(c2===1,'gennemgang + varme isolerer ikke tallet ('+it.q+'): '+c2+' kandidater')}
 });
 /* --- 2) hovedregning: facit skal passe til operanderne --- */
 (DATA.t1reg||[]).forEach(it=>{
  const a=it.a0;
  ok(regTekst(it)===it.q,'opgavetekst matcher ikke operanderne: '+it.q);
  const fin={p:1,m:1,g:1,d:1,mg:1,pg:1}[it.op]===1;
  ok(fin,'ukendt regneart: '+it.op);
  if(!fin)return;
  const pas=
   it.op==='p'?(a-it.x===it.y&&a-it.y===it.x):
   it.op==='m'?(a+it.y===it.x):
   it.op==='g'?(it.x>1&&it.y>1&&a/it.x===it.y):
   it.op==='d'?(it.x%it.y===0&&it.x/it.y===a):
   it.op==='mg'?(it.z>0&&a-it.z===it.x*it.y):
   (it.z>0&&a/it.z===it.x+it.y);
  ok(pas,'facit passer ikke til operanderne: '+it.q);
  const cap=it.age<=9?30:it.age<=16?260:1300;
  ok(a<=cap,it.q+': for stort resultat til aldersbandet');
  ok(it.age>9||a>=0,it.q+': børn skal ikke have negative svar');
 });
 /* --- 3) talrakket: rækken skal kunne rekonstrueres fra reglen --- */
 const setty=new Set();
 (DATA.t1rak||[]).forEach(it=>{
  setty.add(it.op);
  const a=t1seqArr(it);
  ok(a.length===it.n+1,it.q+': rækkens længde');
  ok(a[a.length-1]===it.a0,it.q+': facit er sidste led');
  for(let i=1;i<a.length;i++)ok(a[i]>a[i-1],it.q+': rækken skal vokse');
  ok(a.slice(0,it.n).join(' · ')+' · ?'===it.q,it.q+': opgaveteksten er ikke genereret fra rækken');
  const last=a[it.n],forrige=a[it.n-1],nedforrige=a[it.n-2];
  if(it.op==='pl')ok(last-forrige===it.d&&forrige-a[0]===(it.n-1)*it.d,'ligelig regel +'+it.d+' holder ikke');
  if(it.op==='g')ok(last===forrige*it.f,'gange-reglen holder ikke');
  if(it.op==='fib')ok(last===forrige+nedforrige,'fibonacci-reglen holder ikke');
  if(it.op==='al')ok(last-forrige===(it.n%2?it.d1:it.d2),'den alternerende regel holder ikke');
  if(it.op==='kv')ok((it.s+it.n)*(it.s+it.n)===last,'kvadratreglen holder ikke');
  if(it.op==='plg')ok((last-forrige)-(forrige-nedforrige)===it.e,'de stigende spring holder ikke');
  if(it.op==='dob')ok(last===2*forrige+it.c,'doble-og-lægtil-reglen holder ikke');
 });
 ['pl','g','fib','al','kv','plg','dob'].forEach(o=>ok(setty.has(o),'reglen «'+o+'» mangler i talrakket'));
 /* --- 4) overslag: genoptælling fra teksten selv --- */
 (DATA.t1est||[]).forEach(it=>{
  ok(it.words.length>=15&&it.words.length<=120,it.q+': tekstlængde');
  ok(it.words.every(w=>/^[A-ZÆØÅ]{2,16}$/.test(w)),it.q+': teksten må kun indeholde rene ord');
  ok(it.mode==='ord'||it.mode==='antal','ukendt overslagstilstand: '+it.mode);
  ok(antal(t1tekstHTML(it,false),'class="t1w"')===it.words.length,it.q+': HTML-tabellen mister ord');
  if(it.mode==='ord'){
   ok(T1ORD.includes(it.ord),it.q+': måleordet er ikke fra ordbanken');
   ok(it.words.filter(w=>w===it.ord).length===it.a0,it.q+': måleordets antal genberegnet');
   ok(it.a0>=3,it.q+': mindst tre forekomster');
   ok(antal(t1tekstHTML(it,true),'class="t1w t1hi"')===it.a0,it.q+': fremhævede forekomster != facit');
  }else{
   ok(it.a0===it.words.length,it.q+': antal ord genberegnet');
   ok(antal(t1tekstHTML(it,true),'class="t1i"')===Math.ceil(it.words.length/10),it.q+': linjetal pr. 10');
  }
 });
 ok(new Set(DATA.t1est.map(x=>x.mode)).size===2,'begge overslagstyper skal være i puljen');
 /* --- 5) procentleg: pct-krydstjek og optalt plette-HTML --- */
 (DATA.t1proc||[]).forEach(it=>{
  const a=it.a0;
  ok(['grid','del','af'].includes(it.mode),'ukendt procenttilstand: '+it.mode);
  if(it.mode==='af'){ok(it.p>0&&it.p<100&&it.n>=20&&it.n<=240,'rammer for procent af tal: '+it.q);
   ok(a*100===it.p*it.n,'procent-af-tal passer ikke: '+it.q)}
  else{ok(it.f>0&&it.f<it.cnt&&it.cnt>=4&&it.cnt<=50,'del/hele skal passe: '+it.q);
   ok(a*it.cnt===100*it.f,'procentdelen passer ikke: '+it.q);
   const h=t1dotsHTML(it);
   ok(antal(h,'class="t1dot')===it.cnt,it.q+': pletter i HTML != opgaven');
   ok(antal(h,'t1dotf')===it.f,it.q+': farvede pletter != facit');
   ok(antal(t1dotsHTML(it),'t1dotf')===it.f,'plettefordelingen er ikke deterministisk: '+it.q)}
 });
 /* --- 6) sanseprøve: glasset og tællerækkerne skal vise præcis facit-antal --- */
 (DATA.t1sans||[]).forEach(it=>{
  ok(Number.isInteger(it.n)&&it.n>=5&&it.n<=90,'antal stykker er urimeligt: '+it.q);
  ok(Number.isInteger(it.seed),'seed skal være heltal');
  ok(!!it.em&&[...it.em].length<=2,'emoji for godteriet');
  const g1=t1glass(it);
  ok(g1.startsWith('<svg')&&g1.endsWith('</svg>'),'SVG-fejl: '+it.q);
  ok(antal(g1,'class="t1gl"')===it.n,'glasset tegner ikke facit-antal: '+it.q);
  const r2=t1tælrækker(it);
  ok(antal(r2,'class="t1c"')===it.n,'tællerækkerne tæller forkert: '+it.q);
  ok(antal(r2,'class="t1rad"')===Math.ceil(it.n/10),'rækker af ti');
 });
 /* --- 7) ur og tid: genberegning, formater og urets geometri --- */
 (DATA.t1ur||[]).forEach(it=>{
  const a=it.a0;
  ok(it.mode==='mellem'||it.mode==='om','ukendt urtilstand: '+it.q);
  const h=it.mode==='om'?it.h:it.h1,m=it.mode==='om'?it.m:it.m1;
  ok(h>=0&&h<24&&m>=0&&m<60,'tidsparametre: '+it.q);
  if(it.mode==='mellem'){
   ok(a>=1&&a<=1439,'varigheden skal være gyldig: '+it.q);
   const s1=it.h1*60+it.m1,s2=it.h2*60+it.m2;
   ok((s2-s1+1440)%1440===a,'varigheden passer ikke: '+it.q);
   ok(parseMin(fmtVar(a))===a,'format af varigheden kan ikke læses: '+it.q);
  }else{
   ok(a>=0&&a<=1439,'tidspunktet er gyldigt: '+it.q);
   ok(it.d>=5&&it.d<=200,'minutter frem: '+it.q);
   ok((it.h*60+it.m+it.d)%1440===a,'det fremtidige tidspunkt passer ikke: '+it.q);
   ok(parseKlok(fmtKlok(a))===a,'format af uret kan ikke læses: '+it.q);
  }
  const c1=t1urSVG(h,m),ha=((h%12)+m/60)*30;
  ok(c1.indexOf('transform="rotate('+ha.toFixed(1)+' 50 50)"')>=0,'timeviserens vinkel er ikke genereret fra uret: '+it.q);
 });
 ok(parseKlok('kl. 7:05')===425&&parseKlok('16.20')===980&&parseKlok('16,20')===980&&parseKlok('23:59')===1439&&parseKlok('9')===540,'parseKlok er i stykker');
 ok(parseKlok('24:00')===null&&parseKlok('14:75')===null&&parseKlok('1475')===null&&parseKlok('')===null&&parseKlok('i aften')===null,'parseKlok afviser ikke skrammel');
 ok(parseMin('155')===155&&parseMin('2t35')===155&&parseMin('2 t 35 min')===155&&parseMin('3 timer')===180&&parseMin('-14')===-14&&parseMin('95m')===95,'parseMin er i stykker');
 ok(parseMin('a')===null&&parseMin('')===null,'parseMin afviser ikke skrammel');
 /* --- 8) bogstavværdi: summer, ensartethed og unik max --- */
 ok(ALPHA29.length===29,'det danske alfabet skal have 29 bogstaver');
 ok(bvValue('A')===1&&bvValue('Z')===26&&bvValue('Æ')===27&&bvValue('Ø')===28&&bvValue('Å')===29,'bogstavværdierne skal følge A=1 … Å=29');
 ok(bvValue('AB')===3&&bvValue('iS')===28&&bvValue('123')===null,'bogstavværdi opfører sig pænt');
 (DATA.t1bog||[]).forEach(it=>{
  ok(['værdi','mest','lig'].includes(it.mode),'ukendt bogstavværdi-tilstand: '+it.q);
  if(it.mode==='mest'){
   ok(it.ws.length===3,'tre ord at vælge imellem: '+it.q);
   ok(it.ws.every(w=>/^[A-ZÆØÅ]{3,16}$/.test(w)),it.q+': rene danske bogstaver');
   const vs=it.ws.map(bvValue),mx=Math.max.apply(null,vs),mi=vs.indexOf(mx);
   ok(vs.filter(v=>v===mx).length===1,'vinderen skal være unik: '+it.q);
   ok(mx-Math.max.apply(null,vs.filter((v,j)=>j!==mi))>=4,'for snævert margin til bedst-2: '+it.q);
   ok(it.a0===mx&&t1bogMestIdx(it)===mi,'mest-facit passer ikke: '+it.q);
  }else{
   ok(/^[A-ZÆØÅ]{3,16}$/.test(it.w),it.q+': ordet er ikke rent');
   let s=0;for(const c of it.w)s+=ALPHA29.indexOf(c)+1;
   ok(bvValue(it.w)===s&&it.a0===s,'værdien genberegnes ikke korrekt: '+it.q);
   if(it.mode==='lig')ok(it.v===it.a0&&it.v>0,'lig-værdien skal passe: '+it.q);
  }
 });
 /* --- alt indhold rent for personlige data/mærker (grov check) --- */
 for(const key in KRAV)(DATA[key]||[]).forEach(it=>{
  ok(!/\d{5,}/.test(JSON.stringify(it)),key+': mistænkelig talssnare for personligt nummer i '+it.q)});
 if(verbose)return E;
 return E.length;
};

/* ================= i browseren: kør selvtesten ved indlæsning og log kun ved fejl ================= */
try{if(typeof document!=='undefined'&&!document.__t1ranTest){document.__t1ranTest=true;
 const n=window.t1Selvtest();if(n)console.error('t1 selvtest: '+n+' fejl',window.t1Selvtest(true))}}catch(e){}
})();

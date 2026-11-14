/* Kildetjek-lag + ingen gentagelser + afsløring kræver alle stemmer + SVÆRE mysterier. HS_VF (vf.js): rm=[id,...] fjerner, fix={id:punkt} erstatter. id = pulje|tekst (se HS_ID). */
(function(){
const SKIP=['mys'];
const J=a=>a.join(' | ');
window.HS_ID=function(k,i){let t;
 if(typeof i==='string')t=i;
 else if(k==='tl'&&Array.isArray(i.a))t=J(i.a);
 else if(k==='rather')t=i.a+' | '+i.b;
 else if(k==='odd'&&Array.isArray(i.o))t=J(i.o);
 else if(k==='who')t=i.a;
 else if(k==='taboo')t=i.w;
 else if(k==='geo')t=i.c;
 else if(k==='tf'&&i.s)t=i.s;
 else if(i.q)t=i.q;
 else t=JSON.stringify(i);
 return k+'|'+String(t)};
const NZ=s=>String(s).toLowerCase().replace(/[^a-zæøå0-9]/g,'');
const f0=window.HS_FINISH;
window.HS_FINISH=function(){f0&&f0();
 try{const vf=window.HS_VF||{rm:[],fix:{}},rm=new Set(vf.rm||[]),fx=vf.fix||{};
  for(const k in DATA){if(!Array.isArray(DATA[k])||SKIP.includes(k))continue;const seen=new Set();
   DATA[k]=DATA[k].map(i=>{const id=window.HS_ID(k,i),nk=NZ(id);if(rm.has(id)||seen.has(nk))return null;seen.add(nk);return fx[id]?fx[id]:i}).filter(Boolean)}
 }catch(e){console.error('HS vf',e)}
 try{DATA.mys=Array.from({length:400},(_,n)=>({t:'Mysterie',s:'Mysterie '+(n+1),c:['x','y','z'],p:['a','b','c'],a:0,seed:n}))}catch(e){}};
const e0=window.HS_EXTRA;
window.HS_EXTRA=function(x){e0&&e0(x);
 try{const vf=window.HS_VF||{rm:[],fix:{}},rm=new Set(vf.rm||[]);
  for(const k in DATA){if(!Array.isArray(DATA[k])||SKIP.includes(k))continue;const seen=new Set();
   DATA[k]=DATA[k].filter(i=>{const id=window.HS_ID(k,i),nk=NZ(id);if(rm.has(id)||seen.has(nk))return false;seen.add(nk);return true})}
 }catch(e){console.error('HS vf2',e)}};
window.HS_DUMP=function(){const o={};for(const k in DATA){if(!Array.isArray(DATA[k])||SKIP.includes(k))continue;o[k]=DATA[k].map(i=>({id:window.HS_ID(k,i),item:i}))}return o};

/* ---- ingen gentagelser i samme session ---- */
const SS={get(k){try{return JSON.parse(sessionStorage.getItem('hs_ses2_'+k)||'[]')}catch(e){return []}},set(k,v){try{sessionStorage.setItem('hs_ses2_'+k,JSON.stringify(v))}catch(e){}}};
const MEM={};
const d0=window.draw;
const K=x=>NZ(idOf(x));
window.draw=function(gk,list){
 if(gk==='mys'){try{return window.HS_MYS()}catch(e){console.error('HS mys',e)}}
 let seen=MEM[gk];if(!seen){seen=MEM[gk]=new Set(SS.get(gk))}
 let av=list.filter(x=>!seen.has(K(x)));
 if(!av.length){seen.clear();av=list}
 const it=av[Math.random()*av.length|0];
 seen.add(K(it));SS.set(gk,[...seen]);
 return d0(gk,[it])};

/* ---- afslør først når ALLE dommere har valgt svar ---- */
const missing=()=>{const b=g&&g.b;if(!b||!b.judges||b.reveal||g.reveal||g.ph===2)return [];return b.judges.filter(i=>!g.assign||!g.assign[i])};
function sync(){
 try{const btn=document.getElementById('go');if(!btn||!g||!g.b||!g.b.judges)return;
  if(btn.dataset.t0===undefined)btn.dataset.t0=btn.textContent;
  const ms=missing();
  if(ms.length){btn.disabled=true;btn.textContent='🔒 Venter på: '+ms.map(i=>players[i].n).join(', ')}
  else{btn.disabled=false;btn.textContent=btn.dataset.t0}
 }catch(e){}}
const og=window.onGo;
window.onGo=function(){if(missing().length){sync();return}return og.apply(this,arguments)};
const bg=window.bindGame;
window.bindGame=function(){const r=bg.apply(this,arguments);sync();return r};
const rb=window.refreshBoard;
window.refreshBoard=function(){const r=rb.apply(this,arguments);sync();return r};

/* ---- mysterier: sammenhængende historie + indirekte spor (solver sikrer én mulig skyldig; overflødige spor fjernes) ---- */
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' og '+a[a.length-1];
const PP=[];(function g2(a,r){if(!a.length){const inv=[];r.forEach((v,p)=>inv[v]=p);PP.push({a:r.slice(),inv});return}for(let i=0;i<a.length;i++){const b=a.slice(),x=b.splice(i,1)[0];r.push(x);g2(b,r);r.pop()}})([0,1,2,3,4],[]);
const NAMES=['Anna','Bo','Camilla','Dennis','Eva','Frederik','Gitte','Henrik','Ida','Jens','Karen','Lars','Mette','Niels','Ole','Pia','Rasmus','Signe','Thomas','Ulla','Viggo','Yrsa','Mads','Nanna','Poul','Rikke','Søren','Tine','Victor','Bent'];
const COLS=[['rød','rødt'],['blå','blåt'],['grøn','grønt'],['gul','gult'],['sort','sort'],['hvid','hvidt'],['lilla','lilla'],['orange','orange'],['grå','gråt']];
const TWIST=['Ingen kan huske, hvem der slukkede lyset i to minutter lige før opdagelsen.','En dør stod på klem, selvom alle sværger på, at den var låst.','Det store ur i gangen stoppede præcis, da det skete – men det går alligevel altid forkert.','Der duftede svagt af parfume, men ingen af de fem bruger parfume.','Alle fem fortæller roligt og detaljeret – lidt for roligt og lidt for detaljeret.','Fire af de fem har allerede fundet på en forklaring, som den femte slet ikke har spørgt efter.'];
const ASIDE=['Vidnet bad samtidig om en kop kaffe.','Vidnet var tydeligt irriteret over at blive spurgt.','Vidnet kunne ikke lade være med at tilføje, at alting var bedre i gamle dage.','Det blev noteret af en meget træt betjent.','Vidnet ville gerne have haft en kage for besværet.','Vidnet insisterede på, at det her skulle med i protokollen.','Vidnet sagde det med den særlige ro, man kun har, når man ikke selv er mistænkt.'];
const R=(n,l,f)=>[n,l,f];
const IT=(a,b)=>[a,b];
const SETS=[
{pl:'herregårdens',intro:['Det er nytårsaften på herregården Rosenlund. Sneen har lukket vejen, og de fem, der blev tilbage efter middagen, kommer ingen steder før morgenen.','Det er den gamle fru Rosenlunds 80-årsdag på herregården. Stormen har væltet træer ned over indkørslen, så de fem tilbageblevne kommer ikke hjem i nat.'],
 wit:['Hushjælpen, der aldrig glemmer et ansigt, husker, at ','Fru Rosenlund, der ser alt fra sin lænestol, er sikker på, at ','Det gamle kamera i entreen viser, at ','Papegøjen i salonen, der gentager alt, hvad den hører, har sladret om, at '],
 rooms:[R('biblioteket','i biblioteket','fra biblioteket'),R('vinterhaven','i vinterhaven','fra vinterhaven'),R('køkkenet','i køkkenet','fra køkkenet'),R('vinkælderen','i vinkælderen','fra vinkælderen'),R('balkonen','på balkonen','fra balkonen')],
 items:[IT('en lommelygte','lommelygten'),IT('en nøglering','nøgleringen'),IT('et par handsker','handskerne'),IT('en notesbog','notesbogen'),IT('en lysestage','lysestagen'),IT('en termokande','termokanden'),IT('en paraply','paraplyen')],
 roles:[
 {r:'godsforvalteren',b:'Har passet godset i 30 år og kender hver revne i murene.',m:['Fik for nylig at vide, at godset skal sælges, og at ringen skal med i handlen.','Blev nægtet en eneste dråbe af flasken ved sit eget 30-årsjubilæum.']},
 {r:'kokken',b:'Har lavet familiens nytårsmenu i 20 år uden en eneste tak.',m:['Blev lovet en erindringsgave af fruen, som aldrig kom.','Har fået forbud mod at smage på vinen, selvom hele menuen er bygget op om den.']},
 {r:'revisoren',b:'Er kommet for at gøre regnskabet op og har fundet ting, der ikke stemmer.',m:['Ved, at ringen er opført til en langt højere værdi, end forsikringen dækker.','Ved, at flasken er forsikret til en pris, der langt overstiger markedsværdien.']},
 {r:'slægtshistorikeren',b:'Er hyret til at skrive slægtens krønike og har læst alle de gamle breve.',m:['Har læst et brev, der tyder på, at ringen aldrig retmæssigt tilhørte fru Rosenlund.','Har fundet noget, der tyder på, at flasken aldrig var den, familien påstår.']},
 {r:'chaufføren',b:'Har kørt for familien i 25 år og ved, hvem der kommer og går.',m:['Er lovet en bonus ved salget af godset og frygter at miste den.','Har lovet en hemmelig køber at skaffe flasken, før den bliver åbnet.']}],
 loots:[{t:'Tyveriet af safirringen',h:'Safirringen fra 1887 har været i slægten i fire generationer, og ifølge sagnet bringer den ulykke over den, der sælger den. Hele aftenen har den ligget i en glasmontre i salonen, men efter desserten opdages det, at montren er tom, og glasset er ubrudt.'},{t:'Tyveriet af vinflasken',h:'Flasken er den sidste af en årgang 1945, som fru Rosenlunds far selv lagde ned, og den skulle åbnes ved midnat. Da skålen skulle drikkes, stod der kun et tomt hul i vinreolen, og alle kan se, at flasken ikke er gået i stykker.'}]},
{pl:'teatrets',intro:['Det er premierenat på Det Gamle Teater. Forestillingen er slut, og hoveddøren er låst, men de fem, der blev tilbage for at rydde op, er stadig i bygningen.','Det er generalprøven på teatrets nye opsætning, og kun de fem inderste medarbejdere har fået lov at blive efter lukketid. Alarmen er slået til på alle yderdøre, så ingen er kommet ind eller ud.'],
 wit:['Natportneren, der sidder ved hoveddøren og påstår, at han aldrig sover, er sikker på, at ','Teatrets sikkerhedskamera viser, at ','Rengøringsdamen, der ser alt, hvad folk smider i skraldespanden, kan bekræfte, at ','Skuespilleren, der stadig sad i sminke, ved, at '],
 rooms:[R('scenen','på scenen','fra scenen'),R('garderoben','i garderoben','fra garderoben'),R('kantinen','i kantinen','fra kantinen'),R('orkestergraven','i orkestergraven','fra orkestergraven'),R('lysrummet','i lysrummet','fra lysrummet')],
 items:[IT('et headset','headsettet'),IT('et manuskript','manuskriptet'),IT('en sminketaske','sminketasken'),IT('en lommelygte','lommelygten'),IT('en termokop','termokoppen'),IT('et sæt nøgler','nøglerne'),IT('en saks','saksen')],
 roles:[
 {r:'iscenesætteren',b:'Har skabt forestillingen og lever for bifald.',m:['Har lånt penge til opsætningen og kan sælge kronen til en samler.','Vil ikke risikere, at komponisten kan kræve flere penge for forestillingen.']},
 {r:'kostumieren',b:'Har syet hvert eneste kostume i hånden og fået skæld ud for hver tråd.',m:['Mener, at kronen burde være lavet efter ens egne tegninger.','Blev ikke nævnt i programmet og vil have sit navn på forestillingen.']},
 {r:'inspicienten',b:'Styrer hele aftenen fra en lille bås bag scenen og ser alt.',m:['Fik skylden for en forsvundet rekvisit sidste år og vil bevise, at andre er værre.','Har en nøgle til kassen og ved, at ingen tror på en uskyldig nøgleholder.']},
 {r:'lysmesteren',b:'Kan gøre hele salen mørk på et splitsekund.',m:['Er lovet en bonus, der aldrig kom, og har en regning at betale.','Har hørt rygter om, at partituret vil blive solgt til udlandet.']},
 {r:'pianisten',b:'Har spillet til hver eneste forestilling i 15 år uden en eneste solo.',m:['Har altid drømt om at stå på scenen med kronen på hovedet.','Mener, at store dele af musikken er stjålet fra ens egne melodier.']}],
 loots:[{t:'Tyveriet af kronen',h:'Kronen er en ægte forgyldt krone fra 1790, som teatret har lånt af et museum, og den skulle sendes tilbage næste morgen. Da lyset blev tændt efter sidste tæppefald, stod kronen ikke længere på sit podie.'},{t:'Tyveriet af partituret',h:'Partituret er komponistens originale håndskrift til forestillingens musik, og der findes kun det ene eksemplar. Det lå i en aflåst kasse bag scenen, og låsen er ikke brudt op, men åbnet.'}]},
{pl:'hotellets',intro:['Det er en stormfuld novembernat på Hotel Klitten i Skagen. Færgen er aflyst, receptionen er lukket for natten, og de fem, der arbejder her, er de eneste vågne i bygningen.','Det er en mørk vinteraften på Hotel Klitten ved Skagen. Elektrikeren er forsinket af stormen, og de fem, der egentlig havde fri, blev på hotellet for at hjælpe med at holde varmen.'],
 wit:['Gæsten i værelse 12, der ikke kunne sove, så, at ','Hotellets sikkerhedskamera viser, at ','Nattens eneste gæst, en gammel skibskaptajn, husker tydeligt, at ','Receptionens vagthund, der aldrig tager fejl af lugte, har markeret, at '],
 rooms:[R('receptionen','i receptionen','fra receptionen'),R('baren','i baren','fra baren'),R('badeanlægget','i badeanlægget','fra badeanlægget'),R('vaskeriet','i vaskeriet','fra vaskeriet'),R('tagterrassen','på tagterrassen','fra tagterrassen')],
 items:[IT('et sæt nøgler','nøglesættet'),IT('en radio','radioen'),IT('en lommelygte','lommelygten'),IT('en termokande','termokanden'),IT('en bylt vasketøj','vasketøjet'),IT('en paraply','paraplyen'),IT('en notesbog','notesbogen')],
 roles:[
 {r:'nattevagten',b:'Har ikke sovet ordentligt siden 2009 og ser alt, der sker efter midnat.',m:['Skal fyres ved nytår og vil have noget at tage med sig.','Står selv i gæstebogen under et navn, ingen må kende til.']},
 {r:'bartenderen',b:'Kender alles hemmeligheder, men fortæller dem kun mod drikkepenge.',m:['Har tabt en indsats på uret i et vædemål med gæsterne.','Ved, at en berygtet svindler har skrevet sig ind, og vil sælge siden til en samler.']},
 {r:'rengøringslederen',b:'Har rene hænder og et næsten sygeligt behov for orden.',m:['Blev engang anklaget for at have stjålet uret og har aldrig fået sin undskyldning.','Har gemt noget mellem siderne for mange år siden og må have det tilbage.']},
 {r:'køkkenchefen',b:'Drømmer om sin egen restaurant, men mangler startkapital.',m:['Vil sælge uret og åbne restaurant.','Er den eneste kok i hotellets historie, der aldrig blev nævnt i bogen.']},
 {r:'viceværten',b:'Kender hvert rør og hvert hul i vægge og lofter.',m:['Fandt for mange år siden uret i en nedlagt skorsten og blev bedt om at tie.','Er bange for, at en gammel optegnelse i bogen afslører en gammel brøde.']}],
 loots:[{t:'Tyveriet af gulduret',h:'Hotellets stifter efterlod et guldur med indgraveret dedikation i en montre i receptionen, og uret skulle auktioneres bort næste dag til fordel for et børnehospice. Nu er montren tom, men glasset er helt.'},{t:'Tyveriet af gæstebogen',h:'Hotellets gæstebog fra 1923 rummer underskrifter fra kongelige, kunstnere og en enkelt berygtet svindler, og den skulle udstilles i morgen. Den lå i receptionens aflåste skuffe i aftes – nu er skuffen tom, og låsen er hel.'}]},
{pl:'kroens',intro:['Det er sidste aften, før kroen på Torvet lukker for altid efter 140 år. Gæsterne er gået hjem, og kun de fem, der har arbejdet her længst, sidder tilbage for at tage afsked.','Det er byfest i Vester Sønderby, og kroen har haft fuldt hus hele dagen. Nu er skænkestuen tom, og de fem, der stod for arrangementet, er blevet tilbage for at gøre op.'],
 wit:['Sognepræsten, der gik forbi på vej hjem, så, at ','Det gamle kamera over indgangen viser, at ','Pigen, der leverede is til festen, husker, at ','Kroens kat, der aldrig siger noget, men altid ser alt, har i hvert fald ikke modsagt, at '],
 rooms:[R('skænkestuen','i skænkestuen','fra skænkestuen'),R('køkkenet','i køkkenet','fra køkkenet'),R('vinkælderen','i vinkælderen','fra vinkælderen'),R('loftet','på loftet','fra loftet'),R('stalden','i stalden','fra stalden')],
 items:[IT('en lanterne','lanternen'),IT('en madkurv','madkurven'),IT('en notesbog','notesbogen'),IT('et sæt nøgler','nøglerne'),IT('en paraply','paraplyen'),IT('en ølkrukke','ølkrukken'),IT('en lommelygte','lommelygten')],
 roles:[
 {r:'værten',b:'Har drevet kroen i 30 år og skal nu lukke for altid.',m:['Står til at miste kroen og ser pengene som sin sidste redning.','Har aldrig selv vundet kruset og har altid fundet det uretfærdigt.']},
 {r:'tjeneren',b:'Har båret tallerkener i 12 år og kender alle gæsters bestilling udenad.',m:['Har ikke fået løn i to måneder.','Fortalte sidste års bedste historie, men blev nægtet kruset.']},
 {r:'musikanten',b:'Spiller til hver byfest og bliver altid betalt i øl.',m:['Har fået lovning på 3.000 kroner for aftenens spil, som ikke er betalt.','Mener, at kruset skulle gives til musikken, ikke til historiefortællingen.']},
 {r:'slagteren',b:'Leverer kroens kød og har en lang regning udestående.',m:['Er ikke blevet betalt for sidste måneds leverance.','Er den eneste, der ved, at kruset i virkeligheden er af plet og ikke af sølv.']},
 {r:'naboen',b:'Bor ved siden af og har klaget over larmen i 20 år.',m:['Frygter, at forsamlingshuset vil ruinere udsigten, og vil spolere byggeriet.','Er den, der oprindelig skænkede kruset, og mener at have ret til det.']}],
 loots:[{t:'Tyveriet af kassen',h:'Dagens indtægt på 48.000 kroner lå i en jernkasse under disken, og pengene skulle gå til byens nye forsamlingshus. Kassen står der stadig, men den er tom, og der er ingen spor af opbrud.'},{t:'Tyveriet af sølvkruset',h:'Kroens sølvkrus fra 1884 blev hvert år givet til byens bedste historiefortæller, og i aften skulle det overrækkes. Kruset stod på hylden bag disken ved lukketid, men nu er hylden tom.'}]}
];
function solve(cl,ca,cv){
 const by={1:[],2:[],3:[],4:[],5:[],6:[]};cl.forEach(c=>by[c.m].push(c.f));
 const ok=(L,A,B,C)=>{for(let k=0;k<L.length;k++)if(!L[k](A,B,C))return false;return true};
 const LR=PP.filter(P=>ok(by[1],P,null,null)),LI=PP.filter(P=>ok(by[2],null,P,null)),LC=PP.filter(P=>ok(by[4],null,null,P));
 let gu=-1;
 for(const A of LR)for(const B of LI){if(!ok(by[3],A,B,null))continue;
  for(const C of LC){if(!ok(by[5],A,null,C)||!ok(by[6],null,B,C))continue;
   const p=[A,B,C][ca].inv[cv];if(gu<0)gu=p;else if(gu!==p)return -2}}
 return gu}
function tryBuild(){
 const S=pick(SETS),nm=shuf(NAMES).slice(0,5),li=rnd(2),roles=S.roles.slice(),items=shuf(S.items).slice(0,5),cols=shuf(COLS).slice(0,5),rooms=S.rooms;
 const T=[pick(PP),pick(PP),pick(PP)],gp=rnd(5),ca=rnd(3),cv=T[ca].a[gp];
 const loc=v=>rooms[v][1],OB=v=>items[v][1],CO=v=>cols[v][1];
 const ref=(p,c)=>{const s=Math.random()<.4?roles[p].r:nm[p];return c?cap(s):s};
 const PS=[v=>'var '+loc(v),v=>'havde '+OB(v)+' med',v=>'var klædt i '+CO(v)+' tøj'];
 const NS=[v=>'ikke var '+loc(v),v=>'ikke havde '+OB(v)+' med',v=>'ikke var klædt i '+CO(v)+' tøj'];
 const NM=[v=>'var ikke '+loc(v),v=>'havde ikke '+OB(v)+' med',v=>'var ikke klædt i '+CO(v)+' tøj'];
 const TX=(sub,main)=>Math.random()<.6?pick(S.wit)+sub+'.'+(Math.random()<.3?' '+pick(ASIDE):''):cap(main)+'.';
 const uNeg=()=>{const a=rnd(3),p=rnd(5),v=T[a].a[p];let w;do{w=rnd(5)}while(w===v||(a===ca&&w===cv));const r=ref(p);
  return {k:'n'+a+p+w,t:TX(r+' '+NS[a](w),r+' '+NM[a](w)),m:1<<a,f:(A,B,C)=>[A,B,C][a].a[p]!==w}};
 const uPos=()=>{let a,p;do{a=rnd(3);p=rnd(5)}while(a===ca&&p===gp);const v=T[a].a[p],r=ref(p);
  return {k:'p'+a+p+v,t:TX(r+' '+PS[a](v),r+' '+PS[a](v)),m:1<<a,f:(A,B,C)=>[A,B,C][a].a[p]===v}};
 const link=pos=>{const a1=rnd(3);let a2;do{a2=rnd(3)}while(a2===a1);const v1=rnd(5),p=T[a1].inv[v1],tv=T[a2].a[p];let v2;if(pos)v2=tv;else do{v2=rnd(5)}while(v2===tv);
  const lo=Math.min(a1,a2),hi=Math.max(a1,a2),vl=lo===a1?v1:v2,vh=lo===a1?v2:v1;let sub,main;
  if(lo===0&&hi===1){sub=OB(vh)+(pos?' var ':' ikke var ')+loc(vl);main=OB(vh)+(pos?' var ':' var ikke ')+loc(vl)}
  else if(lo===1&&hi===2){sub=OB(vl)+(pos?' var i hænderne på en person i ':' ikke var i hænderne på en person i ')+CO(vh)+' tøj';main=OB(vl)+(pos?' var i hænderne på en person i ':' var ikke i hænderne på en person i ')+CO(vh)+' tøj'}
  else{sub=pos?'der var en person i '+CO(vh)+' tøj '+loc(vl):'der ikke var nogen i '+CO(vh)+' tøj '+loc(vl);main=pos?'der var en person i '+CO(vh)+' tøj '+loc(vl):'der var ingen i '+CO(vh)+' tøj '+loc(vl)}
  return {k:'l'+[a1+''+v1,a2+''+v2].sort().join(',')+(pos?1:0),t:TX(sub,main),m:(1<<a1)|(1<<a2),f:(A,B,C)=>{const W=[A,B,C];return (W[a1].inv[v1]===W[a2].inv[v2])===pos}}};
 const eith=()=>{const a=rnd(3),p=rnd(5);let q;do{q=rnd(5)}while(q===p);const v=T[a].a[p];if(a===ca&&v===cv)return null;const pr=shuf([p,q]);
  const body='enten '+ref(pr[0])+' eller '+ref(pr[1])+' '+PS[a](v);
  return {k:'e'+a+[p,q].sort().join('')+v,t:TX(body,body),m:1<<a,f:(A,B,C)=>{const X=[A,B,C][a];return X.a[p]===v||X.a[q]===v}}};
 const seen=new Set();let cl=[];
 const add=c=>{if(!c||seen.has(c.k))return false;seen.add(c.k);cl.push(c);return true};
 add(uPos());add(uNeg());add(uNeg());add(eith());
 let res=-1;
 for(let k=0;k<26;k++){const r=Math.random();add(r<.65?link(Math.random()<.6):r<.8?eith():r<.9?uNeg():uPos());
  if(cl.length>=6){res=solve(cl,ca,cv);if(res===gp)break}}
 if(res!==gp)return null;
 for(const c of shuf(cl)){const t=cl.filter(x=>x!==c);if(t.length>=4&&solve(t,ca,cv)===gp)cl=t}
 for(let k=0,n=0;k<30&&n<2;k++){const r=Math.random();if(add(r<.6?link(Math.random()<.5):r<.8?uNeg():uPos()))n++}
 const crime=ca===0?'Et vidne så tyven komme '+rooms[cv][2]+'.':ca===1?'Et vidne så tyven med '+items[cv][0]+' i hånden.':'På overvågningen ses tyven i '+CO(cv)+' tøj.';
 const clues=[crime].concat(shuf(cl).map(c=>c.t));
 const loot=S.loots[li];
 const h=17+rnd(6);
 const story=[pick(S.intro),loot.h,pick(TWIST),'Tyveriet skete mellem klokken '+h+'.00 og '+(h+1)+'.00. I den time var de fem alene i hvert sit af '+S.pl+' fem rum – '+list(rooms.map(x=>x[0]))+' – og hver af dem havde netop én af disse genstande med sig: '+list(items.map(x=>x[0]))+'. De var desuden klædt i hver sin farve: '+list(cols.map(x=>x[0]))+'. Præcis én af de fem er tyven. Ingen af vidnerne siger det ligeud, så læs udsagnene nedenfor nøje.'];
 const sus=nm.map((n,i)=>({n,r:roles[i].r,b:roles[i].b,m:roles[i].m[li]}));
 const order=shuf([0,1,2,3,4]);
 return {t:loot.t,s:story.join(' '),story,sus,c:clues,p:order.map(i=>nm[i]+' ('+roles[i].r+')'),a:order.indexOf(gp),e:'Det var '+nm[gp]+' ('+roles[gp].r+'): '+rooms[T[0].a[gp]][1]+', med '+items[T[1].a[gp]][0]+', i '+cols[T[2].a[gp]][1]+' tøj. Motivet: '+roles[gp].m[li]+' Kun én kan passe på alle sporene på én gang.',_T:T,_cl:cl,_gp:gp,_ca:ca,_cv:cv}}
window.HS_MYS=function(){for(let i=0;i<80;i++){const r=tryBuild();if(r)return r}throw new Error('mys')};

/* ---- layout ---- */
const st=document.createElement('style');
st.textContent=`.mys{text-align:left;margin:6px 0 14px}
.mys h4{margin:18px 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.mys-story{font-size:clamp(16px,2.1vw,20px);font-weight:600;line-height:1.6;padding:14px 18px;border-radius:18px;background:rgba(255,255,255,.07);border-left:5px solid #ffb703}
.mys-story p{margin:0 0 10px}.mys-story p:last-child{margin:0}
.mys-sus{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.mys-s{padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid var(--line);border-top:4px solid var(--c)}
.mys-s b{display:block;font-size:18px;color:var(--c)}
.mys-r{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}
.mys-s div{font-size:14px;line-height:1.5;color:#e8e5fa}.mys-s div.mm{margin-top:6px;color:#ffd47a}
.mys-cl{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;margin-bottom:8px;border-radius:16px;background:rgba(255,255,255,.06);font-size:16px;line-height:1.5;font-weight:600;animation:pop .4s}
.mys-cl.new{background:rgba(255,183,3,.16);box-shadow:0 0 0 2px #ffb703}
.mys-cl i{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:800;background:#ffb703;color:#111}`;
document.head.appendChild(st);
const MC=['#ff5d8f','#ffb703','#2ec4b6','#8f6bff','#4cc9f0'];
window.mysHead=function(it){
 const cl=it.c.slice(0,g.cl);
 return `<div class='tag'>🔍 ${esc(it.t)}</div><div class='mys'><h4>📜 Historien</h4><div class='mys-story'>${(it.story||[it.s]).map(p=>`<p>${esc(p)}</p>`).join('')}</div>`
  +(it.sus?`<h4>👥 De mistænkte</h4><div class='mys-sus'>${it.sus.map((s,i)=>`<div class='mys-s' style='--c:${MC[i%5]}'><b>${esc(s.n)}</b><div class='mys-r'>${esc(s.r)}</div><div>${esc(s.b)}</div><div class='mm'>💢 ${esc(s.m)}</div></div>`).join('')}</div>`:'')
  +`<h4>🔎 Spor (${cl.length} af ${it.c.length})</h4>${cl.map((c,i)=>`<div class='mys-cl ${i===cl.length-1?'new':''}'><i>${i+1}</i><span>${esc(c)}</span></div>`).join('')}</div>`};
})();

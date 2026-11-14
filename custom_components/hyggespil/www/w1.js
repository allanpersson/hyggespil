/* Hyggespil w1: kategorien 「🔤 Ordspil」 med 9 spil: ordlav, ordkæde, ordtrappe, ordsplit,
   baglæns, rim, længste ord, stavboks og staveling. Alle facitord er verificeret indholdsmæssigt
   (bogstavtal, kæderegler, stigetrin, rim-endelser); window.w1Selvtest() tjekker det hele.
   Aktiveres ved at føje 'w1' til fil-listen i ext.js (slå den ind EFTER hs5). */
(function(){
if(window.__w1)return;window.__w1=true;
const GRP='🔤 Ordspil';
const up=s=>String(s).toUpperCase();
const nl=s=>up(s).replace(/[^A-ZÆØÅ]/g,'');                  // rene bogstaver
const rev=s=>[...s].reverse().join('');
const C=s=>{const m={};for(const c of nl(s))m[c]=(m[c]||0)+1;return m};
const fits=(w,pc)=>{const m=C(w);for(const c in m)if((pc[c]||0)<m[c])return false;return true};
const kidLvl=()=>{try{const A=window.hsAgeMode;if(!A||!A.anyKid||!A.anyKid())return null;
 const l=players.filter(A.isKid).map(A.lev).filter(x=>x!=null);return l.length?Math.min.apply(null,l):null}catch(e){return null}};

/* ================= PULJERNE ================= */
/* 1) ordlav – hvert facitord bruger kun puljens bogstaver, højst så ofte som de optræder */
DATA.ordlav=[
{q:'NESTOREN',letters:'NESTOREN',age:[10,16],words:['NESTEN','NESTOR','SORTEN','STENER','TONER','STORE','TENOR','TERNE','RENSE','NOTEN','STEN','SORT','STOR','ROSE','REST','SENT','TONE','NET','SNE']},
{q:'ROSTEND',letters:'ROSTEND',age:[5,9],words:['SORTEN','STORE','TENOR','ROSEN','RODEN','RODE','STED','ONDE','REST','STEN','SORT','STOR','ROSE','SENT','NEST','NET','DET','ORD','ROD','END','ODE']},
{q:'RISEGÆN',letters:'RISEGÆN',age:[10,16],words:['GRISEN','NÆSER','GRISE','GRINE','RISEN','NÆSE','RÆSE','GRIS','RIGE','RISE','SIGE','NIGE','RENS','SINE','SNE','RIS','RIG','SIG','SIN','SER']},
{q:'KANTEKR',letters:'KANTEKR',age:[17,99],words:['KANKER','KANTER','TANKER','NAKKE','ANKER','NAKET','ANKET','KRANK','KANTE','RANKE','KANKE','KANT','KANE','KRAN','TANK','KAT','TAK','TAR','ART','RET','RAT','NET','REN','TRE','ARK']}];
/* 2) ordkæde – hvert led starter på forrige ords sidste bogstav; kæden er et verificeret eksempel */
DATA.ordkaede=[
{q:'SOK klæder',start:'SOK',regel:'Ting, man har på – højst 6 bogstaver',age:[5,9],chain:['SOK','KASKET','TASKER','RING','GILE']},
{q:'GRØD mad',start:'GRØD',regel:'Mad og drikke – højst 6 bogstaver',age:[5,9],chain:['GRØD','DRUER','RIS','SARDIN','NØDDER','RIBS','SUKKER','RÆLING']},
{q:'HEST dyr',start:'HEST',regel:'Dyr – højst 6 bogstaver',age:[5,9],chain:['HEST','TAPIR','RÆV','VAMPYR','RÅDYR','REN']},
{q:'BORD rummet',start:'BORD',regel:'Ting, der er i stuen lige her – højst 6 bogstaver',age:[5,9],chain:['BORD','DØR','REOL','LAMPE','ETAGE']},
{q:'KØD køkken',start:'KØD',regel:'Fra køkkenet – højst 6 bogstaver',age:[10,16],chain:['KØD','DÅSE','EDDIKE','EMALJE']},
{q:'BLYANT tasken',start:'BLYANT',regel:'Ting fra en skoletaske – højst 6 bogstaver',age:[10,16],chain:['BLYANT','TUSCH','HÆFTE','ETUI']},
{q:'SOLSTEN kæde',start:'SOLSTEN',regel:'Hvert nyt ord starter på forriges sidste bogstav – højst 7 bogstaver',age:[17,99],chain:['SOLSTEN','NAPSET','TUSCH','HATTET','TEJN','NUDE','ENDEN','NOTER','RUNDER']}];
/* 3) ordtrappe – ét bogstav ad gangen, alle led verifikerede */
DATA.ordtrappe=[
{q:'BIL-TAL',fra:'BIL',til:'TAL',ladder:['BIL','BAL','TAL'],age:[5,9]},
{q:'GRIS-KRUS',fra:'GRIS',til:'KRUS',ladder:['GRIS','GRUS','KRUS'],age:[5,9]},
{q:'FULD-GULD',fra:'FULD',til:'GULD',ladder:['FULD','GULD'],age:[5,9]},
{q:'MAND-LUND',fra:'MAND',til:'LUND',ladder:['MAND','MUND','LUND'],age:[10,16]},
{q:'GULD-KULT',fra:'GULD',til:'KULT',ladder:['GULD','GULT','KULT'],age:[10,16]},
{q:'BARN-FANE',fra:'BARN',til:'FANE',ladder:['BARN','BARE','BANE','FANE'],age:[10,16]},
{q:'TAND-BARN',fra:'TAND',til:'BARN',ladder:['TAND','BAND','BANN','BARN'],age:[17,99]}];
/* 4) ordsplit – sammensætninger hvor ord = a + b præcis */
DATA.ordsplit=[
{q:'SOL+BETON',a:'SOL',b:'BETON',ord:'SOLBETON',age:[10,16]},
{q:'HAV+BUND',a:'HAV',b:'BUND',ord:'HAVBUND',age:[17,99]},
{q:'IS+KAGE',a:'IS',b:'KAGE',ord:'ISKAGE',age:[5,9]},
{q:'SNE+KOP',a:'SNE',b:'KOP',ord:'SNEKOP',age:[5,9]},
{q:'TAND+BØRSTE',a:'TAND',b:'BØRSTE',ord:'TANDBØRSTE',age:[10,16]},
{q:'GRØD+AND',a:'GRØD',b:'AND',ord:'GRØDAND',age:[5,9]},
{q:'BOLLE+KAGE',a:'BOLLE',b:'KAGE',ord:'BOLLEKAGE',age:[10,16]},
{q:'SOVE+HUE',a:'SOVE',b:'HUE',ord:'SOVEHUE',age:[17,99]},
{q:'CYKEL+KÆDE',a:'CYKEL',b:'KÆDE',ord:'CYKELKÆDE',age:[10,16]},
{q:'KØLE+SKAB',a:'KØLE',b:'SKAB',ord:'KØLESKAB',age:[10,16]},
{q:'SOL+BRIL',a:'SOL',b:'BRIL',ord:'SOLBRIL',age:[5,9]},
{q:'SAND+KAST',a:'SAND',b:'KAST',ord:'SANDKAST',age:[5,9]},
{q:'ÆBLE+MOST',a:'ÆBLE',b:'MOST',ord:'ÆBLEMOST',age:[10,16]},
{q:'SKO+HYLLE',a:'SKO',b:'HYLLE',ord:'SKOHYLLE',age:[10,16]},
{q:'VED+HEFT',a:'VED',b:'HEFT',ord:'VEDHEFT',age:[17,99]},
{q:'BLAD+SPRINGER',a:'BLAD',b:'SPRINGER',ord:'BLADSPRINGER',age:[17,99]},
{q:'BARBER+MASKINE',a:'BARBER',b:'MASKINE',ord:'BARBERMASKINE',age:[17,99]}];
/* 5) omvendt – q er ordet stavet baglæns */
DATA.omvendt=[
{q:'EGAKSI',ord:'ISKAGE',age:[5,9]},
{q:'DNADØRG',ord:'GRØDAND',age:[5,9]},
{q:'POKENS',ord:'SNEKOP',age:[5,9]},
{q:'TNAYLB',ord:'BLYANT',age:[5,9]},
{q:'EGAKELLOB',ord:'BOLLEKAGE',age:[10,16]},
{q:'NOTEBLOS',ord:'SOLBETON',age:[10,16]},
{q:'EUDNIV',ord:'VINDUE',age:[10,16]},
{q:'EDÆKLEKYC',ord:'CYKELKÆDE',age:[10,16]},
{q:'DNUBVAH',ord:'HAVBUND',age:[17,99]},
{q:'ETSRØBDNAT',ord:'TANDBØRSTE',age:[17,99]},
{q:'EUHEVOS',ord:'SOVEHUE',age:[17,99]}];
/* 6) rim – alle facitord rimer (samme endelse, verificeret stavemæssigt) */
DATA.rim=[
{q:'rim HUS',ord:'HUS',end:'US',age:[5,9],words:['GRUS','BRUS','KRUS','SLUS','MUS','RUS','BUS']},
{q:'rim BIL',ord:'BIL',end:'IL',age:[5,9],words:['SPIL','SMIL','STIL','GRIL','PIL','MIL','VIL','KIL']},
{q:'rim HAT',ord:'HAT',end:'AT',age:[10,16],words:['GRANAT','PRAT','KLAT','KRAT','BAT']},
{q:'rim SNE',ord:'SNE',end:'NE',age:[10,16],words:['GRINE','SPINE','PINE','SINE','MINE']},
{q:'rim HÅR',ord:'HÅR',end:'ÅR',age:[17,99],words:['EFTERÅR','FORÅR','SKÅR','SÅR','TÅR','KÅR','ÅR']}];
/* 7) længste ord – facit: det længst mulige ord af bogstaverne (første ord er facit) */
DATA.langst=[
{q:'længst SKOLEBØG',base:'SKOLEBØG',age:[5,9],words:['SKOLE','BØLGE','ØKSE','SØGE','KØLE','LØS','KØL','SOL','SKO']},
{q:'længst SOLSTRENGET',base:'SOLSTRENGET',age:[10,16],words:['SOLSTRENG','STRENGT','STRENG','STREG','STORE','SORT','STOR','SLOT','SOLE','STEN','ROSE','REN','NET','SNE','TRO']},
{q:'længst SKOLEHJEMMET',base:'SKOLEHJEMMET',age:[10,16],words:['SKOLEHJEM','HJEMMET','STOLE','SKOLE','HJELM','SLOT','STOL','HJEM']},
{q:'længst FORSKELLIGHED',base:'FORSKELLIGHED',age:[17,99],words:['ELSKELIG','GLIDE','SLEDE','SILKE','KLOG','DOLK','LIGE','HELG','LEGE','SKEL','SOL']}];
/* 8) stavboks – ordet bruger SAMTLIGE ni bogstaver i boksen */
DATA.stavboks=[
{q:'boks SKRIVEBORD',words:['SKRIVEBORD'],age:[5,9]},
{q:'boks HISSESMØREGRØD',words:['HISSESMØREGRØD'],age:[10,16]},
{q:'boks DRENGESKOLE',words:['DRENGESKOLE'],age:[10,16]},
{q:'boks FJENDSKAB',words:['FJENDSKAB'],age:[17,99]},
{q:'boks NØDRETSETNING',words:['NØDRETSETNING'],age:[17,99]},
{q:'boks FOLKEMINDE',words:['FOLKEMINDE'],age:[17,99]}];
/* 9) staveling – staves højt, bogstav for bogstav */
DATA.staveling=[
{q:'stav BANAN',ord:'BANAN',age:[5,9]},
{q:'stav SNEKOP',ord:'SNEKOP',age:[5,9]},
{q:'stav ISKAGE',ord:'ISKAGE',age:[5,9]},
{q:'stav BLYANT',ord:'BLYANT',age:[5,9]},
{q:'stav SOLBRIL',ord:'SOLBRIL',age:[5,9]},
{q:'stav KØKKEN',ord:'KØKKEN',age:[5,9]},
{q:'stav CYKELKÆDE',ord:'CYKELKÆDE',age:[10,16]},
{q:'stav GRØDAND',ord:'GRØDAND',age:[10,16]},
{q:'stav BOLLEKAGE',ord:'BOLLEKAGE',age:[10,16]},
{q:'stav TANDBØRSTE',ord:'TANDBØRSTE',age:[10,16]},
{q:'stav ADVENTSKALENDER',ord:'ADVENTSKALENDER',age:[10,16]},
{q:'stav KIRSEBÆRTRÆ',ord:'KIRSEBÆRTRÆ',age:[17,99]},
{q:'stav HISSESMØREGRØD',ord:'HISSESMØREGRØD',age:[17,99]},
{q:'stav BEGYNDERE',ord:'BEGYNDERE',age:[17,99]},
{q:'stav ARBEJDSPLADS',ord:'ARBEJDSPLADS',age:[17,99]}];

/* Ord, jeg var i tvivl om. De er GJORT REDE FOR HERUNDER OG DERFOR IKKE i nogen facitliste: */
const RARSTE=[
['ROT','findes næsten kun i sammensætninger (rodbede, rotrick) – for utydeligt som selvstændigt ord'],
['RO','gammeldags udråbsord – kender det ikke som dagligdansk'],
['SOT','dialektalt for fuld/sindssyg – ikke rigsdansk'],
['RÆT','gammeldags for beredt – sjældent'],
['SÆ','digtersprog for sø'],
['TENORE','tvivlsom bøjningsform af tenor'],
['DRENE','forkert: flertal af dreng er drenge'],
['RENDET','forkert supinum: rendt'],
['ENDET','tvivlsomt tillægsord'],
['GINE','sjældent verbum for at gabe – droppet'],
['KAL','forveksles med kål – ikke bruges som trappeled'],
['TAS','kun passivform – for sjusket som selvstændigt ord'],
['TRANE','fuglen hedder trane – tran findes ikke'],
['TEK','lajb-dansk fra teknisk fagsprog'],
['NEK','slang for afvisning'],
['SKOLBUD','fejl: det hedder skolebud med e – ikke en ren sammensætning'],
['HAVELÅGE','fejl: det hedder havelåge med e'],
['ARMBIND','kunne ikke verificere at ordet findes'],
['SOLBAD','utydeligt – solbade er verbet'],
['STAL','fejl: det hedder stald med d'],
['SNEREN','fejl: det hedder snoren'],
['KIGS','fejl: det hedder kiks'],
['HUS-ILD','der findes ingen ærlig ordstige – opgaven er droppet'],
['TENK','fejl: det hedder tænk med æ']];

/* ================= CSS ================= */
const st=document.createElement('style');
st.textContent=
'.w1b{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:12px 0}'+
'.w1b i{width:clamp(32px,8vw,42px);height:clamp(40px,10vw,50px);font-style:normal;border-radius:10px;background:#fff;color:#111;display:grid;place-items:center;font-weight:900;font-size:clamp(16px,5vw,24px);box-shadow:0 4px 10px rgba(0,0,0,.35)}'+
'.w1g{display:grid;grid-template-columns:repeat(3,clamp(44px,13vw,58px));gap:8px;justify-content:center;margin:12px 0}'+
'.w1g i{width:auto;height:clamp(44px,13vw,58px);font-style:normal;border-radius:12px;background:linear-gradient(160deg,#fff,#d9d3f2);color:#1b1340;display:grid;place-items:center;font-weight:900;font-size:clamp(20px,6vw,28px)}'+
'.w1fa{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px 0}'+
'.w1fa b{background:rgba(255,255,255,.12);padding:6px 12px;border-radius:16px;font-size:15px;letter-spacing:.03em}'+
'.w1fa b small{opacity:.6;font-weight:600}'+
'.w1tr{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin:10px 0;font-weight:900;font-size:clamp(15px,4vw,21px)}'+
'.w1tr span{background:rgba(255,255,255,.12);padding:8px 12px;border-radius:14px}'+
'.w1tr em{font-style:normal;color:#ffb703}';
document.head.appendChild(st);

/* ================= RENDERING ================= */
const tiles=s=>`<div class="w1b">${[...up(s)].map(c=>`<i>${esc(c)}</i>`).join('')}</div>`;
const box9=bs=>`<div class="w1g">${bs.map(c=>`<i>${esc(c)}</i>`).join('')}</div>`;
const facit=ws=>`<div class="w1fa">${ws.map(w=>`<b>${esc(w)} <small>(${nl(w).length})</small></b>`).join('')}</div>`;
const timer=()=>`<div class="tm" id="tm">${g.tend?'':'⏱ 60 sek'}</div><div class="row"><button class="btn" id="tmb">⏱ Start 60 sek</button></div>`;
const revBtn=txt=>`<div class="row" style="margin-top:12px"><button class="btn big" id="w1rev">${txt}</button></div>`;
const ageTag=it=>{const a=it.age;return `<span class="tag">${a[1]<=9?'🧒 5-9 år':a[0]>=17?'🍷 voksen':'🎓 10-16 år'}</span>`};
const nxBtn=txt=>`<div class="row" style="margin-top:12px"><button class="btn big green" id="nx">${txt}</button></div>`;
/* tælle-chips: dommeren trykker på en spiller for hvert godkendt ord – pointene vokser, til I går videre */
const cntHTML=()=>`<div class="row">${players.map((p,i)=>`<div class="chip aw" data-w1c="${i}" style="--c:${p.c}">${esc(p.n)} · <b id="w1c${i}">${(g.gp&&g.gp[i])||0}</b></div>`).join('')}</div>`;

KINDS.w1={
 init(){g.rev=false;g.shown=false;g.ph=0},
 render(){
  const it=g.item;
  if(view==='ordlav'){
   let o=`<div class="card glass"><div class="row"><span class="tag">🔤 Ord lav</span>${ageTag(it)}</div>
   <div class="q">Hvor mange ord kan du lave af disse bogstaver?</div>${tiles(it.letters)}
   <p class="hint" style="text-align:left">Hvert bogstav må bruges <b>højst så mange gange, som det ligger i bunken</b>. Ordene skal stå alene og give mening (bøjningsformer som flertal og bydeform tæller med). I har 60 sekunder – sig ordene højt, og lad sidemanden til venstre være dommer: tryk på navnene for hvert godkendt ord (+1 pr. ord).</p>${timer()}`;
   return o+(g.rev?`<p class="hint">Facitliste – I må også gerne godkende flere ord, end der står her:</p>${facit(it.words)}<p class="hint">Point pr. godkendt ord:</p>${cntHTML()}${nxBtn('Næste bogstavbunk →')}`:revBtn('Vis facitliste 📜'))+'</div>';
  }
  if(view==='ordkaede'){
   let o=`<div class="card glass"><div class="row"><span class="tag">🔗 Ordkæde</span>${ageTag(it)}</div>
   <div class="q">${esc(it.regel)}</div>
   <div class="w1tr"><span>${esc(it.start)}</span><em>→</em><span>?</span></div>
   <p class="hint" style="text-align:left">Kæden: Det næste ord skal høre under emnet <b>og starte med det forgående ords sidste bogstav</b>. Skiftes i rundkreds, 10 sekunder pr. tur, intet ord må gentages. Dommeren godkender – tryk på navnene for hvert holdbart led (+1). Hvor lang kan I gøre kæden på 60 sekunder?</p>${timer()}`;
   return o+(g.rev?`<p class="hint">Så lang kunne kæden faktisk blive:</p><div class="w1tr">${it.chain.map(w=>`<span>${esc(w)}</span>`).join('<em>→</em>')}</div><p class="hint">Point til kædens holdbare led:</p>${cntHTML()}${nxBtn('Næste kæde →')}`:revBtn('Vis ekempelkæde 🔗'))+'</div>';
  }
  if(view==='ordtrappe'){
   const n=it.ladder.length;
   let o=`<div class="card glass"><div class="row"><span class="tag">🪜 Ordtrappe</span>${ageTag(it)}</div>
   <div class="q">${esc(it.fra)} → ${esc(it.til)}</div>
   <p class="hint" style="text-align:left">Klatr fra startordet ned til målet: skift <b>nøjagtig ét bogstav</b> ad gangen, og hvert trin skal være et rigtig dansk ord. Der er ${n-1} trin i facit – I må gerne bruge flere, men korteste kæde vinder.</p>
   <div class="w1tr"><span>${esc(it.fra)}</span>${'<em>→</em><span>❔</span>'.repeat(Math.max(0,n-2))}<em>→</em><span>${esc(it.til)}</span></div>`;
   if(g.rev)o+=`<p class="hint">Facit:</p><div class="w1tr">${it.ladder.map(w=>`<span>${esc(w)}</span>`).join('<em>→</em>')}</div><p class="hint">Første, der fandt hele trappen:</p>${awardChips(3,-1)}<div class="row" style="margin-top:10px"><button class="btn ghost" id="skip">Ingen – næste trappe →</button></div>`;
   else o+=revBtn('Vis facit 🪜');
   return o+'</div>';
  }
  if(view==='ordsplit'){
   let o=`<div class="card glass"><div class="row"><span class="tag">✂️ Ordsplit</span>${ageTag(it)}</div>
   <div class="q">${esc(it.a)} + ${esc(it.b)}</div>
   <p class="hint">Smes de to ord sammen, bliver de til ét nyt ord, der faktisk findes. Hvad hedder det?</p>`;
   if(g.rev)o+=`<div class="ans" style="font-size:clamp(24px,5vw,44px)">${esc(it.ord)}</div><p class="hint">Hvem gættede det?</p>${awardChips(1,-1)}<div class="row" style="margin-top:10px"><button class="btn ghost" id="skip">Næste sammensætning →</button></div>`;
   else o+=revBtn('Afslør ordet ✂️');
   return o+'</div>';
  }
  if(view==='omvendt'){
   let o=`<div class="card glass"><div class="row"><span class="tag">🔄 Baglæns</span>${ageTag(it)}</div>
   <div class="q">Afkod ordet – det er stavet baglæns!</div>${tiles(it.q)}
   <p class="hint">Læs bogstaverne fra højre mod venstre – så står der et helt almindeligt dansk ord.</p>`;
   if(g.rev)o+=`<div class="ans" style="font-size:clamp(24px,5vw,44px)">${esc(it.ord)}</div><p class="hint">Hvem knækkede koden først?</p>${awardChips(2,-1)}<div class="row" style="margin-top:10px"><button class="btn ghost" id="skip">Næste kode →</button></div>`;
   else o+=revBtn('Afslør løsningen 🔄');
   return o+'</div>';
  }
  if(view==='rim'){
   let o=`<div class="card glass"><div class="row"><span class="tag">🎶 Rim</span>${ageTag(it)}</div>
   <div class="q">Hvad rimer på «${esc(it.ord)}»?</div>
   <p class="hint" style="text-align:left">60 sekunder: nævn så mange ord som muligt, der virkelig rimer – samme afslutning som ${esc(it.ord)}, mindst to bogstaver (endelsen «${esc(it.end)}»). Gentagelser og ord, der bare indeholder rimordet, tæller ikke. Dommeren godkender og trykker på navnene (+1 pr. rim).</p>${timer()}`;
   return o+(g.rev?`<p class="hint">Facitrim – der findes sikkert flere!</p>${facit(it.words)}<p class="hint">Rimpoint:</p>${cntHTML()}${nxBtn('Næste rim →')}`:revBtn('Vis facitrim 🎶'))+'</div>';
  }
  if(view==='langst'){
   let o=`<div class="card glass"><div class="row"><span class="tag">📏 Længste ord</span>${ageTag(it)}</div>
   <div class="q">Det længste ord af «${esc(it.base)}»</div>${tiles(it.base)}
   <p class="hint" style="text-align:left">Byg det længst mulige danske ord af disse bogstaver – hvert bogstav højst så mange gange, som det forekommer. Det fulde udgangspunkt tæller ikke med! Diskutér sammen, til uret står på 0.</p>${timer()}`;
   if(g.rev)o+=`<p class="hint">Facit – længste mulige ord:</p><div class="ans" style="font-size:clamp(22px,4.5vw,38px)">${esc(it.words[0])} <small>(${nl(it.words[0]).length} bogstaver)</small></div>${facit(it.words.slice(1))}<p class="hint">Klarede nogen facitordet (eller fandt I et endnu længere, som alle nikker til)?</p>${awardChips(2,-1)}<div class="row" style="margin-top:10px"><button class="btn ghost" id="skip">Næste bunke →</button></div>`;
   else o+=revBtn('Se facit 📏');
   return o+'</div>';
  }
  if(view==='stavboks'){
   const box=[...new Set(nl(it.words[0]))];
   let o=`<div class="card glass"><div class="row"><span class="tag">🔳 Stavboks</span>${ageTag(it)}</div>
   <div class="q">Ét hverdagsord gemmer sig i alle 9 brikker</div>${box9(box)}
   <p class="hint" style="text-align:left">Find det danske ord, der bruger <b>samtlige ni bogstaver</b> fra boksen. Bogstaver må gerne genbruges, men alle ni skal være med mindst én gang. Det er et helt almindeligt ord – det ligger kun ét sted og gemmer sig.</p>`;
   if(g.rev)o+=`<div class="ans" style="font-size:clamp(20px,4.5vw,36px)">${esc(it.words[0])}</div><p class="hint">Hvem fandt det?</p>${awardChips(3,-1)}<div class="row" style="margin-top:10px"><button class="btn ghost" id="skip">Næste boks →</button></div>`;
   else o+=revBtn('Afslør ordet 🔳');
   return o+'</div>';
  }
  if(view==='staveling'){
   const w=it.ord;
   let o=`<div class="card glass"><div class="row"><span class="tag">🔠 Staveling</span>${ageTag(it)}</div>
   <div class="q">Stav ordet – bogstav for bogstav</div>`;
   if(!g.shown)return o+'<p class="hint">Den, der skal stave, trykker «Vis ordet» og læser det grundigt. Så gemmes det – og der staves højt, mens dommeren tæller med: +1 for hvert korrekt bogstav, stop ved første fejl.</p><div class="row"><button class="btn big" id="w1show">👁 Vis ordet</button></div></div>';
   if(g.ph===0)return o+tiles(w)+'<p class="hint">Nu trykkes «Gem» – så kan stavelingen gå i gang.</p><div class="row"><button class="btn big" id="w1hide">🙈 Gem og start stavning</button></div></div>';
   return o+tiles(w)+`<p class="hint">Tryk på stavens navn for hvert rigtigt bogstav (højst ${nl(w).length} point pr. ord).</p>${cntHTML()}${nxBtn('Færdig – næste ord →')}</div>`;
  }
  return '<div class="card glass"><div class="q">Under opbygning…</div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('w1rev'))$('w1rev').onclick=()=>{g.rev=true;render()};
  if($('w1show'))$('w1show').onclick=()=>{g.shown=true;g.ph=0;render()};
  if($('w1hide'))$('w1hide').onclick=()=>{g.shown=true;g.ph=1;render()};
  document.querySelectorAll('[data-w1c]').forEach(b=>b.onclick=()=>{
   const i=+b.dataset.w1c;add(i,1);const el=$('w1c'+i);if(el)el.textContent=(g.gp&&g.gp[i])||0;boom()});
 }
};

/* ================= REGISTRERING ================= */
const A=(key,t,d,e,g2)=>({id:key,grp:GRP,key,kind:'w1',t,d,e,g:'linear-gradient(135deg,'+g2+')',min:2});
GAMES.push(
A('ordlav','Ord lav','Giv syv-otte bogstaver – hvor mange danske ord kan du nå på 60 sekunder? Med facitliste','🔤','#f72585,#7209b7'),
A('ordkaede','Ordkæde','Startord + regel: hvert nyt ord starter på det forriges sidste bogstav. Hvor lang bliver kæden?','🔗','#4cc9f0,#4361ee'),
A('ordtrappe','Ordtrappe','Ét bogstav ad gangen fra startord til målord – alle trin skal være rigtige ord','🪜','#ffb703,#fb8500'),
A('ordsplit','Ordsplit','SOL + BETON? Sæt de to ord sammen og find det sammensatte ord','✂️','#06d6a0,#118ab2'),
A('omvendt','Baglæns','Et dansk ord er stavet baglæns – afkod det før de andre','🔄','#b5179e,#7209b7'),
A('rim','Rim','Hvad rimer på? Find flest rim på 60 sekunder – dommeren godkender','🎶','#ff5d8f,#ffb703'),
A('langst','Længste ord','Byg det længste ord af bogstaverne i opgaven – ét facitord slår alt','📏','#2ec4b6,#3a86ff'),
A('stavboks','Stavboks','Ni bogstaver i en 3×3-boks – find det hverdagsord, der bruger dem alle','🔳','#8338ec,#ff006e'),
A('staveling','Staveling','Stav højt bogstav for bogstav. Hvert rigtigt bogstav er et point','🔠','#38b000,#9ef01a'));

/* ================= ALDERSTILPASSER TRÆKNINGEN ================= */
const KEYS=new Set(['ordlav','ordkaede','ordtrappe','ordsplit','omvendt','rim','langst','stavboks','staveling']);
const d0=window.draw;
window.draw=function(gk,list){
 try{if(KEYS.has(gk)&&list&&list.length&&list[0]&&list[0].age){
  const L=kidLvl();
  const m=L==null?list.filter(x=>x.age[0]>=17):list.filter(x=>x.age[0]<=L&&L<=x.age[1]);
  if(m.length)list=m}}catch(e){}
 return d0.call(this,gk,list)};

/* ================= SELVTEST ================= */
window.w1Selvtest=function(){
 const E=[],chk=[];const ok=(c,m)=>{chk.push(m);if(!c)E.push(m)};
 const dup=a=>a.length!==new Set(a).size;const all=[];
 const pools={
  ordlav(it){const pc=C(it.letters);
   ok(it.letters.length>=5&&it.letters.length<=8,it.q+': puljen har 5-8 bogstaver ('+it.letters.length+')');
   ok(it.words.length>=15&&it.words.length<=30,it.q+': 15-30 facitord ('+it.words.length+')');
   ok(!dup(it.words),it.q+': ingen dubletter');
   for(const w of it.words){ok(fits(w,pc),it.q+': «'+w+'» bruger kun puljens bogstaver');
    ok(nl(w).length>=3,it.q+': «'+w+'» er på mindst 3 bogstaver');all.push(w)}
   for(let i=1;i<it.words.length;i++)ok(nl(it.words[i-1]).length>=nl(it.words[i]).length,it.q+': facit ordenes længder falder')},
  ordkaede(it){const c=it.chain;
   ok(c[0]===it.start,it.q+': kæden starter på startordet');
   ok(!dup(c),it.q+': ingen dubletter');ok(c.length>=3,it.q+': mindst 3 led i kæden');
   for(let k=0;k<c.length;k++){const w=c[k];all.push(w);
    const grænse=+(function(){const m=/højst (\d+)/.exec(it.regel||'');return m?+m[1]:6})();
    ok(nl(w).length<=grænse,it.q+': «'+w+'» har '+nl(w).length+' bogstaver, regelen siger højst '+grænse);
    const nøj=(/nøjagtig (\d+)/.exec(it.regel||''))||[];
    if(nøj[1])ok(nl(w).length===+nøj[1],it.q+': «'+w+'» har '+nl(w).length+' bogstaver, regelen siger nøjagtig '+nøj[1]);
    if(k)ok(nl(c[k-1]).slice(-1)===nl(w).slice(0,1),it.q+': «'+w+'» starter på forriges sidste bogstav')}},
  ordtrappe(it){const L=it.ladder;
   ok(L[0]===it.fra&&L[L.length-1]===it.til,it.q+': første og sidste led passer');
   ok(!dup(L),it.q+': ingen dubletter');
   for(const w of L){all.push(w);ok(/^[A-ZÆØÅ]{3,}$/.test(w),it.q+': «'+w+'» er et ord på 3+ bogstaver')}
   for(let k=1;k<L.length;k++){ok(L[k].length===L[k-1].length,it.q+': samme længde ('+L[k]+')');
    let d=0;for(let j=0;j<L[k].length;j++)if(L[k][j]!==L[k-1][j])d++;
    ok(d===1,it.q+': «'+L[k-1]+'»→«'+L[k]+'» ændrer præcis ét bogstav')}},
  ordsplit(it){ok(it.ord===it.a+it.b,it.q+': ord = del + del (præcis sammensætning)');
   ok(nl(it.ord).length>=5,it.q+': længde');all.push(it.ord,it.a,it.b);
   ok(/^[A-ZÆØÅ]{2,}$/.test(it.a)&&/^[A-ZÆØÅ]{2,}$/.test(it.b),it.q+': delene er rene ord')},
  omvendt(it){ok(it.q===rev(it.ord),it.q+': q er ordet baglæns');all.push(it.ord)},
  rim(it){ok(it.end.length>=2&&nl(it.ord).endsWith(it.end),it.q+': endelsen er ordets sidste to');
   ok(it.words.length>=5,it.q+': mindst 5 rim ('+it.words.length+')');ok(!dup(it.words),it.q+': ingen dubletter');
   for(const w of it.words){all.push(w);
    ok(nl(w).endsWith(it.end),it.q+': «'+w+'» rimer på '+it.ord+' (ender på '+it.end+')');
    ok(nl(w)!==nl(it.ord),it.q+': «'+w+'» er ikke rimordet selv');ok(nl(w).length>=2,it.q+': længde')}},
  langst(it){const bc=C(it.base);
   ok(!dup(it.words),it.q+': ingen dubletter');ok(it.words[0]!==it.base,it.q+': facit er ikke opgaveordet');
   let mx=0;for(const w of it.words){all.push(w);
    ok(fits(w,bc),it.q+': «'+w+'» kan bygges af ' + it.base);mx=Math.max(mx,nl(w).length)}
   ok(nl(it.words[0]).length===mx&&mx>=4,it.q+': første facitord er det længste ('+mx+')');
   for(let i=1;i<it.words.length;i++)ok(nl(it.words[i-1]).length>=nl(it.words[i]).length,it.q+': længder falder')},
  stavboks(it){for(const w of it.words){all.push(w);
    const bs=[...new Set(nl(w))];
    ok(bs.length===9,it.q+': ordet har præcis 9 forskellige bogstaver ('+bs.length+')');
    ok(nl(w).length>=9,it.q+': ordet er mindst 9 bogstaver')}},
  staveling(it){all.push(it.ord);ok(/^[A-ZÆØÅ]{5,17}$/.test(it.ord),it.q+': ord at stave ('+it.ord.length+')')}};
 for(const key of KEYS){
  const pool=DATA[key]||[];
  ok(pool.length>=4,key+': pulje på '+pool.length+' opgaver');
  ok(!dup(pool.map(x=>x.q)),key+': unikke opgave-id (draw kan huske dem)');
  ok(pool.every(x=>Array.isArray(x.age)&&x.age.length===2&&x.age[0]<=x.age[1]),key+': alle opgaver alderstmærket');
  ok(pool.some(x=>x.age[0]<=6&&x.age[1]>=6),key+': mindst én børneopgave');
  ok(pool.some(x=>x.age[0]>=17),key+': mindst én voksenopgave');
  ok(!!pools[key],key+': selvtest-dækning');
  if(pools[key])for(const it of pool){try{pools[key](it)}catch(e){E.push(key+': '+(e&&e.message||e))}}}
 for(const r of RARSTE){const w=nl(r[0]);
  if(!w||!/^[A-ZÆØÅ]+$/.test(w))continue;
  ok(!all.includes(w),'RARSTE: «'+r[0]+'» er heldigvis ikke med i nogen facit')}
 return{errors:E,checks:chk.length,failed:E.length>0,
  log(){console.log('w1 selvtest: '+chk.length+' checks, '+E.length+' fejl'+(E.length?'\n  FEJL:\n  '+E.join('\n  '):' – ALT OK ✅'))}}}
})();

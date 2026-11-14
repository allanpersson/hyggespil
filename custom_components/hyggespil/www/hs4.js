/* Spil fra hele verden: Shiritori (Japan), Yut Nori (Korea), Suit Jawa (Indonesien), Lotería (Mexico).
   Hvert spil vises først, når DATA.cult har et kildetjekket regelkort for det (id). Regelkort: {id,t,origin,tradition:[fakta],app:'sådan spiller I det her'} */
(function(){
if(window.__hs4)return;window.__hs4=true;
const rnd=n=>Math.random()*n|0,pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const GRP_W='🌍 Spil fra hele verden';
const st=document.createElement('style');
st.textContent='.ybar{height:14px;border-radius:8px;background:rgba(255,255,255,.12);overflow:hidden;flex:1;min-width:120px}.ybar i{display:block;height:100%}.sticks{display:flex;gap:10px;justify-content:center;font-size:42px;margin:10px 0}.lb{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;max-width:340px;margin:6px 0}.lb div{font-size:11px;text-align:center;padding:6px 2px;border-radius:8px;background:rgba(255,255,255,.1);min-height:48px;display:grid;place-items:center}.lb .hit{background:#2ec4b6;color:#062;font-weight:800}.rulebox{text-align:left;font-size:14px;line-height:1.45;margin:8px 0;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07)}.rulebox li{margin:3px 0}';
document.head.appendChild(st);
const cult=id=>(DATA.cult||[]).find(c=>c.id===id)||{};
function rules(id){const c=cult(id);return '<div class="rulebox"><b>'+esc(c.t||'')+(c.origin?' – '+esc(c.origin):'')+'</b><ul style="margin:6px 0 6px 18px;padding:0">'+(c.tradition||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(c.app?'<div><b>Sådan spiller I det her:</b> '+esc(String(c.app).replace('(to kort med navne, som i dag opfattes som stødende, er udeladt)','(to kort fra originalen er udeladt)').replace(/^Sådan spiller I det i appen:\s*/,'').replace(/^Foreslået appmekanik[^:]*:\s*/,''))+'</div>':'')+'</div>'}

/* ---------- Shiritori ---------- */
const SL='ABDFGHKLMNPRSTV'.split('');
KINDS.shiri={
 init(){g.alive=players.map((_,i)=>i);g.cur=0;g.used=[];g.L=pick(SL);g.tend=Date.now()+15000;g.sm='';g.over=false;g.sw=false},
 render(){
  if(!g.sw)return '<div class="card glass"><div class="q">🔤 Shiritori</div>'+rules('shiri')+'<div class="row"><button class="btn big" id="shgo">▶ Start</button></div></div>';
  if(g.over){const w=players[g.alive[0]];return '<div class="card glass"><div class="q">🏆 '+esc(w.n)+' vandt!</div><p class="hint">'+(g.sm||'')+' (+3 point)</p><p class="hint">Brugte ord: '+g.used.map(esc).join(', ')+'</p><div class="row"><button class="btn big green" id="nx">Nyt spil →</button></div></div>'}
  const p=players[g.alive[g.cur]];
  return '<div class="card glass"><div class="row"><span class="tag" style="background:'+p.c+';color:#111">Tur: '+esc(p.n)+'</span><span class="tag">Tilbage: '+g.alive.length+'</span></div><div class="q">Sig et ord, der begynder med <b style="color:#ffb703;font-size:1.4em">'+g.L+'</b></div>'+(g.sm?'<p class="hint">'+esc(g.sm)+'</p>':'')+'<div class="tm" id="tm">⏱ 15 sek</div><div class="est"><div class="p" style="--c:'+p.c+'"><input class="in" id="shw" placeholder="Skriv ordet" autocomplete="off"></div></div><div class="row"><button class="btn big green" id="shok">✅ Send ordet</button><button class="btn ghost" id="shno">Giv op</button></div><p class="hint">Brugt: '+(g.used.length?g.used.map(esc).join(', '):'(ingen endnu)')+'</p></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  const elim=m=>{g.sm=m;g.alive.splice(g.cur,1);
   if(g.alive.length<=1){g.over=true;g.sm=m;clearInterval(tid);add(g.alive[0],3);boom()}
   else{g.cur%=g.alive.length;g.tend=Date.now()+15000}
   render()};
  if($('shgo'))$('shgo').onclick=()=>{g.sw=true;g.tend=Date.now()+15000;render()};
  if($('shw')){$('shw').focus();clearInterval(tid);
   tid=setInterval(()=>{const t=$('tm');if(!t){clearInterval(tid);return}const s=Math.max(0,Math.ceil((g.tend-Date.now())/1000));t.textContent='⏱ '+s+' sek';if(s<=0){clearInterval(tid);elim('⏰ '+players[g.alive[g.cur]].n+' løb tør for tid og er ude.')}},250);
   const send=()=>{const w=$('shw').value.trim(),lw=w.toLowerCase();
    if(!/^[A-Za-zÆØÅæøåéüö-]{2,}$/.test(w)||w[0].toUpperCase()!==g.L||g.used.map(x=>x.toLowerCase()).includes(lw)){$('shw').classList.add('shake');setTimeout(()=>$('shw').classList.remove('shake'),400);return}
    g.used.push(w);g.L=w.replace(/-+$/,'').slice(-1).toUpperCase();g.sm='';g.cur=(g.cur+1)%g.alive.length;g.tend=Date.now()+15000;render()};
   $('shok').onclick=send;$('shw').onkeydown=e=>{if(e.key==='Enter')send()};
   $('shno').onclick=()=>{clearInterval(tid);elim('🏳️ '+players[g.alive[g.cur]].n+' gav op.')}}
 }
};

/* ---------- Yut Nori ---------- */
const YN={1:'Do',2:'Gae',3:'Geol',4:'Yut',0:'Mo'},YM={1:1,2:2,3:3,4:4,0:5},GOAL=20;
KINDS.yut={
 init(){g.yp=players.map(()=>0);g.yt=((g.yt==null?-1:g.yt)+1)%players.length;g.yl=null;g.yw=null;g.ys=false;g.ex=false},
 render(){
  const p=players[g.yt];
  const bars='<div class="est" style="display:block">'+players.map((q,i)=>'<div class="row" style="align-items:center;margin:4px 0"><b style="min-width:80px;color:'+q.c+'">'+esc(q.n)+'</b><div class="ybar"><i style="width:'+Math.min(100,g.yp[i]/GOAL*100)+'%;background:'+q.c+'"></i></div><span>'+g.yp[i]+'/'+GOAL+'</span></div>').join('')+'</div>';
  if(!g.ys)return '<div class="card glass"><div class="q">🎲 Yut Nori</div>'+rules('yut')+'<div class="row"><button class="btn big" id="ygo">▶ Start løbet</button></div></div>';
  let o='<div class="card glass"><div class="q">🎲 Yut Nori-løb til '+GOAL+'</div>'+bars;
  if(g.yw!=null)return o+'<div class="ans">🏆 '+esc(players[g.yw].n)+' nåede først i mål! (+3 point)</div><div class="row"><button class="btn big green" id="nx">Nyt løb →</button></div></div>';
  if(g.yl){const flats=g.yl.f;o+='<div class="sticks">'+flats.map(f=>f?'⬜':'🟫').join('')+'</div><div class="ans" style="font-size:clamp(24px,4vw,40px)">'+YN[g.yl.n]+' – '+YM[g.yl.n]+' felter'+(g.ex?' + kast igen!':'')+'</div>'}
  return o+'<div class="row"><span class="tag" style="background:'+p.c+';color:#111">'+esc(p.n)+'s tur</span></div><div class="row"><button class="btn big" id="ythrow">'+(g.ex?'Kast igen':'Kast pindene')+' 🎲</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('ygo'))$('ygo').onclick=()=>{g.ys=true;render()};
  if($('ythrow'))$('ythrow').onclick=()=>{
   const f=[0,1,2,3].map(()=>rnd(2)),n=f.reduce((a,b)=>a+b,0);
   g.yl={f,n};g.yp[g.yt]+=YM[n];g.ex=(n===4||n===0);
   if(g.yp[g.yt]>=GOAL){g.yw=g.yt;add(g.yt,3);boom()}
   else if(!g.ex)g.yt=(g.yt+1)%players.length;
   render()};
 }
};

/* ---------- Suit Jawa (gajah–orang–semut) ---------- */
const SU=[['🐘','Elefant'],['🧍','Menneske'],['🐜','Myre']];
KINDS.suit={
 init(){g.sa=((g.sa==null?-1:g.sa)+1)%players.length;g.sb=(g.sa+1)%players.length;g.sph=-1;g.pa=null;g.pb=null},
 render(){
  const a=players[g.sa],b=players[g.sb];
  if(g.sph<0)return '<div class="card glass"><div class="q">🐘🧍🐜 Suit Jawa</div>'+rules('suit')+'<div class="row"><button class="btn big" id="sugo">▶ Start duellen</button></div></div>';
  let o='<div class="card glass"><div class="row"><span class="tag" style="background:'+a.c+';color:#111">'+esc(a.n)+'</span><span class="tag">mod</span><span class="tag" style="background:'+b.c+';color:#111">'+esc(b.n)+'</span></div>';
  const btns=who=>'<div class="row">'+SU.map((s,i)=>'<button class="btn big" data-su="'+who+i+'" style="font-size:42px">'+s[0]+'</button>').join('')+'</div>';
  if(g.sph===0)return o+'<p class="hint">'+esc(a.n)+': vælg i hemmelighed (skærmen kun til dig).</p>'+btns('a')+'</div>';
  if(g.sph===1)return o+'<p class="hint">'+esc(b.n)+': nu er det din tur – vælg i hemmelighed.</p>'+btns('b')+'</div>';
  const d=(g.pa-g.pb+3)%3; // 0 uafgjort; 1: a vinder? elefant(0)>menneske(1)>myre(2)>elefant(0)
  const res=g.pa===g.pb?'Uafgjort!':((g.pa+1)%3===g.pb?a.n+' vinder (+1)':b.n+' vinder (+1)');
  return o+'<div class="sticks">'+SU[g.pa][0]+' ⚔️ '+SU[g.pb][0]+'</div><div class="ans" style="font-size:clamp(22px,4vw,34px)">'+esc(res)+'</div><div class="row"><button class="btn big green" id="nx">Næste duel →</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('sugo'))$('sugo').onclick=()=>{g.sph=0;render()};
  document.querySelectorAll('[data-su]').forEach(b=>b.onclick=()=>{const w=b.dataset.su[0],i=+b.dataset.su[1];
   if(w==='a'){g.pa=i;g.sph=1}else{g.pb=i;g.sph=2;if(g.pa!==g.pb){add((g.pa+1)%3===g.pb?g.sa:g.sb,1);boom()}}
   render()});
 }
};

/* ---------- Lotería ---------- */
const DECK=[['El gallo','Hanen','🐓'],['El diablito','Den lille djævel','😈'],['La dama','Damen','👩'],['El catrín','Gentlemanden','🎩'],['El paraguas','Paraplyen','☂️'],['La sirena','Havfruen','🧜'],['La escalera','Stigen','🪜'],['La botella','Flasken','🍾'],['El barril','Tønden','🛢️'],['El árbol','Træet','🌳'],['El melón','Melonen','🍈'],['El valiente','Den tapre','🗡️'],['El gorrito','Huen','🧢'],['La muerte','Døden','💀'],['La pera','Pæren','🍐'],['La bandera','Flaget','🚩'],['El bandolón','Bandolonen','🎸'],['El violoncello','Cellen','🎻'],['La garza','Hejren','🦢'],['El pájaro','Fuglen','🐦'],['La mano','Hånden','✋'],['La bota','Støvlen','👢'],['La luna','Månen','🌙'],['El cotorro','Papegøjen','🦜'],['El borracho','Den berusede','🥴'],['El corazón','Hjertet','❤️'],['La sandía','Vandmelonen','🍉'],['El tambor','Trommen','🥁'],['El camarón','Rejen','🦐'],['Las jaras','Pilene','🏹'],['El músico','Musikeren','🎶'],['La araña','Edderkoppen','🕷️'],['El soldado','Soldaten','💂'],['La estrella','Stjernen','⭐'],['El cazo','Gryden','🍲'],['El mundo','Verden','🌍'],['El nopal','Fikenkaktussen','🌵'],['El alacrán','Skorpionen','🦂'],['La rosa','Rosen','🌹'],['La calavera','Kraniet','☠️'],['La campana','Klokken','🔔'],['El cantarito','Den lille krukke','🏺'],['El venado','Hjorten','🦌'],['El sol','Solen','☀️'],['La corona','Kronen','👑'],['La chalupa','Chalupaen','🛶'],['El pino','Fyrretræet','🌲'],['El pescado','Fisken','🐟'],['La palma','Palmen','🌴'],['La maceta','Blomsterpotten','🪴'],['El arpa','Harpen','🪕'],['La rana','Frøen','🐸']];
const LINES=[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],[0,5,10,15],[3,6,9,12]];
KINDS.lot={
 init(){const ids=DECK.map((_,i)=>i);g.ld=shuffle(ids);g.lc=[];g.lb=players.map(()=>shuffle(ids).slice(0,16));g.ls=false;g.lw=null;g.lm=''},
 render(){
  if(!g.ls)return '<div class="card glass"><div class="q">🎴 Lotería</div>'+rules('lot')+'<div class="row"><button class="btn big" id="lgo">▶ Start</button></div></div>';
  const cur=g.lc.length?DECK[g.lc[g.lc.length-1]]:null;
  let o='<div class="card glass">'+(cur?'<div class="sticks" style="font-size:72px">'+cur[2]+'</div><div class="ans" style="font-size:clamp(24px,4vw,40px)">'+cur[0]+'</div><p class="hint">'+cur[1]+' ('+g.lc.length+' kort kaldt)</p>':'<p class="hint">Tryk på «Næste kort» for at kalde det første kort.</p>');
  if(g.lm)o+='<p class="hint" style="font-size:16px">'+g.lm+'</p>';
  if(g.lw==null){
   o+='<div class="row"><button class="btn big" id="lnext">Næste kort →</button></div><p class="hint">Hver spiller har et bræt på 16 kort. Har du en hel række, kolonne eller diagonal af kaldte kort, så tryk på dit navn: <b>LOTERÍA!</b></p>'
  }else o+='<div class="ans">🏆 '+esc(players[g.lw].n)+' råbte Lotería! (+3 point)</div><div class="row"><button class="btn big green" id="nx">Nyt spil →</button></div>';
  o+=players.map((p,i)=>'<div style="margin:8px 0"><div class="row"><div class="chip aw" data-lo="'+i+'" style="--c:'+p.c+'">'+esc(p.n)+' – LOTERÍA!</div></div><div class="lb">'+g.lb[i].map(c=>'<div class="'+(g.lc.includes(c)?'hit':'')+'">'+DECK[c][2]+'<br>'+DECK[c][0]+'</div>').join('')+'</div></div>').join('');
  return o+'</div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('lgo'))$('lgo').onclick=()=>{g.ls=true;render()};
  if($('lnext'))$('lnext').onclick=()=>{if(g.ld.length){g.lc.push(g.ld.shift());g.lm=''}else g.lm='Alle kort er kaldt.';render()};
  document.querySelectorAll('[data-lo]').forEach(c=>c.onclick=()=>{if(g.lw!=null)return;const i=+c.dataset.lo,b=g.lb[i];
   const ok=LINES.some(l=>l.every(k=>g.lc.includes(b[k])));
   if(ok){g.lw=i;add(i,3);boom();g.lm=''}else g.lm='🙅 '+esc(players[i].n)+': endnu ikke en hel række, kolonne eller diagonal af kaldte kort!';
   render()});
 }
};


/* ---------- Shagai (Mongoliet) ---------- */
const SH=[['🐎','hest'],['🐪','kamel'],['🐑','får'],['🐐','ged']],SHG=10;
function shScore(t){const c=[0,0,0,0];t.forEach(i=>c[i]++);const m=c.filter(x=>x>0);
 if(m.length===4)return [8,'durvun berkh – fire forskellige sider! (8)'];
 if(m.length===1)return [4,'fire ens! (4)'];
 if(m.length===2&&c.includes(2)&&!c.includes(3)&&!c.includes(1))return [2,'to par (2)'];
 return [0,'ingen point'];}
KINDS.shagai={
 init(){g.shp=players.map(()=>0);g.sht=((g.sht==null?-1:g.sht)+1)%players.length;g.shl=null;g.shw=null;g.shs=false},
 render(){
  if(!g.shs)return '<div class="card glass"><div class="q">🐑 Shagai</div>'+rules('shagai')+'<div class="row"><button class="btn big" id="shsgo">▶ Start</button></div></div>';
  const p=players[g.sht];
  let o='<div class="card glass"><div class="q">🐑 Shagai – først til '+SHG+' point</div><div class="est" style="display:block">'+players.map((q,i)=>'<div class="row" style="align-items:center;margin:4px 0"><b style="min-width:80px;color:'+q.c+'">'+esc(q.n)+'</b><div class="ybar"><i style="width:'+Math.min(100,g.shp[i]/SHG*100)+'%;background:'+q.c+'"></i></div><span>'+g.shp[i]+'</span></div>').join('')+'</div>';
  if(g.shl)o+='<div class="sticks">'+g.shl.t.map(i=>SH[i][0]).join('')+'</div><div class="ans" style="font-size:clamp(18px,3.4vw,28px)">'+g.shl.t.map(i=>SH[i][1]).join(' · ')+'</div><p class="hint">'+esc(players[g.shl.p].n)+': '+g.shl.msg+'</p>';
  if(g.shw!=null)return o+'<div class="ans">🏆 '+esc(players[g.shw].n)+' vandt! (+3 point)</div><div class="row"><button class="btn big green" id="nx">Nyt spil →</button></div></div>';
  return o+'<div class="row"><span class="tag" style="background:'+p.c+';color:#111">'+esc(p.n)+'s tur</span></div><div class="row"><button class="btn big" id="shthrow">Kast 4 knogler 🎲</button></div></div>';
 },
 bind(){
  const $=id=>document.getElementById(id);
  if($('shsgo'))$('shsgo').onclick=()=>{g.shs=true;render()};
  if($('shthrow'))$('shthrow').onclick=()=>{const t=[0,1,2,3].map(()=>rnd(4)),r=shScore(t),pl=g.sht;
   g.shp[pl]+=r[0];g.shl={t,p:pl,msg:r[1]};
   if(g.shp[pl]>=SHG){g.shw=pl;add(pl,3);boom()}else g.sht=(g.sht+1)%players.length;
   render()};
 }
};

/* ---------- Inuit-vinterlege (stue-turnering) ---------- */
const INU=[
 {t:'Knæspring (kneel jump)',r:'Knæl med benene fladt mod gulvet, og spring op og frem i én bevægelse, så du lander på begge fødder samtidig. Den, der springer længst og lander med balance, vinder. Mål med skridt eller tape.'},
 {t:'Alaskansk højt spark (Alaskan high kick)',r:'Sid ned, tag fat i den modsatte fod med en hånd, og spark til en ophængt genstand (fx en ballon eller en rullet sok, som en anden holder i stigende højde). Kun én hånd må røre gulvet, og du skal lande kontrolleret på sparkefoden.'},
 {t:'Enhåndsræk (one-hand reach)',r:'Balancér på begge hænder, løft den ene hånd, og rør en ophængt genstand. Sæt så hånden tilbage i gulvet uden at andre kropsdele rører det.'},
 {t:'Armtræk (arm pull)',r:'To deltagere trækker langsomt og jævnt i hinandens albue på signal, mens den anden hånd støttes mod modstanderens ankel. Målet er at trække modstanderen over eller få modstanderens hånd til at røre brystet.'}];
KINDS.inuit={
 init(){g.inu=INU[rnd(INU.length)];g.inI=false},
 render(){
  if(!g.inI)return '<div class="card glass"><div class="q">🏔️ Inuit-vinterlege</div>'+rules('inuit')+'<p class="hint" style="text-align:left">⚠️ Knoglehop og ørerul er smertefulde og bruges ikke i stuen. Prøv kun de øvrige på et blødt underlag med god plads, og stop, hvis det gør ondt.</p><div class="row"><button class="btn big" id="ingo">▶ Træk en disciplin</button></div></div>';
  return '<div class="card glass"><div class="q">'+esc(g.inu.t)+'</div><div class="rulebox">'+esc(g.inu.r)+'</div><p class="hint">Prøv på skift. De andre er dommere. Hvem vandt disciplinen? (+3 point)</p>'+awardChips(3,-1)+'<div class="row" style="margin-top:12px"><button class="btn ghost" id="skip">Ingen – ny disciplin →</button></div></div>';
 },
 bind(){const $=id=>document.getElementById(id);if($('ingo'))$('ingo').onclick=()=>{g.inI=true;render()}}
};

const W=[
 {id:'shiri',key:'shiri',kind:'shiri',t:'Shiritori',d:'Japansk ordkæde – hvert ord skal starte med det forrige ords sidste bogstav',e:'🔤',g:'linear-gradient(135deg,#ff758c,#ff7eb3)'},
 {id:'yut',key:'yut',kind:'yut',t:'Yut Nori',d:'Koreansk kastespil med fire pinde – først i mål vinder',e:'🎲',g:'linear-gradient(135deg,#00b4d8,#e63946)'},
 {id:'suit',key:'suit',kind:'suit',t:'Suit Jawa',d:'Indonesisk håndspil: elefant, menneske, myre',e:'🐘',g:'linear-gradient(135deg,#6a4c93,#2ec4b6)'},
 {id:'shagai',key:'shagai',kind:'shagai',t:'Shagai',d:'Mongolsk knoglekast: fire ankelknogler, fire sider – hest, kamel, får og ged',e:'🐑',g:'linear-gradient(135deg,#8d6e63,#ffb703)'},
 {id:'inuit',key:'inuit',kind:'inuit',t:'Inuit-vinterlege',d:'Arktiske idrætsgrene i stuen – knæspring, højt spark, enhåndsræk og armtræk',e:'🏔️',g:'linear-gradient(135deg,#a8dadc,#457b9d)'},
 {id:'lot',key:'lot',kind:'lot',t:'Lotería',d:'Mexicansk billedbingo – første med en hel række råber Lotería!',e:'🎴',g:'linear-gradient(135deg,#f9d423,#e63946)'}];
const f2=window.HS_FINISH;
window.HS_FINISH=function(){
 f2&&f2();
 try{W.forEach(w=>{if(cult(w.id).id&&!GAMES.find(a=>a.id===w.id)){GAMES.push(Object.assign({grp:GRP_W,min:2},w));DATA[w.key]=DATA[w.key]||[w.id]}})}catch(e){console.error('HS cult',e)}
};
})();

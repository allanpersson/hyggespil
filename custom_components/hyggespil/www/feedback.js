/* Hyggespil: feedback-knap (💬) i hvert spil.
   Spillet sender aldrig noget selv. «Åbn sag på GitHub» åbner en færdigudfyldt sag i en ny fane, og spilleren sender den selv.
   Med i sagen: spillerens tekst, spillets navn og – hvis fluebenet står – version, browser, antal spillere og de seneste
   tekniske fejlmeddelelser. Aldrig navne, aldre eller point. Tekniske fejl logges kun lokalt (hs_errorlog). */
(function(){
if(window.hsFeedbackBox)return;
const K_ERR='hs_errorlog',K_SENT='hs_feedback_sent',MAXLOG=40;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsGet=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const game=()=>(typeof GAMES!=='undefined'&&typeof view==='string'&&GAMES.find(x=>x.id===view))||null;
const KINDS_FB=['Fejl','Forkert svar eller facit','Forslag','Upassende indhold'];

const st=document.createElement('style');
st.textContent='.fbk.sel{background:#fff;color:#1d1447}.fbt{width:100%;min-height:110px;font:inherit;font-size:16px;background:#241a55;color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:12px;box-sizing:border-box}.fbs{width:auto;height:auto;padding:6px 12px}';
document.head.appendChild(st);

/* ---------- lokal fejllog ---------- */
window.hsLogError=function(where,e){
 try{const l=lsGet(K_ERR)||[];
  l.push({d:new Date().toISOString().slice(0,19).replace('T',' '),v:window.HSCFG?HSCFG.version:'?',where:String(where).slice(0,40),msg:String(e&&e.message||e||'').slice(0,160),game:typeof view==='string'?view:'home'});
  while(l.length>MAXLOG)l.shift();lsSet(K_ERR,l)}catch(x){}};
window.hsErrors=()=>lsGet(K_ERR)||[];
const errText=l=>l.map(e=>`${e.d} v${e.v} [${e.game}] ${e.where}: ${e.msg}`).join('\n');
addEventListener('error',e=>window.hsLogError('fejl',e.error||e.message));
addEventListener('unhandledrejection',e=>window.hsLogError('promise',e.reason));

/* ---------- sagens tekst ---------- */
function tech(){
 const x=window.hsAgeMode,n=typeof players!=='undefined'?players:[],gs=game();
 const rows=['Spil: '+(gs?gs.t+' ('+gs.id+')':'forsiden'),'Version: '+(window.HSCFG?HSCFG.version:'?'),'Browser: '+String(navigator.userAgent).slice(0,110),
  'Spillere: '+n.length+(x?' (børn: '+n.filter(p=>x.isKid(p)).length+', under 18: '+n.filter(p=>x.isMinor(p)).length+')':'')];
 const er=window.hsErrors().slice(-5);
 if(er.length)rows.push('','Seneste tekniske fejl:',errText(er));
 return rows.join('\n')}
function body(text,kind,withTech){
 return '**'+kind+'**\n\n'+text.trim().slice(0,1500)+'\n\n'+(withTech?'```\n'+tech()+'\n```\n\n':'')+'_Sendt fra 💬-knappen i Hyggespil._\n'}
function issueUrl(title,text){
 const r=(window.HSCFG||{}).repo||'';if(!/^[\w.-]+\/[\w.-]+$/.test(r))return null;
 return 'https://github.com/'+r+'/issues/new?'+new URLSearchParams({title:title.slice(0,100),body:text}).toString()}
function remember(o){const l=lsGet(K_SENT)||[];l.push(o);while(l.length>100)l.shift();lsSet(K_SENT,l)}

/* ---------- dialog ---------- */
function box(){
 const gs=game(),title=gs?gs.t:'Hyggespil',id=gs?gs.id:'home',nerr=window.hsErrors().length;
 const d=document.createElement('div');d.className='modal';
 d.innerHTML=`<div class="mbox" style="max-height:92vh;overflow:auto">
 <h3 style="margin-top:0">💬 Feedback til «${esc(title)}»</h3>
 <p class="hint" style="text-align:left;margin:0 0 10px">Hvad er galt, eller hvad kunne blive bedre? Intet sendes, før du selv trykker på en knap nedenfor.</p>
 <div class="row" style="flex-wrap:wrap;gap:6px">${KINDS_FB.map(k=>`<button class="btn ghost fbk fbs" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
 <div style="height:8px"></div>
 <textarea class="fbt" id="ftx" maxlength="1500" placeholder="Skriv her… (ingen navne eller andre personlige oplysninger – sagen bliver offentlig)"></textarea>
 <p class="hint" style="text-align:left;margin:8px 0 2px"><label><input type="checkbox" id="fdiag" checked> Vedlæg tekniske oplysninger: version, browser, antal spillere${nerr?' og de seneste fejlmeddelelser':''} – ingen navne, aldre eller point</label></p>
 <div class="row" style="margin-top:12px"><button class="btn big green" id="fgo">Åbn sag på GitHub ↗</button><button class="btn ghost" id="fcopy">Kopiér teksten</button></div>
 <p class="hint" style="text-align:left">«Åbn sag på GitHub» åbner en færdigudfyldt sag i en ny fane (kræver en GitHub-konto). Du sender den selv dér.</p>
 <p class="hint" id="fmsg" style="text-align:left;font-weight:700"></p>
 <div class="row"><button class="btn ghost" id="fclose">Luk</button></div></div>`;
 document.body.appendChild(d);
 const $=q=>d.querySelector('#'+q);let kind='';
 d.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{kind=b.dataset.k;d.querySelectorAll('[data-k]').forEach(x=>x.classList.toggle('sel',x===b));$('ftx').focus()});
 $('fclose').onclick=()=>d.remove();
 const collect=()=>{const t=$('ftx').value.trim();
  if(!t){$('ftx').classList.add('shake');setTimeout(()=>$('ftx').classList.remove('shake'),400);$('ftx').focus();return null}
  const k=kind||'Feedback';return {k,text:body(t,k,$('fdiag').checked),title:'['+title+'] '+t.replace(/\s+/g,' ').slice(0,60)}};
 const done=(c,opened)=>remember({d:new Date().toISOString().slice(0,10),game:id,kind:c.k,opened});
 const copy=t=>{try{navigator.clipboard.writeText(t);return true}catch(e){return false}};
 $('fgo').onclick=()=>{const c=collect();if(!c)return;const u=issueUrl(c.title,c.text);
  if(u&&window.open(u,'_blank','noopener')!==undefined){done(c,true);$('fmsg').textContent='Sagen er åbnet i en ny fane – husk at sende den dér.'}
  else{copy(c.text);done(c,false);$('fmsg').textContent='Kunne ikke åbne GitHub. Teksten er kopieret, så du kan sætte den ind i en sag selv.'}};
 $('fcopy').onclick=()=>{const c=collect();if(!c)return;done(c,false);
  $('fmsg').textContent=copy(c.text)?'Teksten er kopieret.':'Kunne ikke kopiere – markér og kopiér teksten selv.'};
 $('ftx').focus();
}
window.hsFeedbackBox=box;

/* ---------- knapper: i baren i hvert spil og nederst på forsiden ---------- */
const g0=window.game;
window.game=function(){const r=g0.apply(this,arguments);
 try{const bar=document.querySelector('#main .bar');
  if(bar&&!document.getElementById('fbtn')){const b=document.createElement('button');b.className='btn ghost';b.id='fbtn';b.textContent='💬';b.title='Feedback om dette spil';
   b.onclick=box;const e=document.getElementById('endg');e?bar.insertBefore(b,e):bar.appendChild(b)}}catch(e){window.hsLogError('feedback-knap',e)}
 return r};
const h0=window.home;
window.home=function(){
 const r=h0.apply(this,arguments);
 try{
  const f=document.getElementById('fhome');
  if(f)f.onclick=box;
  const s=document.getElementById('fstotte');
  if(s)s.onclick=()=>window.hsStotte&&window.hsStotte();
 }catch(e){window.hsLogError('feedback-forside',e)}
 return r};
})();

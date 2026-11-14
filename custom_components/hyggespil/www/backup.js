/* Sikkerhed for brugerens data: eksport/imap af alt, hvad spillet gemmer lokalt (spillere, point, grupper,
   egne spørgsmål, glemte spil, 🔞-kode-kontrolsum). Kører helt udenfor nettet – teksten vises i et felt,
   som brugeren selv kan gemme på sin computer. */
(function(){
if(window.__backupLoaded)return;window.__backupLoaded=true;
const NØGLER=['hs_players','hs_own','hs_groups','hs_resume2','hs_xlock','hs_forst','hs_cfg','hs_feedback_sent','hs_errorlog'];
const praefiks=['hs_seen2_','hs_hjem'];
function samling(){
 const data={_art:'hyggespil-data',_version:(window.HSCFG||{}).version||'?',_tidspunkt:new Date().toISOString(),nøgle:HSCFG&&HSCFG.repo||'',indhold:{}};
 NØGLER.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)data.indhold[k]=v});
 Object.keys(localStorage).forEach(k=>{if(praefiks.some(p=>k.startsWith(p)))data.indhold[k]=localStorage.getItem(k)});
 return data;
}
function vis(g){
 const d=document.createElement('div');d.className='modal';
 const tekst=JSON.stringify(g,null,1);
 d.innerHTML=`<div class="mbox" style="max-height:92vh;overflow:auto"><h3 style="margin-top:0">${g?'Sikkerhedskopi af dit spil':'Genopret data'}</h3>
 <p class="hint" style="text-align:left">${g?'Alt hvad spillet gemmer på <b>denne enhed</b>. Kopiér teksten og gem den et sted, du selv ejer (fx en fil på computeren). Den indeholder dine spillernavne – del den kun med dig selv.':'Sæt ind en tidligere sikret kopi (den tekst du fik via «Sikkerhedskopi»), og tryk Genskab.'}</p>
 ${g?`<textarea class="fbt" id="btx" readonly rows="12" style="width:100%;font-size:11px;background:#241a55;color:#fff;border-radius:12px;padding:10px"></textarea>
 <div class="row" style="margin-top:10px"><button class="btn big green" id="bcp">Kopiér teksten</button><button class="btn" id="bdl">Download som fil</button></div>`
 :`<textarea class="fbt" id="btx" rows="12" placeholder="sæt ind her…" style="width:100%;font-size:11px;background:#241a55;color:#fff;border-radius:12px;padding:10px"></textarea>
 <div class="row" style="margin-top:10px"><button class="btn big green" id="brest">Genskab data</button></div>`}
 <p class="hint" id="bmsg" style="min-height:1.1em;color:#ffb703"></p>
 <div class="row"><button class="btn ghost" id="bluk">Luk</button></div></div>`;
 document.body.appendChild(d);
 const $=q=>d.querySelector('#'+q);
 $('btx').value=tekst;
 const msg=t=>{$('bmsg').textContent=t||''};
 $('bluk').onclick=()=>d.remove();
 if($('bcp'))$('bcp').onclick=async()=>{try{await navigator.clipboard.writeText(tekst);msg('Teksten er kopieret. Gem den et sikkert sted.')}catch(e){msg('Kunne ikke kopiere – markér teksten og kopiér den selv.')}};
 if($('bdl'))$('bdl').onclick=()=>{const b=new Blob([tekst],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='hyggespil-sikkerhedskopi-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);msg('Filens download er startet.')};
 if($('brest'))$('brest').onclick=()=>{
  let o;try{o=JSON.parse($('btx').value)}catch(e){return msg('Det var ikke gyldig tekst.')}
  if(!o||o._art!=='hyggespil-data'||!o.indhold)return msg('Filen ser ikke ud til at være en Hyggespil-kopi.');
  Object.keys(o.indhold).forEach(k=>{try{localStorage.setItem(k,String(o.indhold[k]))}catch(e){}});
  msg('Data er genskabt. Genindlæser…');setTimeout(()=>location.reload(),900)};
}
window.hsBackup=()=>vis(samling());
window.hsRestore=()=>vis(false);
/* knapper i 👥 Spillere-dialogen */
const mh=window.modalHTML;
window.modalHTML=function(){
 let h=mh.apply(this,arguments);
 if(modal==='pl'&&h.includes('</div></div>')){
  h=h.replace('<div class="row"><button class="btn green" id="closem"',
   '<p class="hint" style="text-align:left;margin-top:14px">💾 Alt sammen (spillere, point, sæsoner, egne spørgsmål, 🔞-kode) ligger kun på denne enhed. Du kan sikre det selv:</p>'+
   '<div class="row"><button class="btn ghost" id="bexp">Sikkerhedskopi</button><button class="btn ghost" id="bimp">Genskab fra kopi</button></div>'+
   '<div class="row"><button class="btn green" id="closem"');
 }
 return h};
const bm=window.bindModal;
window.bindModal=function(){
 bm.apply(this,arguments);
 const e=document.getElementById('bexp');if(e)e.onclick=window.hsBackup;
 const i=document.getElementById('bimp');if(i)i.onclick=window.hsRestore};
})();

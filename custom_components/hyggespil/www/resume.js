/* Beskyttelse mod at afslutte ved en fejl + "Fortsæt hvor jeg kom til".
   - Afslut spil (og Ny aften) kræver at man HOLDER knappen nede.
   - Spiltilstanden gemmes løbende, så et afsluttet/afbrudt spil kan genoptages (resultatsiden og forsiden). */
(function(){
if(window.__resumeLoaded)return;window.__resumeLoaded=true;
const KEY='resume2',MAXN=1,ACT=12*3600e3,ENDED=15*60e3,HOLD=1200;  // MAXN=1: kun det sidste spil kan fortsættes
let RID=null;
const st=document.createElement('style');
st.textContent='.hold{position:relative;overflow:hidden;width:100%;max-width:380px;padding:16px 18px;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-touch-callout:none}.hold .hf{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.38)}.hold .ht{position:relative}'
+'.rsm{display:grid;gap:10px;margin:0 0 18px}.rsr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 14px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.07)}.rsr .rst{flex:1;min-width:180px}.rsr small{display:block;opacity:.75;margin-top:2px}';
document.head.appendChild(st);

const sig=()=>(window.hsGroupId&&window.hsGroupId!=='g0'?window.hsGroupId+'#':'')+players.map(p=>p.n).join('|');
const all=()=>{const a=LS.get(KEY,[]);return Array.isArray(a)?a:[]};
const live=()=>{const t=Date.now();return all().filter(s=>s&&s.g&&(s.ended?t-s.ended<ENDED:t-s.ts<ACT))};

function snap(){
 if(view==='home'||!RID||!g||g.done||g.item===undefined)return;
 let copy;try{copy=JSON.parse(JSON.stringify(g))}catch(e){return}
 const a=live().filter(s=>s.id!==RID);
 a.unshift({id:RID,view,sig:sig(),ts:Date.now(),g:copy});
 LS.set(KEY,a.slice(0,MAXN));
}
function markEnded(){const a=all(),s=a.find(x=>x.id===RID);if(s){s.ended=Date.now();LS.set(KEY,a)}}

function doResume(id){
 const s=all().find(x=>x.id===id);if(!s)return;
 if(s.sig!==sig()){alert('Spillerne er ændret siden dette spil, så det kan ikke fortsættes.');return}
 if(!gm(s.view)){alert('Spillet er låst.');return}
 clearInterval(tid);RID=s.id;view=s.view;g=JSON.parse(JSON.stringify(s.g));g.done=false;
 if(window.hsMix)window.hsMix.set(g.mixmode||null);
 if(g.tend&&g.tend>Date.now())tid=setInterval(tick,250);
 modal=null;render();scrollTo(0,0);
}

function hold(o){
 const d=document.createElement('div');d.className='modal';
 d.innerHTML='<div class="mbox"><h3 style="margin-top:0">'+esc(o.title)+'</h3><p class="hint">'+esc(o.text)+'</p>'
 +'<div class="row"><button class="btn big green" id="hk">'+esc(o.keep)+'</button></div>'
 +'<div class="row" style="margin-top:22px"><button type="button" class="btn red hold" id="hd"><span class="hf"></span><span class="ht">'+esc(o.label)+'</span></button></div></div>';
 document.body.appendChild(d);
 const hd=d.querySelector('#hd'),hf=d.querySelector('.hf'),ht=d.querySelector('.ht');
 let t0=0,raf=0,done=false;
 const reset=()=>{cancelAnimationFrame(raf);t0=0;hf.style.width='0';ht.textContent=o.label};
 const fire=()=>{if(done)return;done=true;d.remove();o.yes()};
 const step=()=>{if(!t0)return;const p=Math.min(1,(performance.now()-t0)/HOLD);hf.style.width=(p*100)+'%';ht.textContent=p<1?'Hold… bliv ved':'Afslutter…';if(p>=1)fire();else raf=requestAnimationFrame(step)};
 hd.addEventListener('pointerdown',e=>{e.preventDefault();try{hd.setPointerCapture(e.pointerId)}catch(_){}t0=performance.now();raf=requestAnimationFrame(step)});
 ['pointerup','pointercancel','pointerleave','lostpointercapture'].forEach(n=>hd.addEventListener(n,()=>{if(!done)reset()}));
 hd.addEventListener('contextmenu',e=>e.preventDefault());
 hd.addEventListener('click',e=>{if(e.detail===0)fire()});
 d.querySelector('#hk').onclick=()=>{done=true;cancelAnimationFrame(raf);d.remove()};
 d.querySelector('#hk').focus();
}

const ask0=window.ask;
window.ask=function(text,yes){
 if(/^Afslut spillet/.test(text))return hold({title:'Afslutte spillet?',text:'Pointene bevares, og du kan bagefter fortsætte lige der, hvor du var kommet til.',keep:'▶ Fortsæt med at spille',label:'Hold nede for at afslutte',yes:()=>{markEnded();yes()}});
 if(/^Nulstil alle point/.test(text))return hold({title:'Starte en ny aften?',text:'Alle point nulstilles, og igangværende spil kan ikke fortsættes bagefter.',keep:'Annuller',label:'Hold nede for at nulstille',yes:()=>{LS.set(KEY,[]);yes()}});
 return ask0.apply(this,arguments);
};

const s0=window.start;
window.start=function(){RID='r'+Date.now();return s0.apply(this,arguments)};

const r0=window.render;
window.render=function(){const r=r0.apply(this,arguments);try{snap()}catch(e){console.warn('HS resume',e)}return r};

const res0=window.results;
window.results=function(){
 let h=res0.apply(this,arguments);
 if(all().some(s=>s.id===RID))h=h.replace('<div class="row"><button class="btn big green" id="again">','<p class="hint">Afsluttede du ved en fejl? Så kan du fortsætte lige der, hvor du var kommet til.</p><div class="row"><button class="btn big" id="resumeg">↩ Fortsæt hvor jeg kom til</button></div><div class="row"><button class="btn big green" id="again">');
 return h;
};
const bg0=window.bindGame;
window.bindGame=function(){const r=bg0.apply(this,arguments);const b=document.getElementById('resumeg');if(b){const id=RID;b.onclick=()=>doResume(id)}return r};

const ago=t=>{const m=Math.floor((Date.now()-t)/60000);return m<1?'under 1 min':m<60?m+' min':Math.floor(m/60)+' t '+(m%60)+' min'};
const h0=window.home;
window.home=function(){
 const r=h0.apply(this,arguments);
 try{
  const m=document.getElementById('main');if(!m)return r;
  const list=live().filter(s=>s.sig===sig()&&gm(s.view));if(!list.length)return r;
  m.insertAdjacentHTML('afterbegin','<div class="rsm">'+list.map(s=>{const x=gm(s.view),gp=(s.g&&s.g.gp)||{};
   const pts=players.map((p,i)=>esc(p.n)+' '+(gp[i]||0)).join(' · ');
   return '<div class="rsr"><div class="rst"><b>'+(s.g&&s.g.mixmode?(s.g.mixmode==='prov'?'📜 ':'🎲 '):'')+x.e+' '+esc(x.t)+'</b><small>'+(s.ended?'Afsluttet':'Afbrudt')+' for '+ago(s.ended||s.ts)+' siden · point i spillet: '+pts+'</small></div><button class="btn green" data-rs="'+s.id+'">▶ Fortsæt</button><button class="btn ghost" data-rx="'+s.id+'" title="Fjern">✕</button></div>'}).join('')+'</div>');
  m.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>doResume(b.dataset.rs));
  m.querySelectorAll('[data-rx]').forEach(b=>b.onclick=()=>{LS.set(KEY,all().filter(s=>s.id!==b.dataset.rx));render()});
 }catch(e){console.warn('HS resume banner',e)}
 return r;
};
window.hsResume={all,live,doResume};window.hsHold=hold;
})();

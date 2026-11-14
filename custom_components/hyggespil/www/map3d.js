/* 3D-globus til "Sæt knappenålen": ingen navne, men søer, floder, skove, ørkener og bjerge. Alt ligger lokalt (three.min.js + world3d.js). */
(function(){
if(window.__map3dLoaded)return;window.__map3dLoaded=true;
const V='1',D2R=Math.PI/180;
let G=null;
window.globeReady=false;window.globeError=null;
function load(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('kunne ikke hente '+src));document.head.appendChild(s)})}
function boot(){
 let p=Promise.resolve();
 if(!window.THREE)p=p.then(()=>load('three.min.js?g='+V));
 if(!window.W3D)p=p.then(()=>load('world3d.js?g='+V));
 return p.then(()=>new Promise(r=>setTimeout(r,60))).then(()=>{G=build();window.globeDbg=G;window.globeReady=true}).catch(e=>{window.globeError=String(e&&e.stack||e);console.warn('HS globus',e)});
}
window.globeBoot=boot;
window.globeMap=(box,cb)=>G?G.attach(box,cb):null;
if(!window.__noGlobeBoot)setTimeout(boot,500);

const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function hash(x,y){let h=Math.imul(x,374761393)+Math.imul(y,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y)=>(vn(x,y)*.5+vn(x*2.03+5,y*2.03+9)*.25+vn(x*4.1+13,y*4.1+3)*.125+vn(x*8.3+1,y*8.3+7)*.0625)/.9375;
const gs=(lat,lon,a,b,c,d)=>{const x=(lat-a)/c,y=(lon-b)/d;return Math.exp(-(x*x+y*y))};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const DES=[[23,10,7,24,1],[24,45,7,10,1],[27,71,3,4,.8],[41,95,4,16,.9],[34,-112,5,6,.8],[-26,134,7,14,.9],[-23,18,6,7,.9],[-24,-70,6,2,1],[15,30,4,6,.5],[33,55,4,7,.6]];
const STP=[[46,65,5,16,.6],[-44,-69,6,4,.5],[45,105,3,12,.5],[40,-102,6,6,.5],[-30,25,4,6,.4]];
const MTN=[[32,88,5,14,1],[-20,-68,25,2.8,1],[5,-75,8,3,.7],[45,-112,15,4,.8],[46.5,10,2,6,.8],[42.5,44,1.5,5,.8],[58,60,10,1.5,.5],[63,13,6,2.5,.6],[9,39,4,4,.6],[45,85,3,12,.7],[38,-80,8,3,.35],[-30,150,12,2,.35],[32,-5,2,7,.5],[32,50,4,4,.5],[35,70,4,8,.8],[61,-150,3,10,.8],[-43,170,3,3,.8],[27,-105,9,3,.5]];
const VEG=[[0,[31,122,61]],[10,[42,125,62]],[18,[134,160,67]],[26,[154,160,76]],[36,[88,144,63]],[48,[74,138,60]],[56,[45,95,59]],[63,[63,107,69]],[68,[154,165,138]],[74,[228,237,241]],[90,[244,249,251]]];
const SAND=[214,182,106],DUNE=[196,152,84],STEP=[170,164,90],ROCK=[132,124,110],SNOW=[240,244,246];
const mixc=(a,b,t,o)=>{o[0]=a[0]+(b[0]-a[0])*t;o[1]=a[1]+(b[1]-a[1])*t;o[2]=a[2]+(b[2]-a[2])*t};

const S={r:0,g:0,b:0,h:0,des:0,stp:0,ice:0};
const tmp=[0,0,0];
function sample(lat,lon){
 const a=Math.abs(lat);
 let d=0,sp=0,m=0;
 for(const e of DES)d+=e[4]*gs(lat,lon,e[0],e[1],e[2],e[3]);
 for(const e of STP)sp+=e[4]*gs(lat,lon,e[0],e[1],e[2],e[3]);
 for(const e of MTN)m+=e[4]*gs(lat,lon,e[0],e[1],e[2],e[3]);
 const n=fbm(lon*.11+7,lat*.11+3),n2=fbm(lon*.5+2,lat*.5+8);
 d=clamp(d*(.75+.5*n),0,1);sp=clamp(sp*(.8+.4*n),0,1);
 let h=clamp(m*(.5+n2),0,1);
 let ice=Math.max(smooth(-60,-66,lat),clamp((gs(lat,lon,72,-40,11,20)*1.4-.2)*2.5,0,1));
 if(ice>0)h=Math.max(h,.3*ice);
 let i=0;while(i<VEG.length-2&&a>VEG[i+1][0])i++;
 const t=clamp((a-VEG[i][0])/(VEG[i+1][0]-VEG[i][0]),0,1);
 mixc(VEG[i][1],VEG[i+1][1],t,tmp);
 const f=.82+.36*n;let r=tmp[0]*f,g=tmp[1]*f,b=tmp[2]*f;
 tmp[0]=r;tmp[1]=g;tmp[2]=b;
 if(sp>0){mixc(tmp,STEP,sp*.8,tmp)}
 if(d>0){const sd=[0,0,0];mixc(SAND,DUNE,n2,sd);mixc(tmp,sd,Math.min(1,d*1.1),tmp)}
 const rk=smooth(.22,.6,h);if(rk>0)mixc(tmp,ROCK,rk*.85,tmp);
 const sn=smooth(.58,.9,h);if(sn>0)mixc(tmp,SNOW,sn,tmp);
 if(ice>0)mixc(tmp,SNOW,ice,tmp);
 S.r=tmp[0];S.g=tmp[1];S.b=tmp[2];S.h=h;S.des=d;S.stp=sp;S.ice=ice;
 return S;
}

function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function mkPath(rings,s,close){const P=new Path2D();for(const r of rings){P.moveTo((r[0]+180)*s,(90-r[1])*s);for(let i=2;i<r.length;i+=2)P.lineTo((r[i]+180)*s,(90-r[i+1])*s);if(close)P.closePath()}return P}

function makeTextures(TW){
 const W3=window.W3D,TH=TW/2,k=TW/4096;
 const BW=720,BH=360;
 const bc=mkCanvas(BW,BH),nc=mkCanvas(BW,BH);
 {
  const cx=bc.getContext('2d'),ci=cx.createImageData(BW,BH);
  const HH=new Float32Array(BW*BH),HT=new Float32Array(BW*BH);
  for(let y=0;y<BH;y++){const lat=90-(y+.5)*180/BH;for(let x=0;x<BW;x++){const lon=(x+.5)*360/BW-180,s=sample(lat,lon),o=(y*BW+x)*4;ci.data[o]=s.r;ci.data[o+1]=s.g;ci.data[o+2]=s.b;ci.data[o+3]=255;HH[y*BW+x]=s.h}}
  for(let it=0;it<3;it++){
   for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){let a=0,n=0;for(let d=-2;d<=2;d++){const xx=x+d;if(xx>=0&&xx<BW){a+=HH[y*BW+xx];n++}}HT[y*BW+x]=a/n}
   for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){let a=0,n=0;for(let d=-2;d<=2;d++){const yy=y+d;if(yy>=0&&yy<BH){a+=HT[yy*BW+x];n++}}HH[y*BW+x]=a/n}
  }
  const nx=nc.getContext('2d'),ni=nx.createImageData(BW,BH),NS=3.2;
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){
   const xl=Math.max(0,x-1),xr=Math.min(BW-1,x+1),yu=Math.max(0,y-1),yd=Math.min(BH-1,y+1);
   const gx=(HH[y*BW+xr]-HH[y*BW+xl])*.5*NS,gy=(HH[yd*BW+x]-HH[yu*BW+x])*.5*NS;
   const X=-gx,Y=gy,l=Math.sqrt(X*X+Y*Y+1),o=(y*BW+x)*4;
   ni.data[o]=(X/l*.5+.5)*255;ni.data[o+1]=(Y/l*.5+.5)*255;ni.data[o+2]=(1/l*.5+.5)*255;ni.data[o+3]=255;
  }
  nx.putImageData(ni,0,0);
  cx.putImageData(ci,0,0);
 }
 const sc=TW/360,land=mkPath(W3.land,sc,true),lakes=mkPath(W3.lakes,sc,true),rivers=mkPath(W3.rivers,sc,false);
 const col=mkCanvas(TW,TH),c=col.getContext('2d');
 const og=c.createLinearGradient(0,0,0,TH);
 [[0,'#12407a'],[.3,'#0d4f93'],[.5,'#10609f'],[.7,'#0d4f93'],[1,'#12407a']].forEach(s=>og.addColorStop(s[0],s[1]));
 c.fillStyle=og;c.fillRect(0,0,TW,TH);
 c.lineJoin='round';
 [[13,.07],[7,.12],[3.5,.2]].forEach(s=>{c.strokeStyle='rgba(95,205,235,'+s[1]+')';c.lineWidth=s[0]*k;c.stroke(land)});
 c.save();c.clip(land,'evenodd');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(bc,0,0,TW,TH);c.restore();
 c.strokeStyle='rgba(205,200,150,.5)';c.lineWidth=2*k;c.stroke(land);
 c.fillStyle='#2c86d4';c.fill(lakes);
 c.strokeStyle='rgba(150,215,245,.9)';c.lineWidth=1.4*k;c.stroke(lakes);
 c.strokeStyle='rgba(72,152,228,.8)';c.lineWidth=1.25*k;c.lineCap='round';c.stroke(rivers);
 const spec=mkCanvas(1024,512),sp=spec.getContext('2d'),ss=1024/360;
 sp.fillStyle='#fff';sp.fillRect(0,0,1024,512);sp.fillStyle='#000';sp.fill(mkPath(W3.land,ss,true),'evenodd');sp.fillStyle='#fff';sp.fill(mkPath(W3.lakes,ss,true));
 const mask=mkCanvas(1440,720),m=mask.getContext('2d'),ms=1440/360;
 m.fillStyle='#000';m.fillRect(0,0,1440,720);m.fillStyle='#fff';m.fill(mkPath(W3.land,ms,true),'evenodd');m.fillStyle='#000';m.fill(mkPath(W3.lakes,ms,true));m.strokeStyle='#000';m.lineWidth=2;m.stroke(mkPath(W3.lakes,ms,true));
 return {col,bump:nc,spec,mask};
}

function ll2v(lat,lon,T,out){const a=lat*D2R,o=lon*D2R,c=Math.cos(a);return(out||new T.Vector3()).set(c*Math.cos(o),Math.sin(a),-c*Math.sin(o))}
function v2ll(v){return[Math.asin(clamp(v.y,-1,1))/D2R,Math.atan2(-v.z,v.x)/D2R]}
const wrap=l=>((l+540)%360)-180;

function makeTrees(T,maskCanvas,treeU){
 const MW=maskCanvas.width,MH=maskCanvas.height,md=maskCanvas.getContext('2d').getImageData(0,0,MW,MH).data;
 const R=rng(1337),N=10000,pines=[],broad=[];
 let tries=0;
 while(pines.length+broad.length<N&&tries<140000){
  tries++;
  const lat=Math.asin(2*R()-1)/D2R,lon=R()*360-180,a=Math.abs(lat);
  if(a>70)continue;
  const px=Math.min(MW-1,Math.floor((lon+180)/360*MW)),py=Math.min(MH-1,Math.floor((90-lat)/180*MH));
  if(md[(py*MW+px)*4]<200)continue;
  const s=sample(lat,lon);
  let p=a<14?.95:a<24?.45:a<45?.5:a<62?.85:a<68?.25:0;
  p*=(1-Math.min(1,s.des*1.2))*(1-s.stp*.7)*(1-s.ice)*(1-Math.min(1,s.h*1.4))*(.4+1.1*fbm(lon*.3+4,lat*.3+1));
  if(R()>p)continue;
  const kind=a>46?(R()<.85?0:1):a<14?(R()<.1?0:1):(R()<.45?0:1);
  (kind?broad:pines).push([lat,lon,a,R(),R(),R()]);
 }
 const up=new T.Vector3(0,1,0),d=new T.Object3D(),v=new T.Vector3(),q=new T.Quaternion(),col=new T.Color();
 const mk=(geo,list,colFn)=>{
  const mat=new T.MeshLambertMaterial({color:0xffffff});
  mat.onBeforeCompile=sh=>{sh.uniforms.uTS=treeU;sh.vertexShader='uniform float uTS;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed*=uTS;')};
  const mesh=new T.InstancedMesh(geo,mat,Math.max(1,list.length));
  mesh.count=list.length;mesh.frustumCulled=false;
  list.forEach((t,i)=>{
   ll2v(t[0],t[1],T,v);q.setFromUnitVectors(up,v);
   d.position.copy(v).multiplyScalar(.9995);d.quaternion.copy(q);
   const sz=.5+t[3]*.55;d.scale.set(sz,sz*(.85+t[4]*.4),sz);d.updateMatrix();
   mesh.setMatrixAt(i,d.matrix);colFn(col,t);mesh.setColorAt(i,col);
  });
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  return mesh;
 };
 const pineGeo=new T.ConeGeometry(.0058,.022,6).translate(0,.011,0);
 const roundGeo=new T.IcosahedronGeometry(.0072,1).scale(1,1.3,1).translate(0,.0088,0);
 const pm=mk(pineGeo,pines,(c,t)=>c.setHSL(.38+t[5]*.04,.5,.17+t[4]*.07));
 const bm=mk(roundGeo,broad,(c,t)=>{const a=t[2];if(a<14)c.setHSL(.34+t[5]*.03,.62,.21+t[4]*.08);else if(a<26)c.setHSL(.2+t[5]*.05,.5,.28+t[4]*.08);else c.setHSL(.27+t[5]*.06,.5,.26+t[4]*.1)});
 return [pm,bm];
}

function build(){
 const T=THREE;
 const canvas=document.createElement('canvas');
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 if(!renderer.getContext())throw new Error('WebGL mangler');
 renderer.outputEncoding=T.sRGBEncoding;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.setClearColor(0x060a1e,1);
 const TW=renderer.capabilities.maxTextureSize>=4096?4096:2048;
 const tx=makeTextures(TW);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.03,80);
 scene.add(new T.AmbientLight(0xc8d6ff,.62));
 const sun=new T.DirectionalLight(0xfff4e0,.95);sun.position.set(3,1.4,3.2);scene.add(sun);
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const ct=new T.CanvasTexture(tx.col);ct.encoding=T.sRGBEncoding;ct.anisotropy=aniso;
 const nt=new T.CanvasTexture(tx.bump),st=new T.CanvasTexture(tx.spec);
 const globe=new T.Group();scene.add(globe);
 const sphere=new T.Mesh(new T.SphereGeometry(1,96,64),new T.MeshPhongMaterial({map:ct,normalMap:nt,normalScale:new T.Vector2(1,1),specularMap:st,specular:new T.Color(0x16222f),shininess:60}));
 globe.add(sphere);
 const treeU={value:1};
 makeTrees(T,tx.mask,treeU).forEach(m=>globe.add(m));
 const atm=new T.Mesh(new T.SphereGeometry(1.13,64,48),new T.ShaderMaterial({
  vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'varying vec3 vN;void main(){float i=pow(max(0.0,0.74-dot(vN,vec3(0.0,0.0,1.0))),3.0);gl_FragColor=vec4(0.36,0.62,1.0,1.0)*i*1.15;}',
  blending:T.AdditiveBlending,side:T.BackSide,transparent:true,depthWrite:false}));
 scene.add(atm);
 {const sp=new Float32Array(900),R=rng(7);for(let i=0;i<300;i++){const u=R()*2-1,a=R()*6.2832,r=Math.sqrt(1-u*u);sp[i*3]=r*Math.cos(a)*30;sp[i*3+1]=u*30;sp[i*3+2]=r*Math.sin(a)*30}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(sp,3));scene.add(new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:.75,depthWrite:false})))}

 const DEF={lat:22,lon:12,dist:3.8},view=Object.assign({},DEF),tgt=Object.assign({},DEF);
 let raf=0,drag=false,box=null,onClick=null,ro=null,aspect=1;
 const pins=[],items=[];
 const pinScale=()=>.3+.6*(view.dist-1);
 function applyView(){
  globe.rotation.set(view.lat*D2R,(-90-view.lon)*D2R,0);
  camera.position.set(0,0,view.dist);
  treeU.value=.42+.43*Math.pow(clamp((view.dist-1)/2.8,0,1),.7);
  const s=pinScale();pins.forEach(p=>p.scale.setScalar(p.userData.big?s*1.2:s));
 }
 function frame(){
  raf=0;if(!canvas.isConnected)return;
  let busy=false;
  if(!drag){
   const dl=tgt.lat-view.lat,dn=wrap(tgt.lon-view.lon),dd=tgt.dist-view.dist;
   if(Math.abs(dl)>.02||Math.abs(dn)>.02||Math.abs(dd)>.002){view.lat+=dl*.2;view.lon=wrap(view.lon+dn*.2);view.dist+=dd*.2;busy=true}
   else{view.lat=tgt.lat;view.lon=tgt.lon;view.dist=tgt.dist}
  }
  applyView();renderer.render(scene,camera);
  if(busy)req();
 }
 function req(){if(!raf)raf=requestAnimationFrame(frame)}
 function resize(){
  if(!box)return;const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);aspect=w/h;camera.aspect=aspect;
  camera.fov=aspect>=1?36:2*Math.atan(Math.tan(18*D2R)/aspect)/D2R;
  camera.updateProjectionMatrix();req();
 }
 canvas.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab';
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.globeReady=false});

 const setDist=(d,instant)=>{tgt.dist=clamp(d,1.1,5.4);if(instant)view.dist=tgt.dist;req()};
 const zoom=(f,instant)=>setDist(1+(tgt.dist-1)*f,instant);
 const ptrs=new Map();let moved=0,ld=0;
 const pd=()=>{const a=[...ptrs.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
 const ray=new T.Raycaster();
 function pick(e){
  const r=canvas.getBoundingClientRect();
  applyView();camera.updateMatrixWorld();globe.updateMatrixWorld(true);
  ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-((e.clientY-r.top)/r.height)*2+1},camera);
  const hit=ray.intersectObject(sphere,false)[0];if(!hit)return;
  const p=sphere.worldToLocal(hit.point.clone()).normalize(),ll=v2ll(p);
  onClick(ll[0],ll[1]);
 }
 canvas.addEventListener('pointerdown',e=>{try{canvas.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;drag=true;canvas.style.cursor='grabbing';if(ptrs.size===2)ld=pd()});
 canvas.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
  if(ptrs.size===1){
   if(moved>6){const deg=2*Math.tan(camera.fov*D2R/2)*(view.dist-1)/(canvas.clientHeight||1)/D2R;
    view.lon=wrap(view.lon-dx*deg);view.lat=clamp(view.lat+dy*deg,-85,85);tgt.lat=view.lat;tgt.lon=view.lon;req()}
  }else if(ptrs.size===2){const nd=pd();if(ld>0&&nd>0){zoom(ld/nd,true)}ld=nd;moved=99}
 });
 const end=e=>{
  const single=ptrs.size===1&&ptrs.has(e.pointerId);
  if(single&&moved<8&&e.type==='pointerup'&&onClick)pick(e);
  ptrs.delete(e.pointerId);if(!ptrs.size){drag=false;canvas.style.cursor='grab'}req();
 };
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.22:.82)},{passive:false});

 function clearItems(){
  items.splice(0).forEach(o=>{globe.remove(o);o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material)n.material.dispose()})});
  pins.length=0;
 }
 function makePin(col,big){
  const g=new T.Group(),c=new T.Color(col);
  g.add(new T.Mesh(new T.ConeGeometry(.0065,.05,10).rotateX(Math.PI).translate(0,.025,0),new T.MeshPhongMaterial({color:0xe6e6ee,shininess:80})));
  g.add(new T.Mesh(new T.SphereGeometry(.021,20,16).translate(0,.066,0),new T.MeshPhongMaterial({color:c,emissive:c.clone().multiplyScalar(.3),shininess:70})));
  if(big)g.add(new T.Mesh(new T.RingGeometry(.034,.05,40).rotateX(-Math.PI/2).translate(0,.002,0),new T.MeshBasicMaterial({color:c,side:T.DoubleSide,transparent:true,opacity:.85})));
  g.userData.big=!!big;return g;
 }
 const up=new T.Vector3(0,1,0),vt=new T.Vector3();
 function place(g,lat,lon){ll2v(lat,lon,T,vt);g.position.copy(vt);g.quaternion.setFromUnitVectors(up,vt)}
 const api={
  mark(lat,lon,col,base){const g=makePin(col,(base||0)>=3);place(g,lat,lon);globe.add(g);items.push(g);pins.push(g);g.scale.setScalar(pinScale());req();return g},
  move(g,lat,lon){place(g,lat,lon);req()},
  line(a,b,col){
   const va=ll2v(a[0],a[1],T),vb=ll2v(b[0],b[1],T),w=Math.acos(clamp(va.dot(vb),-1,1));if(w<1e-3)return;
   const pts=[],sw=Math.sin(w);
   for(let i=0;i<=48;i++){const t=i/48,p=va.clone().multiplyScalar(Math.sin((1-t)*w)/sw).add(vb.clone().multiplyScalar(Math.sin(t*w)/sw)).normalize();p.multiplyScalar(1.006+.28*(w/Math.PI)*Math.sin(Math.PI*t));pts.push(p)}
   const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),64,.0042,6,false),new T.MeshBasicMaterial({color:new T.Color(col)}));
   globe.add(m);items.push(m);req();
  },
  fit(pts){
   const vs=pts.map(p=>ll2v(p[0],p[1],T)),m=new T.Vector3();vs.forEach(v=>m.add(v));if(m.length()<1e-3)m.copy(vs[0]);m.normalize();
   let om=0;vs.forEach(v=>{om=Math.max(om,Math.acos(clamp(v.dot(m),-1,1)))});
   const ll=v2ll(m),th=Math.min(om*1.4+.05,1.4),lim=Math.tan(camera.fov*D2R/2)*Math.min(1,aspect)*.8;
   let d=1.12;while(d<5.2&&Math.sin(th)/(d-Math.cos(th))>lim)d+=.04;
   tgt.lat=clamp(ll[0],-80,80);tgt.lon=ll[1];tgt.dist=clamp(d,1.15,5.2);req();
  }
 };
 function attach(b,cb){
  clearItems();box=b;onClick=cb;ptrs.clear();drag=false;
  b.innerHTML='';b.appendChild(canvas);
  const bt2=document.createElement('div');bt2.className='mapb';
  bt2.innerHTML="<button type='button' data-z='in'>+</button><button type='button' data-z='out'>−</button><button type='button' data-z='all'>⌂</button>";
  bt2.addEventListener('click',e=>{const z=e.target.dataset&&e.target.dataset.z;if(!z)return;if(z==='all'){Object.assign(tgt,DEF)}else zoom(z==='in'?.6:1.6);req()});
  b.appendChild(bt2);
  Object.assign(view,DEF);Object.assign(tgt,DEF);
  if(ro)ro.disconnect();
  if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(b)}
  resize();applyView();req();
  return api;
 }
 return {attach,renderer,scene,camera,globe,view,tgt,req};
}
})();

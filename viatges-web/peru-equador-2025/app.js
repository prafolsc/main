'use strict';
const lang=document.documentElement.lang==='es'?'es':'ca';
const isEs=lang==='es';
const chapter=document.body.dataset.chapter;
const photos=window.TRIP_PHOTOS.filter(p=>!chapter||p.chapter===chapter).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
const text=(ca,es)=>isEs?es:ca;
const localized=(p,key)=>p[key+'_'+lang];
const el=(tag,value)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;return node};
const date=p=>p.date?new Intl.DateTimeFormat(isEs?'es-ES':'ca-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(p.date.slice(0,10)+'T12:00:00Z')):'';
const selector=document.getElementById('language-select');
selector.addEventListener('change',()=>{const page=document.body.dataset.page;window.location.href=page+(selector.value==='es'?'-es':'')+'.html'+window.location.hash;});
const gallery=document.getElementById('gallery');
if(gallery){
 document.querySelector('.photo-total').textContent=photos.length+' '+text('fotografies · Toca una foto per ampliar-la.','fotografías · Toca una foto para ampliarla.');
 for(const [i,p] of photos.entries()){
  const figure=el('figure');const button=el('button');button.type='button';button.className='photo-button';button.setAttribute('aria-label',text('Amplia: ','Amplía: ')+(localized(p,'caption')||localized(p,'place')||p.filename));
  const img=el('img');img.src=p.src;img.alt=localized(p,'caption')||localized(p,'place')||p.filename;img.width=p.width;img.height=p.height;img.loading='lazy';img.decoding='async';button.append(img);button.addEventListener('click',()=>openPhoto(i));
  const caption=el('figcaption');const place=el('span',localized(p,'place'));place.className='photo-place';caption.append(place);
  if(localized(p,'caption')){const c=el('span',localized(p,'caption'));c.className='photo-caption';caption.append(c);}
  const meta=el('div');meta.className='photo-meta';meta.append(el('span',date(p)),el('span',p.filename));caption.append(meta);figure.append(button,caption);gallery.append(figure);
 }
}
const dialog=document.getElementById('lightbox');let photoIndex=0;let returnFocus=null;
function openPhoto(index){
 photoIndex=(index+photos.length)%photos.length;const p=photos[photoIndex];const img=document.getElementById('photo-large');img.src=p.src;img.alt=localized(p,'caption')||localized(p,'place')||p.filename;
 document.getElementById('photo-count').textContent=(photoIndex+1)+' / '+photos.length;
 const info=document.getElementById('photo-info');info.replaceChildren(el('strong',localized(p,'place')));
 if(localized(p,'caption'))info.append(el('p',localized(p,'caption')));
 const meta=el('p',[date(p),p.filename].filter(Boolean).join(' · '));meta.className='lightbox-meta';info.append(meta);
 if(Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)){const a=el('a',text('Veure el lloc a Google Maps ↗','Ver el lugar en Google Maps ↗'));a.href='https://www.google.com/maps?q='+p.latitude+','+p.longitude;a.target='_blank';a.rel='noopener';info.append(a);}
 if(!dialog.open){returnFocus=document.activeElement;dialog.showModal();}
}
document.getElementById('photo-prev').addEventListener('click',()=>openPhoto(photoIndex-1));document.getElementById('photo-next').addEventListener('click',()=>openPhoto(photoIndex+1));document.getElementById('photo-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(returnFocus)returnFocus.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft'){e.preventDefault();openPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();openPhoto(photoIndex+1);}});
const mapStatus=document.getElementById('map-status');
const located=photos.map((p,i)=>({p,i})).filter(({p})=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude)<=90&&Math.abs(p.longitude)<=180&&p.latitude<10&&p.longitude<-65);
if(window.L&&located.length){
 const map=L.map('trip-map',{scrollWheelZoom:false});
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(map);
 const groups=new Map();for(const entry of located){const key=Math.round(entry.p.latitude*150)+','+Math.round(entry.p.longitude*150);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);}
 for(const entries of groups.values()){
  const {p,i}=entries[0];const popup=el('div');const b=el('button');b.type='button';const img=el('img');img.src=p.src;img.alt=localized(p,'place');img.loading='lazy';b.append(img,el('strong',localized(p,'place')),el('div',entries.length+' '+text('fotografies','fotografías')));b.addEventListener('click',()=>openPhoto(i));popup.append(b);
  L.circleMarker([p.latitude,p.longitude],{radius:7,color:'#faf2e5',weight:2,fillColor:'#a84730',fillOpacity:.9}).addTo(map).bindPopup(popup);
 }
 map.fitBounds(L.latLngBounds(located.map(({p})=>[p.latitude,p.longitude])),{padding:[25,25],maxZoom:12});
 mapStatus.textContent=text('Es mostren les fotografies amb coordenades del viatge. Les fotos sense geolocalització continuen a la galeria.','Se muestran las fotografías con coordenadas del viaje. Las fotos sin geolocalización siguen en la galería.');
}else{mapStatus.textContent=text('El mapa no està disponible. Pots obrir les coordenades de cada fotografia des del visor.','El mapa no está disponible. Puedes abrir las coordenadas de cada fotografía desde el visor.');}

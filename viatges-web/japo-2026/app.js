'use strict';
const LANGUAGE=document.documentElement.lang==='es'?'es':'ca';
const LOCAL_PHOTOS=LANGUAGE==='es'?PHOTOS.map(p=>({...p,place:TRANSLATIONS_ES.places[p.place]??p.place,comments:p.comments?(TRANSLATIONS_ES.comments[p.order]??p.comments):''})):PHOTOS;

// Display-only adjustments approved in the six-photo comparison.
// Keep source image files, metadata and stable photo IDs unchanged.
const PHOTO_TONE_PRESETS=[{"table":"0.000000 0.033865 0.068287 0.103158 0.138379 0.173853 0.209488 0.245200 0.280908 0.316537 0.352014 0.387273 0.422252 0.456891 0.491140 0.524944 0.558260 0.591044 0.623259 0.654865 0.685835 0.716137 0.745747 0.774639 0.802796 0.830199 0.856834 0.882689 0.907754 0.932021 0.955487 0.978147 1.000000","saturation":1.12},{"table":"0.000000 0.039727 0.078906 0.117539 0.155625 0.193164 0.230156 0.266602 0.302500 0.337852 0.372656 0.406914 0.440625 0.473789 0.506406 0.538477 0.570000 0.600977 0.631406 0.661289 0.690625 0.719414 0.747656 0.775352 0.802500 0.829102 0.855156 0.880664 0.905625 0.930039 0.953906 0.977227 1.000000","saturation":1.045},{"table":"0.000000 0.033317 0.067198 0.101542 0.136256 0.171247 0.206431 0.241725 0.277053 0.312342 0.347522 0.382528 0.417302 0.451784 0.485923 0.519667 0.552970 0.585790 0.618087 0.649824 0.680969 0.711489 0.741359 0.770552 0.799047 0.826824 0.853865 0.880156 0.905685 0.930440 0.954416 0.977604 1.000000","saturation":1.12},{"table":"0.000000 0.034963 0.070469 0.106397 0.142634 0.179072 0.215613 0.252162 0.288631 0.324939 0.361008 0.396769 0.432156 0.467110 0.501573 0.535497 0.568834 0.601543 0.633587 0.664934 0.695550 0.725414 0.754502 0.782795 0.810276 0.836934 0.862758 0.887743 0.911885 0.935179 0.957627 0.979233 1.000000","saturation":1.12},{"table":"0.000000 0.032220 0.065021 0.098314 0.132016 0.166046 0.200328 0.234788 0.269356 0.303964 0.338549 0.373051 0.407411 0.441575 0.475490 0.509109 0.542385 0.575273 0.607734 0.639728 0.671220 0.702177 0.732566 0.762360 0.791532 0.820057 0.847912 0.875079 0.901538 0.927273 0.952270 0.976516 1.000000","saturation":1.12},{"table":"0.000000 0.042148 0.083594 0.124336 0.164375 0.203711 0.242344 0.280273 0.317500 0.354023 0.389844 0.424961 0.459375 0.493086 0.526094 0.558398 0.590000 0.620898 0.651094 0.680586 0.709375 0.737461 0.764844 0.791523 0.817500 0.842773 0.867344 0.891211 0.914375 0.936836 0.958594 0.979648 1.000000","saturation":1.025}];
function photoToneIndex(p){
  const sample={88:0,284:1,11:2,193:3,279:4,153:5};
  if(Object.prototype.hasOwnProperty.call(sample,p.order))return sample[p.order];
  if(p.category==='Busseig')return 5;
  if(p.category==='Esquí')return 0;
  if(p.category==='Menjar'||p.category==='Persones')return 2;
  if(p.category==='Temples i patrimoni')return 1;
  if(p.category==='Okinawa i costa')return 4;
  if(p.category)return 3;
  const place=(p.place||'').toLowerCase();
  if(/zenkō|senso|sensō|seiryu|temple/.test(place))return 1;
  if(/yuze|tazawako/.test(place))return 2;
  if(p.group==='Okinawa–Yaeyama')return 4;
  return 3;
}
const PHOTO_TONES=new Map(PHOTOS.map(p=>[p.order,photoToneIndex(p)]));
function installPhotoTones(){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs=document.createElementNS(ns,'defs');
  PHOTO_TONE_PRESETS.forEach((preset,i)=>{
    const filter=document.createElementNS(ns,'filter');
    filter.id='japan-photo-tone-'+i;
    filter.setAttribute('color-interpolation-filters','sRGB');
    const transfer=document.createElementNS(ns,'feComponentTransfer');
    for(const channel of ['R','G','B']){
      const fn=document.createElementNS(ns,'feFunc'+channel);
      fn.setAttribute('type','table');
      fn.setAttribute('tableValues',preset.table);
      transfer.append(fn);
    }
    const saturation=document.createElementNS(ns,'feColorMatrix');
    saturation.setAttribute('type','saturate');
    saturation.setAttribute('values',String(preset.saturation));
    filter.append(transfer,saturation);
    defs.append(filter);
  });
  svg.append(defs);
  document.body.prepend(svg);
}
function applyPhotoTone(image,p){
  const tone=PHOTO_TONES.get(p.order)??3;
  image.style.filter='url(#japan-photo-tone-'+tone+')';
  image.dataset.photoTone=String(tone);
}
installPhotoTones();
document.querySelectorAll('.triptych img').forEach(image=>{
  const p=PHOTOS.find(p=>p.image===image.getAttribute('src'));
  if(p)applyPhotoTone(image,p);
});

const UI_ES={"fotografies": "fotografías", " fotografies": " fotografías", "Amplia ": "Amplía ", " de ": " de ", "Veure ": "Ver ", "Shimoji · localització de l’illa": "Shimoji · ubicación de la isla", "Réferència aproximada de l’illa. Sense GPS ni punt d’immersió confirmat.": "Referencia aproximada de la isla. Sin GPS ni punto de inmersión confirmado.", " · lloc aproximat": " · lugar aproximado", "No hi ha fotografies amb localització per a aquest dia.": "No hay fotografías con ubicación para este día.", "El mapa no s’ha pogut carregar. Les fotografies continuen disponibles.": "No se ha podido cargar el mapa. Las fotografías siguen disponibles."};
const t=s=>LANGUAGE==='es'?(UI_ES[s]??s):s;
const PAGE_REGION=document.body.dataset.region||'';
const PAGE_PHOTOS=PAGE_REGION?LOCAL_PHOTOS.filter(p=>p.group===PAGE_REGION):LOCAL_PHOTOS;
const ROUTE_POINTS=typeof ROUTE==='undefined'?[]:ROUTE;
const GROUPS=['Honshu','Hokkaido','Okinawa–Yaeyama'];
const COLORS={'Honshu':'#b14f41','Hokkaido':'#456778','Okinawa–Yaeyama':'#447e70'};
const $=id=>document.getElementById(id);
const dateLong=d=>new Intl.DateTimeFormat(LANGUAGE,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
const dateShort=d=>new Intl.DateTimeFormat(LANGUAGE,{day:'2-digit',month:'2-digit',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
let galleryRegion='',galleryDate='',query='',mapRegion='',mapDate='',visible=PAGE_PHOTOS.map((p,i)=>i),current=0,album=[];
const dates=[...new Set(PAGE_PHOTOS.map(p=>p.date))].sort();for(const id of ['gallery-day','map-day'])if($(id))for(const day of dates){const o=node('option',dateLong(day));o.value=day;$(id).append(o);}
const FEATURED=new Set([13,29,52,69,73,88,117,130,149,156,190,209,226,238,246,256,270]);
function photoCard(p,i,featured){const portrait=p.display_aspect<1;const card=node('article',undefined,'photo-card'+(featured?' photo-feature':'')+(portrait?' is-portrait':' is-landscape'));const button=node('button',undefined,'image-button');button.type='button';button.setAttribute('aria-label',t("Amplia ")+(p.place||p.filename));const img=node('img');img.src=p.image;img.srcset=p.image+' '+p.image_width+'w, '+p.image_large+' '+p.image_large_width+'w';img.sizes=featured?'(max-width:700px) 88vw, 85vw':'(max-width:420px) 88vw, (max-width:700px) 45vw, 45vw';img.alt=p.place||p.comments||p.filename;img.loading='lazy';img.decoding='async';img.style.aspectRatio=String(p.display_aspect);applyPhotoTone(img,p);button.append(img);button.onclick=()=>openPhoto(i,visible.slice());const text=node('div',undefined,'photo-text');const caption=node('div',undefined,'caption-head');const time=node('time',dateShort(p.date));time.dateTime=p.date;caption.append(node('h4',p.place||''),time);text.append(caption);if(p.comments)text.append(node('p',p.comments));card.append(button,text);return card;}
function layoutRows(items){const result=[];let pending=[],rowNumber=0;function flush(){if(pending.length){result.push({featured:false,items:pending});pending=[];rowNumber++;}}for(let j=0;j<items.length;j++){const item=items[j];if(FEATURED.has(item.p.order)||j===0){flush();result.push({featured:true,items:[item]});continue;}pending.push(item);const target=rowNumber%3===1?3:2;if(pending.length===target)flush();}flush();return result;}
function renderGallery(){const gallery=$('gallery');if(!gallery)return;gallery.replaceChildren();visible=[];for(const g of GROUPS){if(galleryRegion&&g!==galleryRegion)continue;const items=PAGE_PHOTOS.map((p,i)=>({p,i})).filter(({p})=>p.group===g&&(!galleryDate||p.date===galleryDate)&&(!query||[p.place,p.comments,p.filename].join(' ').toLocaleLowerCase(LANGUAGE).includes(query)));if(!items.length)continue;visible.push(...items.map(x=>x.i));const head=node('div',undefined,'region-heading');head.append(node('h3',g));gallery.append(head);const stream=node('div',undefined,'photo-stream');for(const row of layoutRows(items)){if(row.featured){const {p,i}=row.items[0];stream.append(photoCard(p,i,true));}else{const line=node('div',undefined,'photo-row row-'+row.items.length);for(const {p,i} of row.items)line.append(photoCard(p,i,false));stream.append(line);}}gallery.append(stream);}$('empty').hidden=visible.length!==0;document.querySelectorAll('[data-gallery]').forEach(b=>{b.classList.toggle('active',b.dataset.gallery===galleryRegion);b.setAttribute('aria-pressed',String(b.dataset.gallery===galleryRegion));});}
function setGallery(g){galleryRegion=g;renderGallery();}
document.querySelectorAll('[data-gallery]').forEach(b=>b.onclick=()=>setGallery(b.dataset.gallery));if($('search'))$('search').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase(LANGUAGE);renderGallery();};if($('gallery-day'))$('gallery-day').onchange=e=>{galleryDate=e.target.value;renderGallery();};if($('reset'))$('reset').onclick=()=>{galleryRegion=galleryDate=query='';$('search').value=$('gallery-day').value='';renderGallery();};
const dialog=$('lightbox');function openPhoto(i,list){current=i;album=list&&list.length?list:visible.slice();if(!album.includes(i))album=[i];updatePhoto();if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');}
function updatePhoto(){const p=PAGE_PHOTOS[current];$('lb-photo').src=p.image_large||p.image;applyPhotoTone($('lb-photo'),p);$('lb-photo').alt=p.place||p.comments||p.filename;$('lb-region').textContent=p.group;$('lb-place').textContent=p.place||'';$('lb-comment').textContent=p.comments||'';$('lb-comment').hidden=!p.comments;$('lb-date').textContent=dateLong(p.date);$('lb-file').textContent=p.filename;$('lb-position').textContent=(album.indexOf(current)+1)+' / '+album.length;$('lb-map').hidden=p.latitude===null;if(p.latitude!==null)$('lb-map').href=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.latitude+','+p.longitude)}`;}
function movePhoto(step){current=album[(album.indexOf(current)+step+album.length)%album.length];updatePhoto();}document.querySelector('.lb-close').onclick=()=>dialog.close();document.querySelector('.lb-prev').onclick=()=>movePhoto(-1);document.querySelector('.lb-next').onclick=()=>movePhoto(1);dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowRight'){e.preventDefault();movePhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(-1);}});
function routeRegion(p){return p.lat<30?'Okinawa–Yaeyama':p.lat>41.4?'Hokkaido':'Honshu';}
function distance(a,b){const rad=x=>x*Math.PI/180;const v=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lon-a.lon)/2)**2;return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));}
const simplified=[];for(const p of ROUTE_POINTS){const last=simplified.at(-1);if(!last||last.date.slice(0,10)!==p.date.slice(0,10)||distance(last,p)>2)simplified.push(p);}if(ROUTE_POINTS.length&&simplified.at(-1)!==ROUTE_POINTS.at(-1))simplified.push(ROUTE_POINTS.at(-1));
const stops=[];PAGE_PHOTOS.forEach((p,i)=>{if(p.latitude===null){if(p.place.toLocaleLowerCase().includes('shimoji')){let s=stops.find(x=>x.approx&&x.day===p.date);if(!s){s={name:t("Shimoji · localització de l’illa"),group:p.group,day:p.date,lat:24.82,lon:125.15,approx:true,photos:[]};stops.push(s);}s.photos.push(i);}return;}if(p.latitude<24||p.latitude>46||p.longitude<122||p.longitude>146)return;let s=stops.find(x=>!x.approx&&x.group===p.group&&x.day===p.date&&x.name===p.place&&distance({lat:x.lat,lon:x.lon},{lat:p.latitude,lon:p.longitude})<2);if(!s){s={name:p.place||p.group,group:p.group,day:p.date,lat:p.latitude,lon:p.longitude,approx:false,photos:[]};stops.push(s);}s.photos.push(i);});
let map,layers,markers=new Map();function popup(s){const wrap=node('div',undefined,'popup');wrap.append(node('h3',s.name),node('p',dateLong(s.day)));const im=node('img');im.src=PAGE_PHOTOS[s.photos[0]].image;applyPhotoTone(im,PAGE_PHOTOS[s.photos[0]]);im.alt=s.name;wrap.append(im);if(s.approx)wrap.append(node('p',t("Réferència aproximada de l’illa. Sense GPS ni punt d’immersió confirmat.")));const b=node('button',t("Veure ")+s.photos.length+t(" fotografies"));b.onclick=()=>openPhoto(s.photos[0],s.photos);wrap.append(b);return wrap;}
function renderMap(){const chosen=stops.filter(s=>(!mapRegion||s.group===mapRegion)&&(!mapDate||s.day===mapDate));const list=$('stops');list.replaceChildren();if(map)layers.clearLayers();markers.clear();if(map){for(let i=1;i<simplified.length;i++){const a=simplified[i-1],b=simplified[i],g=routeRegion(b);if(mapRegion&&(g!==mapRegion||routeRegion(a)!==mapRegion))continue;if(mapDate&&(a.date.slice(0,10).replaceAll(':','-')!==mapDate||b.date.slice(0,10).replaceAll(':','-')!==mapDate))continue;const jump=distance(a,b)>100||routeRegion(a)!==g;L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:jump?'#8b8e80':COLORS[g],weight:jump?1.5:2,opacity:.65,dashArray:jump?'5 7':'3 5'}).addTo(layers);}}
for(const s of chosen){if(map){const icon=L.divIcon({className:'',html:`<div class="pin${s.approx?' approx':''}" style="background:${COLORS[s.group]}"></div>`,iconSize:s.approx?[23,23]:[17,17],iconAnchor:s.approx?[11,11]:[8,8]});const marker=L.marker([s.lat,s.lon],{icon,title:s.name}).bindPopup(popup(s)).addTo(layers);markers.set(s,marker);}const b=node('button',s.name,'stop');b.append(node('small',dateShort(s.day)+' · '+s.photos.length+' fotos'+(s.approx?t(" · lloc aproximat"):'')));b.onclick=()=>{if(map){map.setView([s.lat,s.lon],s.approx?11:12);markers.get(s).openPopup();}else openPhoto(s.photos[0],s.photos);};list.append(b);}if(!chosen.length)list.append(node('p',t("No hi ha fotografies amb localització per a aquest dia.")));if(map&&chosen.length)map.fitBounds(L.latLngBounds(chosen.map(s=>[s.lat,s.lon])),{padding:[30,30],maxZoom:mapDate?12:mapRegion?8:5});document.querySelectorAll('[data-map]').forEach(b=>{b.classList.toggle('active',b.dataset.map===mapRegion);b.setAttribute('aria-pressed',String(b.dataset.map===mapRegion));});}
function initMap(){if(!$('map'))return;if(typeof L==='undefined'){$('map').append(node('p',t("El mapa no s’ha pogut carregar. Les fotografies continuen disponibles.")));renderMap();return;}map=L.map('map',{scrollWheelZoom:false}).setView([35,135],5);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri · Esri, HERE, Garmin, Intermap, increment P, GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, MapmyIndia, GIS User Community'}).addTo(map);layers=L.layerGroup().addTo(map);renderMap();}
document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{mapRegion=b.dataset.map;mapDate='';$('map-day').value='';renderMap();});if($('map-day'))$('map-day').onchange=e=>{mapDate=e.target.value;renderMap();};renderGallery();initMap();

const languageSelect=document.getElementById('language-select');if(languageSelect)languageSelect.onchange=e=>{const ca=document.body.dataset.caPage||'index.html';const target=e.target.value==='es'?ca.replace('.html','-es.html'):ca;window.location.href=target+window.location.hash;};

const stickyHeader=document.querySelector('.region-page .site-header');if(stickyHeader){const setHeaderHeight=()=>document.documentElement.style.setProperty('--site-header-height',stickyHeader.getBoundingClientRect().height+'px');setHeaderHeight();if(typeof ResizeObserver!=='undefined')new ResizeObserver(setHeaderHeight).observe(stickyHeader);window.addEventListener('resize',setHeaderHeight);}

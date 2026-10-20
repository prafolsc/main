'use strict';
const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
const isEs = lang === 'es';
const chapter = document.body.dataset.chapter;
const photos = window.TRIP_PHOTOS.filter(p => !chapter || p.chapter === chapter)
  .sort((a, b) => a.date.localeCompare(b.date) || a.filename.localeCompare(b.filename));
// Explicit placements preserve the requested order without inventing capture times.
const placedPhotos = photos.filter(p => p.display_before || p.display_after);
for (const p of placedPhotos) photos.splice(photos.indexOf(p), 1);
for (const p of placedPhotos) {
  const anchorName = p.display_before || p.display_after;
  const anchorIndex = photos.findIndex(candidate => candidate.filename === anchorName);
  if (anchorIndex < 0) photos.push(p);
  else photos.splice(anchorIndex + (p.display_after ? 1 : 0), 0, p);
}
const text = (ca, es) => isEs ? es : ca;
const localized = (p, key) => p[key + '_' + lang] || '';
const el = (tag, value) => {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  return node;
};
const formatDate = value => new Intl.DateTimeFormat(isEs ? 'es-ES' : 'ca-ES', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
}).format(new Date(value.slice(0, 10) + 'T12:00:00Z'));
const date = p => p.date ? formatDate(p.date) : '';
const selector = document.getElementById('language-select');
selector.addEventListener('change', () => {
  window.location.href = document.body.dataset.page + (selector.value === 'es' ? '-es' : '') + '.html' + window.location.hash;
});
const videos = (window.TRIP_VIDEOS || []).filter(v => !chapter || v.chapter === chapter);
const galleryItems = photos.flatMap((p, photoIndex) => [
  {kind: 'photo', p, photoIndex},
  ...videos.filter(v => v.after === p.filename).map(v => ({kind: 'video', p: v}))
]);
const gallery = document.getElementById('gallery');
if (gallery) {
  document.querySelector('.photo-total').textContent = photos.length + ' ' + text('fotografies', 'fotografías')
    + (videos.length ? ' · ' + videos.length + ' ' + text('vídeos', 'vídeos') : '')
    + text(' · Toca una foto per ampliar-la.', ' · Toca una foto para ampliarla.');
  // Preserve photo order and insert each video after its requested anchor photo.
  let row;
  let rowEnd = 0;
  let rowNumber = 0;
  for (const [i, item] of galleryItems.entries()) {
    const p = item.p;
    if (i === rowEnd) {
      const remaining = galleryItems.length - i;
      const stage = rowNumber % 5;
      const landscape = p.width / p.height >= 1.5;
      let count = (stage === 0 || stage === 4) && landscape ? 1 : stage === 2 ? 3 : 2;
      count = Math.min(count, remaining);
      row = el('div');
      const narrowFirst = p.height > p.width || rowNumber % 2 === 1;
      row.className = 'gallery-row ' + (count === 1 ? 'gallery-solo' : count === 3 ? 'gallery-trio' : narrowFirst ? 'gallery-pair narrow-first' : 'gallery-pair wide-first');
      rowEnd = i + count;
      rowNumber++;
      gallery.append(row);
    }
    const figure = el('figure');
    let media;
    if (item.kind === 'video') {
      media = el('video');
      media.className = 'gallery-video';
      media.src = p.src;
      media.poster = p.poster;
      media.controls = true;
      media.playsInline = true;
      media.preload = 'none';
      media.width = p.width;
      media.height = p.height;
      media.setAttribute('aria-label', localized(p, 'place') + ' · ' + p.filename);
      media.append(document.createTextNode(text('El navegador no pot reproduir aquest vídeo.', 'El navegador no puede reproducir este vídeo.')));
    } else {
      media = el('button');
      media.type = 'button';
      media.className = 'photo-button';
      media.setAttribute('aria-label', text('Amplia: ', 'Amplía: ') + (localized(p, 'place') || p.filename));
      const img = el('img');
      img.src = p.src;
      img.alt = localized(p, 'caption') || localized(p, 'place') || p.filename;
      img.width = p.width;
      img.height = p.height;
      img.loading = 'lazy';
      img.decoding = 'async';
      media.append(img);
      media.addEventListener('click', () => openPhoto(item.photoIndex));
    }
    const caption = el('figcaption');
    const place = el('span', localized(p, 'place'));
    place.className = 'photo-place';
    caption.append(place);
    if (localized(p, 'caption')) {
      const comment = el('span', localized(p, 'caption'));
      comment.className = 'photo-caption';
      caption.append(comment);
    }
    const meta = el('div');
    meta.className = 'photo-meta';
    meta.append(el('span', date(p)), el('span', p.filename));
    caption.append(meta);
    figure.append(media, caption);
    row.append(figure);
  }
}
const dialog = document.getElementById('lightbox');
let photoIndex = 0;
let returnFocus = null;
function openPhoto(index) {
  if (!photos.length) return;
  photoIndex = (index + photos.length) % photos.length;
  const p = photos[photoIndex];
  const img = document.getElementById('photo-large');
  img.src = p.src;
  img.alt = localized(p, 'caption') || localized(p, 'place') || p.filename;
  document.getElementById('photo-count').textContent = (photoIndex + 1) + ' / ' + photos.length;
  const info = document.getElementById('photo-info');
  info.replaceChildren(el('strong', localized(p, 'place')));
  if (localized(p, 'caption')) info.append(el('p', localized(p, 'caption')));
  const meta = el('p', [date(p), p.filename].filter(Boolean).join(' · '));
  meta.className = 'lightbox-meta';
  info.append(meta);
  if (Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) {
    const link = el('a', p.location_approximate
      ? text('Veure ubicació aproximada a Google Maps ↗', 'Ver ubicación aproximada en Google Maps ↗')
      : text('Veure el lloc a Google Maps ↗', 'Ver el lugar en Google Maps ↗'));
    link.href = 'https://www.google.com/maps?q=' + p.latitude + ',' + p.longitude;
    link.target = '_blank';
    link.rel = 'noopener';
    info.append(link);
  }
  if (!dialog.open) {
    returnFocus = document.activeElement;
    dialog.showModal();
  }
}
document.getElementById('photo-prev').addEventListener('click', () => openPhoto(photoIndex - 1));
document.getElementById('photo-next').addEventListener('click', () => openPhoto(photoIndex + 1));
document.getElementById('photo-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { if (returnFocus) returnFocus.focus(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); openPhoto(photoIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); openPhoto(photoIndex + 1); }
});
const mapStatus = document.getElementById('map-status');
// Only destination coordinates belong in the Korea / Okinawa map.
const located = photos.map((p, i) => ({p, i})).filter(({p}) =>
  Number.isFinite(p.latitude) && Number.isFinite(p.longitude) &&
  p.latitude >= 25 && p.latitude <= 39 && p.longitude >= 125 && p.longitude <= 131
);
const chapterStyles = {
  seul: {color: '#2864a0', ca: 'Seül', es: 'Seúl'},
  gyeongju: {color: '#a86414', ca: 'Gyeongju', es: 'Gyeongju'},
  busan: {color: '#b23f54', ca: 'Busan', es: 'Busan'},
  centre: {color: '#477a35', ca: 'Andong i Suwon', es: 'Andong y Suwon'},
  dmz: {color: '#8054a2', ca: 'Zona desmilitaritzada', es: 'Zona desmilitarizada'},
  okinawa: {color: '#087f83', ca: 'Okinawa', es: 'Okinawa'}
};
const chapterColor = key => chapterStyles[key].color;
const route = window.TRIP_ROUTE.filter(stop => !chapter || stop.chapter === chapter);
const daySelect = document.getElementById('map-day');
const dayStops = document.getElementById('map-day-stops');
if (window.L && (located.length || route.length)) {
  const map = L.map('trip-map', {scrollWheelZoom: false});
  // The packaged regional base always works locally, including file:// previews.
  // OSM's detailed layer requires a real HTTP(S) page and a valid Referer.
  map.createPane('regional-land').style.zIndex = 190;
  map.createPane('regional-labels').style.zIndex = 210;
  L.geoJSON(window.TRIP_LAND, {
    pane: 'regional-land', interactive: false,
    style: {color: '#91a595', weight: .8, fillColor: '#e7e4d3', fillOpacity: 1},
    attribution: '<a href="https://www.naturalearthdata.com/">Natural Earth</a>'
  }).addTo(map);
  const basicLabels = L.layerGroup();
  for (const label of window.TRIP_MAP_LABELS || []) {
    const name = localized(label, 'name');
    const node = el('span', name);
    node.className = 'regional-map-label ' + label.kind;
    L.marker([label.lat, label.lon], {
      icon: L.divIcon({className: 'regional-label-icon', html: node.outerHTML, iconSize: [130, 24], iconAnchor: [65, 12]}),
      pane: 'regional-labels', interactive: false, keyboard: false
    }).addTo(basicLabels);
  }
  let basicMap = window.location.protocol === 'file:' || !window.location.hostname;
  if (basicMap) basicLabels.addTo(map);
  else {
    const detailed = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://www.fossgis.de/">FOSSGIS</a>',
      maxZoom: 18, referrerPolicy: 'strict-origin-when-cross-origin'
    });
    detailed.on('tileerror', () => {
      if (basicMap) return;
      basicMap = true;
      map.removeLayer(detailed);
      basicLabels.addTo(map);
      renderDay();
    });
    detailed.addTo(map);
  }
  const legend = el('div');
  legend.className = 'map-legend';
  legend.setAttribute('aria-label', text('Capítols del mapa', 'Capítulos del mapa'));
  const shownChapters = new Set([...located.map(({p}) => p.chapter), ...route.map(stop => stop.chapter)]);
  for (const [key, style] of Object.entries(chapterStyles)) {
    if (!shownChapters.has(key)) continue;
    const item = el('span');
    const dot = el('i');
    dot.style.backgroundColor = style.color;
    dot.setAttribute('aria-hidden', 'true');
    item.append(dot, document.createTextNode(style[lang]));
    legend.append(item);
  }
  document.getElementById('trip-map').insertAdjacentElement('afterend', legend);
  const photoMarkers = [];
  const stageMarkers = [];
  const groups = new Map();
  for (const entry of located) {
    const key = entry.p.chapter + ',' + Math.round(entry.p.latitude * 150) + ',' + Math.round(entry.p.longitude * 150);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  // Build popup images on demand, once the popup is visible.
  function photoPopup(entries) {
    const popup = el('div');
    popup.className = 'map-photo-list';
    for (const entry of entries) {
      const button = el('button');
      button.type = 'button';
      const img = el('img');
      img.src = entry.p.src;
      img.alt = localized(entry.p, 'place') || entry.p.filename;
      img.loading = 'eager';
      img.decoding = 'async';
      button.append(img, el('strong', localized(entry.p, 'place')), el('small', date(entry.p)));
      button.addEventListener('click', () => openPhoto(entry.i));
      popup.append(button);
    }
    return popup;
  }
  function stagePhotos(stop) {
    const sameChapter = photos.map((p, i) => ({p, i})).filter(({p}) => p.chapter === stop.chapter);
    const sameDay = sameChapter.filter(({p}) => p.date.startsWith(stop.date));
    const candidates = sameDay.length ? sameDay : sameChapter;
    const distance = ({p}) => {
      if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return Infinity;
      const x = (p.longitude - stop.lon) * Math.cos(stop.lat * Math.PI / 180);
      return (p.latitude - stop.lat) ** 2 + x ** 2;
    };
    return {
      sameDay: sameDay.length > 0,
      entries: candidates.sort((a, b) => distance(a) - distance(b) || a.i - b.i).slice(0, 6)
    };
  }
  for (const entries of groups.values()) {
    const p = entries[0].p;
    const marker = L.circleMarker([p.latitude, p.longitude], {
      radius: 6, color: '#f8f4eb', weight: 2, fillColor: chapterColor(p.chapter), fillOpacity: .9
    }).bindPopup(() => photoPopup(daySelect.value
      ? entries.filter(({p}) => p.date.startsWith(daySelect.value))
      : entries));
    photoMarkers.push({marker, entries});
  }
  for (const stop of route) {
    const marker = L.circleMarker([stop.lat, stop.lon], {
      radius: 9, color: '#fff', weight: 2, fillColor: chapterColor(stop.chapter), fillOpacity: 1
    }).bindPopup(() => {
      const popup = el('div');
      popup.append(el('strong', localized(stop, 'name')), el('p', formatDate(stop.date)));
      const related = stagePhotos(stop);
      if (related.entries.length) {
        popup.append(el('small', related.sameDay
          ? text('Fotografies del mateix dia, ordenades per proximitat', 'Fotografías del mismo día, ordenadas por proximidad')
          : text('Fotografies del capítol', 'Fotografías del capítulo')));
        popup.append(photoPopup(related.entries));
      }
      return popup;
    });
    stageMarkers.push({marker, stop});
  }
  const dates = [...new Set([...located.map(({p}) => p.date.slice(0, 10)), ...route.map(s => s.date)])].sort();
  for (const d of dates) {
    const option = el('option', formatDate(d));
    option.value = d;
    daySelect.append(option);
  }
  function renderDay() {
    const day = daySelect.value;
    const entries = day ? located.filter(({p}) => p.date.startsWith(day)) : located;
    const stages = day ? route.filter(s => s.date === day) : route;
    map.closePopup();
    for (const item of photoMarkers) {
      const visible = !day || item.entries.some(({p}) => p.date.startsWith(day));
      if (visible) item.marker.addTo(map); else map.removeLayer(item.marker);
    }
    for (const item of stageMarkers) {
      if (!day || item.stop.date === day) item.marker.addTo(map); else map.removeLayer(item.marker);
    }
    const bounds = [...entries.map(({p}) => [p.latitude, p.longitude]), ...stages.map(s => [s.lat, s.lon])];
    if (bounds.length) map.fitBounds(L.latLngBounds(bounds), {padding: [25, 25], maxZoom: 12});
    dayStops.replaceChildren();
    if (!day) {
      for (const stop of route) {
        const button = el('button');
        button.type = 'button';
        button.append(el('strong', localized(stop, 'name')), el('small', formatDate(stop.date)));
        button.addEventListener('click', () => {
          map.setView([stop.lat, stop.lon], 11);
          stageMarkers.find(item => item.stop === stop).marker.openPopup();
        });
        dayStops.append(button);
      }
    } else {
      const unique = new Map();
      for (const entry of entries) {
        const name = localized(entry.p, 'place') || entry.p.filename;
        if (!unique.has(name)) unique.set(name, entry);
      }
      for (const [name, entry] of unique) {
        const button = el('button', name);
        button.type = 'button';
        button.addEventListener('click', () => {
          map.setView([entry.p.latitude, entry.p.longitude], 13);
          photoMarkers.find(item => item.entries.includes(entry)).marker.openPopup();
        });
        dayStops.append(button);
      }
      if (!unique.size) for (const stop of stages) dayStops.append(el('p', localized(stop, 'name')));
    }
    mapStatus.textContent = (basicMap ? text('Mapa regional inclòs · ', 'Mapa regional incluido · ') : '') + entries.length + ' ' + text('fotografies geolocalitzades. Les fotos sense GPS continuen a la galeria. Els punts aproximats s’indiquen al visor.', 'fotografías geolocalizadas. Las fotos sin GPS siguen en la galería. Los puntos aproximados se indican en el visor.');
  }
  daySelect.addEventListener('change', renderDay);
  renderDay();
} else {
  mapStatus.textContent = text('El mapa no està disponible. Pots obrir el mapa extern o les coordenades des del visor de les fotos.', 'El mapa no está disponible. Puedes abrir el mapa externo o las coordenadas desde el visor de las fotos.');
  for (const stop of route) dayStops.append(el('p', localized(stop, 'name') + ' · ' + formatDate(stop.date)));
}




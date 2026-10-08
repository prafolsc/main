'use strict';
(() => {
  const container = document.getElementById('trip-map');
  if (!container) return;
  const spanish = document.documentElement.lang === 'es';
  const stops = [
  {
    "id": "cph",
    "ca": "Copenhaguen",
    "es": "Copenhague",
    "lat": 55.675757,
    "lon": 12.5690233,
    "region": "dk",
    "chapter": "copenhague.html",
    "dateCa": "12, 13 i 25 d’agost",
    "dateEs": "12, 13 y 25 de agosto"
  },
  {
    "id": "malmo",
    "ca": "Malmö",
    "es": "Malmö",
    "lat": 55.6033166,
    "lon": 13.0013362,
    "region": "dk",
    "chapter": "malmo.html",
    "dateCa": "13 d’agost",
    "dateEs": "13 de agosto"
  },
  {
    "id": "odense",
    "ca": "Odense",
    "es": "Odense",
    "lat": 55.3962255,
    "lon": 10.3905956,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "ribe",
    "ca": "Ribe",
    "es": "Ribe",
    "lat": 55.3284018,
    "lon": 8.7619278,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "billund",
    "ca": "Billund",
    "es": "Billund",
    "lat": 55.737492,
    "lon": 8.968636,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "aarhus",
    "ca": "Aarhus",
    "es": "Aarhus",
    "lat": 56.1581547,
    "lon": 10.2120347,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "aalborg",
    "ca": "Aalborg",
    "es": "Aalborg",
    "lat": 57.0472247,
    "lon": 9.9201043,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "dune",
    "ca": "Råbjerg Mile",
    "es": "Råbjerg Mile",
    "lat": 57.64947,
    "lon": 10.40986,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "hirtshals",
    "ca": "Hirtshals",
    "es": "Hirtshals",
    "lat": 57.5881857,
    "lon": 9.9592615,
    "region": "dk",
    "chapter": "jutlandia.html",
    "dateCa": "14–18 d’agost",
    "dateEs": "14–18 de agosto"
  },
  {
    "id": "torshavn",
    "ca": "Tórshavn",
    "es": "Tórshavn",
    "lat": 62.0101719,
    "lon": -6.773055,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "kirkjubour",
    "ca": "Kirkjubøur",
    "es": "Kirkjubøur",
    "lat": 61.9520625,
    "lon": -6.7945808,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "finger",
    "ca": "Trøllkonufingur",
    "es": "Trøllkonufingur",
    "lat": 62.04664,
    "lon": -7.0877,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "cliff",
    "ca": "Trælanípa · Leitisvatn",
    "es": "Trælanípa · Leitisvatn",
    "lat": 62.0209,
    "lon": -7.2301,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "gasadalur",
    "ca": "Gásadalur · Múlafossur",
    "es": "Gásadalur · Múlafossur",
    "lat": 62.1105209,
    "lon": -7.4380606,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "vestmanna",
    "ca": "Vestmanna",
    "es": "Vestmanna",
    "lat": 62.182079,
    "lon": -7.177198,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "eidi",
    "ca": "Eiði",
    "es": "Eiði",
    "lat": 62.2996463,
    "lon": -7.0925126,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "gjogv",
    "ca": "Gjógv",
    "es": "Gjógv",
    "lat": 62.3249355,
    "lon": -6.9421895,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "fossa",
    "ca": "Fossá",
    "es": "Fossá",
    "lat": 62.25109,
    "lon": -7.07753,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "tjornuvik",
    "ca": "Tjørnuvík",
    "es": "Tjørnuvík",
    "lat": 62.2897926,
    "lon": -7.148522,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  },
  {
    "id": "drangarnir",
    "ca": "Drangarnir",
    "es": "Drangarnir",
    "lat": 62.07501,
    "lon": -7.41426,
    "region": "fo",
    "chapter": "feroe.html",
    "dateCa": "20–23 d’agost",
    "dateEs": "20–23 de agosto"
  }
];
  const ui = spanish ? {
    chapter: 'Ver capítulo', google: 'Ver en Google Maps',
    ferry: 'Ferry Hirtshals ↔ Tórshavn', dayTrip: 'Excursión a Malmö',
    road: 'Etapas por carretera', failed: 'El mapa no se ha podido cargar. Puedes consultar las paradas en la lista.'
  } : {
    chapter: 'Veure el capítol', google: 'Veure a Google Maps',
    ferry: 'Ferri Hirtshals ↔ Tórshavn', dayTrip: 'Excursió a Malmö',
    road: 'Etapes per carretera', failed: 'El mapa no s’ha pogut carregar. Pots consultar les parades a la llista.'
  };
  const list = document.getElementById('trip-map-stops');
  const controls = document.getElementById('trip-map-controls');
  const colors = {dk: '#33684B', fo: '#3E5C58', malmo: '#1B4B6B', cph: '#C1272D'};
  const name = p => spanish ? p.es : p.ca;
  const date = p => spanish ? p.dateEs : p.dateCa;
  const point = p => [p.lat, p.lon];
  const link = (label, href) => {
    const a = document.createElement('a');
    a.textContent = label; a.href = href;
    return a;
  };
  let map, layers, markers = new Map();
  function renderList(selected) {
    list.replaceChildren();
    selected.forEach(p => {
      const li = document.createElement('li');
      const a = link(name(p), p.chapter);
      if (map) {
        a.addEventListener('click', e => {
          e.preventDefault();
          map.setView(point(p), p.region === 'fo' ? 12 : 10);
          markers.get(p.id).openPopup();
        });
      }
      li.append(a);
      list.append(li);
    });
  }
  renderList(stops);
  if (typeof L === 'undefined') {
    container.textContent = ui.failed;
    return;
  }
  map = L.map(container, {scrollWheelZoom: false});
  const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri — Esri, HERE, Garmin, Intermap, increment P, GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, GIS User Community'
  }).addTo(map);
  layers = L.layerGroup().addTo(map);
  const status = document.getElementById('trip-map-status');
  let failures = 0;
  tiles.on('tileerror', () => {
    if (++failures >= 3) {status.hidden = false; status.textContent = ui.failed;}
  });
  tiles.on('tileload', () => {failures = 0; status.hidden = true;});
  function popup(p) {
    const wrap = document.createElement('div');
    wrap.className = 'trip-map-popup';
    const heading = document.createElement('h3'); heading.textContent = name(p);
    const dates = document.createElement('p'); dates.textContent = date(p);
    const chapter = link(ui.chapter, p.chapter);
    const google = link(ui.google, 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.lat + ',' + p.lon));
    google.target = '_blank'; google.rel = 'noopener';
    wrap.append(heading, dates, chapter, google);
    return wrap;
  }
  function line(ids, color, label, dashed) {
    L.polyline(ids.map(id => point(stops.find(p => p.id === id))), {
      color, weight: dashed ? 2 : 3, opacity: .8, dashArray: dashed ? '6 8' : null
    }).bindTooltip(label).addTo(layers);
  }
  function render(view) {
    layers.clearLayers(); markers.clear();
    const selected = stops.filter(p => view === 'all' || p.region === view);
    if (view !== 'fo') {
      line(['cph', 'malmo'], colors.malmo, ui.dayTrip, false);
      line(['cph','odense','ribe','billund','aarhus','aalborg','dune','hirtshals'], colors.dk, ui.road, false);
    }
    if (view === 'all') line(['hirtshals','torshavn'], colors.fo, ui.ferry, true);
    selected.forEach(p => {
      const color = colors[p.id] || colors[p.region];
      const icon = L.divIcon({className: 'trip-map-marker', html: '<span style="background:' + color + '"></span>', iconSize: [18,18], iconAnchor: [9,9]});
      const marker = L.marker(point(p), {icon, title: name(p), alt: name(p)})
        .bindTooltip(name(p)).bindPopup(popup(p)).addTo(layers);
      markers.set(p.id, marker);
    });
    map.fitBounds(L.latLngBounds(selected.map(point)), {padding: [32,32], maxZoom: view === 'fo' ? 10 : 7});
    renderList(selected);
    controls.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mapView === view));
    });
  }
  controls.hidden = false;
  controls.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => render(button.dataset.mapView));
  });
  render('all');
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => map.invalidateSize()).observe(container);
})();

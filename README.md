# Diaris de viatge

Webs estàtiques dels nostres viatges, agrupades en una sola carpeta.

- `viatges-web/index.html`: portada general en català.
- `viatges-web/index-es.html`: portada general en castellà.
- `viatges-web/japo-2026/`: Japó, 27 de febrer–11 d'abril de 2026.
- `viatges-web/feroe-dinamarca-2026/`: Dinamarca i Fèroe, 12–26 d'agost de 2026.
- `viatges-web/peru-equador-2025/`: Perú i Equador, juny–juliol de 2025.
- `viatges-web/corea-2018/`: Corea i Okinawa, agost de 2018.

## Corea i Okinawa · 2018

Quadern del viatge d'agost de 2018, disponible a [prafols.com/corea-2018/](https://prafols.com/corea-2018/).

- Versions en català (`index.html`) i castellà (`index-es.html`), amb capítols en tots dos idiomes.
- Sis capítols: Seül, Gyeongju, Busan, El centre: Andong i Suwon, Zona desmilitaritzada i Okinawa.
- 411 fotografies i 3 vídeos; Okinawa inclou les immersions a l'USS Emmons i el busseig amb taurons balena.
- Galeries amb ampliació de les fotografies i comentaris.
- Mapa general i mapes dels capítols, amb punts de colors segons el capítol i miniatures de les fotografies.
- Fotografies en format WebP a `fotos/` i vídeos en MP4 amb imatges de portada a `videos/`.
- `data.js` conté les fotografies, els vídeos, els comentaris, les ubicacions i l'ordre de la galeria.

## Publicació a Cloudflare Workers

La web existent està publicada a Cloudflare Workers amb els dominis `prafols.com` i `www.prafols.com`.

- Repositori: `prafolsc/main`.
- Branca de producció: `main`.
- Directori dels fitxers estàtics: `viatges-web/`.
- Es conserva la configuració de publicació existent a Cloudflare.

La portada és a `/`, el Japó a `/japo-2026/`, Dinamarca–Fèroe a `/feroe-dinamarca-2026/`, Perú–Equador a `/peru-equador-2025/` i Corea–Okinawa a `/corea-2018/`.

## Afegir un viatge

Crea una carpeta dins de `viatges-web/` (per exemple, `nou-viatge-2027/`) amb el seu `index.html`, imatges i fitxers auxiliars. Afegeix l'enllaç a les dues portades generals.

S'ha conservat també la còpia anterior que ja existia dins del directori de Dinamarca–Fèroe (`viaje-web/`), juntament amb tots els fitxers originals del repositori.

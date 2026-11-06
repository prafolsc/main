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
- Nom del Worker: `main`. Configuració a `wrangler.jsonc`.
- Deploy command (a *Settings → Build*): `npx wrangler deploy --var "SITE_PASSWORD:$SITE_PASSWORD"`.

La portada és a `/`, el Japó a `/japo-2026/`, Dinamarca–Fèroe a `/feroe-dinamarca-2026/`, Perú–Equador a `/peru-equador-2025/`, Taiwan–Palau a `/taiwan-palau-2025/` i Corea–Okinawa a `/corea-2018/`.

## Accés amb contrasenya

Les carpetes dels viatges estan protegides amb una contrasenya única compartida; la portada, el contacte i `assets/` són públics. No hi ha usuaris: qui no té la galeta d'accés veu una pàgina amb només el camp de contrasenya, en català i castellà. En enviar la clau correcta es desa una galeta de 30 dies vàlida per a tots els viatges.

- `src/worker.js`: el Worker que comprova l'accés. Les carpetes protegides són a la llista `PROTECTED`, les miniatures de la portada que han de ser visibles sense clau a `PUBLIC_FILES`, i els textos de la pàgina d'accés a l'objecte `TEXTS`.
- `wrangler.jsonc`: `run_worker_first` indica quines rutes passen pel Worker; la resta es serveix directament.
- La contrasenya és la **Build variable** `SITE_PASSWORD` (*Settings → Build → Variables and secrets*). No s'escriu mai al repositori, que és públic. La deploy command la passa al Worker amb `--var`, i queda com a variable de text visible al panell del Worker.
- Si falta la variable, les carpetes protegides responen amb un 503 («Accés no configurat»): queden tancades, no obertes.
- Per canviar la contrasenya, edita `SITE_PASSWORD` a *Build* i torna a desplegar; les galetes antigues deixen de valer.
- Si el navegador no desa la galeta (típic dels navegadors integrats d'Instagram o Facebook), després d'una clau correcta es mostra un avís en català i castellà que recomana obrir l'enllaç amb Safari, Chrome o un altre navegador. Per detectar-ho, la redirecció posterior a la clau afegeix un paràmetre temporal `_acces=1` que s'elimina de l'adreça quan la galeta funciona.
- Per provar-ho, fes servir una finestra privada. Per esborrar la galeta en una finestra normal, elimina la galeta `acces` del domini.

## Afegir un viatge

1. Crea una carpeta dins de `viatges-web/` (per exemple, `nou-viatge-2027/`) amb el seu `index.html`, imatges i fitxers auxiliars.
2. Afegeix l'enllaç a les dues portades generals (`index.html` i `index-es.html`).
3. **Protegeix-la:** afegeix `/nou-viatge-2027` a la llista `PROTECTED` de `src/worker.js` i `"/nou-viatge-2027*"` a `run_worker_first` de `wrangler.jsonc`. Si te n'oblides, el viatge quedarà públic.
4. Si la portada fa servir una foto del viatge com a miniatura, afegeix-ne la ruta a `PUBLIC_FILES` de `src/worker.js`; si no, la miniatura es veurà trencada per als visitants sense clau.

S'ha conservat també la còpia anterior que ja existia dins del directori de Dinamarca–Fèroe (`viaje-web/`), juntament amb tots els fitxers originals del repositori.

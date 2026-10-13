# Diaris de viatge

Webs estàtiques dels nostres viatges, agrupades en una sola carpeta.

- `viatges-web/index.html`: portada general en català.
- `viatges-web/index-es.html`: portada general en castellà.
- `viatges-web/japo-2026/`: Japó, 27 de febrer–11 d'abril de 2026.
- `viatges-web/feroe-dinamarca-2026/`: Dinamarca i Fèroe, 12–26 d'agost de 2026.

- `viatges-web/peru-equador-2025/`: Perú i Equador, juny–juliol de 2025.

## Publicació a Cloudflare Workers

La web existent està publicada a Cloudflare Workers amb els dominis `prafols.com` i `www.prafols.com`.

- Repositori: `prafolsc/main`.
- Branca de producció: `main`.
- Directori dels fitxers estàtics: `viatges-web/`.
- Es conserva la configuració de publicació existent a Cloudflare.

La portada és a `/`, el Japó a `/japo-2026/`, Dinamarca–Fèroe a `/feroe-dinamarca-2026/` i Perú–Equador a `/peru-equador-2025/`.

## Afegir un viatge

Crea una carpeta dins de `viatges-web/` (per exemple, `nou-viatge-2027/`) amb el seu `index.html`, imatges i fitxers auxiliars. Afegeix l'enllaç a les dues portades generals.

S'ha conservat també la còpia anterior que ja existia dins del directori de Dinamarca–Fèroe (`viaje-web/`), juntament amb tots els fitxers originals del repositori.

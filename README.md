# Diaris de viatge

Webs estàtiques dels nostres viatges, agrupades en una sola carpeta.

- `viatges-web/index.html`: portada general en català.
- `viatges-web/index-es.html`: portada general en castellà.
- `viatges-web/japo-2026/`: Japó, 27 de febrer–11 d'abril de 2026.
- `viatges-web/feroe-dinamarca-2026/`: Dinamarca i Fèroe, 12–26 d'agost de 2026.

## Publicació a Cloudflare Pages

Connecta aquest repositori i configura:

- Branca de producció: `main`.
- Framework: cap (None).
- Ordre de compilació: buida.
- Directori de sortida: `viatges-web`.

La portada serà a `/`, el Japó a `/japo-2026/` i Dinamarca–Fèroe a `/feroe-dinamarca-2026/`.

## Afegir un viatge

Crea una carpeta dins de `viatges-web/` (per exemple, `nou-viatge-2027/`) amb el seu `index.html`, imatges i fitxers auxiliars. Afegeix l'enllaç a les dues portades generals.

S'ha conservat també la còpia anterior que ja existia dins del directori de Dinamarca–Fèroe (`viaje-web/`), juntament amb tots els fitxers originals del repositori.

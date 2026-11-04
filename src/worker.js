// Accés amb contrasenya única per a les carpetes dels viatges.
// La portada, el contacte i /assets/ són públics; el Worker només rep les
// rutes llistades a "run_worker_first" (wrangler.jsonc).
//
// La contrasenya és el secret SITE_PASSWORD (Cloudflare → Worker → Settings →
// Variables and Secrets). No s'escriu mai al codi.

// Carpetes protegides (afegeix-hi els viatges nous, i també a wrangler.jsonc).
const PROTECTED = [
  '/japo-2026',
  '/feroe-dinamarca-2026',
  '/peru-equador-2025',
  '/corea-2018',
  '/taiwan-palau-2025',
];

// Fitxers de dins dels viatges que la portada necessita veure sense clau
// (les miniatures de les targetes).
const PUBLIC_FILES = new Set([
  '/corea-2018/fotos/IMG_20180817_123631.webp',
  '/feroe-dinamarca-2026/img/fe-15-mulafossur.jpg',
  '/peru-equador-2025/fotos/d1bb7275cb4f74a16fa0a2ee.jpg',
  '/taiwan-palau-2025/fotos/0282.jpg',
  '/taiwan-palau-2025/fotos/0172.jpg',
]);

const COOKIE_NAME = 'acces';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dies

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isProtected(pathname) {
  return PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// Decodifica "Authorization: Basic ..." i en retorna la contrasenya (o null).
function passwordFromBasicAuth(header) {
  const [scheme, encoded] = (header || '').split(' ');
  if (scheme !== 'Basic' || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return decoded.split(':').slice(1).join(':'); // el nom d'usuari s'ignora
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    // Fora de les carpetes protegides, o miniatures públiques: servir tal qual.
    if (!isProtected(pathname) || PUBLIC_FILES.has(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // Si falta el secret, millor tancar que deixar-ho obert per error.
    if (!env.SITE_PASSWORD) {
      return new Response('Accés no configurat', { status: 503 });
    }

    const token = await sha256('prafols:' + env.SITE_PASSWORD);

    // 1) Ja té la galeta d'accés?
    const cookies = (request.headers.get('Cookie') || '').split(/;\s*/);
    if (cookies.includes(`${COOKIE_NAME}=${token}`)) {
      return withHeaders(await env.ASSETS.fetch(request));
    }

    // 2) Ha escrit la contrasenya al quadre del navegador?
    const pass = passwordFromBasicAuth(request.headers.get('Authorization'));
    if (pass !== null && (await sha256('prafols:' + pass)) === token) {
      const res = withHeaders(await env.ASSETS.fetch(request));
      res.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; Secure; HttpOnly; SameSite=Lax`
      );
      return res;
    }

    // 3) Demanar la contrasenya.
    return new Response('Cal contrasenya', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Viatges", charset="UTF-8"',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'no-store',
      },
    });
  },
};

// Respostes protegides: no indexar i no deixar-les en caches compartides.
function withHeaders(res) {
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex');
  out.headers.set('Cache-Control', 'private');
  return out;
}

// Accés amb contrasenya única per a les carpetes dels viatges.
// La portada, el contacte i /assets/ són públics; el Worker només rep les
// rutes llistades a "run_worker_first" (wrangler.jsonc).
//
// La contrasenya és la variable SITE_PASSWORD. No s'escriu mai al codi.
// Qui no té la galeta d'accés veu una pàgina amb un camp de contrasenya
// (català i castellà); en enviar-la bé es desa una galeta de 30 dies.

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

// Textos de la pàgina d'accés. Edita'ls lliurement (només text, sense HTML).
const TEXTS = {
  title: 'Accés privat · Acceso privado',
  ca: {
    intro: 'Aquest diari de viatge és privat. Introdueix la contrasenya que t’han facilitat per veure’l.',
    label: 'Contrasenya',
    button: 'Entrar', // és el mateix en castellà; només es mostra aquest
    error: 'Contrasenya incorrecta. Torna-ho a provar.',
    // Contrasenya correcta, però el navegador no ha desat la galeta
    // (típic dels navegadors integrats d'Instagram, Facebook, etc.).
    cookies: 'La contrasenya és correcta, però aquest navegador no permet desar l’accés. Obre aquest enllaç amb Safari, Chrome o un altre navegador.',
  },
  es: {
    intro: 'Este diario de viaje es privado. Introduce la contraseña que te han facilitado para verlo.',
    label: 'Contraseña',
    error: 'Contraseña incorrecta. Inténtalo de nuevo.',
    cookies: 'La contraseña es correcta, pero este navegador no permite guardar el acceso. Abre este enlace con Safari, Chrome u otro navegador.',
  },
  home: { href: '/', label: '← Diaris de viatge' },
};

const COOKIE_NAME = 'acces';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dies

// Paràmetre temporal que s'afegeix a l'adreça just després d'entrar la clau
// correcta. Si en tornar-hi no hi ha galeta, vol dir que el navegador no l'ha
// desada, i es mostra un avís en lloc de repetir el formulari sense explicació.
// Quan la galeta sí que hi és, el paràmetre s'elimina de l'adreça.
const MARK = '_acces';

function withoutMark(url) {
  const u = new URL(url);
  u.searchParams.delete(MARK);
  return u;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isProtected(pathname) {
  return PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// state: null (primer cop), 'bad' (clau errònia) o 'cookies' (clau correcta
// però el navegador no desa la galeta).
function loginPage(state) {
  const t = TEXTS;
  const key = state === 'cookies' ? 'cookies' : 'error';
  const err = state
    ? `<p class="err" role="alert">${escapeHtml(t.ca[key])}<br>${escapeHtml(t.es[key])}</p>`
    : '';
  const html = `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(t.title)}</title>
<style>
  :root { color-scheme: light dark; --bg:#f6f5f2; --card:#fff; --fg:#1d1d1b; --muted:#6a6a66; --line:#d9d7d1; --accent:#1d1d1b; --accent-fg:#fff; --err:#b3261e; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161615; --card:#1f1f1d; --fg:#ecebe7; --muted:#a3a29c; --line:#3a3a37; --accent:#ecebe7; --accent-fg:#161615; --err:#f2877f; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--fg); font:16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { width:100%; max-width:400px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:28px 24px; }
  h1 { margin:0 0 14px; font-size:1.15rem; font-weight:600; }
  p { margin:0 0 10px; }
  .es { color:var(--muted); }
  form { margin-top:20px; }
  label { display:block; margin-bottom:6px; font-size:.9rem; color:var(--muted); }
  input[type=password] { width:100%; padding:10px 12px; font:inherit; color:var(--fg); background:transparent; border:1px solid var(--line); border-radius:8px; }
  input[type=password]:focus-visible, button:focus-visible, a:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  button { margin-top:12px; width:100%; padding:10px 12px; font:inherit; font-weight:600; color:var(--accent-fg); background:var(--accent); border:0; border-radius:8px; cursor:pointer; }
  .err { margin-top:14px; color:var(--err); font-size:.9rem; }
  .back { display:inline-block; margin-top:18px; font-size:.9rem; color:var(--muted); }
  .u { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(t.title)}</h1>
  <p>${escapeHtml(t.ca.intro)}</p>
  <p class="es" lang="es">${escapeHtml(t.es.intro)}</p>
  <form method="post" action="">
    <input class="u" type="text" name="usuari" value="viatges" autocomplete="username" tabindex="-1" aria-hidden="true">
    <label for="clau">${escapeHtml(t.ca.label)} · ${escapeHtml(t.es.label)}</label>
    <input id="clau" type="password" name="clau" autocomplete="current-password" required autofocus>
    <button type="submit">${escapeHtml(t.ca.button)}</button>
  </form>
  ${err}
  <a class="back" href="${escapeHtml(t.home.href)}">${escapeHtml(t.home.label)}</a>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'",
    },
  });
}

// Respostes protegides: no indexar i no deixar-les en caches compartides.
function withHeaders(res) {
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex');
  out.headers.set('Cache-Control', 'private');
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Fora de les carpetes protegides, o miniatures públiques: servir tal qual.
    if (!isProtected(pathname) || PUBLIC_FILES.has(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // Si falta la variable, millor tancar que deixar-ho obert per error.
    if (!env.SITE_PASSWORD) {
      return new Response('Accés no configurat', { status: 503 });
    }

    const token = await sha256('prafols:' + env.SITE_PASSWORD);

    // 1) Ja té la galeta d'accés?
    const cookies = (request.headers.get('Cookie') || '').split(/;\s*/);
    if (cookies.includes(`${COOKIE_NAME}=${token}`)) {
      if (url.searchParams.has(MARK)) {
        // La galeta funciona: treu el paràmetre temporal de l'adreça.
        const clean = withoutMark(url);
        return new Response(null, {
          status: 303,
          headers: { Location: clean.pathname + clean.search, 'Cache-Control': 'no-store' },
        });
      }
      return withHeaders(await env.ASSETS.fetch(request));
    }

    // 2) Ha enviat el formulari amb la contrasenya?
    if (request.method === 'POST') {
      let pass = '';
      try {
        pass = String((await request.formData()).get('clau') || '');
      } catch {
        // cos il·legible: es tracta com a contrasenya buida
      }
      if ((await sha256('prafols:' + pass)) === token) {
        // Redirecció a la mateixa adreça (ara com a GET) amb la galeta desada
        // i el paràmetre temporal que permet detectar si el navegador l'ha desada.
        const next = withoutMark(url);
        next.searchParams.set(MARK, '1');
        return new Response(null, {
          status: 303,
          headers: {
            Location: next.pathname + next.search,
            'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; Secure; HttpOnly; SameSite=Lax`,
            'Cache-Control': 'no-store',
          },
        });
      }
      return loginPage('bad');
    }

    // 3) Mostrar la pàgina d'accés. Si ve de la redirecció posterior a una clau
    // correcta i encara no hi ha galeta, el navegador no l'ha desada.
    return loginPage(url.searchParams.has(MARK) ? 'cookies' : null);
  },
};

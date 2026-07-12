const PRECACHE = 'precache-v8'; // v8: main sans badge + quiz stop
const RUNTIME  = 'runtime-v7';

const PRECACHE_URLS = [
  './',                       // ok si tu sers à la racine du dossier
  './index.html',
  './language-selection.html',
  './style.css',
  './app.js',
  './secure-content.js',
  './content-loader.js',
  './manifest.json',
  // './images/logo.png',      // ❌ supprimé car 404 chez toi
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    const results = await Promise.allSettled(
      PRECACHE_URLS.map(url => cache.add(new Request(url, { cache: 'reload' })))
    );
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.warn('[SW] precache fail:', PRECACHE_URLS[i]);
    });
  })());
});

self.addEventListener('activate', (event) => {
  clients.claim();
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== PRECACHE && k !== RUNTIME).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ne pas intercepter l'API
  if (url.origin === 'http://localhost:8080') return;

  // CRITIQUE : Ne JAMAIS mettre en cache language-selection.html pour éviter les problèmes Android
  if (url.pathname.includes('language-selection.html')) {
    // Toujours aller chercher la version fraîche, jamais depuis le cache
    event.respondWith(fetch(req).catch(() => {
      // En cas d'erreur réseau, ne pas utiliser le cache
      return new Response('Page non disponible', { status: 503 });
    }));
    return;
  }

  // Force network-first sur checkout.js (iOS peut sinon servir une ancienne version du fichier)
  if (req.method === 'GET' && url.origin === self.location.origin && url.pathname.endsWith('checkout.js')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'reload' });
        const runtime = await caches.open(RUNTIME);
        runtime.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await caches.match(req);
        if (cached) return cached;
        throw e;
      }
    })());
    return;
  }

  if (req.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        const runtime = await caches.open(RUNTIME);
        runtime.put(req, res.clone());
        return res;
      } catch (e) {
        // Optionnel: renvoyer une page offline si tu en as une
        // return caches.match('./offline.html');
        throw e;
      }
    })());
  }
});

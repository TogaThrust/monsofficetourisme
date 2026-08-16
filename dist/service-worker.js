const PRECACHE = 'precache-v127-ot';
const RUNTIME = 'runtime-v127-ot';

const PRECACHE_URLS = [
  './',
  './index.html',
  './language-selection.html',
  './style.css',
  './manifest.json',
];

function isHtmlJsonOrCode(url) {
  const p = url.pathname.toLowerCase();
  return (
    p.endsWith('.html') ||
    p.endsWith('.json') ||
    p.endsWith('.js') ||
    p.endsWith('.css') ||
    p.endsWith('/') ||
    p === ''
  );
}

function isStaticAsset(url) {
  return /\.(png|jpe?g|gif|svg|webp|ico|mp3|wav|ogg|woff2?|ttf|mp4)$/i.test(url.pathname);
}

async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok && res.type === 'basic') {
      const runtime = await caches.open(RUNTIME);
      runtime.put(req, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw e;
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached && cached.ok) return cached;
  const res = await fetch(req);
  if (res && res.ok && res.type === 'basic') {
    const runtime = await caches.open(RUNTIME);
    runtime.put(req, res.clone());
  }
  return res;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    const results = await Promise.allSettled(
      PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
    );
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.warn('[SW] precache fail:', PRECACHE_URLS[i]);
    });
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/service-worker.js')) return;
  if (url.pathname.startsWith('/.netlify/')) return;
  if (url.origin === 'http://localhost:8080') return;

  if (url.pathname.includes('language-selection.html')) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => {
      return new Response('Page non disponible', { status: 503 });
    }));
    return;
  }

  const mustBeFresh =
    req.mode === 'navigate' ||
    req.cache === 'reload' ||
    isHtmlJsonOrCode(url);

  if (mustBeFresh) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(networkFirst(req));
});

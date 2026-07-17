const CACHE_NAME = 'agroprecios-v4-network-first';
const ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
  );
  self.clients.claim();
});

// Network-first for everything: always try to get the freshest version
// (index.html, admin.html, data.json, manifest.json). Only fall back to
// cache if there's no internet connection at all.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((res) => {
        // keep a copy of icons for true offline fallback
        if (event.request.url.includes('/icons/')) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

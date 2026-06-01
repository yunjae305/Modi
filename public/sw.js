const CACHE_NAME = 'modi-pwa-v3';
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/modi-192.png',
  '/icons/modi-512.png',
  '/icons/modi-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => caches.match(request).then((response) => response || Response.error())),
    );
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((response) => response || caches.match('/offline.html'))),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((response) => (
      response ||
      fetch(request).then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return networkResponse;
      })
    )),
  );
});

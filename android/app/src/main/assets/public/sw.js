// Candy Crush Deluxe Service Worker
const CACHE_NAME = 'candy-crush-deluxe-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/background.jpg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/images/Blue.png',
  '/images/Green.png',
  '/images/Orange.png',
  '/images/Purple.png',
  '/images/Red.png',
  '/images/Yellow.png',
  '/images/Choco.png',
  '/images/Blue-Striped-Horizontal.png',
  '/images/Blue-Striped-Vertical.png',
  '/images/Blue-Wrapped.png',
  '/images/Green-Striped-Horizontal.png',
  '/images/Green-Striped-Vertical.png',
  '/images/Green-Wrapped.png',
  '/images/Orange-Striped-Horizontal.png',
  '/images/Orange-Striped-Vertical.png',
  '/images/Orange-Wrapped.png',
  '/images/Purple-Striped-Horizontal.png',
  '/images/Purple-Striped-Vertical.png',
  '/images/Purple-Wrapped.png',
  '/images/Red-Striped-Horizontal.png',
  '/images/Red-Striped-Vertical.png',
  '/images/Red-Wrapped.png',
  '/images/Yellow-Striped-Horizontal.png',
  '/images/Yellow-Striped-Vertical.png',
  '/images/Yellow-Wrapped.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets could not be cached immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

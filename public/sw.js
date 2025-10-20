const CACHE_NAME = 'katla-live-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/kamus.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // If the network request fails, try to find it in the cache.
      return caches.match(event.request);
    }).then((response) => {
      // Either the network response or the cached response.
      // We can also update the cache with the new response here.
      if (response) {
        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            // We only cache GET requests.
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });
        return response;
      }
      // If fetch fails and it's not in cache, it will result in a network error.
      // For navigation requests, you might want to return a fallback offline page.
      return caches.match(event.request);
    })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

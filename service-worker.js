const CACHE_NAME = 'offline-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  // Adicione outros arquivos que você deseja armazenar em cache
];

// Instala o service worker e armazena em cache todos os recursos necessários
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta as solicitações de rede e retorna os recursos do cache se disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Verifica se recebeu uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Ativa o service worker e remove caches antigos se necessário
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
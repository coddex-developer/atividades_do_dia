const CACHE_NAME = 'offline-cache-v5';  // Atualize a versão do cache aqui
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
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta as solicitações de rede e retorna os recursos do cache se disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
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

// Atualiza o service worker e remove caches antigos
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
    }).then(() => {
      self.clients.claim();
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ action: 'update' }));
      });
    })
  );
});
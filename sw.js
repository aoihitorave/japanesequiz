// sw.js の改良版
const CACHE_VERSION = 'v1.0.1'; // バージョンを更新時に変更
const CACHE_NAME = `kokugo-master-${CACHE_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './data/kotowaza/beginner.json',
  './data/kotowaza/intermediate.json',
  './data/kotowaza/advanced.json',
  './data/kanyouku/beginner.json',
  './data/kanyouku/intermediate.json',
  './data/kanyouku/advanced.json',
  './data/kojiseigo/beginner.json',
  './data/kojiseigo/intermediate.json',
  './data/kojiseigo/advanced.json'
];

// インストール時の処理
self.addEventListener('install', event => {
  console.log('新しいService Workerをインストール中...');
  // 即座に有効化
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 有効化時の処理
self.addEventListener('activate', event => {
  console.log('Service Workerを有効化中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('kokugo-master-') && cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // すべてのクライアントを即座に制御
      return self.clients.claim();
    })
  );
});

// フェッチ時の処理（ネットワークファースト戦略）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ネットワークから取得できた場合はキャッシュを更新
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

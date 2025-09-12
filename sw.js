// Service Worker - オフライン対応のための設定
const CACHE_NAME = 'kokugo-master-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // 問題データファイル
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

// インストール時にファイルをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// リクエスト時にキャッシュから返す
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す、なければネットワークから取得
        return response || fetch(event.request);
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

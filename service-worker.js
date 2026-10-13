/* ==========================================================================
   운세방앗간 Service Worker (2026 리뉴얼판)
   · 이전 버전의 '캐시 감옥'(구버전 파일이 계속 서빙되던 문제)을 정리합니다.
   · index.html 에는 킬스위치가 있어 기존 방문자는 자동으로 등록 해제됩니다.
   · 여기서는 최신 자산만 캐싱하는 캐시 우선 + 네트워크 갱신 전략을 사용합니다.
   ========================================================================== */
const CACHE_NAME = 'unsemill-2026-design-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './about.html',
  './privacy.html',
  './terms.html',
  './cookie.html',
  './contact.html',
  './ad-policy.html',
  './404.html',
  './manifest.json',
  './assets/og-image.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-32.png'
];

/* 1) 설치: 핵심 문서만 미리 캐싱 (실패해도 설치가 막히지 않도록 개별 처리) */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    ).then(() => self.skipWaiting())
  );
});

/* 2) 활성화: 이전 캐시 전부 삭제 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* 3) 요청 처리: HTML/JS/CSS 는 네트워크 우선(항상 최신), 그 외는 캐시 우선 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin + '/')) return;

  const url = new URL(req.url);
  const isCore = /\.(html|js|css|json)$/i.test(url.pathname) || url.pathname === '/';

  if (isCore) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});

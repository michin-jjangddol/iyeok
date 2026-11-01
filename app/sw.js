// 아이역 동전점 서비스 워커
// 인터넷이 되면 새 파일을 받고(network-first), 끊기면 저장해 둔 파일로 연다.

const CACHE = "iyeok-app-v1";
const FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./iching.js",
  "./manifest.webmanifest",
  "../assets/style.css",
  "../assets/favicon.svg",
  "../assets/icons/icon-192.png",
  "../assets/icons/icon-512.png",
  "../assets/icons/icon-512-maskable.png",
  "../assets/icons/apple-touch-icon.png",
  "../data/hexagrams.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("iyeok-app-") && key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});

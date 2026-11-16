// 아이역 동전점 서비스 워커
// 인터넷이 되면 새 파일을 받고(network-first), 끊기면 저장해 둔 파일로 연다.
// 새 파일을 받을 때 브라우저 캐시(GitHub Pages는 10분)를 그대로 믿지 않고 서버에 바뀌었는지 묻는다.

const CACHE = "iyeok-app-v12";
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
  "../data/hexagrams/261117_0733_content-index_Laude.json",
  "../data/hexagrams/111010/judgment/original/261116_2223_judgment_Laude.json",
  "../data/hexagrams/111010/judgment/ko/261116_2223_judgment_Laude.json",
  "../data/hexagrams/110001/judgment/original/261116_2301_judgment_Laude.json",
  "../data/hexagrams/110001/judgment/ko/261116_2301_judgment_Laude.json",
  "../data/hexagrams/111100/judgment/original/261116_2316_judgment_Laude.json",
  "../data/hexagrams/111100/judgment/ko/261116_2316_judgment_Laude.json",
  "../data/hexagrams/010001/judgment/original/261116_2336_judgment_Laude.json",
  "../data/hexagrams/010001/judgment/ko/261116_2336_judgment_Laude.json",
  "../data/hexagrams/111111/judgment/original/261116_2344_judgment_Laude.json",
  "../data/hexagrams/111111/judgment/ko/261116_2344_judgment_Laude.json",
  "../data/hexagrams/001100/judgment/original/261116_2353_judgment_Laude.json",
  "../data/hexagrams/001100/judgment/ko/261116_2353_judgment_Laude.json",
  "../data/hexagrams/001001/judgment/original/261117_0656_judgment_Laude.json",
  "../data/hexagrams/001001/judgment/ko/261117_0656_judgment_Laude.json",
  "../data/hexagrams/101000/judgment/original/261117_0716_judgment_Laude.json",
  "../data/hexagrams/101000/judgment/ko/261117_0716_judgment_Laude.json",
  "../data/hexagrams/011001/judgment/original/261117_0733_judgment_Laude.json",
  "../data/hexagrams/011001/judgment/ko/261117_0733_judgment_Laude.json",
];

self.addEventListener("install", (event) => {
  // 설치할 때도 브라우저 캐시가 아니라 서버에서 새로 받아 저장한다.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES.map((path) => new Request(path, { cache: "reload" })))),
  );
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
    fetch(request, { cache: "no-cache" })
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

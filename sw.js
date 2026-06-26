// Simple offline cache for the app shell. Bump the version to force an update.
const CACHE = "wear-app-v1";
const ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Always go to the network for the weather APIs; never serve those from cache.
  if (request.url.includes("open-meteo.com")) {
    event.respondWith(fetch(request));
    return;
  }

  // App shell: serve from cache first, fall back to the network.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

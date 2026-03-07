/* YourDiveLog Service Worker */
const CACHE_NAME = "ydl-v1";

// Files to pre-cache (app shell)
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./assets/logo.png",
  "./manifest.json",
];

// CDN resources to cache on first fetch
const CDN_ORIGINS = [
  "unpkg.com",
];

/* ── Install: cache app shell ─────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* ── Activate: clean up old caches ───────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: network-first for same-origin, cache-first for CDN ─ */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  // Skip Nominatim geocoding & tile requests from cache (always fresh)
  if (url.hostname.includes("nominatim") || url.hostname.includes("tile.openstreetmap")) return;

  // CDN resources: cache-first
  if (CDN_ORIGINS.some((origin) => url.hostname.includes(origin))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Same-origin: network-first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

const CACHE_NAME = "unterhaltpro-cache-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Wichtige Routen vorab cachen (optional erweiterbar)
    await cache.addAll(["/", "/rechner", OFFLINE_URL, "/favicon.ico"]);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

// Network-first mit Offline-Fallback für Navigationen (Seitenaufrufe)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        // Seiten frisch aus dem Netz -> optional in Cache legen
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch (err) {
        // Offline -> versuche Cache, sonst Offline-Seite
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        return cached || cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Für Assets: Cache-first, dann Netz
  if (request.destination === "style" || request.destination === "script" || request.destination === "image" || request.destination === "font") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        // Fallback: nichts
        return new Response("", { status: 404 });
      }
    })());
  }
});

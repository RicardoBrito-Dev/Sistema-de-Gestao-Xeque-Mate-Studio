// ─── Xeque Mate Studio — Service Worker ───
const CACHE_NAME = "xm-cache-v15";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg",
];

// Instalação: ativa imediatamente
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Ativação: limpa TODOS os caches antigos imediatamente
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-first para navegação, Cache-first para assets estáticos
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests de outros domínios (Supabase, fontes, etc.)
  if (url.origin !== self.location.origin) return;

  // Ignora requisições de API e dados dinâmicos
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) return;

  // Assets estáticos do Next.js (_next/static): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Páginas: Network-first, fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

const CACHE_NAME = 'aestate-img-cache-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max

// Cache strategy: Network first, fallback to cache (agar selalu dapat data terbaru)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Only cache images from our domain or trusted sources
    if (event.request.destination === 'image' && 
        (url.origin === location.origin || url.hostname.includes('ibb.co'))) {
        
        event.respondWith(
            // Try network first for fresh images
            fetch(event.request)
                .then((response) => {
                    // Clone and cache successful response
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || new Response('', { status: 404 });
                    });
                })
        );
    }
});

// Clear old cache saat activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

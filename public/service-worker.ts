// Service Worker for Progressive Web App
/// <reference lib="webworker" />

const CACHE_NAME = 'aqt-journal-v1';
const RUNTIME_CACHE = 'aqt-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
];

const sw = self as ServiceWorkerGlobalScope;

// Install event - cache static assets
sw.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    sw.skipWaiting();
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    sw.clients.claim();
});

// Fetch event - network first, then cache
sw.addEventListener('fetch', (event: FetchEvent) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(sw.location.origin)) {
        return;
    }

    //Network first strategy for API calls
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((response) => {
                        return response || new Response('Offline', { status: 503 });
                    });
                })
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            });
        })
    );
});

// Background sync for offline trade logging
sw.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-trades') {
        event.waitUntil(syncTrades());
    }
});

async function syncTrades() {
    // Get pending trades from IndexedDB
    // This would sync with your backend when online
    console.log('[SW] Syncing trades...');
}

// Push notifications
sw.addEventListener('push', (event: PushEvent) => {
    const data = event.data?.json() ?? {};
    const options = {
        body: data.body || 'New notification',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        vibrate: [200, 100, 200],
        data: data,
    };

    event.waitUntil(sw.registration.showNotification(data.title || 'RetailBeastFX', options));
});

// Notification click
sw.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    event.waitUntil(
        sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus existing window if available
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (sw.clients.openWindow) {
                return sw.clients.openWindow('/');
            }
        })
    );
});

export { };

// PWA Registration and Installation Prompt
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
    if ('serviceWorker' in navigator) {
        return navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered:', registration);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                return registration;
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
                return undefined;
            });
    }

    return Promise.resolve(undefined);
}

export function unregisterServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                return registration.unregister();
            }
            return false;
        });
    }

    return Promise.resolve(false);
}

// Check if app is installed
export function isAppInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isIOSStandalone = (window.navigator as any).standalone === true;

    return isStandalone || (isIOS && isIOSStandalone);
}

// Request push notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('[PWA] Notifications not supported');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
}

// Subscribe to push notifications
export async function subscribeToPush(
    registration: ServiceWorkerRegistration,
    vapidPublicKey: string
): Promise<PushSubscription | null> {
    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
        });

        console.log('[PWA] Push subscription:', subscription);
        return subscription;
    } catch (error) {
        console.error('[PWA] Push subscription failed:', error);
        return null;
    }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

// Background sync for offline trades
export async function syncOfflineTrades(trades: any[]): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;

        // Store trades in IndexedDB
        await storeOfflineTrades(trades);

        // Request background sync
        try {
            await (registration as any).sync.register('sync-trades');
            console.log('[PWA] Background sync registered');
        } catch (error) {
            console.error('[PWA] Background sync failed:', error);
        }
    }
}

// IndexedDB storage for offline trades
async function storeOfflineTrades(trades: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RetailBeastFXJournal', 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['offlineTrades'], 'readwrite');
            const store = transaction.objectStore('offlineTrades');

            trades.forEach((trade) => {
                store.put(trade);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('offlineTrades')) {
                db.createObjectStore('offlineTrades', { keyPath: 'id' });
            }
        };
    });
}

// Check for app updates
export function checkForUpdates(
    registration: ServiceWorkerRegistration,
    onUpdateFound: () => void
): void {
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker installed, notify user
                    onUpdateFound();
                }
            });
        }
    });
}

// Apply app update
export function applyUpdate(registration: ServiceWorkerRegistration): void {
    const waiting = registration.waiting;

    if (waiting) {
        waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload page when new service worker takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
}

// Get app install prompt event
let deferredPrompt: any = null;

export function setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('[PWA] Install prompt available');
    });
}

export function showInstallPrompt(): Promise<boolean> {
    if (!deferredPrompt) {
        return Promise.resolve(false);
    }

    deferredPrompt.prompt();

    return deferredPrompt.userChoice.then((choiceResult: any) => {
        const accepted = choiceResult.outcome === 'accepted';
        console.log(`[PWA] User ${accepted ? 'accepted' : 'dismissed'} install prompt`);
        deferredPrompt = null;
        return accepted;
    });
}

export function canShowInstallPrompt(): boolean {
    return deferredPrompt !== null && !isAppInstalled();
}

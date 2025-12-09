'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function ServiceWorkerRegistrar() {
    const [isOffline, setIsOffline] = useState(false);
    const [swStatus, setSwStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        // Check online status
        const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
        updateOnlineStatus();

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Registered:', registration.scope);
                    setSwStatus('ready');

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        console.log('[SW] Update found');
                    });
                })
                .catch((error) => {
                    console.error('[SW] Registration failed:', error);
                    setSwStatus('error');
                });
        } else {
            setSwStatus('error');
        }

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Show offline indicator
    if (isOffline) {
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg shadow-lg">
                    <WifiOff size={18} />
                    <span className="text-sm font-medium">Offline Mode</span>
                </div>
            </div>
        );
    }

    return null;
}

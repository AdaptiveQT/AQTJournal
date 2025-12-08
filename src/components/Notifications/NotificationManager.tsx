'use client';

import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, TrendingUp, Trophy } from 'lucide-react';

export type NotificationType =
    | 'goal_reached'
    | 'max_loss_warning'
    | 'streak_milestone'
    | 'weekly_summary'
    | 'custom';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    action?: () => void;
}

interface NotificationManagerProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onClearAll: () => void;
    notificationSettings?: {
        enabled: boolean;
        sound: boolean;
    };
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
    notifications,
    onMarkRead,
    onClearAll,
    notificationSettings = { enabled: true, sound: true },
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Check browser notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    const sendBrowserNotification = (notification: Notification) => {
        if (
            notificationSettings.enabled &&
            permission === 'granted' &&
            'Notification' in window &&
            document.hidden
        ) {
            const browserNotif = new window.Notification(notification.title, {
                body: notification.message,
                icon: '/icon-192.png',
                badge: '/icon-96.png',
                tag: notification.id,
            });

            if (notificationSettings.sound) {
                // Play notification sound (you'd need an audio file)
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            }

            browserNotif.onclick = () => {
                window.focus();
                if (notification.action) notification.action();
                browserNotif.close();
            };
        }
    };

    // Auto-send new notifications
    useEffect(() => {
        const unreadNotifs = notifications.filter(n => !n.read);
        if (unreadNotifs.length > 0 && permission === 'granted') {
            const latest = unreadNotifs[unreadNotifs.length - 1];
            sendBrowserNotification(latest);
        }
    }, [notifications.length]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'goal_reached':
                return <CheckCircle size={20} className="text-green-600" />;
            case 'max_loss_warning':
                return <AlertTriangle size={20} className="text-red-600" />;
            case 'streak_milestone':
                return <Trophy size={20} className="text-yellow-600" />;
            case 'weekly_summary':
                return <TrendingUp size={20} className="text-blue-600" />;
            default:
                return <Bell size={20} className="text-slate-600" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[500px] flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell size={18} className="text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Permission Request */}
                        {permission !== 'granted' && (
                            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                    Enable browser notifications to stay updated
                                </p>
                                <button
                                    onClick={requestPermission}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-500 transition-colors"
                                >
                                    Enable Notifications
                                </button>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                }`}
                                            onClick={() => {
                                                onMarkRead(notification.id);
                                                if (notification.action) {
                                                    notification.action();
                                                    setIsOpen(false);
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(notification.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        onClearAll();
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationManager;

// Utility function to create notifications
export function createNotification(
    type: NotificationType,
    title: string,
    message: string,
    action?: () => void
): Notification {
    return {
        id: Date.now().toString() + Math.random(),
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        action,
    };
}

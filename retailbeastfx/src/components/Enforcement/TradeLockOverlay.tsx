'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Clock, AlertOctagon, X } from 'lucide-react';
import { TradeLock } from '../../types';

interface TradeLockOverlayProps {
    lock: TradeLock | null;
    onDismiss?: () => void;
    darkMode?: boolean;
}

/**
 * Trade Lock Overlay - Displays when trading is restricted
 * Clinical language, no sympathy
 */
export default function TradeLockOverlay({
    lock,
    onDismiss,
    darkMode = true
}: TradeLockOverlayProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!lock || lock.expiresAt === 0) return;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = lock.expiresAt - now;

            if (remaining <= 0) {
                setTimeLeft('Expired');
                return;
            }

            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lock]);

    if (!lock) return null;

    const bg = darkMode ? 'bg-red-950/95' : 'bg-red-50';
    const text = darkMode ? 'text-white' : 'text-gray-900';
    const subtext = darkMode ? 'text-red-300' : 'text-red-700';
    const border = darkMode ? 'border-red-800' : 'border-red-300';

    const lockTypeLabels: Record<string, string> = {
        cooldown: 'Cooldown Active',
        session: 'Session Locked',
        review: 'Review Required',
        violations: 'Violation Limit Reached',
        daily_limit: 'Daily Trade Limit Reached'
    };

    const lockIcons: Record<string, React.ReactNode> = {
        cooldown: <Clock className="w-8 h-8 text-amber-500" />,
        session: <Lock className="w-8 h-8 text-red-500" />,
        review: <AlertOctagon className="w-8 h-8 text-amber-500" />,
        violations: <AlertOctagon className="w-8 h-8 text-red-500" />,
        daily_limit: <Lock className="w-8 h-8 text-red-500" />
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className={`${bg} rounded-xl shadow-2xl w-full max-w-sm mx-4 border ${border}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${border}`}>
                    <div className="flex items-center gap-3">
                        {lockIcons[lock.type]}
                        <h2 className={`text-lg font-semibold ${text}`}>
                            {lockTypeLabels[lock.type]}
                        </h2>
                    </div>
                    {lock.expiresAt === 0 && onDismiss && (
                        <button onClick={onDismiss} className="text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 text-center space-y-4">
                    <p className={`text-sm ${subtext}`}>
                        {lock.reason}
                    </p>

                    {lock.expiresAt > 0 && (
                        <div className={`text-3xl font-mono font-bold ${text}`}>
                            {timeLeft}
                        </div>
                    )}

                    {lock.sessionType && (
                        <p className={`text-xs ${subtext}`}>
                            Affected session: {lock.sessionType}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${border}`}>
                    <p className={`text-xs text-center ${subtext}`}>
                        Trading is temporarily restricted.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Inline cooldown indicator for trade button area
 */
export function CooldownIndicator({
    expiresAt,
    darkMode = true
}: {
    expiresAt: number;
    darkMode?: boolean;
}) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const updateTimer = () => {
            const remaining = expiresAt - Date.now();
            if (remaining <= 0) {
                setTimeLeft('');
                return;
            }
            const minutes = Math.floor(remaining / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!timeLeft) return null;

    return (
        <div className={`flex items-center gap-2 text-amber-500 text-sm ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'} px-3 py-2 rounded-lg`}>
            <Clock className="w-4 h-4" />
            <span>Cooldown: {timeLeft}</span>
        </div>
    );
}

'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface AnalyticsLockProps {
    tradesLogged: number;
    requiredTrades?: number;
    children: React.ReactNode;
}

export default function AnalyticsLock({
    tradesLogged,
    requiredTrades = 10,
    children
}: AnalyticsLockProps) {
    const isLocked = tradesLogged < requiredTrades;

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Blurred content with real labels visible */}
            <div className="blur-sm opacity-50 pointer-events-none select-none">
                {children}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-slate-900/90 border border-slate-700 rounded-xl px-8 py-6 text-center max-w-sm">
                    <Lock className="mx-auto text-slate-500 mb-3" size={32} />
                    <p className="text-slate-300 font-medium mb-1">
                        Matrix calibrating.
                    </p>
                    <p className="text-slate-500 text-sm">
                        Log {requiredTrades - tradesLogged} more trade{requiredTrades - tradesLogged !== 1 ? 's' : ''} to unlock.
                    </p>
                </div>
            </div>
        </div>
    );
}

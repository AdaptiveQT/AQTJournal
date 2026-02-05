'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, Lock, ShieldOff } from 'lucide-react';

interface Trade {
    ts: number;
    violationReason?: string;
    setupQuality?: string;
}

interface ViolationEnforcementBannerProps {
    trades: Trade[];
}

// Constants - outside component
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const WARNING_THRESHOLD = 3;
const LOCKOUT_THRESHOLD = 5;

/**
 * Calculates enforcement state from trades array
 */
function calculateEnforcement(trades: Trade[], now: number) {
    const fourteenDaysAgo = now - FOURTEEN_DAYS_MS;

    // Count violations in last 14 days
    const recentViolations = trades.filter(t => {
        const hasViolation = !!t.violationReason || t.setupQuality === 'IMPULSE';
        const isRecent = t.ts >= fourteenDaysAgo;
        return hasViolation && isRecent;
    });

    const violationCount = recentViolations.length;

    // Calculate days since last violation
    const allViolations = trades.filter(t => !!t.violationReason || t.setupQuality === 'IMPULSE');
    const lastViolationTs = allViolations.length > 0
        ? Math.max(...allViolations.map(t => t.ts))
        : null;

    const daysSinceLastViolation = lastViolationTs
        ? Math.floor((now - lastViolationTs) / ONE_DAY_MS)
        : trades.length > 0 ? 999 : 0; // 999 = never violated, 0 = no trades yet

    // Determine enforcement level
    const isReadOnly = violationCount >= LOCKOUT_THRESHOLD;
    const showWarning = violationCount >= WARNING_THRESHOLD && !isReadOnly;

    return {
        violationCount,
        daysSinceLastViolation,
        isReadOnly,
        showWarning,
        violationsUntilLockout: Math.max(0, LOCKOUT_THRESHOLD - violationCount),
    };
}

/**
 * Violation Enforcement Engine
 * 
 * Tracks violations in rolling 14-day window:
 * - 3+ violations → Warning banner (visible, persistent)
 * - 5+ violations → READ-ONLY MODE (no new entries)
 */
export default function ViolationEnforcementBanner({ trades }: ViolationEnforcementBannerProps) {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update time on mount and when trades change
    useEffect(() => {
        requestAnimationFrame(() => setCurrentTime(Date.now()));
    }, [trades]);

    const enforcement = useMemo(() => {
        return calculateEnforcement(trades, currentTime);
    }, [trades, currentTime]);

    // Nothing to show if clean
    if (!enforcement.showWarning && !enforcement.isReadOnly) {
        return null;
    }

    // READ-ONLY MODE - Maximum enforcement
    if (enforcement.isReadOnly) {
        return (
            <div className="bg-red-900/80 border-2 border-red-500 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                    <Lock className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
                    <div className="flex-1">
                        <p className="text-red-400 font-bold text-lg flex items-center gap-2">
                            <ShieldOff size={20} />
                            READ-ONLY MODE
                        </p>
                        <p className="text-red-300 text-sm mt-1">
                            <span className="font-bold">{enforcement.violationCount} violations</span> in the last 14 days.
                            Journal is locked. Review your trades. No new entries until violations age out.
                        </p>
                        <p className="text-red-400/70 text-xs mt-2 italic">
                            &quot;You weren&apos;t stopped by the market. You were stopped by the system.&quot;
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // WARNING BANNER
    if (enforcement.showWarning) {
        return (
            <div className="bg-amber-900/50 border border-amber-500/50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <p className="text-amber-400 font-bold text-sm">
                            ENFORCEMENT WARNING
                        </p>
                        <p className="text-amber-300/80 text-xs mt-1">
                            <span className="font-bold">{enforcement.violationCount} violations</span> in last 14 days.
                            {enforcement.violationsUntilLockout > 0 && (
                                <> {enforcement.violationsUntilLockout} more → <span className="text-red-400 font-bold">READ-ONLY MODE</span>.</>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

/**
 * Hook to get enforcement state for use elsewhere (e.g., disabling buttons)
 */
export function useViolationEnforcement(trades: Trade[]) {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update time on mount and when trades change
    useEffect(() => {
        requestAnimationFrame(() => setCurrentTime(Date.now()));
    }, [trades]);

    return useMemo(() => {
        return calculateEnforcement(trades, currentTime);
    }, [trades, currentTime]);
}

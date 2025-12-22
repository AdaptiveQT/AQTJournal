'use client';

import React, { useMemo } from 'react';
import { Target, Clock, Zap, AlertTriangle } from 'lucide-react';

interface DailyDirectiveProps {
    maxTrades?: number;
    tradesLogged?: number;
    preferredSession?: 'London' | 'New York' | 'Asia' | 'Any';
    allowedSetups?: string[];
    isRecoveryMode?: boolean;
}

export default function DailyDirective({
    maxTrades = 3,
    tradesLogged = 0,
    preferredSession = 'New York',
    allowedSetups = ['Trinity OB', 'BB Reversal'],
    isRecoveryMode = false
}: DailyDirectiveProps) {

    const tradesRemaining = Math.max(0, maxTrades - tradesLogged);
    const isMaxedOut = tradesRemaining === 0;

    // Get current session based on time (EST)
    const currentSession = useMemo(() => {
        const now = new Date();
        const hour = now.getHours();
        // Rough EST session times
        if (hour >= 3 && hour < 6) return 'London';
        if (hour >= 8 && hour < 12) return 'New York';
        if (hour >= 19 || hour < 3) return 'Asia';
        return 'Off-Hours';
    }, []);

    const isPreferredSession = currentSession === preferredSession || preferredSession === 'Any';

    return (
        <div className={`rounded-xl p-4 mb-4 border transition-all ${isRecoveryMode
                ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/50'
                : isMaxedOut
                    ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50'
                    : 'bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border-emerald-500/30'
            }`}>

            <div className="flex items-center justify-between flex-wrap gap-4">

                {/* Directive Title */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isRecoveryMode ? 'bg-red-500/20' : 'bg-emerald-500/20'
                        }`}>
                        {isRecoveryMode ? (
                            <AlertTriangle className="text-red-400" size={20} />
                        ) : (
                            <Target className="text-emerald-400" size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                            {isRecoveryMode ? "Recovery Protocol" : "Today's Directive"}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {isRecoveryMode
                                ? "Reduced risk. Maximum discipline."
                                : "Execute with precision."}
                        </p>
                    </div>
                </div>

                {/* Directive Cards */}
                <div className="flex items-center gap-4 flex-wrap">

                    {/* Trades Remaining */}
                    <div className={`px-3 py-2 rounded-lg border ${isMaxedOut
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}>
                        <div className="text-[10px] text-slate-400 uppercase">Trades Left</div>
                        <div className={`text-lg font-bold ${isMaxedOut ? 'text-red-400' : 'text-white'
                            }`}>
                            {tradesRemaining}/{maxTrades}
                        </div>
                    </div>

                    {/* Session */}
                    <div className={`px-3 py-2 rounded-lg border ${isPreferredSession
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}>
                        <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <Clock size={10} /> Session
                        </div>
                        <div className={`text-lg font-bold ${isPreferredSession ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                            {preferredSession}
                        </div>
                    </div>

                    {/* Allowed Setups */}
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                            <Zap size={10} /> Setups Only
                        </div>
                        <div className="text-sm font-bold text-blue-400">
                            {allowedSetups.slice(0, 2).join(' • ')}
                        </div>
                    </div>

                </div>

            </div>

            {/* Bottom Warning */}
            {isMaxedOut && (
                <div className="mt-3 pt-3 border-t border-red-500/20 text-center">
                    <span className="text-red-400 text-sm font-bold">
                        ⚠️ Daily trade limit reached. Step away.
                    </span>
                </div>
            )}

        </div>
    );
}

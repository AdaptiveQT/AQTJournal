'use client';

import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

interface MaxLossEnforcerProps {
    todayPnL: number;
    maxDailyLoss: number;
    onOverride: () => void;
}

const MaxLossEnforcer: React.FC<MaxLossEnforcerProps> = ({ todayPnL, maxDailyLoss, onOverride }) => {
    const fmtUSD = (val: number) => `$${Math.abs(val).toFixed(2)}`;

    const hasHitMaxLoss = todayPnL <= -Math.abs(maxDailyLoss);

    if (!hasHitMaxLoss) return null;

    return (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 mb-6 animate-pulse">
            <div className="flex items-start gap-4">
                <AlertCircle size={48} className="text-red-500 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                        <Shield size={20} />
                        Max Daily Loss Reached
                    </h3>
                    <div className="text-white mb-3">
                        <div className="text-3xl font-bold mb-1">
                            Loss Today: {fmtUSD(todayPnL)}
                        </div>
                        <div className="text-lg opacity-80">
                            Max Allowed: {fmtUSD(maxDailyLoss)}
                        </div>
                    </div>
                    <p className="text-red-200 mb-4 leading-relaxed">
                        <strong>Stop trading now.</strong> You've hit your maximum daily loss limit.
                        Trading when you're down increases the risk of revenge trading and bigger losses.
                        Take a break and come back tomorrow with a fresh mindset.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onOverride}
                            className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-white text-sm border border-red-500/50 transition-all"
                        >
                            I Understand the Risk - Continue Anyway
                        </button>
                    </div>
                    <p className="text-xs text-red-300/60 mt-3">
                        ⚠️ Most profitable traders stop after hitting max loss
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MaxLossEnforcer;

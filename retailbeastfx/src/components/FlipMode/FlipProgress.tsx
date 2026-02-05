'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface FlipProgressProps {
    startBalance: number;
    currentBalance: number;
    targetBalance: number;
}

const FlipProgress: React.FC<FlipProgressProps> = ({ startBalance, currentBalance, targetBalance }) => {
    const fmtUSD = (val: number) => `$${val.toFixed(0)}`;

    const progress = Math.max(0, Math.min(100, ((currentBalance - startBalance) / (targetBalance - startBalance)) * 100));
    const growthPercent = ((currentBalance / startBalance) * 100).toFixed(0);
    const remaining = Math.max(0, targetBalance - currentBalance);

    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Flip Progress
            </h3>

            <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-400">Start: {fmtUSD(startBalance)}</span>
                <span className="font-bold text-white text-base">{fmtUSD(currentBalance)}</span>
                <span className="text-slate-400">Goal: {fmtUSD(targetBalance)}</span>
            </div>

            <div className="h-6 bg-slate-800 rounded-full overflow-hidden mb-4 relative">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                    {progress.toFixed(1)}%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{growthPercent}%</div>
                    <div className="text-xs text-slate-400">Total Growth</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{fmtUSD(remaining)}</div>
                    <div className="text-xs text-slate-400">To Goal</div>
                </div>
            </div>
        </div>
    );
};

export default FlipProgress;

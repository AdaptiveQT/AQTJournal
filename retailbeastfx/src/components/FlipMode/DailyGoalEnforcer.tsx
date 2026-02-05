'use client';

import React from 'react';
import { Trophy, X } from 'lucide-react';

interface DailyGoalEnforcerProps {
    todayPnL: number;
    dailyGoal: number;
    onClose: () => void;
}

const DailyGoalEnforcer: React.FC<DailyGoalEnforcerProps> = ({ todayPnL, dailyGoal, onClose }) => {
    const fmtUSD = (val: number) => `$${Math.abs(val).toFixed(2)}`;

    if (todayPnL < dailyGoal) return null;

    return (
        <div className="fixed inset-0 bg-green-500/95 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center px-6 animate-in fade-in zoom-in duration-500">
                <Trophy size={80} className="mx-auto mb-6 text-white drop-shadow-2xl animate-bounce" />
                <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    Daily Goal Hit! 🎯
                </h2>
                <div className="mb-6">
                    <div className="text-6xl font-bold text-white mb-2">
                        {fmtUSD(todayPnL)}
                    </div>
                    <div className="text-2xl text-white/90">
                        Goal: {fmtUSD(dailyGoal)}
                    </div>
                </div>
                <p className="text-xl text-white/90 mb-3 max-w-md mx-auto leading-relaxed">
                    Amazing work! You've hit your target for today.
                </p>
                <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
                    Overtrading after hitting your goal is the #1 way to give back profits.
                    Close the app and come back tomorrow.
                </p>
                <button
                    onClick={onClose}
                    className="px-10 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-2xl flex items-center gap-3 mx-auto"
                >
                    <X size={24} />
                    I'm Done For Today ✓
                </button>
                <p className="text-sm text-white/60 mt-4">
                    This lock protects your profits
                </p>
            </div>
        </div>
    );
};

export default DailyGoalEnforcer;

'use client';

import React from 'react';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

interface StreakTrackerProps {
    currentStreak: number;
    longestStreak: number;
    lastProfitableDay: string | null;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
    currentStreak,
    longestStreak,
    lastProfitableDay
}) => {
    const getStreakEmoji = (streak: number) => {
        if (streak >= 10) return '🔥🔥🔥';
        if (streak >= 5) return '🔥🔥';
        if (streak >= 3) return '🔥';
        return '';
    };

    return (
        <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-4">
                <Flame size={24} className="text-orange-400" />
                <h3 className="text-lg font-bold text-white">Profit Streak</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Current Streak */}
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-slate-400 mb-1">Current</div>
                    <div className="text-4xl font-bold text-orange-400 mb-1">
                        {currentStreak}
                    </div>
                    <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
                    {currentStreak > 0 && (
                        <div className="text-xs text-slate-500 mt-2">
                            {currentStreak === 1 ? 'day' : 'days'} in profit
                        </div>
                    )}
                </div>

                {/* Longest Streak */}
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-slate-400 mb-1 flex items-center justify-center gap-1">
                        <Trophy size={12} />
                        Best
                    </div>
                    <div className="text-4xl font-bold text-yellow-400 mb-1">
                        {longestStreak}
                    </div>
                    <div className="text-2xl">{getStreakEmoji(longestStreak)}</div>
                    {longestStreak > 0 && (
                        <div className="text-xs text-slate-500 mt-2">
                            personal record
                        </div>
                    )}
                </div>
            </div>

            {lastProfitableDay && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                    <div className="text-xs text-blue-200">
                        <TrendingUp size={12} className="inline mr-1" />
                        Last profitable day: <strong>{lastProfitableDay}</strong>
                    </div>
                </div>
            )}

            {currentStreak === 0 && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-center">
                    <div className="text-xs text-slate-400">
                        💡 Make a profitable trade today to start your streak!
                    </div>
                </div>
            )}

            {currentStreak >= 3 && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                    <div className="text-sm text-green-300 font-bold">
                        🎯 You're on fire! Keep the momentum going!
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreakTracker;

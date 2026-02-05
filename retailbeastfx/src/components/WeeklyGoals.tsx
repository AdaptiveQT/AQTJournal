'use client';

import React from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';

interface WeeklyGoalsProps {
    weeklyGoal: number;
    monthlyGoal: number;
    trades: Array<{ pnl: number; date: string }>;
    onUpdateWeeklyGoal: (goal: number) => void;
    onUpdateMonthlyGoal: (goal: number) => void;
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({
    weeklyGoal,
    monthlyGoal,
    trades,
    onUpdateWeeklyGoal,
    onUpdateMonthlyGoal
}) => {
    // Calculate this week's P&L
    const getWeekStart = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = start
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const getMonthStart = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };

    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    const weeklyPnL = trades
        .filter(t => new Date(t.date) >= weekStart)
        .reduce((sum, t) => sum + (t.pnl || 0), 0);

    const monthlyPnL = trades
        .filter(t => new Date(t.date) >= monthStart)
        .reduce((sum, t) => sum + (t.pnl || 0), 0);

    const weeklyProgress = weeklyGoal > 0 ? (weeklyPnL / weeklyGoal) * 100 : 0;
    const monthlyProgress = monthlyGoal > 0 ? (monthlyPnL / monthlyGoal) * 100 : 0;

    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
                <Target size={24} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">Extended Goals</h3>
            </div>

            {/* Weekly Goal */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={14} />
                        <span>Weekly Target</span>
                    </div>
                    <input
                        type="number"
                        value={weeklyGoal}
                        onChange={(e) => onUpdateWeeklyGoal(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-slate-800 rounded text-white text-xs border border-slate-600 text-right"
                        placeholder="Goal"
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className={weeklyPnL >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            ${weeklyPnL.toFixed(2)}
                        </span>
                        <span className="text-slate-400">
                            ${weeklyGoal.toFixed(0)} goal
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${weeklyPnL >= weeklyGoal ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, weeklyProgress))}%` }}
                        />
                    </div>
                </div>
                {weeklyPnL >= weeklyGoal && weeklyGoal > 0 && (
                    <div className="text-xs text-green-400 font-bold">
                        ✓ Weekly goal achieved!
                    </div>
                )}
            </div>

            {/* Monthly Goal */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <TrendingUp size={14} />
                        <span>Monthly Target</span>
                    </div>
                    <input
                        type="number"
                        value={monthlyGoal}
                        onChange={(e) => onUpdateMonthlyGoal(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-slate-800 rounded text-white text-xs border border-slate-600 text-right"
                        placeholder="Goal"
                    />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className={monthlyPnL >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            ${monthlyPnL.toFixed(2)}
                        </span>
                        <span className="text-slate-400">
                            ${monthlyGoal.toFixed(0)} goal
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${monthlyPnL >= monthlyGoal ? 'bg-green-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, monthlyProgress))}%` }}
                        />
                    </div>
                </div>
                {monthlyPnL >= monthlyGoal && monthlyGoal > 0 && (
                    <div className="text-xs text-green-400 font-bold">
                        ✓ Monthly goal achieved!
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyGoals;

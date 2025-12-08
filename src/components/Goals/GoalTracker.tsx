'use client';

import React, { useState, useEffect } from 'react';
import {
    Target,
    TrendingUp,
    Award,
    Zap,
    Trophy,
    Star,
    Flame,
    DollarSign,
} from 'lucide-react';

export interface Milestone {
    id: string;
    name: string;
    description: string;
    target: number;
    current: number;
    type: 'balance' | 'profit' | 'trades' | 'streak' | 'winrate';
    icon: string;
    color: string;
    achieved: boolean;
    achievedAt?: number;
}

interface GoalTrackerProps {
    currentBalance: number;
    startBalance: number;
    targetBalance: number;
    totalPnL: number;
    totalTrades: number;
    currentStreak: number;
    longestStreak: number;
    winRate: number;
    onMilestoneAchieved?: (milestone: Milestone) => void;
}

const DEFAULT_MILESTONES: Omit<Milestone, 'current' | 'achieved' | 'achievedAt'>[] = [
    {
        id: 'first-profit',
        name: 'First Profit',
        description: 'Make your first profitable trade',
        target: 1,
        type: 'profit',
        icon: '💵',
        color: 'bg-green-500',
    },
    {
        id: 'ten-trades',
        name: 'Getting Started',
        description: 'Complete 10 trades',
        target: 10,
        type: 'trades',
        icon: '📈',
        color: 'bg-blue-500',
    },
    {
        id: 'first-hundred',
        name: 'First $100',
        description: 'Reach $100 in total profit',
        target: 100,
        type: 'profit',
        icon: '💰',
        color: 'bg-yellow-500',
    },
    {
        id: 'fifty-trades',
        name: 'Consistency',
        description: 'Complete 50 trades',
        target: 50,
        type: 'trades',
        icon: '🎯',
        color: 'bg-purple-500',
    },
    {
        id: 'five-streak',
        name: 'Hot Streak',
        description: 'Win 5 trades in a row',
        target: 5,
        type: 'streak',
        icon: '🔥',
        color: 'bg-orange-500',
    },
    {
        id: 'fifty-percent-winrate',
        name: 'Breakeven Trader',
        description: 'Achieve 50% win rate',
        target: 50,
        type: 'winrate',
        icon: '⚖️',
        color: 'bg-indigo-500',
    },
    {
        id: 'thousand-profit',
        name: 'Four Figures',
        description: 'Earn $1,000 in total profit',
        target: 1000,
        type: 'profit',
        icon: '🚀',
        color: 'bg-pink-500',
    },
    {
        id: 'hundred-trades',
        name: 'Experienced',
        description: 'Complete 100 trades',
        target: 100,
        type: 'trades',
        icon: '💪',
        color: 'bg-red-500',
    },
];

const GoalTracker: React.FC<GoalTrackerProps> = ({
    currentBalance,
    startBalance,
    targetBalance,
    totalPnL,
    totalTrades,
    currentStreak,
    longestStreak,
    winRate,
    onMilestoneAchieved,
}) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [celebrating, setCelebrating] = useState(false);
    const [recentAchievement, setRecentAchievement] = useState<Milestone | null>(null);

    // Initialize milestones
    useEffect(() => {
        const stored = localStorage.getItem('aqt_milestones');
        if (stored) {
            setMilestones(JSON.parse(stored));
        } else {
            const initial = DEFAULT_MILESTONES.map(m => ({
                ...m,
                current: getCurrentValue(m.type),
                achieved: false,
            }));
            setMilestones(initial);
            localStorage.setItem('aqt_milestones', JSON.stringify(initial));
        }
    }, []);

    // Update milestones when values change
    useEffect(() => {
        if (milestones.length === 0) return;

        const updated = milestones.map(milestone => {
            const current = getCurrentValue(milestone.type);
            const wasAchieved = milestone.achieved;
            const isNowAchieved = current >= milestone.target;

            // Trigger celebration if newly achieved
            if (!wasAchieved && isNowAchieved) {
                triggerCelebration(milestone);
            }

            return {
                ...milestone,
                current,
                achieved: isNowAchieved,
                achievedAt: isNowAchieved && !wasAchieved ? Date.now() : milestone.achievedAt,
            };
        });

        setMilestones(updated);
        localStorage.setItem('aqt_milestones', JSON.stringify(updated));
    }, [currentBalance, totalPnL, totalTrades, currentStreak, winRate]);

    const getCurrentValue = (type: Milestone['type']): number => {
        switch (type) {
            case 'balance':
                return currentBalance;
            case 'profit':
                return totalPnL;
            case 'trades':
                return totalTrades;
            case 'streak':
                return longestStreak;
            case 'winrate':
                return winRate;
            default:
                return 0;
        }
    };

    const triggerCelebration = (milestone: Milestone) => {
        setRecentAchievement(milestone);
        setCelebrating(true);

        if (onMilestoneAchieved) {
            onMilestoneAchieved(milestone);
        }

        setTimeout(() => {
            setCelebrating(false);
            setTimeout(() => setRecentAchievement(null), 500);
        }, 3000);
    };

    const balanceProgress = ((currentBalance - startBalance) / (targetBalance - startBalance)) * 100;
    const clampedProgress = Math.min(Math.max(balanceProgress, 0), 100);

    const achievedCount = milestones.filter(m => m.achieved).length;
    const totalCount = milestones.length;

    return (
        <div className="space-y-6">
            {/* Main Balance Goal */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target size={24} />
                            <h2 className="text-xl font-bold">Balance Goal</h2>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-90">Target</div>
                            <div className="text-2xl font-bold">${targetBalance.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span>${startBalance.toLocaleString()}</span>
                            <span className="font-bold">${currentBalance.toLocaleString()}</span>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-1000 ease-out relative"
                                style={{ width: `${clampedProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center mt-2 text-sm font-semibold">
                            {clampedProgress.toFixed(1)}% Complete
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm">
                        <div>
                            <div className="opacity-75">Remaining</div>
                            <div className="font-bold">
                                ${Math.max(0, targetBalance - currentBalance).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="opacity-75">Growth</div>
                            <div className="font-bold">
                                +${Math.max(0, currentBalance - startBalance).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-600 dark:text-yellow-400" size={24} />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Milestones</h2>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">{achievedCount}</span>
                        <span> / {totalCount}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {milestones.map(milestone => {
                        const progress = (milestone.current / milestone.target) * 100;
                        const clampedMilestoneProgress = Math.min(progress, 100);

                        return (
                            <div
                                key={milestone.id}
                                className={`relative p-3 rounded-lg border-2 transition-all ${milestone.achieved
                                        ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                                    }`}
                            >
                                {milestone.achieved && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Star size={14} className="text-white" fill="white" />
                                    </div>
                                )}

                                <div className="text-center">
                                    <div className="text-3xl mb-2">{milestone.icon}</div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                                        {milestone.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                        {milestone.description}
                                    </p>

                                    {!milestone.achieved && (
                                        <>
                                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-1">
                                                <div
                                                    className={`h-full ${milestone.color} transition-all duration-500`}
                                                    style={{ width: `${clampedMilestoneProgress}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {milestone.current.toFixed(0)} / {milestone.target}
                                            </div>
                                        </>
                                    )}

                                    {milestone.achieved && (
                                        <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                            ✓ Achieved!
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Celebration Modal */}
            {celebrating && recentAchievement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-6xl mb-4 animate-bounce">{recentAchievement.icon}</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Milestone Achieved!
                        </h2>
                        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            {recentAchievement.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {recentAchievement.description}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <Star size={20} fill="currentColor" />
                            <Star size={24} fill="currentColor" />
                            <Star size={20} fill="currentColor" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalTracker;

'use client';

import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Settings, Trash2 } from 'lucide-react';
import { Trade } from '../../types';
import FlipProgress from './FlipProgress';
import CompoundCalculator from './CompoundCalculator';
import MaxLossEnforcer from './MaxLossEnforcer';
import ReadinessChecklist from './ReadinessChecklist';
import StreakTracker from '../StreakTracker';
import WeeklyGoals from '../WeeklyGoals';
import { useStreakCalculator } from '../../hooks/useStreakCalculator';

// Trade interface now imported from shared types

interface FlipDashboardProps {
    balance: number;
    trades: Trade[];
    dailyGoal: number;
    weeklyGoal?: number;
    monthlyGoal?: number;
    targetBalance: number;
    startBalance: number;
    maxDailyLossPercent: number;
    newTrade: {
        pair: string;
        direction: 'Long' | 'Short';
        entry: string;
        exit: string;
        setup: string;
        emotion: string;
    };
    onNewTradeChange: (trade: any) => void;
    onAddTrade: () => void;
    onDeleteTrade: (trade: Trade) => void;
    onUpdateSettings: (key: string, value: any) => void;
    canLog: boolean;
    TRADE_SETUPS: string[];
    EMOTIONS: string[];
}

const FlipDashboard: React.FC<FlipDashboardProps> = ({
    balance,
    trades,
    dailyGoal,
    weeklyGoal = 200,
    monthlyGoal = 800,
    targetBalance,
    startBalance,
    maxDailyLossPercent,
    newTrade,
    onNewTradeChange,
    onAddTrade,
    onDeleteTrade,
    onUpdateSettings,
    canLog,
    TRADE_SETUPS,
    EMOTIONS
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [hasOverriddenMaxLoss, setHasOverriddenMaxLoss] = useState(false);
    const [readinessComplete, setReadinessComplete] = useState(false);

    // Calculate streak
    const { currentStreak, longestStreak, lastProfitableDay } = useStreakCalculator(trades);

    const todayTrades = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return trades.filter(t => t.date === today);
    }, [trades]);

    const todayPnL = useMemo(() => {
        return todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    }, [todayTrades]);

    const maxDailyLoss = balance * (maxDailyLossPercent / 100);
    const hasHitMaxLoss = todayPnL <= -Math.abs(maxDailyLoss);
    const maxTradesPerDay = 3;
    const canTrade = todayTrades.length < maxTradesPerDay && (hasOverriddenMaxLoss || !hasHitMaxLoss);

    const bestSetup = useMemo(() => {
        const setupStats = TRADE_SETUPS.map(setup => {
            const setupTrades = trades.filter(t => t.setup === setup);
            if (setupTrades.length < 3) return null;
            const wins = setupTrades.filter(t => (t.pnl || 0) > 0).length;
            return { setup, winRate: Math.round((wins / setupTrades.length) * 100), count: setupTrades.length };
        }).filter(Boolean);

        return setupStats.sort((a, b) => (b?.winRate || 0) - (a?.winRate || 0))[0];
    }, [trades, TRADE_SETUPS]);

    const fmtUSD = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}$${val.toFixed(2)}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4">
            <ReadinessChecklist onComplete={() => setReadinessComplete(true)} />

            {/* BIG NUMBERS */}
            <div className="text-center mb-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20">
                <div className="text-6xl md:text-7xl font-bold mb-3 text-white">
                    ${balance.toFixed(2)}
                </div>
                <div className="text-2xl mb-2">
                    <span className="text-slate-400">Today: </span>
                    <span className={todayPnL >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {fmtUSD(todayPnL)}
                    </span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-blue-400 font-bold">${dailyGoal.toFixed(0)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                        className={`h-full transition-all duration-500 ${todayPnL >= dailyGoal ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, (todayPnL / dailyGoal) * 100))}%` }}
                    />
                </div>
            </div>

            {/* MAX LOSS WARNING */}
            {hasHitMaxLoss && !hasOverriddenMaxLoss && (
                <MaxLossEnforcer
                    todayPnL={todayPnL}
                    maxDailyLoss={maxDailyLoss}
                    onOverride={() => setHasOverriddenMaxLoss(true)}
                />
            )}

            {/* SETTINGS */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex justify-between items-center"
                >
                    <div className="flex items-center gap-2 font-bold">
                        <Settings size={18} className="text-blue-400" />
                        Flip Mode Settings
                    </div>
                    <span className="text-xs text-slate-400">Click to {showSettings ? 'hide' : 'show'}</span>
                </button>

                {showSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Daily Goal ($)</label>
                            <input
                                type="number"
                                value={dailyGoal}
                                onChange={(e) => onUpdateSettings('dailyGoal', parseFloat(e.target.value) || 50)}
                                className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Target Balance ($)</label>
                            <input
                                type="number"
                                value={targetBalance}
                                onChange={(e) => onUpdateSettings('targetBalance', parseFloat(e.target.value) || 1000)}
                                className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Max Loss %</label>
                            <input
                                type="number"
                                value={maxDailyLossPercent}
                                onChange={(e) => onUpdateSettings('maxDailyLossPercent', Math.max(1, Math.min(20, parseFloat(e.target.value) || 5)))}
                                className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* QUICK TRADE ENTRY */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign size={18} />
                        Quick Trade Entry
                    </h3>
                    <div className="text-sm">
                        <span className={todayTrades.length >= maxTradesPerDay ? 'text-red-400 font-bold' : 'text-slate-400'}>
                            {todayTrades.length}/{maxTradesPerDay} trades today
                        </span>
                    </div>
                </div>

                {!canTrade && !hasOverriddenMaxLoss && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-sm">
                        <AlertCircle size={16} className="inline mr-2" />
                        {todayTrades.length >= maxTradesPerDay
                            ? `You've hit your ${maxTradesPerDay} trades/day limit. Come back tomorrow.`
                            : 'Max daily loss reached. Override the warning above to continue.'
                        }
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input
                        type="text"
                        placeholder="Pair"
                        value={newTrade.pair}
                        onChange={e => onNewTradeChange({ ...newTrade, pair: e.target.value.toUpperCase() })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    />
                    <select
                        value={newTrade.direction}
                        onChange={e => onNewTradeChange({ ...newTrade, direction: e.target.value as 'Long' | 'Short' })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    >
                        <option>Long</option>
                        <option>Short</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Entry"
                        value={newTrade.entry}
                        onChange={e => onNewTradeChange({ ...newTrade, entry: e.target.value })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    />
                    <input
                        type="number"
                        placeholder="Exit"
                        value={newTrade.exit}
                        onChange={e => onNewTradeChange({ ...newTrade, exit: e.target.value })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    />
                    <select
                        value={newTrade.setup}
                        onChange={e => onNewTradeChange({ ...newTrade, setup: e.target.value })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    >
                        {TRADE_SETUPS.map(s => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                    <select
                        value={newTrade.emotion}
                        onChange={e => onNewTradeChange({ ...newTrade, emotion: e.target.value })}
                        disabled={!canTrade}
                        className="p-2 rounded bg-black/30 border border-white/10 text-sm disabled:opacity-40"
                    >
                        {EMOTIONS.map(em => (
                            <option key={em}>{em}</option>
                        ))}
                    </select>
                    <button
                        disabled={!canLog || !canTrade}
                        onClick={onAddTrade}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded text-sm transition-all col-span-2 md:col-span-1"
                    >
                        Log Trade
                    </button>
                </div>
            </div>

            {/* TODAY'S TRADES */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-400" />
                    Today's Trades ({todayTrades.length})
                </h3>
                {todayTrades.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        No trades yet today. Enter your first trade above.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayTrades.slice(0, 10).map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="font-bold">{t.pair}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${t.direction === 'Long'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {t.direction}
                                    </span>
                                    <span className="text-sm text-slate-400">{t.setup}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {fmtUSD(t.pnl)}
                                    </span>
                                    <button onClick={() => onDeleteTrade(t)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ACTIONABLE INSIGHT */}
            {bestSetup && (
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-200">
                        💡 Your best setup is <strong className="text-white">{bestSetup.setup}</strong> with{' '}
                        <strong className="text-green-400">{bestSetup.winRate}%</strong> win rate ({bestSetup.count} trades).
                        Focus on this pattern!
                    </p>
                </div>
            )}

            {/* STREAK & GOALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StreakTracker
                    currentStreak={currentStreak}
                    longestStreak={longestStreak}
                    lastProfitableDay={lastProfitableDay}
                />
                <WeeklyGoals
                    weeklyGoal={weeklyGoal}
                    monthlyGoal={monthlyGoal}
                    trades={trades}
                    onUpdateWeeklyGoal={(goal) => onUpdateSettings('weeklyGoal', goal)}
                    onUpdateMonthlyGoal={(goal) => onUpdateSettings('monthlyGoal', goal)}
                />
            </div>

            {/* PROGRESS & CALCULATOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FlipProgress
                    startBalance={startBalance}
                    currentBalance={balance}
                    targetBalance={targetBalance}
                />
                <CompoundCalculator />
            </div>
        </div>
    );
};

export default FlipDashboard;

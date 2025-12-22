'use client';

import React, { useMemo } from 'react';
import { Clock, Sun, Moon, Sunrise } from 'lucide-react';
import { Trade } from '../../types';
import { sessionHeatmap, getSessionFromTrade, SessionData } from '../../utils/analyticsEngine';

interface SessionHeatmapProps {
    trades: Trade[];
    baseRisk?: number;
    darkMode?: boolean;
}

const SessionHeatmap: React.FC<SessionHeatmapProps> = ({
    trades,
    baseRisk = 10,
    darkMode = false
}) => {
    const heatmapData = useMemo(() => {
        return sessionHeatmap(trades, baseRisk);
    }, [trades, baseRisk]);

    // Session summary stats
    const sessionSummary = useMemo(() => {
        const summary = new Map<string, { trades: number; wins: number; pnl: number }>();

        trades.forEach(trade => {
            const session = getSessionFromTrade(trade);
            if (!summary.has(session)) {
                summary.set(session, { trades: 0, wins: 0, pnl: 0 });
            }
            const stat = summary.get(session)!;
            stat.trades++;
            if (trade.pnl > 0) stat.wins++;
            stat.pnl += trade.pnl;
        });

        return Array.from(summary.entries()).map(([session, stats]) => ({
            session,
            ...stats,
            winRate: stats.trades > 0 ? stats.wins / stats.trades : 0
        }));
    }, [trades]);

    // Color scale based on win rate
    const getColor = (winRate: number, trades: number): string => {
        if (trades === 0) return darkMode ? 'bg-slate-800' : 'bg-slate-100';

        if (winRate >= 0.6) return darkMode ? 'bg-green-600' : 'bg-green-500';
        if (winRate >= 0.55) return darkMode ? 'bg-green-500/80' : 'bg-green-400';
        if (winRate >= 0.5) return darkMode ? 'bg-green-400/60' : 'bg-green-300';
        if (winRate >= 0.45) return darkMode ? 'bg-yellow-500/60' : 'bg-yellow-300';
        if (winRate >= 0.4) return darkMode ? 'bg-orange-500/60' : 'bg-orange-300';
        return darkMode ? 'bg-red-500/60' : 'bg-red-300';
    };

    const sessionIcons = {
        ASIA: Sunrise,
        LONDON: Sun,
        NY: Moon
    };

    const sessionLabels = {
        ASIA: 'Asia/Tokyo',
        LONDON: 'London',
        NY: 'New York'
    };

    const hourLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

    if (trades.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-purple-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Heatmap</h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Add trades to see session/hour analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="text-purple-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Heatmap</h3>
                </div>
                <div className="text-xs text-slate-500">
                    Win rate by session & hour
                </div>
            </div>

            {/* Session Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {sessionSummary.map(stat => {
                    const Icon = sessionIcons[stat.session as keyof typeof sessionIcons] || Sun;
                    return (
                        <div
                            key={stat.session}
                            className={`p-4 rounded-lg border ${stat.pnl >= 0
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={18} className={stat.pnl >= 0 ? 'text-green-600' : 'text-red-600'} />
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {sessionLabels[stat.session as keyof typeof sessionLabels] || stat.session}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <div className="text-slate-500 text-xs">Trades</div>
                                    <div className="font-medium text-slate-900 dark:text-white">{stat.trades}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs">Win%</div>
                                    <div className={`font-medium ${stat.winRate >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                                        {(stat.winRate * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                            <div className={`text-lg font-bold mt-2 ${stat.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left text-sm text-slate-500 pb-2 w-24">Session</th>
                            {hourLabels.map(label => (
                                <th key={label} className="text-center text-xs text-slate-500 pb-2 px-1">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {heatmapData.map((sessionRow, sIdx) => (
                            <tr key={sIdx}>
                                <td className="py-1">
                                    <div className="flex items-center gap-2">
                                        {React.createElement(sessionIcons[sessionRow[0]?.session as keyof typeof sessionIcons] || Sun, {
                                            size: 16,
                                            className: 'text-slate-500'
                                        })}
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {sessionLabels[sessionRow[0]?.session as keyof typeof sessionLabels] || 'Session'}
                                        </span>
                                    </div>
                                </td>
                                {sessionRow.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-1">
                                        <div
                                            className={`
                        ${getColor(cell.winRate, cell.trades)} 
                        rounded-md p-2 text-center min-w-[60px] transition-all
                        hover:ring-2 hover:ring-blue-400 cursor-default
                      `}
                                            title={`${cell.trades} trades, ${(cell.winRate * 100).toFixed(0)}% win, $${cell.totalPnL.toFixed(0)}`}
                                        >
                                            {cell.trades > 0 ? (
                                                <>
                                                    <div className="text-xs font-bold text-white dark:text-white">
                                                        {(cell.winRate * 100).toFixed(0)}%
                                                    </div>
                                                    <div className="text-xs text-white/80 dark:text-white/80">
                                                        {cell.trades}t
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-xs text-slate-400">-</div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>&lt;40%</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-300 rounded"></div>
                    <span>45-50%</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span>55%+</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>60%+</span>
                </div>
            </div>

            {/* Insight */}
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                    <strong>💡 Tip:</strong> Focus trading during your highest win-rate sessions.
                    Avoid or reduce size during sessions where you consistently underperform.
                </p>
            </div>
        </div>
    );
};

export default SessionHeatmap;

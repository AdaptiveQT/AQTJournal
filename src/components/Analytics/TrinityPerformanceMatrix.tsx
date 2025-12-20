'use client';

import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Trade } from '../../types';
import { getSessionFromTrade } from '../../utils/analyticsEngine';

interface TrinityPerformanceMatrixProps {
    trades: Trade[];
    darkMode?: boolean;
}

const SESSIONS = ['ASIA', 'LONDON', 'NY'] as const;
const ENTRY_TYPES = ['Breakout', 'Pullback', 'Reversal', 'Fade'] as const;

type TrinityCell = {
    trades: number;
    wins: number;
    pnl: number;
    winRate: number;
    avgPnl: number;
};

/**
 * Trinity Performance Matrix - Cross-references Session × Entry Type
 * Reveals the trader's sharpest edge combinations with color-coded cells.
 */
const TrinityPerformanceMatrix: React.FC<TrinityPerformanceMatrixProps> = ({
    trades,
    darkMode = false
}) => {
    // Calculate matrix data
    const matrixData = useMemo(() => {
        const matrix: Record<string, Record<string, TrinityCell>> = {};

        // Initialize matrix
        SESSIONS.forEach(session => {
            matrix[session] = {};
            ENTRY_TYPES.forEach(entryType => {
                matrix[session][entryType] = { trades: 0, wins: 0, pnl: 0, winRate: 0, avgPnl: 0 };
            });
        });

        // Populate with trade data
        trades.forEach(trade => {
            const session = getSessionFromTrade(trade);
            const entryType = trade.entryType || 'Breakout';

            // Map to our simplified entry types
            const mappedEntryType = ENTRY_TYPES.includes(entryType as typeof ENTRY_TYPES[number])
                ? entryType
                : 'Breakout';

            if (matrix[session] && matrix[session][mappedEntryType]) {
                matrix[session][mappedEntryType].trades++;
                if (trade.pnl > 0) matrix[session][mappedEntryType].wins++;
                matrix[session][mappedEntryType].pnl += trade.pnl;
            }
        });

        // Calculate derived metrics
        SESSIONS.forEach(session => {
            ENTRY_TYPES.forEach(entryType => {
                const cell = matrix[session][entryType];
                cell.winRate = cell.trades > 0 ? cell.wins / cell.trades : 0;
                cell.avgPnl = cell.trades > 0 ? cell.pnl / cell.trades : 0;
            });
        });

        return matrix;
    }, [trades]);

    // Find best and worst combos (min 3 trades for consideration)
    const { bestCombo, worstCombo, sessionTotals, entryTypeTotals } = useMemo(() => {
        let best = { session: '', entryType: '', winRate: 0, trades: 0, pnl: 0 };
        let worst = { session: '', entryType: '', winRate: 1, trades: 0, pnl: 0 };

        const sessionTotals: Record<string, TrinityCell> = {};
        const entryTypeTotals: Record<string, TrinityCell> = {};

        // Initialize totals
        SESSIONS.forEach(s => {
            sessionTotals[s] = { trades: 0, wins: 0, pnl: 0, winRate: 0, avgPnl: 0 };
        });
        ENTRY_TYPES.forEach(e => {
            entryTypeTotals[e] = { trades: 0, wins: 0, pnl: 0, winRate: 0, avgPnl: 0 };
        });

        SESSIONS.forEach(session => {
            ENTRY_TYPES.forEach(entryType => {
                const cell = matrixData[session][entryType];

                // Aggregate totals
                sessionTotals[session].trades += cell.trades;
                sessionTotals[session].wins += cell.wins;
                sessionTotals[session].pnl += cell.pnl;

                entryTypeTotals[entryType].trades += cell.trades;
                entryTypeTotals[entryType].wins += cell.wins;
                entryTypeTotals[entryType].pnl += cell.pnl;

                // Find best/worst with minimum sample
                if (cell.trades >= 3) {
                    if (cell.winRate > best.winRate || (cell.winRate === best.winRate && cell.pnl > best.pnl)) {
                        best = { session, entryType, winRate: cell.winRate, trades: cell.trades, pnl: cell.pnl };
                    }
                    if (cell.winRate < worst.winRate) {
                        worst = { session, entryType, winRate: cell.winRate, trades: cell.trades, pnl: cell.pnl };
                    }
                }
            });
        });

        // Calculate totals win rates
        SESSIONS.forEach(s => {
            sessionTotals[s].winRate = sessionTotals[s].trades > 0
                ? sessionTotals[s].wins / sessionTotals[s].trades
                : 0;
        });
        ENTRY_TYPES.forEach(e => {
            entryTypeTotals[e].winRate = entryTypeTotals[e].trades > 0
                ? entryTypeTotals[e].wins / entryTypeTotals[e].trades
                : 0;
        });

        return {
            bestCombo: best.trades > 0 ? best : null,
            worstCombo: worst.trades > 0 ? worst : null,
            sessionTotals,
            entryTypeTotals
        };
    }, [matrixData]);

    // Color scale based on win rate
    const getColor = (winRate: number, trades: number): string => {
        if (trades === 0) return darkMode ? 'bg-slate-800/50' : 'bg-slate-100';
        if (trades < 3) return darkMode ? 'bg-slate-700/50' : 'bg-slate-200'; // Not enough data

        if (winRate >= 0.65) return 'bg-green-600';
        if (winRate >= 0.55) return 'bg-green-500';
        if (winRate >= 0.50) return 'bg-green-400/70';
        if (winRate >= 0.45) return 'bg-yellow-500/70';
        if (winRate >= 0.40) return 'bg-orange-500/70';
        return 'bg-red-500/70';
    };

    const getEdgeClass = (winRate: number, trades: number): string => {
        if (trades < 3) return '';
        if (winRate >= 0.65) return 'Elite Edge 🔥';
        if (winRate >= 0.55) return 'Solid';
        if (winRate >= 0.45) return 'Workable';
        return 'Refine';
    };

    const sessionLabels: Record<string, string> = {
        ASIA: '🌏 Asia',
        LONDON: '🇬🇧 London',
        NY: '🇺🇸 NY'
    };

    const entryTypeColors: Record<string, string> = {
        Breakout: 'text-blue-500',
        Pullback: 'text-purple-500',
        Reversal: 'text-orange-500',
        Fade: 'text-cyan-500'
    };

    if (trades.length < 5) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="text-beast-green" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trinity Performance Matrix</h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Need at least 5 trades to show matrix</p>
                    <p className="text-xs mt-2">Session × Entry Type performance breakdown</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="text-beast-green" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trinity Performance Matrix</h3>
                </div>
                <div className="text-xs text-slate-500">
                    Session × Entry Type
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 p-2 w-24"></th>
                            {ENTRY_TYPES.map(entryType => (
                                <th key={entryType} className={`text-center text-xs font-bold p-2 min-w-[80px] ${entryTypeColors[entryType]}`}>
                                    {entryType}
                                </th>
                            ))}
                            <th className="text-center text-xs font-bold text-slate-400 p-2 min-w-[60px] border-l border-slate-200 dark:border-slate-600">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {SESSIONS.map(session => (
                            <tr key={session}>
                                <td className="text-sm font-bold text-slate-700 dark:text-slate-200 p-2 whitespace-nowrap">
                                    {sessionLabels[session]}
                                </td>
                                {ENTRY_TYPES.map(entryType => {
                                    const cell = matrixData[session][entryType];
                                    const isBest = bestCombo?.session === session && bestCombo?.entryType === entryType;
                                    const isWorst = worstCombo?.session === session && worstCombo?.entryType === entryType;

                                    return (
                                        <td key={entryType} className="p-1">
                                            <div
                                                className={`
                                                    ${getColor(cell.winRate, cell.trades)}
                                                    rounded-lg p-2 text-center min-h-[60px] flex flex-col justify-center
                                                    transition-all cursor-default
                                                    ${isBest ? 'ring-2 ring-green-400 ring-offset-1' : ''}
                                                    ${isWorst && cell.trades >= 3 ? 'ring-2 ring-red-400 ring-offset-1' : ''}
                                                `}
                                                title={`${session} + ${entryType}: ${cell.trades} trades, ${(cell.winRate * 100).toFixed(0)}% WR, $${cell.pnl.toFixed(0)} PnL`}
                                            >
                                                {cell.trades > 0 ? (
                                                    <>
                                                        <div className={`text-sm font-bold ${cell.trades >= 3 ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {(cell.winRate * 100).toFixed(0)}%
                                                        </div>
                                                        <div className={`text-[10px] ${cell.trades >= 3 ? 'text-white/80' : 'text-slate-500'}`}>
                                                            {cell.trades}t • ${cell.pnl >= 0 ? '+' : ''}{cell.pnl.toFixed(0)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-slate-400">—</div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                {/* Session Total */}
                                <td className="p-1 border-l border-slate-200 dark:border-slate-600">
                                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2 text-center min-h-[60px] flex flex-col justify-center">
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {(sessionTotals[session].winRate * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {sessionTotals[session].trades}t
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Entry Type Totals Row */}
                        <tr className="border-t border-slate-200 dark:border-slate-600">
                            <td className="text-sm font-bold text-slate-500 dark:text-slate-400 p-2">
                                Total
                            </td>
                            {ENTRY_TYPES.map(entryType => (
                                <td key={entryType} className="p-1">
                                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {(entryTypeTotals[entryType].winRate * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {entryTypeTotals[entryType].trades}t
                                        </div>
                                    </div>
                                </td>
                            ))}
                            <td className="p-1"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>&lt;40%</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>45%</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span>50%+</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>65%+ 🔥</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">3+ trades for color</span>
            </div>

            {/* Beast Recommendation Banner */}
            {bestCombo && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">
                                🐻 Beast Recommendation
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-bold">Your sharpest edge:</span>{' '}
                                <span className="text-green-600 dark:text-green-400 font-bold">
                                    {sessionLabels[bestCombo.session]} + {bestCombo.entryType}
                                </span>{' '}
                                — {(bestCombo.winRate * 100).toFixed(0)}% WR over {bestCombo.trades} trades (${bestCombo.pnl >= 0 ? '+' : ''}{bestCombo.pnl.toFixed(0)})
                            </p>
                            {worstCombo && worstCombo.winRate < 0.45 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <AlertTriangle size={12} className="text-orange-500" />
                                    Consider avoiding: {sessionLabels[worstCombo.session]} + {worstCombo.entryType} ({(worstCombo.winRate * 100).toFixed(0)}% WR)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrinityPerformanceMatrix;

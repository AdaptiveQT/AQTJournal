'use client';

import React, { useMemo } from 'react';
import { Grid3X3, TrendingUp } from 'lucide-react';
import { Trade } from '../../types';
import { getSessionFromTrade } from '../../utils/analyticsEngine';

interface SessionSetupMatrixProps {
    trades: Trade[];
    darkMode?: boolean;
}

const SESSIONS = ['ASIA', 'LONDON', 'NY'] as const;
const SETUPS = ['Breakout', 'Pullback', 'Reversal', 'Trend', 'Range', 'Scalp', 'News', 'Other'] as const;

type CellData = {
    trades: number;
    wins: number;
    pnl: number;
    winRate: number;
};

/**
 * Session × Setup Matrix showing win rate by session and setup combination.
 * Helps traders identify which setups perform best in which sessions.
 */
const SessionSetupMatrix: React.FC<SessionSetupMatrixProps> = ({
    trades,
    darkMode = false
}) => {
    // Calculate matrix data
    const matrixData = useMemo(() => {
        const matrix: Record<string, Record<string, CellData>> = {};

        // Initialize matrix
        SESSIONS.forEach(session => {
            matrix[session] = {};
            SETUPS.forEach(setup => {
                matrix[session][setup] = { trades: 0, wins: 0, pnl: 0, winRate: 0 };
            });
        });

        // Populate with trade data
        trades.forEach(trade => {
            const session = getSessionFromTrade(trade);
            const setup = trade.setup || 'Other';

            if (matrix[session] && matrix[session][setup]) {
                matrix[session][setup].trades++;
                if (trade.pnl > 0) matrix[session][setup].wins++;
                matrix[session][setup].pnl += trade.pnl;
            }
        });

        // Calculate win rates
        SESSIONS.forEach(session => {
            SETUPS.forEach(setup => {
                const cell = matrix[session][setup];
                cell.winRate = cell.trades > 0 ? cell.wins / cell.trades : 0;
            });
        });

        return matrix;
    }, [trades]);

    // Find best and worst combos
    const { bestCombo, worstCombo } = useMemo(() => {
        let best = { session: '', setup: '', winRate: 0, trades: 0 };
        let worst = { session: '', setup: '', winRate: 1, trades: 0 };

        SESSIONS.forEach(session => {
            SETUPS.forEach(setup => {
                const cell = matrixData[session][setup];
                if (cell.trades >= 3) {
                    if (cell.winRate > best.winRate) {
                        best = { session, setup, winRate: cell.winRate, trades: cell.trades };
                    }
                    if (cell.winRate < worst.winRate) {
                        worst = { session, setup, winRate: cell.winRate, trades: cell.trades };
                    }
                }
            });
        });

        return { bestCombo: best.trades > 0 ? best : null, worstCombo: worst.trades > 0 ? worst : null };
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

    const sessionLabels: Record<string, string> = {
        ASIA: 'Asia',
        LONDON: 'London',
        NY: 'NY'
    };

    if (trades.length < 5) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Grid3X3 className="text-beast-green" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session × Setup Matrix</h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Need at least 5 trades to show matrix</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Grid3X3 className="text-beast-green" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session × Setup Matrix</h3>
                </div>
                <div className="text-xs text-slate-500">
                    Win rate by session + setup
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 p-2 w-20"></th>
                            {SETUPS.map(setup => (
                                <th key={setup} className="text-center text-xs font-medium text-slate-600 dark:text-slate-300 p-1 min-w-[60px]">
                                    {setup}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SESSIONS.map(session => (
                            <tr key={session}>
                                <td className="text-sm font-bold text-slate-700 dark:text-slate-200 p-2">
                                    {sessionLabels[session]}
                                </td>
                                {SETUPS.map(setup => {
                                    const cell = matrixData[session][setup];
                                    const isBest = bestCombo?.session === session && bestCombo?.setup === setup;
                                    const isWorst = worstCombo?.session === session && worstCombo?.setup === setup;

                                    return (
                                        <td key={setup} className="p-1">
                                            <div
                                                className={`
                                                    ${getColor(cell.winRate, cell.trades)}
                                                    rounded-md p-2 text-center min-h-[48px] flex flex-col justify-center
                                                    transition-all cursor-default
                                                    ${isBest ? 'ring-2 ring-green-400' : ''}
                                                    ${isWorst ? 'ring-2 ring-red-400' : ''}
                                                `}
                                                title={`${session} + ${setup}: ${cell.trades} trades, ${(cell.winRate * 100).toFixed(0)}% win, $${cell.pnl.toFixed(0)}`}
                                            >
                                                {cell.trades > 0 ? (
                                                    <>
                                                        <div className={`text-xs font-bold ${cell.trades >= 3 ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {(cell.winRate * 100).toFixed(0)}%
                                                        </div>
                                                        <div className={`text-[10px] ${cell.trades >= 3 ? 'text-white/70' : 'text-slate-500'}`}>
                                                            {cell.trades}t
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-slate-400">-</div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
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
                    <span>65%+</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">3+ trades for color</span>
            </div>

            {/* Insights */}
            {(bestCombo || worstCombo) && (
                <div className="mt-4 p-3 bg-beast-green/10 rounded-lg border border-beast-green/30">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="text-beast-green flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                            {bestCombo && (
                                <p>
                                    <span className="font-bold text-green-600">Best Zone:</span>{' '}
                                    {sessionLabels[bestCombo.session]} + {bestCombo.setup} ({(bestCombo.winRate * 100).toFixed(0)}% over {bestCombo.trades} trades)
                                </p>
                            )}
                            {worstCombo && worstCombo.session !== bestCombo?.session && (
                                <p className="mt-1">
                                    <span className="font-bold text-red-500">Avoid:</span>{' '}
                                    {sessionLabels[worstCombo.session]} + {worstCombo.setup} ({(worstCombo.winRate * 100).toFixed(0)}%)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionSetupMatrix;

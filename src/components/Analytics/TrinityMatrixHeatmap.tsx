'use client';

import React, { useMemo } from 'react';
import { Grid3X3, Target, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { Trade } from '../../types';
import { getSessionFromTrade, expectancyBySetup } from '../../utils/analyticsEngine';

interface TrinityMatrixHeatmapProps {
    trades: Trade[];
    darkMode?: boolean;
}

const SESSIONS = ['ASIA', 'LONDON', 'NY'] as const;
type Session = typeof SESSIONS[number];

interface MatrixCell {
    trades: number;
    wins: number;
    pnl: number;
    winRate: number;
    expectancy: number; // E = p × avgWin - (1-p) × avgLoss
    avgR: number;
}

/**
 * Trinity Matrix Heatmap - Setup × Session with Expectancy
 * Reveals the trader's edge by showing which setup/session combos generate positive expectancy.
 * "Gold Zones" highlight cells with E > 0.5R.
 */
const TrinityMatrixHeatmap: React.FC<TrinityMatrixHeatmapProps> = ({
    trades,
    darkMode = false
}) => {
    // Get unique setups from trades
    const setups = useMemo(() => {
        const setupSet = new Set<string>();
        trades.forEach(t => {
            if (t.setup && t.setup !== 'Unknown' && t.setup !== 'Imported') {
                setupSet.add(t.setup);
            }
        });
        // Default setups if none found
        if (setupSet.size === 0) {
            return ['OB Demand', 'FVG', 'MSS', 'Silver Bullet'];
        }
        return Array.from(setupSet).slice(0, 6); // Max 6 for display
    }, [trades]);

    // Calculate matrix with expectancy
    const { matrix, totals, goldZones, dangerZones } = useMemo(() => {
        const matrix: Record<string, Record<string, MatrixCell>> = {};
        const baseRisk = 10; // Base R for calculations

        // Initialize
        SESSIONS.forEach(session => {
            matrix[session] = {};
            setups.forEach(setup => {
                matrix[session][setup] = {
                    trades: 0, wins: 0, pnl: 0, winRate: 0, expectancy: 0, avgR: 0
                };
            });
        });

        // Populate
        trades.forEach(trade => {
            const session = getSessionFromTrade(trade);
            const setup = trade.setup || 'Unknown';

            if (matrix[session] && matrix[session][setup]) {
                const cell = matrix[session][setup];
                cell.trades++;
                if (trade.pnl > 0) cell.wins++;
                cell.pnl += trade.pnl;
            }
        });

        // Calculate derived metrics with expectancy
        const goldZones: { session: Session; setup: string; expectancy: number }[] = [];
        const dangerZones: { session: Session; setup: string; expectancy: number }[] = [];

        SESSIONS.forEach(session => {
            setups.forEach(setup => {
                const cell = matrix[session][setup];
                if (cell.trades > 0) {
                    cell.winRate = cell.wins / cell.trades;
                    cell.avgR = cell.pnl / (cell.trades * baseRisk);

                    // Simple expectancy: avgR per trade
                    // For proper E = p*W - (1-p)*L, we'd need individual win/loss R values
                    // Here we approximate using avgR as expectancy proxy
                    cell.expectancy = cell.avgR;

                    // Identify gold zones (E > 0.5R, min 3 trades)
                    if (cell.trades >= 3 && cell.expectancy > 0.5) {
                        goldZones.push({ session, setup, expectancy: cell.expectancy });
                    }
                    // Danger zones (E < -0.5R, min 3 trades)
                    if (cell.trades >= 3 && cell.expectancy < -0.5) {
                        dangerZones.push({ session, setup, expectancy: cell.expectancy });
                    }
                }
            });
        });

        // Session and setup totals
        const sessionTotals: Record<Session, MatrixCell> = {} as any;
        const setupTotals: Record<string, MatrixCell> = {};

        SESSIONS.forEach(session => {
            sessionTotals[session] = { trades: 0, wins: 0, pnl: 0, winRate: 0, expectancy: 0, avgR: 0 };
            setups.forEach(setup => {
                const cell = matrix[session][setup];
                sessionTotals[session].trades += cell.trades;
                sessionTotals[session].wins += cell.wins;
                sessionTotals[session].pnl += cell.pnl;
            });
            if (sessionTotals[session].trades > 0) {
                sessionTotals[session].winRate = sessionTotals[session].wins / sessionTotals[session].trades;
                sessionTotals[session].expectancy = sessionTotals[session].pnl / (sessionTotals[session].trades * baseRisk);
            }
        });

        setups.forEach(setup => {
            setupTotals[setup] = { trades: 0, wins: 0, pnl: 0, winRate: 0, expectancy: 0, avgR: 0 };
            SESSIONS.forEach(session => {
                const cell = matrix[session][setup];
                setupTotals[setup].trades += cell.trades;
                setupTotals[setup].wins += cell.wins;
                setupTotals[setup].pnl += cell.pnl;
            });
            if (setupTotals[setup].trades > 0) {
                setupTotals[setup].winRate = setupTotals[setup].wins / setupTotals[setup].trades;
                setupTotals[setup].expectancy = setupTotals[setup].pnl / (setupTotals[setup].trades * baseRisk);
            }
        });

        // Sort gold zones by expectancy
        goldZones.sort((a, b) => b.expectancy - a.expectancy);
        dangerZones.sort((a, b) => a.expectancy - b.expectancy);

        return {
            matrix,
            totals: { sessions: sessionTotals, setups: setupTotals },
            goldZones,
            dangerZones
        };
    }, [trades, setups]);

    // Color based on expectancy (not win rate)
    const getExpectancyColor = (expectancy: number, trades: number): string => {
        if (trades === 0) return darkMode ? 'bg-slate-800/50' : 'bg-slate-100';
        if (trades < 3) return darkMode ? 'bg-slate-700/50' : 'bg-slate-200';

        // Gold zone highlight
        if (expectancy >= 1.0) return 'bg-gradient-to-br from-yellow-400 to-amber-500';
        if (expectancy >= 0.5) return 'bg-gradient-to-br from-green-400 to-emerald-500';
        if (expectancy >= 0.2) return 'bg-green-500/80';
        if (expectancy >= 0) return 'bg-green-400/50';
        if (expectancy >= -0.3) return 'bg-yellow-500/60';
        if (expectancy >= -0.5) return 'bg-orange-500/70';
        return 'bg-red-500/80';
    };

    const sessionLabels: Record<Session, string> = {
        ASIA: '🌏 Asia',
        LONDON: '🇬🇧 London',
        NY: '🇺🇸 NY'
    };

    const formatExpectancy = (exp: number): string => {
        return `${exp >= 0 ? '+' : ''}${exp.toFixed(2)}R`;
    };

    if (trades.length < 5) {
        return (
            <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Grid3X3 className="text-beast-green" size={24} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Trinity Matrix — Setup × Session
                    </h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Need at least 5 trades to show matrix</p>
                    <p className="text-xs mt-2">Log more trades with setup and session info for insights</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Grid3X3 className="text-beast-green" size={24} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Trinity Matrix — Setup × Session
                    </h3>
                </div>
                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Expectancy Heatmap
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className={`text-left text-xs font-bold p-2 w-24 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}></th>
                            {setups.map(setup => (
                                <th key={setup} className={`text-center text-xs font-bold p-2 min-w-[75px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {setup}
                                </th>
                            ))}
                            <th className={`text-center text-xs font-bold p-2 min-w-[60px] border-l ${darkMode ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-400'}`}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {SESSIONS.map(session => (
                            <tr key={session}>
                                <td className={`text-sm font-bold p-2 whitespace-nowrap ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {sessionLabels[session]}
                                </td>
                                {setups.map(setup => {
                                    const cell = matrix[session][setup];
                                    const isGold = goldZones.some(g => g.session === session && g.setup === setup);
                                    const isDanger = dangerZones.some(d => d.session === session && d.setup === setup);

                                    return (
                                        <td key={setup} className="p-1">
                                            <div
                                                className={`
                                                    ${getExpectancyColor(cell.expectancy, cell.trades)}
                                                    rounded-lg p-2 text-center min-h-[65px] flex flex-col justify-center
                                                    transition-all cursor-default relative
                                                    ${isGold ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                                                    ${isDanger ? 'ring-2 ring-red-400 ring-offset-1' : ''}
                                                `}
                                                title={`${session} + ${setup}: ${cell.trades}t, ${(cell.winRate * 100).toFixed(0)}% WR, E=${formatExpectancy(cell.expectancy)}`}
                                            >
                                                {isGold && (
                                                    <Star className="absolute top-1 right-1 text-yellow-300" size={12} fill="currentColor" />
                                                )}
                                                {cell.trades > 0 ? (
                                                    <>
                                                        <div className={`text-sm font-bold ${cell.trades >= 3 ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                            {formatExpectancy(cell.expectancy)}
                                                        </div>
                                                        <div className={`text-[10px] ${cell.trades >= 3 ? 'text-white/80' : 'text-slate-500'}`}>
                                                            {cell.trades}t • {(cell.winRate * 100).toFixed(0)}%
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                {/* Session Total */}
                                <td className={`p-1 border-l ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                                    <div className={`rounded-lg p-2 text-center min-h-[65px] flex flex-col justify-center ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                        <div className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {formatExpectancy(totals.sessions[session].expectancy)}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {totals.sessions[session].trades}t
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Setup Totals Row */}
                        <tr className={`border-t ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                            <td className={`text-sm font-bold p-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Total
                            </td>
                            {setups.map(setup => (
                                <td key={setup} className="p-1">
                                    <div className={`rounded-lg p-2 text-center ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                        <div className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {formatExpectancy(totals.setups[setup].expectancy)}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {totals.setups[setup].trades}t
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
            <div className={`flex flex-wrap items-center justify-center gap-3 mt-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>&lt;-0.5R</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>-0.3R</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span>0R+</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded"></div>
                    <span className="flex items-center gap-0.5">
                        <Star size={10} className="text-yellow-400" fill="currentColor" />
                        Gold Zone 1R+
                    </span>
                </div>
            </div>

            {/* Gold Zones Callout */}
            {goldZones.length > 0 && (
                <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-start gap-3">
                        <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} fill="currentColor" />
                        <div className="flex-1">
                            <div className={`text-sm font-bold mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                🏆 Gold Zones Detected
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <span className="font-semibold">{goldZones.length} high-expectancy combos:</span>{' '}
                                {goldZones.slice(0, 3).map((g, i) => (
                                    <span key={`${g.session}-${g.setup}`}>
                                        {i > 0 && ', '}
                                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                            {sessionLabels[g.session]} + {g.setup}
                                        </span>
                                        <span className="text-green-600 dark:text-green-400 font-bold ml-1">
                                            ({formatExpectancy(g.expectancy)})
                                        </span>
                                    </span>
                                ))}
                                {goldZones.length > 3 && <span className="text-slate-500"> +{goldZones.length - 3} more</span>}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Danger Zones Warning */}
            {dangerZones.length > 0 && (
                <div className={`mt-3 p-3 rounded-lg border ${darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span className="font-semibold">Avoid:</span>{' '}
                            {dangerZones.slice(0, 2).map((d, i) => (
                                <span key={`${d.session}-${d.setup}`}>
                                    {i > 0 && ', '}
                                    {sessionLabels[d.session]} + {d.setup} ({formatExpectancy(d.expectancy)})
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrinityMatrixHeatmap;

'use client';

import React from 'react';
import { Trade } from '../../types';
import { Grid3X3 } from 'lucide-react';

interface TrinityPerformanceMatrixProps {
    trades: Trade[];
    darkMode?: boolean;
}

/**
 * Trinity Performance Matrix
 * Shows performance breakdown by session x setup x entry type
 */
const TrinityPerformanceMatrix: React.FC<TrinityPerformanceMatrixProps> = ({ trades, darkMode = true }) => {
    if (trades.length === 0) {
        return (
            <div className="text-center p-8 text-slate-400 bg-slate-800 rounded-xl border border-slate-700">
                <Grid3X3 className="mx-auto mb-4 opacity-50" size={32} />
                <p>No trades to analyze</p>
            </div>
        );
    }

    // Group trades by session
    const sessionGroups = trades.reduce((acc, trade) => {
        const session = trade.sessionType || 'Unknown';
        if (!acc[session]) acc[session] = { count: 0, wins: 0, pnl: 0 };
        acc[session].count++;
        acc[session].pnl += trade.pnl;
        if (trade.pnl > 0) acc[session].wins++;
        return acc;
    }, {} as Record<string, { count: number; wins: number; pnl: number }>);

    const sessions = Object.entries(sessionGroups)
        .map(([session, stats]) => ({
            session,
            ...stats,
            winRate: stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0
        }))
        .sort((a, b) => b.pnl - a.pnl);

    return (
        <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <Grid3X3 className="text-purple-400" size={20} />
                Trinity Performance Matrix
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                            <th className="text-left py-2 px-3">Session</th>
                            <th className="text-center py-2 px-3">Trades</th>
                            <th className="text-center py-2 px-3">Win Rate</th>
                            <th className="text-right py-2 px-3">P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => (
                            <tr key={s.session} className={`border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                <td className={`py-2 px-3 font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{s.session}</td>
                                <td className={`py-2 px-3 text-center ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{s.count}</td>
                                <td className="py-2 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.winRate >= 60 ? 'bg-emerald-500/20 text-emerald-400' :
                                            s.winRate >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {s.winRate}%
                                    </span>
                                </td>
                                <td className={`py-2 px-3 text-right font-bold ${s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${s.pnl.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrinityPerformanceMatrix;

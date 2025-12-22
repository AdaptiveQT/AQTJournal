'use client';

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Trade } from '../../types';
import { expectancyBySetup, SetupExpectancy } from '../../utils/analyticsEngine';

interface ExpectancyChartProps {
    trades: Trade[];
    baseRisk?: number;
    darkMode?: boolean;
}

const ExpectancyChart: React.FC<ExpectancyChartProps> = ({
    trades,
    baseRisk = 10,
    darkMode = false
}) => {
    const setupStats = useMemo(() => {
        return expectancyBySetup(trades, baseRisk);
    }, [trades, baseRisk]);

    // Chart data with colors
    const chartData = useMemo(() => {
        return setupStats.map(stat => ({
            ...stat,
            color: stat.expectancy >= 0 ? '#10b981' : '#ef4444',
            winRatePercent: (stat.winRate * 100).toFixed(1)
        }));
    }, [setupStats]);

    if (trades.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="text-blue-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expectancy by Setup</h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Add trades to see setup expectancy analysis</p>
                </div>
            </div>
        );
    }

    const bestSetup = setupStats[0];
    const worstSetup = setupStats[setupStats.length - 1];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Target className="text-blue-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expectancy by Setup</h3>
                </div>
                <div className="text-xs text-slate-500">
                    E = p × avgWin - (1-p) × avgLoss
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Best Setup */}
                {bestSetup && (
                    <div className={`p-4 rounded-lg ${bestSetup.expectancy >= 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Best Setup</span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">{bestSetup.setup}</div>
                        <div className={`text-lg font-bold ${bestSetup.expectancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {bestSetup.expectancy >= 0 ? '+' : ''}{bestSetup.expectancy.toFixed(2)}R
                        </div>
                        <div className="text-xs text-slate-500">
                            {bestSetup.trades} trades • {(bestSetup.winRate * 100).toFixed(0)}% win
                        </div>
                    </div>
                )}

                {/* Worst Setup */}
                {worstSetup && worstSetup !== bestSetup && (
                    <div className={`p-4 rounded-lg ${worstSetup.expectancy >= 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Needs Work</span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">{worstSetup.setup}</div>
                        <div className={`text-lg font-bold ${worstSetup.expectancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {worstSetup.expectancy >= 0 ? '+' : ''}{worstSetup.expectancy.toFixed(2)}R
                        </div>
                        <div className="text-xs text-slate-500">
                            {worstSetup.trades} trades • {(worstSetup.winRate * 100).toFixed(0)}% win
                        </div>
                    </div>
                )}
            </div>

            {/* Bar Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis
                            type="number"
                            tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                            tickFormatter={(val) => `${val}R`}
                        />
                        <YAxis
                            type="category"
                            dataKey="setup"
                            tick={{ fill: darkMode ? '#f1f5f9' : '#1e293b', fontSize: 12 }}
                            width={75}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                color: darkMode ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value: number, name: string) => {
                                if (name === 'expectancy') return [`${value >= 0 ? '+' : ''}${value.toFixed(3)}R`, 'Expectancy'];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Setup: ${label}`}
                        />
                        <ReferenceLine x={0} stroke={darkMode ? '#475569' : '#94a3b8'} strokeWidth={2} />
                        <Bar dataKey="expectancy" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-2 font-medium">Setup</th>
                            <th className="pb-2 font-medium text-right">Trades</th>
                            <th className="pb-2 font-medium text-right">Win%</th>
                            <th className="pb-2 font-medium text-right">Avg Win</th>
                            <th className="pb-2 font-medium text-right">Avg Loss</th>
                            <th className="pb-2 font-medium text-right">Expectancy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {setupStats.map((stat, idx) => (
                            <tr key={stat.setup} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-2 font-medium text-slate-900 dark:text-white">{stat.setup}</td>
                                <td className="py-2 text-right text-slate-600 dark:text-slate-400">{stat.trades}</td>
                                <td className="py-2 text-right text-slate-600 dark:text-slate-400">{(stat.winRate * 100).toFixed(0)}%</td>
                                <td className="py-2 text-right text-green-600">+{stat.avgWinR.toFixed(2)}R</td>
                                <td className="py-2 text-right text-red-600">-{stat.avgLossR.toFixed(2)}R</td>
                                <td className={`py-2 text-right font-bold ${stat.expectancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.expectancy >= 0 ? '+' : ''}{stat.expectancy.toFixed(2)}R
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Insight */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>💡 Insight:</strong> Focus on setups with positive expectancy.
                    {bestSetup && bestSetup.expectancy > 0 && (
                        <> Your <strong>{bestSetup.setup}</strong> strategy has an edge of +{bestSetup.expectancy.toFixed(2)}R per trade.</>
                    )}
                    {worstSetup && worstSetup.expectancy < 0 && (
                        <> Consider refining or dropping <strong>{worstSetup.setup}</strong> which loses {Math.abs(worstSetup.expectancy).toFixed(2)}R per trade.</>
                    )}
                </p>
            </div>
        </div>
    );
};

export default ExpectancyChart;

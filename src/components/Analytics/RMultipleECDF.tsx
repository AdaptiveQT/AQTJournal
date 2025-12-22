'use client';

import React, { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { Trade } from '../../types';
import { rMultipleECDF, getECDFPercentiles, expectancyBySetup } from '../../utils/analyticsEngine';

interface RMultipleECDFProps {
    trades: Trade[];
    baseRisk?: number;
    darkMode?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const RMultipleECDF: React.FC<RMultipleECDFProps> = ({
    trades,
    baseRisk = 10,
    darkMode = false
}) => {
    const [selectedSetups, setSelectedSetups] = useState<string[]>([]);

    // Get unique setups
    const setups = useMemo(() => {
        const unique = new Set(trades.map(t => t.setup || 'Unknown'));
        return Array.from(unique);
    }, [trades]);

    // Calculate ECDF for all trades and selected setups
    const ecdfData = useMemo(() => {
        const allECDF = rMultipleECDF(trades, baseRisk);

        // Create a unified dataset for the chart
        const rValuesSet = new Set<number>();
        allECDF.forEach(p => rValuesSet.add(p.r));

        const setupECDFs = new Map<string, ReturnType<typeof rMultipleECDF>>();
        setups.forEach(setup => {
            const ecdf = rMultipleECDF(trades, baseRisk, setup);
            ecdf.forEach(p => rValuesSet.add(p.r));
            setupECDFs.set(setup, ecdf);
        });

        const rValues = Array.from(rValuesSet).sort((a, b) => a - b);

        return rValues.map(r => {
            const point: Record<string, number> = { r };

            // All trades ECDF
            const allPoint = allECDF.find(p => p.r >= r);
            point.all = allPoint ? allPoint.cumulative * 100 : 100;

            // Per-setup ECDFs
            setups.forEach(setup => {
                const setupECDF = setupECDFs.get(setup);
                if (setupECDF) {
                    const setupPoint = setupECDF.find(p => p.r >= r);
                    point[setup] = setupPoint ? setupPoint.cumulative * 100 : 100;
                }
            });

            return point;
        });
    }, [trades, baseRisk, setups]);

    // Percentile stats
    const percentiles = useMemo(() => {
        const allECDF = rMultipleECDF(trades, baseRisk);
        return getECDFPercentiles(allECDF);
    }, [trades, baseRisk]);

    // Risk stats
    const riskStats = useMemo(() => {
        const allECDF = rMultipleECDF(trades, baseRisk);
        const prob1RLoss = allECDF.find(p => p.r >= -1)?.cumulative || 0;
        const prob2RWin = 1 - (allECDF.find(p => p.r >= 2)?.cumulative || 1);
        return { prob1RLoss, prob2RWin };
    }, [trades, baseRisk]);

    const toggleSetup = (setup: string) => {
        setSelectedSetups(prev =>
            prev.includes(setup)
                ? prev.filter(s => s !== setup)
                : [...prev, setup]
        );
    };

    if (trades.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="text-indigo-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">R-Multiple Distribution (ECDF)</h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Add trades to see R-multiple distribution</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart2 className="text-indigo-500" size={24} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">R-Multiple Distribution</h3>
                </div>
                <div className="text-xs text-slate-500">
                    Cumulative distribution of trade outcomes
                </div>
            </div>

            {/* Setup Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {setups.map((setup, idx) => (
                    <button
                        key={setup}
                        onClick={() => toggleSetup(setup)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${selectedSetups.includes(setup)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        style={{ borderColor: COLORS[idx % COLORS.length], borderWidth: 2 }}
                    >
                        {setup}
                    </button>
                ))}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">P(R ≤ -1)</div>
                    <div className="text-lg font-bold text-red-600">{(riskStats.prob1RLoss * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-400">Full loss prob</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Median (P50)</div>
                    <div className={`text-lg font-bold ${percentiles.p50 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {percentiles.p50.toFixed(2)}R
                    </div>
                    <div className="text-xs text-slate-400">Typical trade</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">P(R ≥ 2)</div>
                    <div className="text-lg font-bold text-green-600">{(riskStats.prob2RWin * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-400">Big win prob</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">P90</div>
                    <div className={`text-lg font-bold ${percentiles.p90 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {percentiles.p90.toFixed(2)}R
                    </div>
                    <div className="text-xs text-slate-400">Best 10%</div>
                </div>
            </div>

            {/* ECDF Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ecdfData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis
                            dataKey="r"
                            tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            tickFormatter={(val) => `${val}R`}
                            domain={['dataMin', 'dataMax']}
                        />
                        <YAxis
                            tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            tickFormatter={(val) => `${val}%`}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                color: darkMode ? '#f1f5f9' : '#1e293b'
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Cumulative']}
                            labelFormatter={(label) => `R = ${label.toFixed(2)}`}
                        />
                        <ReferenceLine x={0} stroke={darkMode ? '#ef4444' : '#dc2626'} strokeWidth={2} strokeDasharray="5 5" />
                        <ReferenceLine x={1} stroke={darkMode ? '#22c55e' : '#16a34a'} strokeWidth={1} strokeDasharray="3 3" />

                        {/* All trades line */}
                        <Line
                            type="stepAfter"
                            dataKey="all"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={false}
                            name="All Trades"
                        />

                        {/* Selected setup lines */}
                        {selectedSetups.map((setup, idx) => (
                            <Line
                                key={setup}
                                type="stepAfter"
                                dataKey={setup}
                                stroke={COLORS[setups.indexOf(setup) % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                                name={setup}
                            />
                        ))}

                        <Legend />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Interpretation */}
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                    <strong>📊 Reading:</strong> The ECDF shows what percentage of trades fall below each R value.
                    A steep rise near 0 indicates many breakeven trades.
                    {percentiles.p50 > 0 && (
                        <> Your median trade makes +{percentiles.p50.toFixed(2)}R — you have a statistical edge!</>
                    )}
                    {percentiles.p50 <= 0 && (
                        <> Your median trade is at {percentiles.p50.toFixed(2)}R — focus on cutting losers faster.</>
                    )}
                </p>
            </div>
        </div>
    );
};

export default RMultipleECDF;

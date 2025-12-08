'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';
import { Trade } from '../../types';
import { TrendingUp, BarChart2, PieChart as PieIcon, Calendar as CalendarIcon } from 'lucide-react';
import CalendarView from './CalendarView';

interface AnalyticsDashboardProps {
    trades: Trade[];
    currentBalance: number;
    startBalance: number;
}

const COLORS = {
    green: '#10B981', // emerald-500
    red: '#EF4444',   // red-500
    blue: '#3B82F6',  // blue-500
    slate: '#64748B', // slate-500
    grid: '#334155'   // slate-700
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ trades, currentBalance, startBalance }) => {
    const [activeTab, setActiveTab] = useState<'charts' | 'calendar'>('charts');

    // --- Equity Curve Data ---
    const equityData = useMemo(() => {
        // Sort trades by timestamp ascending
        const sorted = [...trades].sort((a, b) => a.ts - b.ts);

        let runningBalance = startBalance;
        // Start with initial point
        const data = [{
            name: 'Start',
            balance: startBalance,
            pnl: 0
        }];

        sorted.forEach((t, index) => {
            runningBalance += t.pnl;
            data.push({
                name: (index + 1).toString(), // Trade number
                balance: Math.round(runningBalance * 100) / 100,
                pnl: t.pnl
            });
        });

        return data;
    }, [trades, startBalance]);

    // --- Daily P&L Data ---
    const dailyData = useMemo(() => {
        const map = new Map<string, number>();
        trades.forEach(t => {
            const val = map.get(t.date) || 0;
            map.set(t.date, val + t.pnl);
        });

        // Convert to array and sort by date
        return Array.from(map.entries())
            .map(([date, pnl]) => ({ date, pnl: Math.round(pnl * 100) / 100 }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            // Take last 30 active days max for readability
            .slice(-30);
    }, [trades]);

    // --- Win Rate Data ---
    const winRateData = useMemo(() => {
        const wins = trades.filter(t => t.pnl > 0).length;
        const losses = trades.filter(t => t.pnl <= 0).length; // treating BE as non-win
        return [
            { name: 'Wins', value: wins },
            { name: 'Losses', value: losses }
        ];
    }, [trades]);

    const winRate = trades.length > 0
        ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100)
        : 0;

    if (trades.length === 0) {
        return (
            <div className="text-center p-12 text-slate-400 bg-slate-800 rounded-xl border border-slate-700">
                <BarChart2 className="mx-auto mb-4 opacity-50" size={48} />
                <h3 className="text-xl font-bold mb-2">No Data Yet</h3>
                <p>Log some trades to see your advanced analytics.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-lg w-fit border border-slate-700">
                <button
                    onClick={() => setActiveTab('charts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'charts' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <CalendarIcon size={16} /> Calendar
                </button>
            </div>

            {activeTab === 'calendar' ? (
                <CalendarView trades={trades} />
            ) : (
                <>
                    {/* 1. Equity Curve */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                            <TrendingUp className="text-blue-400" />
                            Equity Curve
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={equityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        label={{ value: 'Trade #', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        tickFormatter={(val) => `$${val}`}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(val: number) => [`$${val.toFixed(2)}`, 'Balance']}
                                        labelFormatter={(label) => `Trade #${label}`}
                                    />
                                    <ReferenceLine y={startBalance} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'right', value: 'Start', fill: '#fbbf24', fontSize: 10 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke={COLORS.blue}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: COLORS.blue }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Daily P&L */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                                <BarChart2 className="text-purple-400" />
                                Daily Performance (Last 30 Days)
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            tickFormatter={(str) => {
                                                const d = new Date(str);
                                                return `${d.getMonth() + 1}/${d.getDate()}`;
                                            }}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                            formatter={(val: number) => [`$${val.toFixed(2)}`, 'P&L']}
                                        />
                                        <ReferenceLine y={0} stroke="#94a3b8" opacity={0.5} />
                                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                            {dailyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? COLORS.green : COLORS.red} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 3. Win Rate Pie */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white w-full">
                                <PieIcon className="text-green-400" />
                                Win Rate
                            </h3>
                            <div className="h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={winRateData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell key="wins" fill={COLORS.green} />
                                            <Cell key="losses" fill={COLORS.red} />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-white block">{winRate}%</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest">Win Rate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsDashboard;

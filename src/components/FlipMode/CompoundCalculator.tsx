'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CompoundCalculator: React.FC = () => {
    const [dailyPercent, setDailyPercent] = useState(5);
    const [days, setDays] = useState(30);
    const [startAmount, setStartAmount] = useState(100);

    const chartData = useMemo(() => {
        const data = [];
        let current = startAmount;
        for (let day = 0; day <= days; day++) {
            data.push({ day, balance: parseFloat(current.toFixed(2)) });
            current = current * (1 + dailyPercent / 100);
        }
        return data;
    }, [dailyPercent, days, startAmount]);

    const finalBalance = chartData[chartData.length - 1].balance;

    return (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator size={20} className="text-green-400" />
                Compound Growth Calculator
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Start Balance</label>
                    <input
                        type="number"
                        value={startAmount}
                        onChange={(e) => setStartAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Daily % Gain</label>
                    <input
                        type="number"
                        value={dailyPercent}
                        onChange={(e) => setDailyPercent(Math.max(0.1, Math.min(20, parseFloat(e.target.value) || 5)))}
                        className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Days</label>
                    <input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Math.max(1, Math.min(100, parseInt(e.target.value) || 30)))}
                        className="w-full p-2 bg-slate-800 rounded text-white text-sm border border-slate-600"
                    />
                </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 mb-4 border border-green-500/20">
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-1">Result</div>
                    <div className="text-3xl font-bold text-green-400 mb-1">
                        ${finalBalance.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">
                        {dailyPercent}% daily × {days} days = {((finalBalance / startAmount) * 100 - 100).toFixed(0)}% total growth
                    </div>
                </div>
            </div>

            <div className="h-48 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="day" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs text-slate-400 bg-amber-500/10 p-3 rounded border border-amber-500/20">
                <strong className="text-amber-400">Reality Check:</strong> Consistent {dailyPercent}% daily gains are extremely difficult.
                Most pro traders aim for 3-5% monthly. Use this as motivation, not expectation.
            </div>
        </div>
    );
};

export default CompoundCalculator;

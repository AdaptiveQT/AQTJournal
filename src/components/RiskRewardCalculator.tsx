'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskRewardCalculatorProps {
    entryPrice?: string;
    currentPair?: string;
}

const RiskRewardCalculator: React.FC<RiskRewardCalculatorProps> = ({
    entryPrice = '',
    currentPair = 'EURUSD'
}) => {
    const [entry, setEntry] = useState(entryPrice);
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [direction, setDirection] = useState<'Long' | 'Short'>('Long');

    const calculateRR = () => {
        const en = parseFloat(entry);
        const sl = parseFloat(stopLoss);
        const tp = parseFloat(takeProfit);

        if (isNaN(en) || isNaN(sl) || isNaN(tp)) return null;

        const risk = Math.abs(en - sl);
        const reward = Math.abs(tp - en);

        if (risk === 0) return null;

        const ratio = reward / risk;
        return {
            ratio: ratio.toFixed(2),
            risk: risk.toFixed(5),
            reward: reward.toFixed(5),
            isGood: ratio >= 2
        };
    };

    const rr = calculateRR();

    return (
        <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <Calculator size={20} className="text-purple-400" />
                <h3 className="text-base md:text-lg font-bold text-white">Risk-Reward Calculator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Direction</label>
                    <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value as 'Long' | 'Short')}
                        className="w-full p-2 md:p-3 bg-slate-800 rounded text-white text-sm border border-slate-600 min-h-[44px]"
                    >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Entry Price</label>
                    <input
                        type="number"
                        step="any"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="1.0850"
                        className="w-full p-2 md:p-3 bg-slate-800 rounded text-white text-sm border border-slate-600 min-h-[44px]"
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Stop Loss</label>
                    <input
                        type="number"
                        step="any"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="1.0800"
                        className="w-full p-2 md:p-3 bg-slate-800 rounded text-white text-sm border border-slate-600 min-h-[44px]"
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Take Profit</label>
                    <input
                        type="number"
                        step="any"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        placeholder="1.0950"
                        className="w-full p-2 md:p-3 bg-slate-800 rounded text-white text-sm border border-slate-600 min-h-[44px]"
                    />
                </div>
            </div>

            {rr && (
                <div className={`p-4 rounded-lg border-2 ${rr.isGood ? 'bg-green-500/10 border-green-500' : 'bg-amber-500/10 border-amber-500'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {rr.isGood ? (
                                <TrendingUp size={20} className="text-green-400" />
                            ) : (
                                <AlertTriangle size={20} className="text-amber-400" />
                            )}
                            <span className="font-bold text-white">R:R Ratio</span>
                        </div>
                        <div className={`text-3xl font-bold ${rr.isGood ? 'text-green-400' : 'text-amber-400'}`}>
                            1:{parseFloat(rr.ratio)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                        <div>
                            <div className="text-slate-400">Risk</div>
                            <div className="text-red-400 font-mono">{rr.risk}</div>
                        </div>
                        <div>
                            <div className="text-slate-400">Reward</div>
                            <div className="text-green-400 font-mono">{rr.reward}</div>
                        </div>
                    </div>
                    <div className="mt-3 text-xs">
                        {rr.isGood ? (
                            <div className="text-green-300">✓ Good risk-reward ratio (2:1 or better recommended)</div>
                        ) : (
                            <div className="text-amber-300">⚠️ Consider a better risk-reward ratio (aim for 2:1+)</div>
                        )}
                    </div>
                </div>
            )}

            {!rr && (
                <div className="p-4 bg-slate-800/50 rounded-lg text-center text-slate-400 text-sm">
                    Enter all prices to calculate risk-reward ratio
                </div>
            )}
        </div>
    );
};

export default RiskRewardCalculator;

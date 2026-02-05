'use client';

import React, { useState } from 'react';
import {
    X,
    DollarSign,
    Target,
    Shield,
    TrendingUp,
    AlertTriangle,
    Check,
    Settings
} from 'lucide-react';

interface FlipModeSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onSetBalance: (balance: number) => void;
    settings: {
        dailyGrowth: number;
        maxDailyLoss: number;
        maxTradesPerDay: number;
        startBalance: number;
        targetBalance: number;
    };
    onUpdateSettings: (settings: Partial<FlipModeSettingsProps['settings']>) => void;
    darkMode?: boolean;
}

const FlipModeSettings: React.FC<FlipModeSettingsProps> = ({
    isOpen,
    onClose,
    balance,
    onSetBalance,
    settings,
    onUpdateSettings,
    darkMode = false
}) => {
    const [balanceInput, setBalanceInput] = useState(balance.toString());
    const [dailyGrowthInput, setDailyGrowthInput] = useState(settings.dailyGrowth.toString());
    const [maxLossInput, setMaxLossInput] = useState(settings.maxDailyLoss.toString());
    const [maxTradesInput, setMaxTradesInput] = useState(settings.maxTradesPerDay.toString());
    const [startBalanceInput, setStartBalanceInput] = useState(settings.startBalance.toString());
    const [targetBalanceInput, setTargetBalanceInput] = useState(settings.targetBalance.toString());
    const [showAdvanced, setShowAdvanced] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        const newBalance = parseFloat(balanceInput.replace(/[,$]/g, ''));
        if (!isNaN(newBalance) && newBalance > 0) {
            onSetBalance(newBalance);
        }

        onUpdateSettings({
            dailyGrowth: parseFloat(dailyGrowthInput) || 5,
            maxDailyLoss: parseFloat(maxLossInput) || 5,
            maxTradesPerDay: parseInt(maxTradesInput) || 3,
            startBalance: parseFloat(startBalanceInput.replace(/[,$]/g, '')) || 100,
            targetBalance: parseFloat(targetBalanceInput.replace(/[,$]/g, '')) || 1000,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings size={24} />
                            <div>
                                <h2 className="text-xl font-bold">Flip Mode Settings</h2>
                                <p className="text-purple-200 text-sm">Simple configuration for beginners</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* IMPORTANT: Balance First */}
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="text-amber-600" size={20} />
                            <span className="font-bold text-amber-800 dark:text-amber-300">Step 1: Set Your Account Balance</span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                            This is the most important setting! All risk calculations depend on it.
                        </p>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" size={20} />
                            <input
                                type="text"
                                value={balanceInput}
                                onChange={(e) => setBalanceInput(e.target.value)}
                                placeholder="1000"
                                className={`w-full pl-10 pr-4 py-3 text-xl font-bold rounded-lg border-2 border-amber-400 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} focus:ring-2 focus:ring-amber-500 outline-none`}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {[1000, 5000, 10000, 25000].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => setBalanceInput(amount.toString())}
                                    className={`px-3 py-1.5 text-sm rounded-lg ${balanceInput === amount.toString()
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                                        }`}
                                >
                                    ${amount.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Goals */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <div className="flex items-center gap-2">
                                    <Target size={16} className="text-green-500" />
                                    Daily Growth Target (%)
                                </div>
                            </label>
                            <input
                                type="number"
                                value={dailyGrowthInput}
                                onChange={(e) => setDailyGrowthInput(e.target.value)}
                                min="1"
                                max="20"
                                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} focus:ring-2 focus:ring-green-500 outline-none`}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Goal: ${((parseFloat(balanceInput.replace(/[,$]/g, '')) || 0) * (parseFloat(dailyGrowthInput) || 5) / 100).toFixed(2)}/day
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-red-500" />
                                    Max Daily Loss (%)
                                </div>
                            </label>
                            <input
                                type="number"
                                value={maxLossInput}
                                onChange={(e) => setMaxLossInput(e.target.value)}
                                min="1"
                                max="20"
                                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} focus:ring-2 focus:ring-red-500 outline-none`}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Stop trading at: -${((parseFloat(balanceInput.replace(/[,$]/g, '')) || 0) * (parseFloat(maxLossInput) || 5) / 100).toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-blue-500" />
                                    Max Trades Per Day
                                </div>
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setMaxTradesInput(num.toString())}
                                        className={`flex-1 py-2.5 rounded-lg font-medium ${maxTradesInput === num.toString()
                                            ? 'bg-blue-500 text-white'
                                            : darkMode
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`w-full text-sm py-2 ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'} flex items-center justify-center gap-2`}
                    >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Challenge Start Balance ($)
                                </label>
                                <input
                                    type="text"
                                    value={startBalanceInput}
                                    onChange={(e) => setStartBalanceInput(e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} outline-none`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    Challenge Target Balance ($)
                                </label>
                                <input
                                    type="text"
                                    value={targetBalanceInput}
                                    onChange={(e) => setTargetBalanceInput(e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} outline-none`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={20} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlipModeSettings;

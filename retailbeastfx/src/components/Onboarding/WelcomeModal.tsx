'use client';

import React, { useState } from 'react';
import {
    Sparkles,
    ArrowRight,
    Database,
    Upload,
    DollarSign,
    TrendingUp,
    Target,
    BarChart2,
    Check
} from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadDemo: () => void;
    onOpenImport: () => void;
    onSetBalance: (balance: number) => void;
    currentBalance: number;
    darkMode?: boolean;
}

type Step = 'account' | 'action';

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    isOpen,
    onClose,
    onLoadDemo,
    onOpenImport,
    onSetBalance,
    currentBalance,
    darkMode = false
}) => {
    const [step, setStep] = useState<Step>('account');
    const [balanceInput, setBalanceInput] = useState(currentBalance.toString());
    const [balanceError, setBalanceError] = useState('');

    if (!isOpen) return null;

    const handleBalanceSubmit = () => {
        const value = parseFloat(balanceInput.replace(/[,$]/g, ''));
        if (isNaN(value) || value <= 0) {
            setBalanceError('Please enter a valid account balance');
            return;
        }
        onSetBalance(value);
        setStep('action');
    };

    const handleLoadDemo = () => {
        onLoadDemo();
        onClose();
    };

    const handleOpenImport = () => {
        onOpenImport();
        onClose();
    };

    const handleSkipToManual = () => {
        // Ensure balance is saved even when skipping
        const value = parseFloat(balanceInput.replace(/[,$]/g, ''));
        if (!isNaN(value) && value > 0) {
            onSetBalance(value);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome to The System</h1>
                                <p className="text-blue-100 text-sm">Your trading edge, visualized</p>
                            </div>
                        </div>

                        <p className="text-lg leading-relaxed">
                            <strong>Journal faster. Find your edge.</strong><br />
                            Log trades in seconds. See which setups and sessions actually pay.
                        </p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className={`flex items-center justify-center gap-2 p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-2 ${step === 'account' ? 'text-blue-500' : 'text-green-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'account' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                            {step === 'account' ? '1' : <Check size={16} />}
                        </div>
                        <span className="text-sm font-medium">Account</span>
                    </div>
                    <div className={`w-8 h-0.5 ${step === 'action' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`flex items-center gap-2 ${step === 'action' ? 'text-blue-500' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'action' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Get Started</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Account Setup */}
                    {step === 'account' && (
                        <div>
                            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Set Your Account Size
                            </h3>
                            <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                This helps calculate risk percentages and position sizing.
                            </p>

                            <div className="relative mb-4">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <DollarSign className={`${darkMode ? 'text-slate-400' : 'text-slate-400'}`} size={24} />
                                </div>
                                <input
                                    type="text"
                                    value={balanceInput}
                                    onChange={(e) => {
                                        setBalanceInput(e.target.value);
                                        setBalanceError('');
                                    }}
                                    placeholder="10000"
                                    className={`w-full pl-12 pr-4 py-4 text-2xl font-bold rounded-xl border-2 transition-all ${balanceError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                                        } ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} outline-none focus:ring-2`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleBalanceSubmit()}
                                />
                            </div>

                            {balanceError && (
                                <p className="text-red-500 text-sm mb-4">{balanceError}</p>
                            )}

                            {/* Quick Select Buttons */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {[1000, 5000, 10000, 25000, 50000, 100000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => {
                                            setBalanceInput(amount.toString());
                                            setBalanceError('');
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${balanceInput === amount.toString()
                                            ? 'bg-blue-500 text-white'
                                            : darkMode
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        ${amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleBalanceSubmit}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Get Started */}
                    {step === 'action' && (
                        <div>
                            <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                    <Check size={24} />
                                </div>
                                <div>
                                    <div className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                                        Account set to ${parseFloat(balanceInput.replace(/[,$]/g, '')).toLocaleString()}
                                    </div>
                                    <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                                        Ready for risk calculations
                                    </div>
                                </div>
                            </div>

                            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Now, get started
                            </h3>

                            <div className="space-y-3">
                                {/* Demo Data Option */}
                                <button
                                    onClick={handleLoadDemo}
                                    className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <Database size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-blue-700 dark:text-blue-400">Explore with Demo Data</div>
                                            <div className="text-sm text-blue-600 dark:text-blue-300">
                                                100 sample trades • See analytics in action
                                            </div>
                                        </div>
                                        <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" size={20} />
                                    </div>
                                </button>

                                {/* Import Option */}
                                <button
                                    onClick={handleOpenImport}
                                    className={`w-full p-4 rounded-xl border-2 ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'} transition-all group text-left`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} group-hover:scale-110 transition-transform`}>
                                            <Upload size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Import from MT4/MT5</div>
                                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                CSV or HTML trade history export
                                            </div>
                                        </div>
                                        <ArrowRight className={`${darkMode ? 'text-slate-400' : 'text-slate-400'} group-hover:translate-x-1 transition-transform`} size={20} />
                                    </div>
                                </button>
                            </div>

                            {/* Features Preview */}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
                                        <div className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Expectancy</div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>by setup</div>
                                    </div>
                                    <div>
                                        <Target className="mx-auto mb-2 text-purple-500" size={24} />
                                        <div className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Session</div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>heatmaps</div>
                                    </div>
                                    <div>
                                        <BarChart2 className="mx-auto mb-2 text-blue-500" size={24} />
                                        <div className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>R-Multiple</div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>analysis</div>
                                    </div>
                                </div>
                            </div>

                            {/* Skip Link */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleSkipToManual}
                                    className={`text-sm ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                                >
                                    Skip for now, I'll add trades manually
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;

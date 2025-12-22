'use client';

import React from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';

interface FocusModeProps {
    isActive: boolean;
    onClose: () => void;
    children: React.ReactNode;
    currentBalance?: number;
    todayPnL?: number;
}

const FocusMode: React.FC<FocusModeProps> = ({
    isActive,
    onClose,
    children,
    currentBalance = 0,
    todayPnL = 0,
}) => {
    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
            {/* Minimal Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Zap className="text-yellow-400" size={24} />
                        <div>
                            <h1 className="text-lg font-bold text-white">Focus Mode</h1>
                            <p className="text-xs text-slate-400">Minimal distractions • Fast logging</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Quick Stats */}
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                            <div>
                                <div className="text-xs text-slate-400">Balance</div>
                                <div className="font-semibold text-white">${currentBalance.toLocaleString()}</div>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            <div>
                                <div className="text-xs text-slate-400">Today</div>
                                <div className={`font-semibold ${todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Exit Button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Exit Focus Mode (Ctrl+Shift+F)"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area - Centered Trade Entry */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="flex-shrink-0 px-6 py-3 border-t border-slate-700 bg-slate-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-400">
                    <div>Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300 font-mono">Ctrl+Shift+F</kbd> to exit</div>
                    <div>Focus Mode • Keyboard-optimized workflow</div>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Sparkles,
    ArrowRight,
    Database,
    Upload,
    X,
    TrendingUp,
    Target,
    BarChart2
} from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadDemo: () => void;
    onOpenImport: () => void;
    darkMode?: boolean;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    isOpen,
    onClose,
    onLoadDemo,
    onOpenImport,
    darkMode = false
}) => {
    if (!isOpen) return null;

    const handleLoadDemo = () => {
        onLoadDemo();
        onClose();
    };

    const handleOpenImport = () => {
        onOpenImport();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome to AQT Journal</h1>
                                <p className="text-blue-100 text-sm">Your trading edge, visualized</p>
                            </div>
                        </div>

                        <p className="text-lg leading-relaxed">
                            <strong>Journal faster. Find your edge.</strong><br />
                            Log trades in seconds. See which setups and sessions actually pay.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Get started in 60 seconds
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
                            onClick={onClose}
                            className={`text-sm ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
                        >
                            Skip for now, I'll add trades manually
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;

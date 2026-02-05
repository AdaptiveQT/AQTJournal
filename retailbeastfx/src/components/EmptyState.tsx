'use client';

import React from 'react';
import {
    FileSpreadsheet,
    Upload,
    Database,
    Plus,
    Target,
    BarChart2,
    Lightbulb,
    Link2,
    Sparkles,
    Rocket
} from 'lucide-react';
import { MascotImage } from './Mascot/MascotImage';

interface EmptyStateProps {
    type: 'trades' | 'dashboard' | 'setups' | 'analytics';
    onLoadDemo?: () => void;
    onImportCSV?: () => void;
    onAddTrade?: () => void;
    onCreateSetup?: () => void;
    onConnectAccount?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    onLoadDemo,
    onImportCSV,
    onAddTrade,
    onCreateSetup,
    onConnectAccount
}) => {
    const configs = {
        trades: {
            icon: FileSpreadsheet,
            iconColor: 'text-beast-green',
            bgGradient: 'from-emerald-500/10 via-beast-green/5 to-lime-500/10',
            borderColor: 'border-beast-green/40',
            headline: 'Start Your Trading Journey',
            body: 'Connect your broker account, import from MT4/MT5, or add trades manually.',
            showMascot: true,
            actions: [
                { label: 'Connect Account', icon: Link2, onClick: onConnectAccount, variant: 'hero' as const },
                { label: 'Import Trades', icon: Upload, onClick: onImportCSV, variant: 'secondary' as const },
                { label: 'Load Demo Data', icon: Database, onClick: onLoadDemo, variant: 'ghost' as const },
            ]
        },
        dashboard: {
            icon: BarChart2,
            iconColor: 'text-purple-500',
            bgGradient: 'from-purple-500/10 via-indigo-500/5 to-pink-500/10',
            borderColor: 'border-purple-400/40',
            headline: 'Insights Unlock at 20+ Trades',
            body: 'See your performance come to life with real analytics. Load demo to preview.',
            showMascot: true,
            actions: [
                { label: 'Explore Demo', icon: Sparkles, onClick: onLoadDemo, variant: 'hero' as const },
                { label: 'Add First Trade', icon: Plus, onClick: onAddTrade, variant: 'secondary' as const }
            ]
        },
        setups: {
            icon: Target,
            iconColor: 'text-beast-green',
            bgGradient: 'from-beast-green/10 via-emerald-500/5 to-teal-500/10',
            borderColor: 'border-beast-green/40',
            headline: 'Setups Drive Your Edge',
            body: 'Create 2-4 setup types you actually trade: Breakout, Pullback, Reversal.',
            showMascot: false,
            actions: [
                { label: 'Create Setup', icon: Plus, onClick: onCreateSetup, variant: 'hero' as const }
            ]
        },
        analytics: {
            icon: Lightbulb,
            iconColor: 'text-amber-500',
            bgGradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
            borderColor: 'border-amber-400/40',
            headline: 'Deep Analytics Await',
            body: 'Discover your winning patterns, session performance, and more.',
            showMascot: true,
            actions: [
                { label: 'Preview Analytics', icon: Sparkles, onClick: onLoadDemo, variant: 'hero' as const }
            ]
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br ${config.bgGradient} rounded-2xl border-2 border-dashed ${config.borderColor} p-10`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-beast-green/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center">
                {/* Mascot + Icon Combo */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    {config.showMascot && (
                        <div className="relative">
                            <MascotImage size="lg" animate={true} />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-beast-green rounded-full flex items-center justify-center animate-bounce">
                                <Rocket size={14} className="text-white" />
                            </div>
                        </div>
                    )}
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-xl backdrop-blur-sm border border-white/20`}>
                        <Icon size={40} className={config.iconColor} />
                    </div>
                </div>

                {/* Headline */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {config.headline}
                </h3>

                {/* Body */}
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                    {config.body}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-4">
                    {config.actions.map((action, idx) => {
                        const ActionIcon = action.icon;

                        // Hero button - primary CTA
                        if (action.variant === 'hero') {
                            return (
                                <button
                                    key={idx}
                                    onClick={action.onClick}
                                    disabled={!action.onClick}
                                    className={`
                                        group relative px-6 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all
                                        bg-gradient-to-r from-beast-green via-emerald-500 to-teal-500
                                        text-white shadow-lg shadow-beast-green/30
                                        hover:shadow-xl hover:shadow-beast-green/40 hover:scale-105
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    `}
                                >
                                    <ActionIcon size={20} className="group-hover:rotate-12 transition-transform" />
                                    {action.label}
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            );
                        }

                        // Secondary button
                        if (action.variant === 'secondary') {
                            return (
                                <button
                                    key={idx}
                                    onClick={action.onClick}
                                    disabled={!action.onClick}
                                    className={`
                                        px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
                                        bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                                        border-2 border-slate-200 dark:border-slate-700
                                        hover:border-beast-green/50 hover:bg-beast-green/5
                                        shadow-md hover:shadow-lg
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    <ActionIcon size={18} />
                                    {action.label}
                                </button>
                            );
                        }

                        // Ghost button
                        return (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                disabled={!action.onClick}
                                className={`
                                    px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all
                                    text-slate-500 dark:text-slate-400
                                    hover:text-beast-green hover:bg-beast-green/10
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <ActionIcon size={16} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;

// Demo data banner component - upgraded
export const DemoDataBanner: React.FC<{
    onLoadDemo: () => void;
    onDismiss: () => void;
}> = ({ onLoadDemo, onDismiss }) => (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-5 mb-6 shadow-xl">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles size={26} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Explore with Demo Data</h3>
                    <p className="text-blue-100 text-sm">See full analytics with 100 sample trades</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onDismiss}
                    className="px-4 py-2 text-sm text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                    Dismiss
                </button>
                <button
                    onClick={onLoadDemo}
                    className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                    Load Demo ✨
                </button>
            </div>
        </div>
    </div>
);

// Demo mode indicator - upgraded
export const DemoModeIndicator: React.FC<{
    onClearDemo: () => void;
}> = ({ onClearDemo }) => (
    <div className="fixed bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-4 z-50 animate-fade-in">
        <div className="flex items-center gap-2">
            <Database size={18} />
            <span className="font-bold">Demo Mode</span>
        </div>
        <button
            onClick={onClearDemo}
            className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
        >
            Clear & Use Real Data
        </button>
    </div>
);

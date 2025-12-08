'use client';

import React from 'react';
import {
    FileSpreadsheet,
    Upload,
    Database,
    Plus,
    TrendingUp,
    Target,
    BarChart2,
    Lightbulb
} from 'lucide-react';

interface EmptyStateProps {
    type: 'trades' | 'dashboard' | 'setups' | 'analytics';
    onLoadDemo?: () => void;
    onImportCSV?: () => void;
    onAddTrade?: () => void;
    onCreateSetup?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type,
    onLoadDemo,
    onImportCSV,
    onAddTrade,
    onCreateSetup
}) => {
    const configs = {
        trades: {
            icon: FileSpreadsheet,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            headline: 'No trades yet',
            body: 'Import from MT4/MT5 (CSV/HTML) or add one manually. Or load demo data to explore.',
            actions: [
                { label: 'Import CSV', icon: Upload, onClick: onImportCSV, primary: false },
                { label: 'Load Demo Data', icon: Database, onClick: onLoadDemo, primary: true },
                { label: 'Add Trade', icon: Plus, onClick: onAddTrade, primary: false }
            ]
        },
        dashboard: {
            icon: BarChart2,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            headline: 'Insights appear after 20+ trades',
            body: 'Load demo data to preview analytics, or start logging your trades.',
            actions: [
                { label: 'Load Demo Data', icon: Database, onClick: onLoadDemo, primary: true },
                { label: 'Add First Trade', icon: Plus, onClick: onAddTrade, primary: false }
            ]
        },
        setups: {
            icon: Target,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            headline: 'Setups drive insights',
            body: 'Create 2-4 tags you actually use: Breakout, Pullback, Reversal, Trend.',
            actions: [
                { label: 'Create Setup', icon: Plus, onClick: onCreateSetup, primary: true }
            ]
        },
        analytics: {
            icon: Lightbulb,
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            headline: 'Analytics unlock at 20+ trades',
            body: 'See which setups and sessions actually pay. Load demo data to preview.',
            actions: [
                { label: 'Load Demo Data', icon: Database, onClick: onLoadDemo, primary: true }
            ]
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div className={`${config.bgColor} rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.bgColor} mb-4`}>
                <Icon size={32} className={config.iconColor} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {config.headline}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                {config.body}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
                {config.actions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            disabled={!action.onClick}
                            className={`
                px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all
                ${action.primary
                                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md hover:shadow-lg'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }
                ${!action.onClick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <ActionIcon size={18} />
                            {action.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default EmptyState;

// Demo data banner component
export const DemoDataBanner: React.FC<{
    onLoadDemo: () => void;
    onDismiss: () => void;
}> = ({ onLoadDemo, onDismiss }) => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
            </div>
            <div>
                <h3 className="font-bold">Explore with Demo Data</h3>
                <p className="text-sm text-blue-100">See analytics in action with 100 sample trades</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-sm text-blue-100 hover:text-white transition-colors"
            >
                Dismiss
            </button>
            <button
                onClick={onLoadDemo}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
                Load Demo Data (1 min)
            </button>
        </div>
    </div>
);

// Demo mode indicator
export const DemoModeIndicator: React.FC<{
    onClearDemo: () => void;
}> = ({ onClearDemo }) => (
    <div className="fixed bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-50">
        <Database size={18} />
        <span className="font-medium">Demo Mode Active</span>
        <button
            onClick={onClearDemo}
            className="px-2 py-1 bg-amber-600 rounded text-sm hover:bg-amber-700 transition-colors"
        >
            Clear & Use Real Data
        </button>
    </div>
);

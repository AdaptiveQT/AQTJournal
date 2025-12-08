'use client';

import React, { useState } from 'react';
import {
    Book,
    Plus,
    Edit3,
    Trash2,
    TrendingUp,
    Target,
    Award,
    X,
    Check,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { Strategy, DEFAULT_STRATEGY_TEMPLATES } from '../../types/strategies';

interface StrategyLibraryProps {
    strategies: Strategy[];
    onAddStrategy: (strategy: Omit<Strategy, 'id' | 'totalTrades' | 'winningTrades' | 'losingTrades' | 'totalPnL' | 'averagePnL' | 'bestTrade' | 'worstTrade' | 'createdAt' | 'updatedAt'>) => void;
    onUpdateStrategy: (id: string, updates: Partial<Strategy>) => void;
    onDeleteStrategy: (id: string) => void;
    onSelectStrategy?: (id: string) => void;
}

const StrategyLibrary: React.FC<StrategyLibraryProps> = ({
    strategies,
    onAddStrategy,
    onUpdateStrategy,
    onDeleteStrategy,
    onSelectStrategy,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    const handleAddFromTemplate = (template: typeof DEFAULT_STRATEGY_TEMPLATES[0]) => {
        onAddStrategy(template.strategy);
        setShowTemplates(false);
    };

    const sortedStrategies = [...strategies].sort((a, b) => {
        // Active first, then by total trades
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return b.totalTrades - a.totalTrades;
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Book className="text-purple-600 dark:text-purple-400" size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Strategy Library</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {strategies.length} strategies • {strategies.filter(s => s.isActive).length} active
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Book size={14} />
                        Templates
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2 font-medium text-sm"
                    >
                        {isAdding ? <X size={16} /> : <Plus size={16} />}
                        {isAdding ? 'Cancel' : 'New Strategy'}
                    </button>
                </div>
            </div>

            {/* Templates */}
            {showTemplates && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3">
                        Pre-built Strategy Templates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {DEFAULT_STRATEGY_TEMPLATES.map(template => (
                            <div
                                key={template.id}
                                className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {template.name}
                                        </h4>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                            {template.category}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddFromTemplate(template)}
                                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-500"
                                    >
                                        Use
                                    </button>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {template.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strategy List */}
            <div className="space-y-3">
                {sortedStrategies.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Book size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No strategies yet</p>
                        <p className="text-sm mt-1">Create your first playbook strategy</p>
                    </div>
                ) : (
                    sortedStrategies.map(strategy => (
                        <StrategyCard
                            key={strategy.id}
                            strategy={strategy}
                            isExpanded={expandedStrategy === strategy.id}
                            onToggleExpand={() => setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)}
                            onUpdate={(updates) => onUpdateStrategy(strategy.id, updates)}
                            onDelete={() => onDeleteStrategy(strategy.id)}
                            onSelect={onSelectStrategy ? () => onSelectStrategy(strategy.id) : undefined}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Strategy Card Component
interface StrategyCardProps {
    strategy: Strategy;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpdate: (updates: Partial<Strategy>) => void;
    onDelete: () => void;
    onSelect?: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
    strategy,
    isExpanded,
    onToggleExpand,
    onUpdate,
    onDelete,
    onSelect,
}) => {
    const winRate = strategy.totalTrades > 0
        ? (strategy.winningTrades / strategy.totalTrades) * 100
        : 0;

    const handleDelete = () => {
        const confirmed = window.confirm(
            `Delete "${strategy.name}"?\n\nThis will remove the strategy but won't affect existing trades.`
        );
        if (confirmed) {
            onDelete();
        }
    };

    return (
        <div className={`border-2 rounded-xl overflow-hidden transition-all ${strategy.isActive
                ? 'border-purple-200 dark:border-purple-800'
                : 'border-slate-200 dark:border-slate-700 opacity-60'
            }`}>
            {/* Header */}
            <div
                className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${strategy.isActive ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                onClick={onToggleExpand}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {strategy.name}
                            </h3>
                            {!strategy.isActive && (
                                <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {strategy.description}
                        </p>

                        {/* Quick Stats */}
                        {strategy.totalTrades > 0 && (
                            <div className="flex items-center gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                    <TrendingUp size={12} className="text-green-600 dark:text-green-400" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Win Rate: <span className="font-semibold text-slate-900 dark:text-white">{winRate.toFixed(0)}%</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target size={12} className="text-blue-600 dark:text-blue-400" />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Trades: <span className="font-semibold text-slate-900 dark:text-white">{strategy.totalTrades}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award size={12} className={strategy.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                                    <span className="text-slate-600 dark:text-slate-400">
                                        P&L: <span className={`font-semibold ${strategy.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            ${strategy.totalPnL.toFixed(2)}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {onSelect && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect();
                                }}
                                className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-500"
                            >
                                Use
                            </button>
                        )}
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                                Entry Rules
                            </h4>
                            <ul className="space-y-1">
                                {strategy.entryRules.map((rule, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                                        <Check size={12} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <span>{rule.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                Exit Rules
                            </h4>
                            <ul className="space-y-1">
                                {strategy.exitRules.map((rule, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                                        <Check size={12} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>{rule.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                Risk Rules
                            </h4>
                            <ul className="space-y-1">
                                {strategy.riskRules.map((rule, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                                        <Check size={12} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <span>{rule.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Optimal Conditions */}
                    {(strategy.optimalSessions || strategy.optimalPairs) && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Optimal Conditions
                            </h4>
                            <div className="flex flex-wrap gap-4 text-xs">
                                {strategy.optimalSessions && (
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Sessions:</span>{' '}
                                        <span className="text-slate-900 dark:text-white font-medium">
                                            {strategy.optimalSessions.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {strategy.optimalPairs && (
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Pairs:</span>{' '}
                                        <span className="text-slate-900 dark:text-white font-medium">
                                            {strategy.optimalPairs.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={() => onUpdate({ isActive: !strategy.isActive })}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${strategy.isActive
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    : 'bg-purple-600 text-white hover:bg-purple-500'
                                }`}
                        >
                            {strategy.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium flex items-center gap-1"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrategyLibrary;

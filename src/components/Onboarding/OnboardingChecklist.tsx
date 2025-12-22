'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2,
    Circle,
    Plus,
    Tag,
    BarChart2,
    ChevronRight,
    Sparkles,
    X
} from 'lucide-react';

interface OnboardingChecklistProps {
    tradesCount: number;
    hasTaggedTrade: boolean;
    hasViewedDashboard: boolean;
    onAddTrade: () => void;
    onOpenSetups: () => void;
    onViewDashboard: () => void;
    onDismiss: () => void;
    darkMode?: boolean;
}

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    completed: boolean;
    action: () => void;
    actionLabel: string;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
    tradesCount,
    hasTaggedTrade,
    hasViewedDashboard,
    onAddTrade,
    onOpenSetups,
    onViewDashboard,
    onDismiss,
    darkMode = false
}) => {
    const items: ChecklistItem[] = useMemo(() => [
        {
            id: 'add-trade',
            label: 'Log your first trade',
            description: 'Add a trade to start tracking',
            icon: Plus,
            completed: tradesCount > 0,
            action: onAddTrade,
            actionLabel: 'Add Trade'
        },
        {
            id: 'tag-setup',
            label: 'Tag a setup',
            description: 'Categorize your trade style',
            icon: Tag,
            completed: hasTaggedTrade,
            action: onOpenSetups,
            actionLabel: 'View Setups'
        },
        {
            id: 'view-analytics',
            label: 'Check your analytics',
            description: 'See expectancy by setup',
            icon: BarChart2,
            completed: hasViewedDashboard,
            action: onViewDashboard,
            actionLabel: 'View Dashboard'
        }
    ], [tradesCount, hasTaggedTrade, hasViewedDashboard, onAddTrade, onOpenSetups, onViewDashboard]);

    const completedCount = items.filter(i => i.completed).length;
    const progress = (completedCount / items.length) * 100;
    const isComplete = completedCount === items.length;

    // Don't show if all complete and dismissed
    if (isComplete) {
        return (
            <div className={`rounded-xl border-2 border-green-500 ${darkMode ? 'bg-green-900/20' : 'bg-green-50'} p-4 mb-6`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Sparkles size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-green-700 dark:text-green-400">You're all set! 🎉</div>
                        <div className="text-sm text-green-600 dark:text-green-300">You've completed the onboarding checklist.</div>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-4 mb-6 shadow-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} />
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Quick Start ({completedCount}/{items.length})
                    </span>
                </div>
                <button
                    onClick={onDismiss}
                    className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} mb-4 overflow-hidden`}>
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${item.completed
                                    ? darkMode ? 'bg-green-900/20' : 'bg-green-50'
                                    : darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                                }`}
                        >
                            {/* Status Icon */}
                            {item.completed ? (
                                <CheckCircle2 className="text-green-500 flex-shrink-0" size={22} />
                            ) : (
                                <Circle className="text-slate-300 flex-shrink-0" size={22} />
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium ${item.completed
                                        ? 'text-green-700 dark:text-green-400 line-through'
                                        : darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                    {item.label}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {item.description}
                                </div>
                            </div>

                            {/* Action Button */}
                            {!item.completed && (
                                <button
                                    onClick={item.action}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    {item.actionLabel}
                                    <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnboardingChecklist;

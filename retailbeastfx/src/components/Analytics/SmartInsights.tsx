'use client';

import React, { useMemo } from 'react';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Lightbulb,
    Target,
    CheckCircle,
    XCircle,
    Info,
} from 'lucide-react';
import { Trade } from '../../types';
import { InsightsEngine, Insight } from '../../utils/insightsEngine';

interface SmartInsightsProps {
    trades: Trade[];
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ trades }) => {
    const insights = useMemo(() => {
        const engine = new InsightsEngine(trades);
        return engine.generateInsights();
    }, [trades]);

    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
            case 'warning':
                return <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />;
            case 'danger':
                return <XCircle size={20} className="text-red-600 dark:text-red-400" />;
            case 'info':
            default:
                return <Info size={20} className="text-blue-600 dark:text-blue-400" />;
        }
    };

    const getBorderColor = (type: Insight['type']) => {
        switch (type) {
            case 'success':
                return 'border-green-200 dark:border-green-800';
            case 'warning':
                return 'border-yellow-200 dark:border-yellow-800';
            case 'danger':
                return 'border-red-200 dark:border-red-800';
            case 'info':
            default:
                return 'border-blue-200 dark:border-blue-800';
        }
    };

    const getBgColor = (type: Insight['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20';
            case 'danger':
                return 'bg-red-50 dark:bg-red-900/20';
            case 'info':
            default:
                return 'bg-blue-50 dark:bg-blue-900/20';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Brain className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Smart Insights</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI-powered analysis of your trading patterns
                    </p>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Brain size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No insights available yet</p>
                        <p className="text-sm mt-1">Keep trading to unlock smart insights</p>
                    </div>
                ) : (
                    insights.map(insight => (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-lg border-2 ${getBorderColor(insight.type)} ${getBgColor(insight.type)}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getIcon(insight.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Title */}
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                        {insight.title}
                                        {insight.confidence && (
                                            <span className="text-xs px-2 py-0.5 bg-white dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400">
                                                {insight.confidence}% confident
                                            </span>
                                        )}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                        {insight.description}
                                    </p>

                                    {/* Recommendation */}
                                    {insight.recommendation && (
                                        <div className="flex items-start gap-2 mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                                            <Lightbulb size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                    Recommendation
                                                </p>
                                                <p className="text-sm text-slate-900 dark:text-white font-medium">
                                                    {insight.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Stats */}
            {insights.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {insights.filter(i => i.type === 'success').length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Strengths</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {insights.filter(i => i.type === 'warning').length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Warnings</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {insights.filter(i => i.type === 'danger').length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Critical</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {insights.filter(i => i.type === 'info').length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Info</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartInsights;

'use client';

import React, { useMemo } from 'react';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Smile,
    Meh,
    Frown,
    Angry,
    Zap,
    Heart,
    Target,
    Shield
} from 'lucide-react';
import { Trade } from '../../types';

interface PsychologyDashboardProps {
    trades: Trade[];
    darkMode?: boolean;
}

// Emotion types available in the journal
const EMOTIONS = ['Confident', 'Neutral', 'Anxious', 'FOMO', 'Revenge', 'Impatient', 'Greedy', 'Fearful'] as const;
type Emotion = typeof EMOTIONS[number];

interface EmotionStats {
    emotion: Emotion;
    trades: number;
    wins: number;
    winRate: number;
    avgPnL: number;
    totalPnL: number;
}

interface CorrelationData {
    emotion: Emotion;
    correlation: number; // -1 to 1, positive = emotion correlates with wins
    significance: 'high' | 'medium' | 'low';
}

/**
 * Psychology Dashboard - Emotion × Performance Correlation
 * Helps traders identify emotional patterns that hurt/help their trading
 */
const PsychologyDashboard: React.FC<PsychologyDashboardProps> = ({
    trades,
    darkMode = true
}) => {
    // Calculate emotion statistics
    const emotionStats = useMemo((): EmotionStats[] => {
        const byEmotion = new Map<string, Trade[]>();

        trades.forEach(trade => {
            const emotion = trade.mood || 'Neutral';
            if (!byEmotion.has(emotion)) {
                byEmotion.set(emotion, []);
            }
            byEmotion.get(emotion)!.push(trade);
        });

        const stats: EmotionStats[] = [];

        EMOTIONS.forEach(emotion => {
            const emotionTrades = byEmotion.get(emotion) || [];
            if (emotionTrades.length === 0) return;

            const wins = emotionTrades.filter(t => t.pnl > 0);
            const totalPnL = emotionTrades.reduce((sum, t) => sum + t.pnl, 0);

            stats.push({
                emotion,
                trades: emotionTrades.length,
                wins: wins.length,
                winRate: emotionTrades.length > 0 ? wins.length / emotionTrades.length : 0,
                avgPnL: emotionTrades.length > 0 ? totalPnL / emotionTrades.length : 0,
                totalPnL
            });
        });

        // Sort by trade count descending
        return stats.sort((a, b) => b.trades - a.trades);
    }, [trades]);

    // Calculate correlation between emotion and P&L
    const correlations = useMemo((): CorrelationData[] => {
        if (trades.length < 10) return [];

        const overallWinRate = trades.filter(t => t.pnl > 0).length / trades.length;

        return emotionStats.map(stat => {
            // Compare emotion's win rate to overall
            const delta = stat.winRate - overallWinRate;

            // Simple significance based on sample size
            const significance: 'high' | 'medium' | 'low' =
                stat.trades >= 10 ? 'high' :
                    stat.trades >= 5 ? 'medium' : 'low';

            return {
                emotion: stat.emotion,
                correlation: delta,
                significance
            };
        }).filter(c => c.significance !== 'low');
    }, [emotionStats, trades]);

    // Find best and worst emotional states
    const { bestEmotion, worstEmotion } = useMemo(() => {
        const sorted = [...emotionStats]
            .filter(s => s.trades >= 3)
            .sort((a, b) => b.winRate - a.winRate);

        return {
            bestEmotion: sorted[0] || null,
            worstEmotion: sorted[sorted.length - 1] || null
        };
    }, [emotionStats]);

    // Get emotion icon
    const getEmotionIcon = (emotion: Emotion) => {
        const icons: Record<Emotion, React.ReactNode> = {
            'Confident': <Target className="text-green-500" size={16} />,
            'Neutral': <Meh className="text-slate-400" size={16} />,
            'Anxious': <Frown className="text-yellow-500" size={16} />,
            'FOMO': <Zap className="text-orange-500" size={16} />,
            'Revenge': <Angry className="text-red-500" size={16} />,
            'Impatient': <AlertTriangle className="text-amber-500" size={16} />,
            'Greedy': <Heart className="text-pink-500" size={16} />,
            'Fearful': <Shield className="text-blue-500" size={16} />
        };
        return icons[emotion] || <Meh size={16} />;
    };

    // Get emotion color
    const getEmotionColor = (emotion: Emotion): string => {
        const colors: Record<Emotion, string> = {
            'Confident': 'bg-green-500',
            'Neutral': 'bg-slate-400',
            'Anxious': 'bg-yellow-500',
            'FOMO': 'bg-orange-500',
            'Revenge': 'bg-red-500',
            'Impatient': 'bg-amber-500',
            'Greedy': 'bg-pink-500',
            'Fearful': 'bg-blue-500'
        };
        return colors[emotion] || 'bg-slate-400';
    };

    if (trades.length < 5) {
        return (
            <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="text-purple-500" size={24} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Psychology Dashboard
                    </h3>
                </div>
                <div className="text-center py-8 text-slate-500">
                    <p>Need at least 5 trades with emotion tags</p>
                    <p className="text-xs mt-2">Log how you feel before/during trades for insights</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="text-purple-500" size={24} />
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        Psychology Dashboard
                    </h3>
                </div>
                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Emotion × Performance
                </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {bestEmotion && (
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-green-500" size={18} />
                            <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                                Best State
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getEmotionIcon(bestEmotion.emotion)}
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {bestEmotion.emotion}
                            </span>
                        </div>
                        <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {(bestEmotion.winRate * 100).toFixed(0)}% WR • {bestEmotion.trades} trades
                        </div>
                    </div>
                )}

                {worstEmotion && worstEmotion.emotion !== bestEmotion?.emotion && (
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="text-red-500" size={18} />
                            <span className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                                Problem State
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getEmotionIcon(worstEmotion.emotion)}
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {worstEmotion.emotion}
                            </span>
                        </div>
                        <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {(worstEmotion.winRate * 100).toFixed(0)}% WR • {worstEmotion.trades} trades
                        </div>
                    </div>
                )}
            </div>

            {/* Emotion Breakdown */}
            <div className="space-y-3">
                <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    Emotion Breakdown
                </div>

                {emotionStats.map(stat => (
                    <div key={stat.emotion} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getEmotionIcon(stat.emotion)}
                                <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'
                                    }`}>
                                    {stat.emotion}
                                </span>
                                <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    ({stat.trades})
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${stat.winRate >= 0.5 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                    {(stat.winRate * 100).toFixed(0)}%
                                </span>
                                <span className={`text-xs ${stat.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    ${stat.totalPnL >= 0 ? '+' : ''}{stat.totalPnL.toFixed(0)}
                                </span>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'
                            }`}>
                            <div
                                className={`h-full transition-all ${getEmotionColor(stat.emotion)}`}
                                style={{ width: `${stat.winRate * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Correlation Insights */}
            {correlations.length > 0 && (
                <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="text-purple-500" size={18} />
                        <span className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                            🧠 Beast Analysis
                        </span>
                    </div>
                    <div className={`text-sm space-y-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {correlations
                            .filter(c => Math.abs(c.correlation) > 0.1)
                            .slice(0, 3)
                            .map(c => (
                                <p key={c.emotion}>
                                    {c.correlation > 0 ? '✅' : '⚠️'} Trading while <strong>{c.emotion.toLowerCase()}</strong> is{' '}
                                    <span className={c.correlation > 0 ? 'text-green-500' : 'text-red-500'}>
                                        {c.correlation > 0 ? '+' : ''}{(c.correlation * 100).toFixed(0)}% {c.correlation > 0 ? 'better' : 'worse'}
                                    </span> than average
                                </p>
                            ))}
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className={`mt-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                💡 Tip: Tag your emotional state before entering trades for better self-awareness
            </div>
        </div>
    );
};

export default PsychologyDashboard;

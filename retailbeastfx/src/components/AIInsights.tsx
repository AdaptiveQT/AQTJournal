'use client';

import React, { useState, useMemo } from 'react';
import { X, Brain, Copy, Check, ExternalLink, Sparkles, ClipboardCopy } from 'lucide-react';

interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    pnl: number;
    setup: string;
    emotion: string;
    date: string;
    time: string;
    notes?: string;
}

interface ShareWithLLMProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode?: boolean;
    trades: Trade[];
    stats: {
        winRate: number;
        profitFactor: number;
        expectancy: number;
        totalPnL: number;
    };
}

const LLM_LINKS = [
    { name: 'ChatGPT', url: 'https://chat.openai.com/', color: 'from-green-500 to-green-600' },
    { name: 'Claude', url: 'https://claude.ai/', color: 'from-orange-500 to-orange-600' },
    { name: 'Gemini', url: 'https://gemini.google.com/', color: 'from-blue-500 to-purple-600' },
    { name: 'Grok', url: 'https://grok.com/', color: 'from-slate-600 to-slate-800' },
];

function formatTradeDataForLLM(trades: Trade[], stats: { winRate: number; profitFactor: number; expectancy: number; totalPnL: number }): string {
    // Group by setup
    const bySetup: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        const setup = t.setup || 'Unknown';
        if (!bySetup[setup]) bySetup[setup] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) bySetup[setup].wins++;
        else bySetup[setup].losses++;
        bySetup[setup].pnl += t.pnl;
    });

    // Group by emotion
    const byEmotion: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        const emotion = t.emotion || 'Unknown';
        if (!byEmotion[emotion]) byEmotion[emotion] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) byEmotion[emotion].wins++;
        else byEmotion[emotion].losses++;
        byEmotion[emotion].pnl += t.pnl;
    });

    // Group by time of day
    const bySession: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        if (!t.time) return;
        const hour = parseInt(t.time.split(':')[0], 10);
        const session = hour < 12 ? 'Morning (pre-12pm)' : hour < 17 ? 'Afternoon (12-5pm)' : 'Evening (after 5pm)';
        if (!bySession[session]) bySession[session] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) bySession[session].wins++;
        else bySession[session].losses++;
        bySession[session].pnl += t.pnl;
    });

    // Group by pair
    const byPair: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.forEach(t => {
        const pair = t.pair || 'Unknown';
        if (!byPair[pair]) byPair[pair] = { wins: 0, losses: 0, pnl: 0 };
        if (t.pnl > 0) byPair[pair].wins++;
        else byPair[pair].losses++;
        byPair[pair].pnl += t.pnl;
    });

    // Recent trades
    const recentTrades = trades.slice(0, 15).map(t =>
        `${t.date} | ${t.pair} ${t.direction} | ${t.setup} | ${t.emotion} | $${t.pnl.toFixed(2)}`
    ).join('\n');

    return `I'm a forex/futures trader looking to improve my performance. Please analyze my trading data and provide actionable insights.

=== MY TRADING STATISTICS ===
Total Trades: ${trades.length}
Win Rate: ${stats.winRate.toFixed(1)}%
Profit Factor: ${stats.profitFactor.toFixed(2)}
Expectancy per Trade: $${stats.expectancy.toFixed(2)}
Total P&L: $${stats.totalPnL.toFixed(2)}

=== PERFORMANCE BY SETUP ===
${Object.entries(bySetup).map(([setup, data]) => {
        const wr = ((data.wins / (data.wins + data.losses)) * 100).toFixed(1);
        return `${setup}: ${data.wins}W/${data.losses}L (${wr}% WR), P&L: $${data.pnl.toFixed(2)}`;
    }).join('\n')}

=== PERFORMANCE BY EMOTION STATE ===
${Object.entries(byEmotion).map(([emotion, data]) => {
        const wr = ((data.wins / (data.wins + data.losses)) * 100).toFixed(1);
        return `${emotion}: ${data.wins}W/${data.losses}L (${wr}% WR), P&L: $${data.pnl.toFixed(2)}`;
    }).join('\n')}

=== PERFORMANCE BY SESSION ===
${Object.entries(bySession).map(([session, data]) => {
        const wr = ((data.wins / (data.wins + data.losses)) * 100).toFixed(1);
        return `${session}: ${data.wins}W/${data.losses}L (${wr}% WR), P&L: $${data.pnl.toFixed(2)}`;
    }).join('\n')}

=== PERFORMANCE BY PAIR ===
${Object.entries(byPair).slice(0, 10).map(([pair, data]) => {
        const wr = ((data.wins / (data.wins + data.losses)) * 100).toFixed(1);
        return `${pair}: ${data.wins}W/${data.losses}L (${wr}% WR), P&L: $${data.pnl.toFixed(2)}`;
    }).join('\n')}

=== RECENT TRADES (Last 15) ===
${recentTrades}

Based on this data, please provide:
1. My 3 biggest strengths as a trader
2. My 3 biggest weaknesses or areas for improvement
3. Patterns you notice (emotional, timing, setup-related)
4. 5 specific, actionable recommendations to improve my trading
5. Which setups I should focus on vs avoid

Be specific and data-driven in your analysis.`;
}

const ShareWithLLM: React.FC<ShareWithLLMProps> = ({
    isOpen,
    onClose,
    darkMode = false,
    trades,
    stats,
}) => {
    const [copied, setCopied] = useState(false);

    const prompt = useMemo(() => {
        return formatTradeDataForLLM(trades, stats);
    }, [trades, stats]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                                <Brain size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    Share with AI
                                    <Sparkles size={20} className="text-purple-400" />
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Copy your trading data to analyze with any AI
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                    {/* Trade Count Info */}
                    {trades.length < 5 ? (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                            You need at least 5 trades for meaningful analysis. Currently: {trades.length} trades.
                        </div>
                    ) : (
                        <>
                            {/* Quick Stats */}
                            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-purple-500">{trades.length}</div>
                                        <div className="text-xs text-slate-500">Trades</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-500">{stats.winRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-500">Win Rate</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-500">{stats.profitFactor.toFixed(2)}</div>
                                        <div className="text-xs text-slate-500">Profit Factor</div>
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ${stats.totalPnL.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-slate-500">Total P&L</div>
                                    </div>
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className={`w-full p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-400 hover:to-pink-500 hover:scale-[1.02]'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={20} />
                                        Copied to Clipboard!
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy size={20} />
                                        Copy Analysis Prompt
                                    </>
                                )}
                            </button>

                            {/* LLM Links */}
                            <div className="mt-6">
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    Open your favorite AI and paste:
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {LLM_LINKS.map(llm => (
                                        <a
                                            key={llm.name}
                                            href={llm.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-3 rounded-xl bg-gradient-to-r ${llm.color} text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                                        >
                                            {llm.name}
                                            <ExternalLink size={14} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6">
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                                    <span>Prompt Preview</span>
                                    <span className="text-xs">{prompt.length} characters</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 max-h-48 overflow-y-auto">
                                    <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700 dark:text-slate-300">
                                        {prompt}
                                    </pre>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareWithLLM;

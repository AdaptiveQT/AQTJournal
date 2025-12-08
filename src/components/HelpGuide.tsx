'use client';

import React, { useState } from 'react';
import { X, BookOpen, Search, ChevronRight, Zap, BarChart2, Settings, HelpCircle, Upload, Database, Target, TrendingUp } from 'lucide-react';

interface HelpGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState<string>('quick-start');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const sections = [
        { id: 'quick-start', title: 'Quick Start', icon: Zap },
        { id: 'setup', title: 'Account Setup', icon: Settings },
        { id: 'analytics', title: 'Analytics Dashboard', icon: BarChart2 },
        { id: 'import', title: 'Import Trades', icon: Upload },
        { id: 'modes', title: 'Flip vs Pro Mode', icon: Target },
        { id: 'tips', title: 'Tips for Success', icon: HelpCircle },
    ];

    const content: Record<string, { title: string; sections: { subtitle: string; content: string[] }[] }> = {
        'quick-start': {
            title: 'Quick Start (3 Steps)',
            sections: [
                {
                    subtitle: 'Get Started in 60 Seconds',
                    content: [
                        '**1. Set Your Account Balance** - First thing you\'ll see is the account setup modal',
                        '**2. Load Data** - Choose Demo Data (100 sample trades) or Import from MT4/MT5',
                        '**3. Explore Analytics** - See Expectancy, Session Heatmaps, and R-Multiple charts',
                    ]
                },
                {
                    subtitle: 'New User Checklist',
                    content: [
                        '✓ Add your first trade (or load demo data)',
                        '✓ Tag a setup type (Breakout, Pullback, etc.)',
                        '✓ View your analytics dashboard',
                        '',
                        '💡 **Tip**: Complete all 3 steps to unlock the full experience!'
                    ]
                }
            ]
        },
        'setup': {
            title: 'Account Setup',
            sections: [
                {
                    subtitle: 'Setting Your Balance',
                    content: [
                        'Your account balance is critical for:',
                        '**Risk Calculations** - % risk per trade',
                        '**Position Sizing** - Lot size recommendations',
                        '**Performance Metrics** - ROI tracking',
                        '',
                        '💡 Use the quick-select buttons: $1K, $5K, $10K, $25K, $50K, $100K'
                    ]
                },
                {
                    subtitle: 'Sign In Options',
                    content: [
                        '**Anonymous** - Data saves to browser only',
                        '**Google Sign-In** - Syncs across all devices',
                        '**Twitter Sign-In** - Same sync benefits',
                        '',
                        '⚠️ If you start anonymously and later sign in, your data is preserved!'
                    ]
                }
            ]
        },
        'analytics': {
            title: 'Analytics Dashboard',
            sections: [
                {
                    subtitle: 'Expectancy by Setup',
                    content: [
                        'Shows the statistical edge of each trading setup:',
                        '**Formula**: E = (Win% × Avg Win) - (Loss% × Avg Loss)',
                        '**Positive Expectancy** = You have an edge',
                        '**Negative Expectancy** = Review or drop this setup',
                        '',
                        '💡 Focus trades on your highest expectancy setups!'
                    ]
                },
                {
                    subtitle: 'Session Heatmap',
                    content: [
                        'Win rate visualization across trading sessions:',
                        '**Asia/Tokyo** - 02:00-06:00 UTC',
                        '**London** - 08:00-12:00 UTC',
                        '**New York** - 14:00-18:00 UTC',
                        '',
                        'Color coding: Green = >55% win rate, Red = <45%'
                    ]
                },
                {
                    subtitle: 'R-Multiple ECDF',
                    content: [
                        'Cumulative distribution of your trade outcomes:',
                        '**Median (P50)** - Your typical trade result',
                        '**P(R ≤ -1)** - Probability of full loss',
                        '**P(R ≥ 2)** - Probability of 2R+ winners',
                        '',
                        '💡 A positive P50 means you have a statistical edge!'
                    ]
                },
                {
                    subtitle: 'Calendar View',
                    content: [
                        'Visual trading calendar showing:',
                        '**Green days** - Profitable trading days',
                        '**Red days** - Loss days',
                        '**Win/Loss count** - Daily breakdown',
                        '',
                        'Navigate months with arrow buttons or click "Today"'
                    ]
                }
            ]
        },
        'import': {
            title: 'Import Trades',
            sections: [
                {
                    subtitle: 'Supported Formats',
                    content: [
                        '**CSV files** - Comma, semicolon, or tab separated',
                        '**MT4/MT5 HTML** - Trade history export',
                        '**TXT files** - Text-based trade data',
                    ]
                },
                {
                    subtitle: 'Import Wizard Steps',
                    content: [
                        '**1. Upload** - Drag & drop or click to select file',
                        '**2. Map Columns** - Auto-detected, manually adjust if needed',
                        '**3. Validate** - Review errors and warnings',
                        '**4. Import** - Confirm and add to your journal',
                        '',
                        '💡 Required fields: Symbol, Direction, Entry, P&L'
                    ]
                },
                {
                    subtitle: 'Common Issues',
                    content: [
                        '**Missing columns** - Ensure headers match (Pair, Direction, Entry, PnL)',
                        '**Date format** - Use YYYY-MM-DD or MM/DD/YYYY',
                        '**Direction values** - Use Long/Short, Buy/Sell, or 1/-1',
                    ]
                }
            ]
        },
        'modes': {
            title: 'Flip Mode vs Pro Mode',
            sections: [
                {
                    subtitle: 'Flip Mode 🚀',
                    content: [
                        '**Best For**: Beginners, Small Accounts',
                        '**Interface**: Simplified and focused',
                        '**Daily Trade Limit**: 3 trades/day',
                        '**Daily Goal Lock**: Stops trading when goal reached',
                        '**Readiness Check**: Morning checklist before trading',
                    ]
                },
                {
                    subtitle: 'Pro Mode 📊',
                    content: [
                        '**Best For**: Experienced Traders',
                        '**Interface**: Full analytics dashboard',
                        '**Trade Limit**: Unlimited',
                        '**Features**: Expectancy charts, Session heatmaps, Import wizard',
                        '**Tier System**: 9 levels from Survival to Legend',
                    ]
                },
                {
                    subtitle: 'How to Switch',
                    content: [
                        'Click the mode toggle in the **top-right header**',
                        '**Flip Mode**: Blue gradient with ⚡ icon',
                        '**Pro Mode**: Gray button with 📊 icon',
                        '',
                        'Your preference is saved automatically.'
                    ]
                }
            ]
        },
        'tips': {
            title: 'Tips for Success',
            sections: [
                {
                    subtitle: 'Trading Psychology',
                    content: [
                        '✓ **Log emotions honestly** - Patterns reveal trading psychology',
                        '✓ **Respect daily limits** - Overtrading destroys accounts',
                        '✓ **Review weekly** - What setups are working?',
                        '✓ **Focus on R-multiples** - Not just win/loss',
                    ]
                },
                {
                    subtitle: 'Using Analytics',
                    content: [
                        '✓ **Drop negative expectancy setups** - Data doesn\'t lie',
                        '✓ **Trade your best sessions** - Use the heatmap',
                        '✓ **Target 2R+ winners** - Let winners run',
                        '✓ **Cut losers at 1R** - Protect your capital',
                    ]
                },
                {
                    subtitle: 'Journal Best Practices',
                    content: [
                        '✓ **Log immediately** - Don\'t wait until end of day',
                        '✓ **Be consistent** - Every trade, every time',
                        '✓ **Use notes** - Write what you learned',
                        '✓ **Tag accurately** - Setup, emotion, session',
                    ]
                }
            ]
        },
    };

    const currentContent = content[activeSection];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <BookOpen size={28} className="text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">AQT User Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-56 border-r border-white/10 p-3 overflow-y-auto">
                        <div className="mb-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-800 rounded-lg text-white text-sm border border-slate-600 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${activeSection === section.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        <span className="text-sm font-medium">{section.title}</span>
                                        {activeSection === section.id && (
                                            <ChevronRight size={14} className="ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <h1 className="text-2xl font-bold text-white mb-5">{currentContent.title}</h1>

                        <div className="space-y-6">
                            {currentContent.sections.map((section, idx) => (
                                <div key={idx}>
                                    {section.subtitle && (
                                        <h2 className="text-lg font-bold text-blue-400 mb-2">{section.subtitle}</h2>
                                    )}
                                    <div className="space-y-1.5 text-slate-300 text-sm">
                                        {section.content.map((line, lineIdx) => {
                                            if (line === '') {
                                                return <div key={lineIdx} className="h-2" />;
                                            }

                                            // Parse markdown-style bold
                                            const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                            return (
                                                <p key={lineIdx} className="leading-relaxed">
                                                    {parts.map((part, partIdx) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={partIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                                        }
                                                        return <span key={partIdx}>{part}</span>;
                                                    })}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-blue-200 text-sm">
                                💡 <strong>New Features:</strong> Expectancy by Setup • Session Heatmaps • R-Multiple ECDF • CSV/MT4 Import • Calendar View
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;

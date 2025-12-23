'use client';

import React, { useState } from 'react';
import { X, BookOpen, Search, ChevronRight, Zap, BarChart2, Settings, HelpCircle, Upload, Target, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

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
        { id: 'trade-entry', title: 'Logging Trades', icon: DollarSign },
        { id: 'accounts', title: 'Account Management', icon: Users },
        { id: 'analytics', title: 'Analytics Dashboard', icon: BarChart2 },
        { id: 'import', title: 'Import Trades', icon: Upload },
        { id: 'modes', title: 'Flip vs Pro Mode', icon: Target },
        { id: 'calendar', title: 'Calendar & Streaks', icon: Calendar },
        { id: 'settings', title: 'Settings', icon: Settings },
        { id: 'tips', title: 'Tips for Success', icon: HelpCircle },
    ];

    const content: Record<string, { title: string; sections: { subtitle: string; content: string[] }[] }> = {
        'quick-start': {
            title: 'Quick Start (3 Steps)',
            sections: [
                {
                    subtitle: 'Get Started in 60 Seconds',
                    content: [
                        '**1. Set Your Account Balance** - Click the balance card and enter your starting balance',
                        '**2. Add Your First Trade** - Use the Trade Entry form with Pair, Direction, Entry, Exit, Lots, and Setup',
                        '**3. Explore Analytics** - Click the Analytics icon (📊) to see charts and insights',
                    ]
                },
                {
                    subtitle: 'New User Checklist',
                    content: [
                        '✓ Add your first trade (or click "Load Demo Data" to explore)',
                        '✓ Select a setup type (Breakout, Pullback, Trend, etc.)',
                        '✓ View your analytics dashboard',
                        '',
                        '💡 **Tip**: Load Demo Data first to see how everything works!'
                    ]
                }
            ]
        },
        'trade-entry': {
            title: 'Logging Trades',
            sections: [
                {
                    subtitle: 'Trade Entry Fields',
                    content: [
                        '**Pair** - The currency pair or symbol (e.g., EURUSD, XAUUSD, US30)',
                        '**Direction** - Long (Buy) or Short (Sell)',
                        '**Entry** - Your entry price',
                        '**Exit** - Your exit/close price',
                        '**Lots** - Position size (leave blank to use recommended)',
                        '**Setup** - The strategy used: Breakout, Pullback, Reversal, Trend, Range, Scalp, News, or Other',
                    ]
                },
                {
                    subtitle: 'Live P&L Preview',
                    content: [
                        'The **Live Preview** shows your estimated P&L before you submit:',
                        '• Green = Profit, Red = Loss',
                        '• Shows both dollar amount and R-multiple',
                        '• R-multiple = Profit ÷ Risk (based on 1% account risk)',
                        '',
                        '💡 **Tip**: Press Enter in each field to move to the next one quickly'
                    ]
                },
                {
                    subtitle: 'Setup Categories',
                    content: [
                        '**Breakout** - Price breaks through support/resistance',
                        '**Pullback** - Entry on a retracement in the trend',
                        '**Reversal** - Trading a market direction change',
                        '**Trend** - Following the established trend',
                        '**Range** - Trading inside consolidation zones',
                        '**Scalp** - Quick in-and-out trades',
                        '**News** - Event-driven trades',
                        '**Other** - Custom strategies (SMC, ICT, Wyckoff, etc.)',
                    ]
                }
            ]
        },
        'accounts': {
            title: 'Account Management',
            sections: [
                {
                    subtitle: 'Multiple Accounts',
                    content: [
                        'RetailBeastFX supports **multiple trading accounts**:',
                        '• Click the **Account Manager** button (person icon) in the header',
                        '• Add accounts with different brokers and starting balances',
                        '• Switch between accounts to see separate trade history',
                        '',
                        '💡 Each account tracks its own balance, trades, and analytics'
                    ]
                },
                {
                    subtitle: 'Setting Your Balance',
                    content: [
                        'Your account balance is used for:',
                        '**Risk Calculations** - % risk per trade',
                        '**Lot Size Recommendations** - Position sizing',
                        '**Performance Metrics** - ROI and growth tracking',
                        '',
                        'Quick-select buttons: $1K, $5K, $10K, $25K, $50K, $100K'
                    ]
                },
                {
                    subtitle: 'Cloud Sync',
                    content: [
                        '**Anonymous** - Data saves to browser only (localStorage)',
                        '**Google Sign-In** - Syncs across all devices via Firebase',
                        '**Twitter Sign-In** - Same cloud sync benefits',
                        '',
                        '⚠️ Sign in to backup your data! Anonymous data can be lost if you clear browser data.'
                    ]
                }
            ]
        },
        'analytics': {
            title: 'Analytics Dashboard',
            sections: [
                {
                    subtitle: 'Overview Cards',
                    content: [
                        '**Win Rate** - Percentage of winning trades',
                        '**Profit Factor** - Gross profits ÷ Gross losses (>1.5 is good)',
                        '**Best Trade** - Your largest winning trade',
                        '**Worst Trade** - Your largest losing trade',
                    ]
                },
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
                        'Win rate by trading session and hour:',
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
                }
            ]
        },
        'import': {
            title: 'Import Trades',
            sections: [
                {
                    subtitle: 'Supported Formats',
                    content: [
                        '**MT4/MT5 HTML** - Trade history export (recommended)',
                        '**CSV files** - Comma, semicolon, or tab separated',
                        '**TXT files** - Text-based trade data',
                    ]
                },
                {
                    subtitle: 'How to Export from MT5',
                    content: [
                        '1. Open MT5 → History tab (bottom panel)',
                        '2. Right-click → Select "All History" or date range',
                        '3. Right-click again → **Report → Open XML (Excel)**',
                        '4. Or: Right-click → **Report → HTML (Detailed)**',
                        '5. Import the saved file in RetailBeastFX',
                    ]
                },
                {
                    subtitle: 'Import Wizard Steps',
                    content: [
                        '**1. Upload** - Drag & drop or click to select file',
                        '**2. Map Columns** - Auto-detected, adjust if needed',
                        '**3. Validate** - Review detected trades and errors',
                        '**4. Import** - Confirm and add to your journal',
                        '',
                        '💡 Required: Symbol, Direction, P&L. Date/time optional.'
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
                        '**Best For**: Beginners, Small Accounts ($25-$200)',
                        '**Goal**: Flip a small account into a larger one',
                        '',
                        '**Features**:',
                        '• Daily profit goal tracking',
                        '• Daily loss limit protection',
                        '• Readiness checklist before trading',
                        '• Progress bar to target balance',
                    ]
                },
                {
                    subtitle: 'Pro Mode 📊',
                    content: [
                        '**Best For**: Experienced Traders, Larger Accounts',
                        '**Goal**: Detailed analytics and performance tracking',
                        '',
                        '**Features**:',
                        '• Full analytics dashboard',
                        '• Expectancy charts by setup',
                        '• Session heatmaps',
                        '• Import wizard',
                        '• No trade limits',
                    ]
                },
                {
                    subtitle: 'How to Switch',
                    content: [
                        'Click the **Flip Mode / Pro Mode** toggle in the header',
                        '• Flip Mode: Blue button with ⚡ icon',
                        '• Pro Mode: Shows full dashboard',
                        '',
                        'Your preference is saved automatically.'
                    ]
                }
            ]
        },
        'calendar': {
            title: 'Calendar & Streaks',
            sections: [
                {
                    subtitle: 'Trading Calendar',
                    content: [
                        'Visual overview of your trading performance:',
                        '**Green days** - Profitable trading days',
                        '**Red days** - Loss days',
                        '**Dot indicators** - Trade count and performance',
                        '',
                        'Click any day to see trades from that date'
                    ]
                },
                {
                    subtitle: 'Profit Streak',
                    content: [
                        'Tracks consecutive profitable days:',
                        '**Current Streak** - How many days in a row you\'ve been profitable',
                        '**Achievements** - Badges for milestones (10 trades, 50 trades, etc.)',
                        '',
                        '💡 Focus on consistency, not just big wins!'
                    ]
                },
                {
                    subtitle: 'Weekly & Monthly Goals',
                    content: [
                        'Track progress toward your profit targets:',
                        '• Set weekly and monthly dollar goals',
                        '• Progress bars show how close you are',
                        '• Automatically resets each week/month',
                    ]
                }
            ]
        },
        'settings': {
            title: 'Settings',
            sections: [
                {
                    subtitle: 'Display Settings',
                    content: [
                        '**Dark Mode** - Toggle between light and dark themes',
                        '**Compact View** - Reduce spacing for more data on screen',
                    ]
                },
                {
                    subtitle: 'Trading Settings',
                    content: [
                        '**Default Risk %** - Risk per trade for lot size calculation',
                        '**Broker** - Your broker (affects pip value calculations)',
                        '**Leverage** - Account leverage (affects margin calculations)',
                    ]
                },
                {
                    subtitle: 'Goals (Extended)',
                    content: [
                        '**Weekly Goal** - Dollar target per week',
                        '**Monthly Goal** - Dollar target per month',
                        '',
                        'Enable "Show Extended Goals" in settings to display these'
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
                        '✓ **Log emotions honestly** - Patterns reveal psychology issues',
                        '✓ **Respect daily limits** - Overtrading kills accounts',
                        '✓ **Review weekly** - What setups are working?',
                        '✓ **Focus on R-multiples** - Not just win/loss count',
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
                        '✓ **Add notes** - Write what you learned on each trade',
                        '✓ **Screenshot charts** - Upload trade images for review',
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
                        <h2 className="text-2xl font-bold text-white">RetailBeastFX User Guide</h2>
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
                                💡 <strong>v2.8 Features:</strong> Multi-Account Support • Expectancy by Setup • Session Heatmaps • MT5 Import • Calendar View • Profit Streaks
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;

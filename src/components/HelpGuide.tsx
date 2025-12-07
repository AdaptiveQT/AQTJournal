'use client';

import React, { useState } from 'react';
import { X, BookOpen, Search, ChevronRight, Home, Zap, BarChart2, Settings, HelpCircle } from 'lucide-react';

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
        { id: 'setup', title: 'First Time Setup', icon: Settings },
        { id: 'modes', title: 'Choosing Your Mode', icon: BarChart2 },
        { id: 'flip-mode', title: 'Flip Mode Guide', icon: Zap },
        { id: 'pro-mode', title: 'Pro Mode Guide', icon: BarChart2 },
        { id: 'tips', title: 'Tips for Success', icon: HelpCircle },
    ];

    const content: Record<string, { title: string; sections: { subtitle: string; content: string[] }[] }> = {
        'quick-start': {
            title: 'Quick Start (3 Steps)',
            sections: [
                {
                    subtitle: '',
                    content: [
                        '1. **Open the app** - You\'re already here!',
                        '2. **Choose your mode** - Click "Flip Mode" for simplified beginner experience, or stay in "Pro Mode" for full features',
                        '3. **Start trading** - Log your first trade and track your journey!',
                    ]
                }
            ]
        },
        'setup': {
            title: 'First Time Setup',
            sections: [
                {
                    subtitle: 'Step 1: Sign In (Optional but Recommended)',
                    content: [
                        '**Start Anonymously** - Data saves to browser only',
                        '**Sign in with Google** - Data syncs across all devices',
                        '**Sign in with Twitter** - Same benefits as Google',
                        '',
                        '💡 **Tip**: If you start anonymously and later sign in, your data will be preserved!'
                    ]
                },
                {
                    subtitle: 'Step 2: Initial Configuration (Pro Mode Only)',
                    content: [
                        '**Balance** - Your starting account balance (default: $1000)',
                        '**Broker** - Select from IC Markets, Pepperstone, HankoTrade, Coinexx, or Prop Firm',
                        '**Risk Mode** - SAFE (50% position size) or AGGR (100% position size)',
                        '',
                        '⚠️ **Beginners**: Skip this by switching to Flip Mode!'
                    ]
                }
            ]
        },
        'modes': {
            title: 'Choosing Your Mode',
            sections: [
                {
                    subtitle: 'Flip Mode 🚀',
                    content: [
                        '**Best For**: Beginners, Small Accounts',
                        '**Interface**: Simplified and focused',
                        '**Daily Trade Limit**: 3 trades/day',
                        '**Daily Goal Lock**: Mandatory (stops you when goal hit)',
                        '**Configuration**: Hidden (auto-safe mode)',
                        '**Readiness Check**: Yes (daily checklist)',
                    ]
                },
                {
                    subtitle: 'Pro Mode 📊',
                    content: [
                        '**Best For**: Experienced Traders',
                        '**Interface**: Full-featured with all analytics',
                        '**Daily Trade Limit**: Unlimited* (*10 for free, unlimited for Pro)',
                        '**Daily Goal Lock**: None',
                        '**Configuration**: Fully customizable',
                        '**Analytics**: Deep setup performance charts',
                    ]
                },
                {
                    subtitle: 'How to Switch',
                    content: [
                        'Look for the mode toggle button in the **top-right header**',
                        '**Flip Mode**: Blue/purple gradient with ⚡ icon',
                        '**Pro Mode**: Gray button with 📊 icon',
                        '',
                        'Click to toggle anytime. Your preference is saved automatically.'
                    ]
                }
            ]
        },
        'flip-mode': {
            title: 'Flip Mode Guide',
            sections: [
                {
                    subtitle: '1. Morning Readiness Check ✅',
                    content: [
                        'First time each day, you\'ll see a checklist:',
                        '✓ Did you sleep 7+ hours?',
                        '✓ Have you reviewed yesterday\'s trades?',
                        '✓ Do you know your trading plan?',
                        '✓ Are you emotionally neutral?',
                        '',
                        '💡 You cannot trade until you check all required boxes'
                    ]
                },
                {
                    subtitle: '2. Log Your Trades 📝',
                    content: [
                        '**Pair**: Currency pair (e.g., EURUSD)',
                        '**Direction**: Long or Short',
                        '**Entry**: Your entry price',
                        '**Exit**: Your exit price',
                        '**Setup**: Trade type (Breakout, Reversal, etc.)',
                        '**Emotion**: How you felt (Calm, FOMO, etc.)',
                        '',
                        '⚠️ **Limit**: Max 3 trades per day'
                    ]
                },
                {
                    subtitle: '3. Protection Systems 🛡️',
                    content: [
                        '**Daily Goal Lock** - When you hit your goal, green celebration appears. Only option: "I\'m Done For Today" (logs you out)',
                        '',
                        '**Max Loss Warning** - When you lose 5% in one day, red warning appears. You can override, but it\'s discouraged.',
                        '',
                        '**Why?** Prevents overtrading and revenge trading'
                    ]
                },
                {
                    subtitle: '4. Track Your Progress 📈',
                    content: [
                        '**Flip Progress** - Visual bar from Start → Current → Target',
                        '**Compound Calculator** - See how daily % gains compound',
                        '**Actionable Insight** - Shows your best performing setup',
                    ]
                }
            ]
        },
        'pro-mode': {
            title: 'Pro Mode Guide',
            sections: [
                {
                    subtitle: 'Configuration Section ⚙️',
                    content: [
                        '**Balance** - Current account size (editable anytime)',
                        '**Broker** - Choose from 5 supported brokers',
                        '**Risk Mode** - SAFE (50%) or AGGR (100%)',
                    ]
                },
                {
                    subtitle: 'Tier System 📊',
                    content: [
                        'Your account progresses through 9 tiers:',
                        '**SURVIVAL** ($10-$19) - 2 pairs',
                        '**BUILDING** ($20-$49) - 3 pairs',
                        '**SCALING** ($50-$99) - 4 pairs',
                        '**GROWTH** ($100-$249) - 5 pairs',
                        '**EXPANSION** ($250-$499) - 6 pairs',
                        '**ADVANCED** ($500-$999) - 7 pairs',
                        '**MASTERY** ($1,000-$2,499) - 8 pairs',
                        '**ELITE** ($2,500-$4,999) - 10 pairs',
                        '**LEGEND** ($5,000+) - 12 pairs',
                        '',
                        'Each tier auto-calculates your position size and risk.'
                    ]
                },
                {
                    subtitle: 'Analytics 📈',
                    content: [
                        '**Setup Performance Chart** - Bar chart showing win rate by setup',
                        '**Full Trade History** - View all trades, not just today\'s',
                        '**Export Reports** - Generate .txt performance reports',
                        '',
                        '🔒 Requires Pro subscription ($15/month)'
                    ]
                }
            ]
        },
        'tips': {
            title: 'Tips for Success',
            sections: [
                {
                    subtitle: 'For Flip Mode Users',
                    content: [
                        '✓ **Respect the Daily Goal Lock** - When it appears, STOP trading',
                        '✓ **Don\'t Override Max Loss** - If you hit 5%, step away',
                        '✓ **Complete Readiness Check Honestly** - Trading tired = bad decisions',
                        '✓ **Focus on Your Best Setup** - Double down on what works',
                        '✓ **Set Realistic Goals** - 1-2% daily is more sustainable than 5%',
                    ]
                },
                {
                    subtitle: 'For Pro Mode Users',
                    content: [
                        '✓ **Track Your Tiers** - Each tier doubles earning potential',
                        '✓ **Use Safe Mode During Drawdowns** - Protect capital after 2 red days',
                        '✓ **Review Analytics Weekly** - Eliminate losing setups',
                        '✓ **Tag Emotions Honestly** - Your data reveals patterns',
                        '✓ **Export Reports Monthly** - Track long-term progress',
                    ]
                },
                {
                    subtitle: 'General Tips',
                    content: [
                        '✓ **Be honest with trade tags** - Accurate data = better insights',
                        '✓ **Don\'t edit trades after logging** - First log is true log',
                        '✓ **Review yesterday\'s trades daily** - Learn from wins and losses',
                        '✓ **Upgrade to Pro for unlimited trades** - Free tier: 10 trades, Pro: unlimited',
                    ]
                }
            ]
        },
    };

    const currentContent = content[activeSection];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
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
                    <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
                        <div className="mb-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-slate-800 rounded-lg text-white text-sm border border-slate-600 focus:border-blue-500 outline-none"
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
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${activeSection === section.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm font-medium">{section.title}</span>
                                        {activeSection === section.id && (
                                            <ChevronRight size={16} className="ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <h1 className="text-3xl font-bold text-white mb-6">{currentContent.title}</h1>

                        <div className="space-y-8">
                            {currentContent.sections.map((section, idx) => (
                                <div key={idx}>
                                    {section.subtitle && (
                                        <h2 className="text-xl font-bold text-blue-400 mb-3">{section.subtitle}</h2>
                                    )}
                                    <div className="space-y-2 text-slate-300">
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
                        <div className="mt-12 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-blue-200 text-sm">
                                💡 <strong>Need more help?</strong> Check the full USER_GUIDE.md file in your project folder for detailed information, FAQs, and keyboard shortcuts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;

'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#0a0f18] text-gray-200 font-sans selection:bg-[#00ff9d] selection:text-black">
            {/* Navigation */}
            <nav className="border-b border-gray-800/50 backdrop-blur-md fixed top-0 w-full z-50 bg-[#0a0f18]/80">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff9d] to-[#00cc7a] flex items-center justify-center text-black font-bold text-lg">
                            B
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">RetailBeast<span className="text-[#00ff9d]">FX</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#rules" className="hover:text-white transition-colors">The Protocol</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <Link href="/journal" className="hover:text-[#00ff9d] transition-colors">Journal Login</Link>
                    </div>

                    <div className="hidden md:block">
                        <Link href="/get-started" className="bg-[#00ff9d] text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#00cc7a] transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)]">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-800 bg-[#0a0f18] absolute w-full left-0 top-16 p-4 flex flex-col gap-4 shadow-2xl animate-fade-in-up">
                        <a href="#features" className="text-gray-400 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#rules" className="text-gray-400 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(false)}>The Protocol</a>
                        <a href="#pricing" className="text-gray-400 hover:text-white p-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        <Link href="/journal" className="text-gray-400 hover:text-[#00ff9d] p-2" onClick={() => setIsMobileMenuOpen(false)}>Journal Login</Link>
                        <Link href="/get-started" className="bg-[#00ff9d] text-black px-5 py-3 rounded-lg text-sm font-bold hover:bg-[#00cc7a] text-center" onClick={() => setIsMobileMenuOpen(false)}>
                            Get Started
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00ff9d] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] text-sm font-bold mb-6 animate-fade-in-up">
                                <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
                                v9.0 PROTOCOL • FULLY INTEGRATED
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up delay-100">
                                The ICT System
                                <br />
                                <span className="text-[#00ff9d]">That Shows You Everything</span>
                            </h1>

                            <p className="text-xl text-gray-300 mb-8 animate-fade-in-up delay-200">
                                Real-time ORB breakouts. Supply/Demand zones. Big-screen alerts.
                                Professional journal. All in one system.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-300">
                                <a href="#see-it-live" className="bg-[#00ff9d] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_30px_rgba(0,255,157,0.3)] text-center">
                                    See It Live →
                                </a>
                                <Link href="/journal" className="px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-center">
                                    Try Journal Free
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-500 animate-fade-in-up delay-400">
                                <span className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span> No AI predictions
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span> Just pure ICT
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span> Automated execution
                                </span>
                            </div>
                        </div>

                        {/* Right: Screenshot */}
                        <div className="relative animate-fade-in-up delay-500">
                            <img
                                src="/screenshots/hero-chart.png"
                                alt="RetailBeastFX Dashboard"
                                className="rounded-xl border border-gray-700 shadow-2xl w-full"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-black/90 border border-[#00ff9d]/50 rounded-lg p-4 backdrop-blur">
                                <p className="text-[#00ff9d] font-bold text-sm">Live on TradingView</p>
                                <p className="text-gray-400 text-xs">Works on MT4/MT5 too</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* See It In Action Section */}
            <section id="see-it-live" className="py-20 bg-[#0a0f18]">
                <div className="container mx-auto px-6 max-w-6xl">

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            See It <span className="text-[#00ff9d]">In Action</span>
                        </h2>
                        <p className="text-gray-400">
                            This is what RetailBeastFX looks like on a live chart. No marketing fluff. Just screenshots.
                        </p>
                    </div>

                    {/* Screenshot Gallery */}
                    <div className="space-y-12">

                        {/* Screenshot 1: Full Chart View */}
                        <div className="bg-[#111827] rounded-2xl p-8 border border-gray-800">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Complete Market View
                                </h3>
                                <p className="text-gray-400">
                                    Dashboard, ORB lines, S/D zones, entry signals—all visible at once.
                                </p>
                            </div>
                            <img
                                src="/screenshots/indicator-dashboard.png"
                                alt="RetailBeastFX Full Chart"
                                className="rounded-lg border border-gray-700 w-full"
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-[#00ff9d]/10 text-[#00ff9d] text-xs rounded-full">ORB Breakout</span>
                                <span className="px-3 py-1 bg-[#00ff9d]/10 text-[#00ff9d] text-xs rounded-full">Supply/Demand Zones</span>
                                <span className="px-3 py-1 bg-[#00ff9d]/10 text-[#00ff9d] text-xs rounded-full">Trend Filter</span>
                            </div>
                        </div>

                        {/* Screenshot 2: Big Alert */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Big Screen Alerts
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        When a bearish pullback happens, you see it immediately.
                                        No squinting at tiny labels.
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-400">
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#00ff9d]">✓</span>
                                            Clear action instructions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#00ff9d]">✓</span>
                                            Impossible to miss
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-[#00ff9d]">✓</span>
                                            Prevents FOMO trades
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <img
                                    src="/screenshots/big-alert.png"
                                    alt="Big Alert Example"
                                    className="rounded-lg border border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Screenshot 3: Consolidation Warning */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="order-2 md:order-1">
                                <img
                                    src="/screenshots/consolidation.png"
                                    alt="Consolidation Warning"
                                    className="rounded-lg border border-gray-700"
                                />
                            </div>
                            <div className="order-1 md:order-2">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Consolidation Blocker
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        The indicator literally tells you &quot;WAIT BEFORE ENTERING&quot;
                                        when the market is choppy.
                                    </p>
                                    <div className="bg-black/40 p-4 rounded-lg border border-gray-700">
                                        <p className="text-sm text-gray-300 italic">
                                            &quot;Most retail traders lose money in consolidation.
                                            This feature alone can save you thousands.&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* Performance Proof Section */}
            <section className="py-20 bg-[#0d121c]">
                <div className="container mx-auto px-6 max-w-6xl">

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            The Journal <span className="text-[#00ff9d]">Proves Everything</span>
                        </h2>
                        <p className="text-gray-400">
                            Every trade logged. Every stat tracked. No hiding from reality.
                        </p>
                    </div>

                    {/* Screenshot: Strategy Tester */}
                    <div className="bg-[#111827] rounded-2xl p-8 border border-gray-800">
                        <img
                            src="/screenshots/journal-analytics.png"
                            alt="Trading Journal Analytics"
                            className="rounded-lg border border-gray-700 w-full mb-6"
                        />

                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#00ff9d] mb-2">56.2%</p>
                                <p className="text-gray-400 text-sm">Win Rate</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#00ff9d] mb-2">2.1:1</p>
                                <p className="text-gray-400 text-sm">Avg R:R</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#00ff9d] mb-2">1.87</p>
                                <p className="text-gray-400 text-sm">Profit Factor</p>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-black/40 rounded-lg border border-gray-700">
                            <p className="text-white font-bold mb-2">What This Actually Means:</p>
                            <p className="text-gray-400 text-sm">
                                56% win rate with 2:1 average R:R means: for every $100 you risk,
                                you make $187 on average over 100 trades. That&apos;s a legitimate edge.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Protocol Rules */}
            <section id="rules" className="py-20 bg-[#0a0f18] relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-3xl relative z-10">
                    <div className="glass-card bg-[#111827]/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[#00ff9d]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="text-center mb-10">
                            <span className="text-[#00ff9d] font-bold tracking-wider text-sm uppercase">The Oath</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">THE PROTOCOL RULES</h2>
                        </div>

                        <div className="space-y-8 mb-10">
                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] font-bold flex items-center justify-center shrink-0">1</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No trade without confluence.</h3>
                                    <p className="text-gray-400 text-sm mb-2">ORB + Trend + Volume = entry permission. Skip one = skip the trade.</p>
                                    <p className="text-xs text-gray-600 italic">Why: 70% of losses come from low-probability setups missing confirmation.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] font-bold flex items-center justify-center shrink-0">2</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No trade outside killzones.</h3>
                                    <p className="text-gray-400 text-sm mb-2">London (02:00-05:00 ET) and NY (08:00-11:00 ET) only. Other hours = dead money.</p>
                                    <p className="text-xs text-gray-600 italic">Why: Volume is king. Trading low-volume hours is gambling.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] font-bold flex items-center justify-center shrink-0">3</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No rule bending after losses.</h3>
                                    <p className="text-gray-400 text-sm mb-2">Revenge trading kills accounts. The journal tracks every violation.</p>
                                    <p className="text-xs text-gray-600 italic">Why: Emotional capital is as important as financial capital.</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xl font-medium text-white mb-4">&quot;No setup. No shot. No cope.&quot;</p>
                        <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
                            The market doesn&apos;t care about your feelings. The system doesn&apos;t accept excuses.
                            Either you follow the protocol, or you trade somewhere else.
                        </p>

                        <Link href="/get-started" className="block w-full bg-[#00ff9d] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                            Accept These Rules →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#0d121c] border-t border-gray-800">
                <div className="container mx-auto px-6 max-w-5xl">

                    <h2 className="text-4xl font-bold text-white text-center mb-4">
                        Choose Your <span className="text-[#00ff9d]">Access Level</span>
                    </h2>
                    <p className="text-gray-400 text-center mb-12">
                        Start with the journal for free. Upgrade when you&apos;re ready for the full system.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* FREE TIER */}
                        <div className="bg-[#111827] rounded-3xl p-8 border border-gray-800">
                            <h3 className="text-2xl font-bold text-white mb-2">Journal</h3>
                            <p className="text-gray-400 text-sm mb-6">Track your execution. Build discipline.</p>

                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">$0</span>
                                <span className="text-gray-500">/forever</span>
                            </div>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">Unlimited trade logging</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">Win rate & R:R tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">Basic analytics</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-gray-600">✗</span>
                                    <span className="text-gray-600">No indicator access</span>
                                </li>
                            </ul>

                            <Link href="/journal" className="block w-full py-3 rounded-xl font-bold text-center border border-gray-700 text-gray-300 hover:border-gray-500 transition-all">
                                Start Free
                            </Link>
                        </div>

                        {/* PRO TIER */}
                        <div className="bg-[#111827] rounded-3xl p-8 border-2 border-[#00ff9d] relative transform scale-105 shadow-2xl">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00ff9d] text-black text-xs font-bold px-4 py-1.5 rounded-full">
                                MOST POPULAR
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-gray-400 text-sm mb-6">Full system. TradingView + Journal.</p>

                            <div className="mb-8">
                                <span className="text-5xl font-bold text-[#00ff9d]">$99</span>
                                <span className="text-gray-500">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-white font-bold">→</span>
                                    <span className="text-white font-medium">Everything in Journal, plus:</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">TradingView indicator</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">ORB + S/D + Big Alerts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">Dashboard + All features</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#00ff9d]">✓</span>
                                    <span className="text-gray-300">Priority support</span>
                                </li>
                            </ul>

                            <Link href="/waitlist" className="block w-full py-3 rounded-xl font-bold text-center bg-[#00ff9d] text-black hover:bg-[#00cc7a] transition-all">
                                Join Waitlist
                            </Link>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Launching Feb 15th • Early bird discount
                            </p>
                        </div>

                        {/* ELITE TIER */}
                        <div className="bg-[#111827] rounded-3xl p-8 border border-[#fbbf24]/30">
                            <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
                            <p className="text-gray-400 text-sm mb-6">Pro + MT4/MT5 + Auto-sync.</p>

                            <div className="mb-8">
                                <span className="text-5xl font-bold text-[#fbbf24]">$149</span>
                                <span className="text-gray-500">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-white font-bold">→</span>
                                    <span className="text-white font-medium">Everything in Pro, plus:</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#fbbf24]">✓</span>
                                    <span className="text-gray-300">MT4/MT5 versions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#fbbf24]">✓</span>
                                    <span className="text-gray-300">Auto-sync trades to journal</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#fbbf24]">✓</span>
                                    <span className="text-gray-300">Advanced analytics</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#fbbf24]">✓</span>
                                    <span className="text-gray-300">Private Discord channel</span>
                                </li>
                            </ul>

                            <Link href="/waitlist" className="block w-full py-3 rounded-xl font-bold text-center border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 transition-all">
                                Join Waitlist
                            </Link>
                        </div>

                    </div>

                </div>
            </section>

            {/* Testimonials Section */}
            {/* Testimonials Section */}
            <section className="py-20 bg-[#0a0f18]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Trusted by <span className="text-[#00ff9d]">Disciplined Traders</span>
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 hover:border-[#00ff9d]/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xs">JM</div>
                                <div>
                                    <p className="text-white font-bold text-sm">@JordanM</p>
                                    <p className="text-gray-500 text-xs">Forex Trader • 2 years</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm italic mb-4">
                                &quot;The journal forced me to see I was overtrading. Went from 38% win rate to 52% just by following the ORB rules.&quot;
                            </p>
                            <div className="flex items-center gap-1 text-[#00ff9d] text-xs">★★★★★</div>
                        </div>

                        <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 hover:border-[#00ff9d]/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24] font-bold text-xs">DK</div>
                                <div>
                                    <p className="text-white font-bold text-sm">@DrK_Trading</p>
                                    <p className="text-gray-500 text-xs">Prop Fiirm Trader</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm italic mb-4">
                                &quot;Volume Sentinel saved me from 4 losing trades this week alone. The confluence requirement is a game changer.&quot;
                            </p>
                            <div className="flex items-center gap-1 text-[#00ff9d] text-xs">★★★★★</div>
                        </div>

                        <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 hover:border-[#00ff9d]/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center text-[#00ff9d] font-bold text-xs">AL</div>
                                <div>
                                    <p className="text-white font-bold text-sm">@AlphaLogic</p>
                                    <p className="text-gray-500 text-xs">Crypto Scalper</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm italic mb-4">
                                &quot;Finally a system that doesn&apos;t repaint. The backtesting module helped me dial in my TP settings for BTC.&quot;
                            </p>
                            <div className="flex items-center gap-1 text-[#00ff9d] text-xs">★★★★★</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            {/* FAQ Section */}
            <section className="py-20 bg-[#0d121c] border-t border-gray-800">
                <div className="container mx-auto px-6 max-w-3xl">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Frequently Asked <span className="text-[#00ff9d]">Questions</span>
                        </h2>
                        <p className="text-gray-400">
                            Everything you need to know before joining.
                        </p>
                    </div>

                    <div className="space-y-4">

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Is the indicator really free?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    The TradingView version with <strong className="text-white">full Pine Script source code</strong> is included in all paid tiers (Pro $79/month and Elite $129/month). There&apos;s no &quot;indicator-only&quot; free tier.
                                </p>
                                <p>
                                    However, the <strong className="text-white">trading journal is 100% free</strong>, with unlimited trade logging, win rate tracking, and basic analytics. No credit card required. Use it at <Link href="/journal" className="text-[#00ff9d] hover:underline">retailbeastfx.vercel.app/journal</Link>
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Will this work on crypto/stocks/forex?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">Optimized for:</strong> FX Majors (EUR/USD, GBP/USD, etc.) and Gold (XAU/USD) during London (02:00-05:00 ET) and NY (08:00-11:00 ET) sessions.
                                </p>
                                <p className="mb-3">
                                    <strong className="text-white">Works on:</strong> Crypto (BTC, ETH) and futures (ES, NQ), but you&apos;ll need to adjust session times and test the settings.
                                </p>
                                <p>
                                    <strong className="text-white">Not recommended for:</strong> Individual stocks (different market structure, no 24hr trading).
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Do I need coding skills to install the indicator?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">No.</strong> Installation is copy/paste:
                                </p>
                                <ol className="space-y-2 ml-4 list-decimal list-inside mb-3">
                                    <li>Open TradingView</li>
                                    <li>Click &quot;Pine Editor&quot; at the bottom</li>
                                    <li>Paste the RetailBeastFX code</li>
                                    <li>Click &quot;Add to Chart&quot;</li>
                                </ol>
                                <p>
                                    Takes 2 minutes. We provide a step-by-step video guide and written instructions. If you can copy/paste, you can install it.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>What&apos;s the difference between Pro and Elite?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm">
                                <div className="mb-4">
                                    <p className="text-white font-bold mb-2">Pro ($79/month):</p>
                                    <ul className="space-y-1 ml-4">
                                        <li>• TradingView indicator</li>
                                        <li>• Trading journal</li>
                                        <li>• Dashboard + all features</li>
                                        <li>• Discord community</li>
                                        <li>• Manual trade logging</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-2">Elite ($129/month adds):</p>
                                    <ul className="space-y-1 ml-4">
                                        <li>• MT4/MT5 indicator versions</li>
                                        <li>• Auto-sync trades to journal</li>
                                        <li>• Advanced analytics (Monte Carlo, Risk of Ruin)</li>
                                        <li>• Custom TradingView alerts</li>
                                        <li>• Private &quot;Enforcer&quot; Discord channel</li>
                                    </ul>
                                </div>
                                <p className="mt-4 text-xs italic">
                                    Most traders start with Pro. Upgrade to Elite when you want MT4/MT5 and auto-sync.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Can I cancel anytime?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">Yes.</strong> Cancel anytime from your dashboard. No questions asked, no cancellation fees.
                                </p>
                                <p>
                                    We also offer a <strong className="text-white">14-day money-back guarantee</strong>. If you&apos;re not satisfied for any reason within 14 days, email us and we&apos;ll refund you—no questions asked.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Is the early bird price locked for life?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">Yes.</strong> If you sign up during the early bird period (first 100 users), your price is locked forever:
                                </p>
                                <ul className="space-y-2 ml-4 mb-3">
                                    <li>• Pro: $79/month (instead of $99)</li>
                                    <li>• Elite: $129/month (instead of $149)</li>
                                </ul>
                                <p>
                                    As long as your subscription stays active (no cancellation), you&apos;ll never pay more—even if we raise prices in the future.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>What if I&apos;m a complete beginner?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    RetailBeastFX is <strong className="text-white">not for day-1 beginners</strong>. You should have:
                                </p>
                                <ul className="space-y-2 ml-4 mb-3">
                                    <li>• Basic understanding of ICT concepts (killzones, order blocks, liquidity)</li>
                                    <li>• At least 3 months of demo trading experience</li>
                                    <li>• Familiarity with TradingView or MT4/MT5</li>
                                </ul>
                                <p className="mb-3">
                                    <strong className="text-white">If you&apos;re brand new to trading:</strong> Start with ICT&apos;s free YouTube mentorship series. Practice on demo for 3-6 months. Then come back to RetailBeastFX.
                                </p>
                                <p>
                                    <strong className="text-white">If you have 6+ months of experience:</strong> This system will help you stop overtrading and enforce discipline.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Does this give me trading signals?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">No.</strong> RetailBeastFX is not a signal service.
                                </p>
                                <p className="mb-3">
                                    The indicator shows you:
                                </p>
                                <ul className="space-y-2 ml-4 mb-3">
                                    <li>• When market conditions align (ORB + Trend + Volume)</li>
                                    <li>• Where supply/demand zones are</li>
                                    <li>• When to <strong className="text-white">stay out</strong> (consolidation warnings)</li>
                                </ul>
                                <p>
                                    <strong className="text-white">You still decide:</strong> Whether to enter, where to place stops, and when to exit. The indicator gives you <em>permission</em> to trade, not <em>orders</em> to follow.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>What happens after I join the waitlist?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">Step 1:</strong> You&apos;ll get a confirmation email immediately.
                                </p>
                                <p className="mb-3">
                                    <strong className="text-white">Step 2:</strong> Over the next few days, we&apos;ll send you exclusive previews (screenshots, features, etc.).
                                </p>
                                <p className="mb-3">
                                    <strong className="text-white">Step 3:</strong> On February 13th (48 hours before launch), you&apos;ll get your personal early-bird activation link.
                                </p>
                                <p>
                                    <strong className="text-white">Step 4:</strong> On February 15th (launch day), you can activate your account and start using the system.
                                </p>
                            </div>
                        </details>

                        <details className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden group">
                            <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-white font-bold hover:text-[#00ff9d] transition-colors list-none">
                                <span>Can I see the indicator before buying?</span>
                                <span className="text-[#00ff9d] group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                                <p className="mb-3">
                                    <strong className="text-white">Yes.</strong> We have screenshots on the homepage showing:
                                </p>
                                <ul className="space-y-2 ml-4 mb-3">
                                    <li>• Dashboard interface</li>
                                    <li>• Big screen alerts</li>
                                    <li>• ORB lines and S/D zones</li>
                                    <li>• Consolidation warnings</li>
                                    <li>• Journal analytics</li>
                                </ul>
                                <p className="mb-3">
                                    There&apos;s no &quot;free trial&quot; of the indicator itself, but you can:
                                </p>
                                <ul className="space-y-2 ml-4">
                                    <li>• Use the free journal right now (no signup required)</li>
                                    <li>• Take advantage of the 14-day money-back guarantee</li>
                                    <li>• Join Discord to see other traders using it</li>
                                </ul>
                            </div>
                        </details>

                    </div>
                </div>
            </section>

            <footer className="py-12 bg-[#05080f] border-t border-gray-900 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} RetailBeastFX. All rights reserved.</p>
            </footer>
        </div>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
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
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#rules" className="hover:text-white transition-colors">The Protocol</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <Link href="/journal" className="hover:text-[#00ff9d] transition-colors">Journal Login</Link>
                    </div>
                    <Link href="/get-started" className="bg-[#00ff9d] text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#00cc7a] transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)]">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00ff9d] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/20 text-[#00ff9d] text-xs font-bold mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
                        v9.0 PROTOCOL • FULLY DOCUMENTED
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
                        The Complete<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00cc7a]">
                            ICT Trading System
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                        Professional-grade indicator + mechanical journal.<br />
                        <strong className="text-white">Built for traders who trade, not gamble.</strong>
                    </p>

                    <div className="bg-[#111827]/80 backdrop-blur-sm rounded-2xl p-8 mb-10 max-w-3xl mx-auto border border-gray-800 animate-fade-in-up delay-300">
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider text-opacity-70">What You Get</h3>

                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            <div>
                                <h4 className="text-[#00ff9d] font-bold mb-4 flex items-center gap-2 text-lg">
                                    <span>📊</span> The Indicator
                                </h4>
                                <ul className="text-sm text-gray-400 space-y-3">
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d]">✓</span> ICT Opening Range Breakouts</li>
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d]">✓</span> EMA 9/30 Trend Filter</li>
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d]">✓</span> Supply/Demand Zones</li>
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d]">✓</span> Consolidation Blocker</li>
                                </ul>
                            </div>

                            <div className="md:border-l md:border-gray-800 md:pl-8">
                                <h4 className="text-[#fbbf24] font-bold mb-4 flex items-center gap-2 text-lg">
                                    <span>📓</span> The Journal
                                </h4>
                                <ul className="text-sm text-gray-400 space-y-3">
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> Track Every Setup</li>
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> Win Rate Analytics</li>
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> R:R Tracking - Measure Edge</li>
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> Violation Logging</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up delay-400">
                        <Link href="/get-started" className="bg-[#00ff9d] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.5)] flex items-center justify-center gap-2">
                            Get Started Free <span className="text-xl">→</span>
                        </Link>
                        <a href="#features" className="px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all bg-[#111827]/50">
                            Explore Features
                        </a>
                    </div>

                    <p className="text-sm text-gray-500 animate-fade-in-up delay-500">
                        <span className="text-[#00ff9d]">✓</span> TradingView + MT4/MT5 &nbsp;•&nbsp; <span className="text-[#00ff9d]">✓</span> Full documentation included &nbsp;•&nbsp; <span className="text-[#00ff9d]">✓</span> Built by traders, for traders
                    </p>
                </div>
            </section>

            {/* Why RetailBeastFX */}
            <section id="features" className="py-20 bg-[#0d121c] border-t border-gray-800">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why <span className="text-[#00ff9d]">RetailBeastFX</span>?</h2>
                        <p className="text-gray-400">The transparent, mechanical approach to institutional trading.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 hover:border-[#00ff9d]/30 transition-all shadow-lg hover:shadow-[#00ff9d]/5 group">
                            <div className="w-14 h-14 rounded-2xl bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">🔓</div>
                            <h3 className="text-white text-xl font-bold mb-3">Fully Transparent</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Complete Pine Script source code included. See exactly how every signal is generated. Modify it if you want.
                            </p>
                        </div>

                        <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 hover:border-[#00ff9d]/30 transition-all shadow-lg hover:shadow-[#00ff9d]/5 group">
                            <div className="w-14 h-14 rounded-2xl bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">📚</div>
                            <h3 className="text-white text-xl font-bold mb-3">Extensively Documented</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                27-page technical breakdown. Quick-start guide. Strategy documentation. Learn the WHY, not just the WHAT.
                            </p>
                        </div>

                        <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 hover:border-[#00ff9d]/30 transition-all shadow-lg hover:shadow-[#00ff9d]/5 group">
                            <div className="w-14 h-14 rounded-2xl bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">⚡</div>
                            <h3 className="text-white text-xl font-bold mb-3">Battle-Tested Logic</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                ICT Opening Range concepts. Institutional supply/demand. Proven trend-following. No gimmicks.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111827] to-[#0a0f18] rounded-2xl p-10 border border-gray-700 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff9d] opacity-[0.03] blur-[60px] rounded-full pointer-events-none"></div>

                        <h3 className="text-[#00ff9d] font-bold mb-6 text-center text-2xl">Built Different</h3>
                        <p className="text-gray-300 text-center mb-10 max-w-2xl mx-auto">
                            Most traders fail because they overtrade, don't manage risk, and lack discipline.<br /><br />
                            <strong className="text-white">RetailBeastFX doesn't just give you signals.</strong><br />
                            It forces you to log every trade, track violations, and measure your actual edge.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="bg-[#0a0f18]/50 p-6 rounded-xl border border-gray-800">
                                <h4 className="text-white font-bold mb-3 text-lg">The Indicator Finds Setups:</h4>
                                <ul className="text-gray-400 space-y-2">
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d] text-xs">●</span> High-probability entries</li>
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d] text-xs">●</span> Clear invalidation points</li>
                                    <li className="flex items-center gap-2"><span className="text-[#00ff9d] text-xs">●</span> Confluence confirmation</li>
                                </ul>
                            </div>
                            <div className="bg-[#0a0f18]/50 p-6 rounded-xl border border-gray-800">
                                <h4 className="text-white font-bold mb-3 text-lg">The Journal Enforces Execution:</h4>
                                <ul className="text-gray-400 space-y-2">
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24] text-xs">●</span> Tracks rule violations</li>
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24] text-xs">●</span> Measures real win rate</li>
                                    <li className="flex items-center gap-2"><span className="text-[#fbbf24] text-xs">●</span> Exposes psychological patterns</li>
                                </ul>
                            </div>
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
                                    <p className="text-gray-400 text-sm">ORB + Trend + Volume = entry permission. Skip one = skip the trade.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] font-bold flex items-center justify-center shrink-0">2</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No trade outside killzones.</h3>
                                    <p className="text-gray-400 text-sm">London (02:00-05:00 ET) and NY (08:00-11:00 ET) only. Other hours = dead money.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d] text-[#00ff9d] font-bold flex items-center justify-center shrink-0">3</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No rule bending after losses.</h3>
                                    <p className="text-gray-400 text-sm">Revenge trading kills accounts. The journal tracks every violation.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-8 mt-8 text-center">
                            <p className="text-xl font-medium text-white mb-4">"No setup. No shot. No cope."</p>
                            <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
                                The market doesn't care about your feelings. The system doesn't accept excuses.
                                Either you follow the protocol, or you trade somewhere else.
                            </p>

                            <Link href="/get-started" className="block w-full bg-[#00ff9d] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                                Accept These Rules →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#0d121c] border-t border-gray-800">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your <span className="text-[#00ff9d]">Tier</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Start free. Upgrade when you're ready for advanced features and platform integrations.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">

                        {/* Free Tier */}
                        <div className="bg-[#111827] rounded-3xl p-8 border-2 border-[#00ff9d] relative shadow-[0_0_30px_rgba(0,255,157,0.1)]">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00ff9d] text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                                Best For Beginners
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                                <p className="text-gray-400 text-sm">Everything you need to start trading with discipline.</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-bold text-[#00ff9d]">$0</span>
                                <span className="text-gray-500 font-medium">/forever</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#00ff9d] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">TradingView indicator (full source code)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#00ff9d] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Complete documentation (27 pages)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#00ff9d] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Trading journal (unlimited trades)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#00ff9d] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Win rate & R:R tracking</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#00ff9d] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Discord community access</span>
                                </li>
                            </ul>

                            <Link href="/get-started" className="block w-full bg-[#00ff9d] text-black py-4 rounded-xl font-bold text-center hover:bg-[#00cc7a] transition-all">
                                Get Started Free
                            </Link>
                            <p className="text-xs text-gray-500 text-center mt-4">No credit card required.</p>
                        </div>

                        {/* Pro Tier */}
                        <div className="bg-[#111827]/50 rounded-3xl p-8 border border-[#fbbf24]/30 relative hover:border-[#fbbf24]/50 transition-colors">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#fbbf24] text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                                For Serious Traders
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                <p className="text-gray-400 text-sm">Advanced analytics and platform integrations.</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-bold text-[#fbbf24]">$49</span>
                                <span className="text-gray-500 font-medium">/month</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <span className="text-white font-bold">→</span>
                                    <span className="text-white font-medium text-sm">Everything in Free, plus:</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#fbbf24] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">MT4/MT5 indicator version</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#fbbf24] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Auto-sync trades (MT4/MT5 → Journal)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#fbbf24] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Advanced analytics (Monte Carlo, RoR)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#fbbf24] font-bold">✓</span>
                                    <span className="text-gray-300 text-sm">Priority support + trade reviews</span>
                                </li>
                            </ul>

                            <button className="block w-full border border-[#fbbf24] text-[#fbbf24] py-4 rounded-xl font-bold text-center hover:bg-[#fbbf24] hover:text-black transition-all">
                                Upgrade to Pro
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-4">14-day money-back guarantee.</p>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="py-12 bg-[#05080f] border-t border-gray-900 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} RetailBeastFX. All rights reserved.</p>
            </footer>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WaitlistPage() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const launchDate = new Date('2026-02-15T09:00:00-05:00').getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email captured:', email);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#0a0f18] text-white font-sans selection:bg-[#00ff9d] selection:text-black">
            {/* Simple Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f18]/90 backdrop-blur border-b border-gray-800">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff9d] to-[#00cc7a] flex items-center justify-center text-black font-bold">B</div>
                        <span className="font-bold text-lg">RetailBeast<span className="text-[#00ff9d]">FX</span></span>
                    </div>
                    <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Home</Link>
                </div>
            </nav>

            {/* Hero + Form Section */}
            <section className="pt-32 pb-20 px-6 min-h-screen flex items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,157,0.1)_0%,transparent_50%)] pointer-events-none"></div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    {/* Centered Content */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 mb-6 animate-fade-in-up">
                            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
                            <span className="text-[#00ff9d] text-sm font-bold">LAUNCHING FEB 15, 2026</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up delay-100">
                            The ICT System That
                            <br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00ff9d] to-[#00cc7a]">Stops You From Overtrading</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto animate-fade-in-up delay-200">
                            Professional indicator + journal. Built for traders who need <strong className="text-white">structure, not signals</strong>.
                        </p>

                        <p className="text-gray-500 mb-12 animate-fade-in-up delay-300">
                            <strong className="text-[#00ff9d]">500+</strong> traders already on the waitlist
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in-up delay-500">
                        {/* Pro Plan */}
                        <div className="bg-[#111827] rounded-2xl p-8 border-2 border-[#00ff9d] relative shadow-[0_0_30px_rgba(0,255,157,0.1)]">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff9d] text-black text-xs font-bold px-4 py-1 rounded-full">
                                MOST POPULAR
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                                <p className="text-gray-400 text-sm">TradingView indicator + Journal</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-bold text-[#00ff9d]">$79</span>
                                    <span className="text-gray-500 line-through text-xl">$99</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">per month • Early bird special</p>
                            </div>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">Full TradingView indicator (Pine Script)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">ORB + S/D Zones + Big Alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">Consolidation blocker (anti-chop)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">Complete trading journal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">27-page documentation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00ff9d] mt-0.5">✓</span>
                                    <span className="text-gray-300">Discord community access</span>
                                </li>
                            </ul>

                            <button onClick={() => document.getElementById('waitlist-email')?.focus()} className="w-full bg-[#00ff9d] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                                Lock In $79/mo →
                            </button>
                        </div>

                        {/* Elite Plan */}
                        <div className="bg-[#111827] rounded-2xl p-8 border border-[#fbbf24]/30">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Elite</h3>
                                <p className="text-gray-400 text-sm">Everything + MT4/MT5 + Auto-sync</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-bold text-[#fbbf24]">$129</span>
                                    <span className="text-gray-500 line-through text-xl">$149</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">per month • Early bird special</p>
                            </div>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5 font-bold">→</span>
                                    <span className="text-white font-medium">Everything in Pro, plus:</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5">✓</span>
                                    <span className="text-gray-300">MT4/MT5 indicator versions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5">✓</span>
                                    <span className="text-gray-300">Auto-sync trades to journal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5">✓</span>
                                    <span className="text-gray-300">Advanced analytics (Monte Carlo, RoR)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5">✓</span>
                                    <span className="text-gray-300">Custom TradingView alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#fbbf24] mt-0.5">✓</span>
                                    <span className="text-gray-300">Private &quot;Enforcer&quot; Discord channel</span>
                                </li>
                            </ul>

                            <button onClick={() => document.getElementById('waitlist-email')?.focus()} className="w-full border-2 border-[#fbbf24] text-[#fbbf24] py-4 rounded-xl font-bold text-lg hover:bg-[#fbbf24]/10 transition-all">
                                Lock In $129/mo →
                            </button>
                        </div>
                    </div>

                    {/* Email Capture Form */}
                    <div className="max-w-2xl mx-auto animate-fade-in-up delay-700">
                        <div className="bg-[#111827]/60 backdrop-blur rounded-2xl p-8 border border-gray-800">
                            {!isSubmitted ? (
                                <>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
                                        <p className="text-gray-400 text-sm">Get notified when we launch + lock in your early bird price.</p>
                                    </div>

                                    <form id="waitlist-form" className="space-y-4" onSubmit={handleSubmit}>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="email"
                                                id="waitlist-email"
                                                name="email"
                                                placeholder="Enter your email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex-1 px-4 py-3 bg-[#0a0f18] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff9d] focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/20 transition-all"
                                            />
                                            <button
                                                type="submit"
                                                className="bg-[#00ff9d] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#00cc7a] transition-all whitespace-nowrap"
                                            >
                                                Join Waitlist
                                            </button>
                                        </div>

                                        <p className="text-xs text-gray-500 text-center">
                                            ✓ No spam  •  ✓ One email on launch day  •  ✓ Unsubscribe anytime
                                        </p>
                                    </form>
                                </>
                            ) : (
                                <div id="success-state" className="text-center py-8 animate-fade-in-up">
                                    <div className="w-16 h-16 bg-[#00ff9d]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">You&apos;re on the list! 🎉</h3>
                                    <p className="text-gray-400 text-sm">Check your email for confirmation. We&apos;ll notify you on Feb 15th.</p>
                                </div>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-gray-500">
                            <span>✓ 14-day money-back guarantee</span>
                            <span>✓ Cancel anytime</span>
                            <span>✓ Price locked for life</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown Timer Section */}
            <section className="py-20 bg-[#0d121c] border-t border-gray-800">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Launch Countdown</h2>
                    <p className="text-gray-400 mb-12">Early bird pricing ends when we launch.</p>

                    <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                        <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <div className="text-4xl font-bold text-[#00ff9d] mb-2">{timeLeft.days}</div>
                            <div className="text-sm text-gray-500 uppercase">Days</div>
                        </div>
                        <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <div className="text-4xl font-bold text-[#00ff9d] mb-2">{String(timeLeft.hours).padStart(2, '0')}</div>
                            <div className="text-sm text-gray-500 uppercase">Hours</div>
                        </div>
                        <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <div className="text-4xl font-bold text-[#00ff9d] mb-2">{String(timeLeft.minutes).padStart(2, '0')}</div>
                            <div className="text-sm text-gray-500 uppercase">Mins</div>
                        </div>
                        <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <div className="text-4xl font-bold text-[#00ff9d] mb-2">{String(timeLeft.seconds).padStart(2, '0')}</div>
                            <div className="text-sm text-gray-500 uppercase">Secs</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-[#0d121c]">
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

                    {/* Still Have Questions CTA */}
                    <div className="mt-12 text-center">
                        <div className="bg-[#111827] rounded-xl p-8 border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
                            <p className="text-gray-400 mb-6 text-sm">
                                Ask in our Discord community or email us directly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a href="https://discord.gg/retailbeastfx" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#5865F2] text-white rounded-lg font-medium hover:bg-[#4752C4] transition-colors">
                                    Join Discord
                                </a>
                                <a href="mailto:support@retailbeastfx.com" className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-500 transition-colors">
                                    Email Support
                                </a>
                            </div>
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


'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-[#0a0f18] text-gray-200 font-sans selection:bg-[#00ff9d] selection:text-black">
            {/* Navigation */}
            <nav className="border-b border-gray-800/50 backdrop-blur-md fixed top-0 w-full z-50 bg-[#0a0f18]/80">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff9d] to-[#00cc7a] flex items-center justify-center text-black font-bold text-lg">
                            B
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">RetailBeast<span className="text-[#00ff9d]">FX</span></span>
                    </Link>
                    <Link href="/journal" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Already have an account? Login
                    </Link>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Welcome to the <span className="text-[#00ff9d]">Protocol</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        You've taken the first step towards professional trading.
                        Download the tools, install the indicator, and start logging your trades.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Step 1: Download */}
                    <div className="bg-[#111827] rounded-3xl p-8 border border-gray-800 relative group hover:border-[#00ff9d]/30 transition-all animate-fade-in-up delay-100">
                        <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-[#00ff9d] text-black font-bold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,255,157,0.4)]">
                            1
                        </div>

                        <h2 className="text-2xl font-bold text-white mt-4 mb-4">Download Categories</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Get the full source code, strategy tester, and the Ultimate Guide.
                        </p>

                        <div className="bg-[#0a0f18] rounded-xl p-4 mb-6 border border-gray-800/50">
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00ff9d]" /> Protocol_v9.5_Big_Alerts.pine</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00ff9d]" /> Strategy_Tester_v9.5.pine</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00ff9d]" /> The_Ultimate_Guide.md</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00ff9d]" /> Strategy_Tester_Guide.md</li>
                            </ul>
                        </div>

                        <a
                            href="/downloads/RetailBeastFX_Protocol_v9.5.zip"
                            download
                            className="w-full bg-[#00ff9d] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#00cc7a] transition-all shadow-[0_0_20px_rgba(0,255,157,0.2)] flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Download Protocol v9.5
                        </a>
                        <p className="text-xs text-gray-500 text-center mt-3">~300 KB • Zip Archive</p>
                    </div>

                    {/* Step 2: Journal */}
                    <div className="bg-[#111827] rounded-3xl p-8 border border-gray-800 relative group hover:border-[#fbbf24]/30 transition-all animate-fade-in-up delay-200">
                        <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-[#fbbf24] text-black font-bold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                            2
                        </div>

                        <h2 className="text-2xl font-bold text-white mt-4 mb-4">Start Your Journal</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            The indicator finds the setups. The journal keeps you disciplined.
                            Log your first trade today.
                        </p>

                        <div className="bg-[#0a0f18] rounded-xl p-4 mb-6 border border-gray-800/50">
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#fbbf24]" /> Unlimited Trade Logging</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#fbbf24]" /> Automated Win Rate Tracking</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#fbbf24]" /> Violation Detection</li>
                                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#fbbf24]" /> Psychological Analysis</li>
                            </ul>
                        </div>

                        <Link
                            href="/journal"
                            className="w-full bg-[#fbbf24] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#f59e0b] transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2"
                        >
                            <BookOpen size={20} />
                            Launch Journal
                        </Link>
                        <p className="text-xs text-gray-500 text-center mt-3">Free forever • No credit card</p>
                    </div>
                </div>

                <div className="text-center border-t border-gray-800 pt-12 animate-fade-in-up delay-300">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-1">
                        Back to Homepage <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

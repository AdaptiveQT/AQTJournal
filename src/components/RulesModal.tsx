'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trophy, Zap } from 'lucide-react';

export default function RulesModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Check localStorage after hydration
    useEffect(() => {
        setHasMounted(true);
        const hasSeenRules = localStorage.getItem('rbfx_rules_accepted');
        if (!hasSeenRules) setIsOpen(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('rbfx_rules_accepted', 'true');
        setIsOpen(false);
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!hasMounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 font-mono">
            <div className="bg-[#050505] border border-[#39FF14] w-full max-w-2xl rounded-xl shadow-[0_0_100px_rgba(57,255,20,0.1)] relative overflow-hidden">

                {/* Header */}
                <div className="bg-[#39FF14] p-4 flex items-center justify-between">
                    <h2 className="text-black font-black text-xl tracking-widest flex items-center gap-2">
                        <ShieldAlert size={24} />
                        PROTOCOL v8.4
                    </h2>
                </div>

                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h3 className="text-white text-2xl font-bold">WELCOME TO THE MATRIX.</h3>
                        <p className="text-gray-400 text-sm">
                            This is not a diary. This is a performance engine.
                            <br />The algorithm judges your <span className="text-[#39FF14]">discipline</span>, not just your PnL.
                        </p>
                    </div>

                    {/* The Scoring Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* GAINS */}
                        <div className="border border-gray-800 bg-[#111] rounded-lg p-4">
                            <h4 className="text-[#39FF14] text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                <Trophy size={14} /> XP GAINS (Discipline)
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex justify-between">
                                    <span>TRINITY Setup (A+)</span>
                                    <span className="text-[#39FF14] font-bold">+10 XP</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Standard Setup (B)</span>
                                    <span className="text-[#39FF14] font-bold">+2 XP</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Winning Trade</span>
                                    <span className="text-[#39FF14] font-bold">+5 XP</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>2R+ Risk-Reward</span>
                                    <span className="text-[#39FF14] font-bold">+3 XP</span>
                                </li>
                            </ul>
                        </div>

                        {/* PENALTIES */}
                        <div className="border border-gray-800 bg-[#111] rounded-lg p-4">
                            <h4 className="text-[#FF3131] text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                <Zap size={14} /> PENALTIES (Violations)
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex justify-between">
                                    <span>IMPULSE Trade (F)</span>
                                    <span className="text-[#FF3131] font-bold">-50 XP</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Losing Trade</span>
                                    <span className="text-[#FF3131] font-bold">-2 XP</span>
                                </li>
                                <li className="text-xs text-gray-500 italic pt-2">
                                    *Impulse = entries with ZERO confluence
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Trinity Explanation */}
                    <div className="border border-gray-800 bg-[#111] rounded-lg p-4">
                        <h4 className="text-white text-xs font-bold uppercase mb-3">THE TRINITY (A+ Setup)</h4>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-gray-900 p-2 rounded">
                                <div className="text-[#39FF14] font-bold">Fresh OB</div>
                                <div className="text-gray-500">Unmitigated</div>
                            </div>
                            <div className="bg-gray-900 p-2 rounded">
                                <div className="text-[#39FF14] font-bold">BB 2.0</div>
                                <div className="text-gray-500">Exhaustion</div>
                            </div>
                            <div className="bg-gray-900 p-2 rounded">
                                <div className="text-[#39FF14] font-bold">Vol Spike</div>
                                <div className="text-gray-500">150%+</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleAccept}
                        className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded text-sm tracking-widest transition"
                    >
                        I ACCEPT THE PROTOCOL
                    </button>
                </div>
            </div>
        </div>
    );
}

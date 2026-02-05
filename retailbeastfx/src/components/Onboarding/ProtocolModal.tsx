'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface ProtocolModalProps {
    onAccept: () => void;
}

const PROTOCOL_RULES = [
    { id: 1, text: 'I will not trade outside London (02:00-05:00 ET) or NY (08:00-11:00 ET) killzones', penalty: 'Violation logged' },
    { id: 2, text: 'I will only enter with FULL Trinity confluence (OB + BB 1.0 + EMA 8/21)', penalty: 'Violation logged' },
    { id: 3, text: 'I will not tune BB deviation — it is locked to 1.0', penalty: 'Non-System Configuration' },
    { id: 4, text: 'I will log every trade and every violation without exception', penalty: 'Required' },
    { id: 5, text: 'I may trade any market — FX, indices, stocks, crypto, commodities — The System applies universally', penalty: null },
    { id: 6, text: 'I accept The System judges compliance, not P&L', penalty: null },
];

export default function ProtocolModal({ onAccept }: ProtocolModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Detect scroll to bottom
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Consider scrolled to bottom when within 20px of the end
            if (scrollHeight - scrollTop - clientHeight < 20) {
                setHasScrolledToBottom(true);
            }
        }
    };

    // Check if content is short enough to not need scrolling
    useEffect(() => {
        // Use requestAnimationFrame to avoid synchronous setState warning
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollHeight, clientHeight } = scrollRef.current;
                if (scrollHeight <= clientHeight) {
                    setHasScrolledToBottom(true);
                }
            }
        };
        requestAnimationFrame(checkScroll);
    }, []);

    const canCheckbox = hasScrolledToBottom;
    const canSubmit = acknowledged && hasScrolledToBottom;

    return (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-4">
            {/* No backdrop click, no escape, no close button - HARD GATE */}
            <div className="bg-slate-900 rounded-2xl border border-red-500/30 max-w-lg w-full shadow-2xl shadow-red-500/10">

                {/* Header - Fixed */}
                <div className="text-center p-8 pb-4 border-b border-slate-800">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Shield className="text-red-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">THE PROTOCOL</h1>
                    <p className="text-slate-400 text-sm">
                        This is not a trading app. This is a <span className="text-red-400 font-bold">discipline system</span>.
                    </p>
                </div>

                {/* Scrollable Rules Section */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="max-h-[300px] overflow-y-auto p-8 pt-6"
                >
                    {/* Rules */}
                    <div className="space-y-3 mb-6">
                        {PROTOCOL_RULES.map((rule) => (
                            <div
                                key={rule.id}
                                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-red-900/30"
                            >
                                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-400 text-xs font-bold">{rule.id}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm">{rule.text}</p>
                                    {rule.penalty && (
                                        <p className="text-xs text-red-400/70 mt-1">→ {rule.penalty}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Warning */}
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-red-400 font-bold text-sm">ZERO FLEXIBILITY</p>
                                <p className="text-red-300/70 text-xs mt-1">
                                    There is no tuning. There is no optimization.
                                    Miss one condition — no trade. The System enforces itself.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scroll instruction if not scrolled */}
                    {!hasScrolledToBottom && (
                        <div className="text-center py-2">
                            <p className="text-slate-500 text-xs animate-pulse">↓ Scroll to read all rules ↓</p>
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Section */}
                <div className="p-8 pt-4 border-t border-slate-800">
                    {/* Acknowledgment Checkbox */}
                    <label
                        className={`flex items-center gap-3 p-4 rounded-lg transition-colors mb-4 ${canCheckbox
                            ? 'bg-slate-800/50 cursor-pointer hover:bg-slate-800 border border-slate-700'
                            : 'bg-slate-800/20 cursor-not-allowed border border-slate-800'
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => canCheckbox && setAcknowledged(e.target.checked)}
                            disabled={!canCheckbox}
                            className="w-5 h-5 rounded border-slate-500 accent-red-500"
                        />
                        <span className={`text-sm ${canCheckbox ? 'text-white' : 'text-slate-600'}`}>
                            <span className="font-bold text-red-400">I accept zero flexibility.</span> Violations are logged.
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        onClick={onAccept}
                        disabled={!canSubmit}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${canSubmit
                            ? 'bg-red-500 text-white hover:bg-red-400'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {canSubmit ? (
                            <>
                                <Lock size={20} />
                                ACCEPT PROTOCOL
                            </>
                        ) : !hasScrolledToBottom ? (
                            'Read All Rules First'
                        ) : (
                            'Accept the Terms Above'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}


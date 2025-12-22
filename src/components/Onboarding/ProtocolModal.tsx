'use client';

import React from 'react';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProtocolModalProps {
    onAccept: () => void;
}

const PROTOCOL_RULES = [
    { id: 1, text: 'I will log every trade — wins and losses', xp: '+10 XP per trade' },
    { id: 2, text: 'I will confirm Trinity (OB + BB + Killzone) before entry', xp: '+25 XP for Trinity trades' },
    { id: 3, text: 'I will not exceed my daily trade limit', xp: '-50 XP penalty' },
    { id: 4, text: 'I will not revenge trade after losses', xp: '-100 XP and Recovery Mode' },
    { id: 5, text: 'I accept that data drives evolution, not hope', xp: null },
];

export default function ProtocolModal({ onAccept }: ProtocolModalProps) {
    const [acknowledged, setAcknowledged] = React.useState(false);

    return (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-4">
            {/* No backdrop click, no escape, no close button */}
            <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 max-w-lg w-full p-8 shadow-2xl shadow-emerald-500/10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="text-emerald-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">The Protocol</h1>
                    <p className="text-slate-400 text-sm">
                        RetailBeastFX is not a trading app. It is a discipline system.
                    </p>
                </div>

                {/* Rules */}
                <div className="space-y-3 mb-6">
                    {PROTOCOL_RULES.map((rule) => (
                        <div
                            key={rule.id}
                            className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                        >
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-emerald-400 text-xs font-bold">{rule.id}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm">{rule.text}</p>
                                {rule.xp && (
                                    <p className="text-xs text-slate-500 mt-1">{rule.xp}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Warning */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                        <div>
                            <p className="text-red-400 font-medium text-sm">Non-Negotiable</p>
                            <p className="text-red-300/70 text-xs mt-1">
                                Breaking protocol triggers penalties. The system is designed to make bad habits expensive.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Acknowledgment Checkbox */}
                <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors mb-6">
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-500"
                    />
                    <span className="text-sm text-slate-300">
                        I understand that <span className="text-emerald-400 font-medium">discipline is the edge</span>, and I accept the protocol.
                    </span>
                </label>

                {/* Submit */}
                <button
                    onClick={onAccept}
                    disabled={!acknowledged}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${acknowledged
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {acknowledged ? (
                        <>
                            <CheckCircle2 size={20} />
                            Enter the Matrix
                        </>
                    ) : (
                        'Read and Accept the Protocol'
                    )}
                </button>
            </div>
        </div>
    );
}

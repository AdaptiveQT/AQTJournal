'use client';

import React from 'react';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

interface TrinityChecklistProps {
    checks: {
        obConfirmed: boolean;
        bbTouchVerified: boolean;
        emaBiasAligned: boolean;
    };
    onCheckChange: (key: keyof TrinityChecklistProps['checks'], value: boolean) => void;
    onSkip?: () => void;
    required?: boolean;
}

export default function TrinityChecklist({ checks, onCheckChange, onSkip, required = true }: TrinityChecklistProps) {
    const allChecked = checks.obConfirmed && checks.bbTouchVerified && checks.emaBiasAligned;
    const noneChecked = !checks.obConfirmed && !checks.bbTouchVerified && !checks.emaBiasAligned;

    const checkItems = [
        {
            key: 'obConfirmed' as const,
            label: 'Fresh OB confirmed?',
            description: 'Unmitigated order block at entry'
        },
        {
            key: 'bbTouchVerified' as const,
            label: 'BB touch verified?',
            description: 'Price touched BB 1.0 (20/1.0 locked)'
        },
        {
            key: 'emaBiasAligned' as const,
            label: 'EMA bias aligned?',
            description: '8/21 EMA confirms direction'
        }
    ];

    return (
        <div className={`rounded-lg border p-4 transition-all ${allChecked
            ? 'bg-emerald-900/20 border-emerald-500/50'
            : noneChecked && required
                ? 'bg-red-900/20 border-red-500/50'
                : 'bg-slate-800/50 border-slate-700'
            }`}>

            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-emerald-400">△</span> Trinity Confirmation
                </h4>
                {required && !allChecked && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} /> Required
                    </span>
                )}
                {allChecked && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Confirmed
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {checkItems.map(item => (
                    <div
                        key={item.key}
                        onClick={() => onCheckChange(item.key, !checks[item.key])}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all select-none ${checks[item.key]
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        <div className={`w-5 h-5 flex items-center justify-center rounded transition-all ${checks[item.key] ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                            {checks[item.key] ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className={`text-sm font-medium ${checks[item.key] ? 'text-emerald-400' : 'text-white'}`}>
                                {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500">
                                {item.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Warning if skipping */}
            {!allChecked && !noneChecked && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Partial confirmation = lower conviction trade
                    </p>
                </div>
            )}

            {/* Skip option */}
            {required && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
                    <button
                        type="button"
                        onClick={onSkip}
                        disabled={!onSkip}
                        className={`text-xs underline ${onSkip ? 'text-slate-500 hover:text-slate-300 cursor-pointer' : 'text-slate-600 cursor-not-allowed'}`}
                    >
                        Not a Trinity setup? Log as manual trade
                    </button>
                </div>
            )}
        </div>
    );
}

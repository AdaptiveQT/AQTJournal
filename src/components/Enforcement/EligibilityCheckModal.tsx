'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { UserRule } from '../../types';

interface EligibilityCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (checkedRules: string[], allMet: boolean) => void;
    rules: UserRule[];
    darkMode?: boolean;
}

/**
 * Eligibility Check Modal - Must confirm rules before trade entry
 * Clinical language, no hype
 */
export default function EligibilityCheckModal({
    isOpen,
    onClose,
    onConfirm,
    rules,
    darkMode = true
}: EligibilityCheckModalProps) {
    const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const requiredRules = rules.filter(r => r.required);
    const optionalRules = rules.filter(r => !r.required);
    const allRequiredMet = requiredRules.every(r => checkedRules.has(r.id));
    const canProceed = allRequiredMet;

    const toggleRule = (ruleId: string) => {
        const next = new Set(checkedRules);
        if (next.has(ruleId)) {
            next.delete(ruleId);
        } else {
            next.add(ruleId);
        }
        setCheckedRules(next);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(checkedRules), allRequiredMet);
        setCheckedRules(new Set());
    };

    const handleClose = () => {
        setCheckedRules(new Set());
        onClose();
    };

    const bg = darkMode ? 'bg-gray-900' : 'bg-white';
    const text = darkMode ? 'text-white' : 'text-gray-900';
    const subtext = darkMode ? 'text-gray-400' : 'text-gray-600';
    const border = darkMode ? 'border-gray-700' : 'border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className={`${bg} rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${border}`}>
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-500" />
                        <h2 className={`text-lg font-semibold ${text}`}>
                            Eligibility Check
                        </h2>
                    </div>
                    <button onClick={handleClose} className={`${subtext} hover:${text}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className={`text-sm ${subtext}`}>
                        Confirm each rule before proceeding. Required rules must be checked.
                    </p>

                    {/* Required Rules */}
                    {requiredRules.length > 0 && (
                        <div className="space-y-2">
                            <h3 className={`text-xs font-semibold uppercase ${subtext}`}>
                                Required
                            </h3>
                            {requiredRules.map(rule => (
                                <RuleCheckbox
                                    key={rule.id}
                                    rule={rule}
                                    checked={checkedRules.has(rule.id)}
                                    onChange={() => toggleRule(rule.id)}
                                    darkMode={darkMode}
                                    required
                                />
                            ))}
                        </div>
                    )}

                    {/* Optional Rules */}
                    {optionalRules.length > 0 && (
                        <div className="space-y-2">
                            <h3 className={`text-xs font-semibold uppercase ${subtext}`}>
                                Optional
                            </h3>
                            {optionalRules.map(rule => (
                                <RuleCheckbox
                                    key={rule.id}
                                    rule={rule}
                                    checked={checkedRules.has(rule.id)}
                                    onChange={() => toggleRule(rule.id)}
                                    darkMode={darkMode}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${border} space-y-3`}>
                    {!canProceed && (
                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Check all required rules to proceed.</span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className={`flex-1 py-2 px-4 rounded-lg border ${border} ${text} hover:bg-gray-800`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!canProceed}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${canProceed
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {canProceed ? 'Confirm Eligibility' : 'Rules Required'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface RuleCheckboxProps {
    rule: UserRule;
    checked: boolean;
    onChange: () => void;
    darkMode?: boolean;
    required?: boolean;
}

function RuleCheckbox({ rule, checked, onChange, darkMode = true, required = false }: RuleCheckboxProps) {
    const bg = checked
        ? (darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-500')
        : (darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300');
    const text = darkMode ? 'text-white' : 'text-gray-900';

    const categoryColors: Record<string, string> = {
        entry: 'text-blue-400',
        risk: 'text-red-400',
        session: 'text-amber-400',
        exit: 'text-purple-400'
    };

    return (
        <button
            onClick={onChange}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border ${bg} transition-all`}
        >
            <div className={`w-5 h-5 rounded flex items-center justify-center ${checked ? 'bg-green-600' : 'bg-gray-700'
                }`}>
                {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 text-left">
                <p className={`text-sm ${text}`}>{rule.description}</p>
                <p className={`text-xs ${categoryColors[rule.category] || 'text-gray-500'}`}>
                    {rule.category.toUpperCase()} {required && '• Required'}
                </p>
            </div>
        </button>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ReadinessChecklistProps {
    onComplete: () => void;
}

const CHECKS = [
    { id: 'sleep', question: 'Did you sleep 7+ hours?', required: true },
    { id: 'review', question: 'Have you reviewed yesterday\'s trades?', required: true },
    { id: 'plan', question: 'Do you know your trading plan for today?', required: true },
    { id: 'emotional', question: 'Are you emotionally neutral (not angry, stressed, or euphoric)?', required: true },
    { id: 'news', question: 'Have you checked major economic news?', required: false }
];

const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({ onComplete }) => {
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [showChecklist, setShowChecklist] = useState(false);

    useEffect(() => {
        // Check if checklist was completed today
        const lastCompleted = localStorage.getItem('readinessChecklistDate');
        const today = new Date().toLocaleDateString();

        if (lastCompleted !== today) {
            setShowChecklist(true);
        }
    }, []);

    const toggleCheck = (id: string) => {
        setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allRequiredChecked = CHECKS.filter(c => c.required).every(c => checks[c.id]);

    const handleComplete = () => {
        if (!allRequiredChecked) return;

        const today = new Date().toLocaleDateString();
        localStorage.setItem('readinessChecklistDate', today);
        setShowChecklist(false);
        onComplete();
    };

    if (!showChecklist) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                <div className="text-center mb-6">
                    <AlertCircle size={48} className="mx-auto mb-3 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Are You Ready to Trade?
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Complete this checklist before entering the market
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    {CHECKS.map(check => (
                        <button
                            key={check.id}
                            onClick={() => toggleCheck(check.id)}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${checks[check.id]
                                    ? 'bg-green-500/10 border-green-500/50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {checks[check.id] ? (
                                <CheckCircle2 size={24} className="text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <Circle size={24} className="text-slate-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className="text-white font-medium mb-1">{check.question}</div>
                                {check.required && (
                                    <div className="text-xs text-red-400">Required</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleComplete}
                    disabled={!allRequiredChecked}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${allRequiredChecked
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                        }`}
                >
                    {allRequiredChecked ? 'Start Trading ✓' : 'Complete Required Checks'}
                </button>

                <p className="text-xs text-center text-slate-500 mt-4">
                    Trading with poor sleep or emotional stress significantly increases losses
                </p>
            </div>
        </div>
    );
};

export default ReadinessChecklist;

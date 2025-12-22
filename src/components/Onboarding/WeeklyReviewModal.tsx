import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { VIOLATION_REASONS, ViolationReason, WeeklyReview } from '../../types';

interface WeeklyReviewModalProps {
    isOpen: boolean;
    onComplete: (review: Omit<WeeklyReview, 'id' | 'timestamp' | 'weekEndingDate'>) => void;
    reviewDate: Date;
}

const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onComplete, reviewDate }) => {
    const [step, setStep] = useState(1);
    const [bestSession, setBestSession] = useState('');
    const [worstViolation, setWorstViolation] = useState<string>('');
    const [fixForNextWeek, setFixForNextWeek] = useState('');

    if (!isOpen) return null;

    const canProceed = () => {
        if (step === 1) return bestSession !== '';
        if (step === 2) return worstViolation !== '';
        if (step === 3) return fixForNextWeek.length > 5;
        return false;
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            onComplete({
                bestSession,
                worstViolation,
                fixForNextWeek
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-blue-900/20 p-6 text-center border-b border-blue-500/20">
                    <Calendar className="mx-auto text-blue-400 mb-3" size={40} />
                    <h2 className="text-2xl font-bold text-white mb-1">Weekly Review Required</h2>
                    <p className="text-blue-200 text-sm">Review your week to unlock the next session.</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <label className="block text-sm font-medium text-slate-300 mb-4">
                                1. Which session felt the most controlled and profitable this week?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['London', 'New York', 'Asian', 'Overlap'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setBestSession(s)}
                                        className={`p-4 rounded-xl border text-left transition-all ${bestSession === s
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        <span className="font-bold block">{s}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <label className="block text-sm font-medium text-slate-300 mb-4">
                                2. What was your biggest leak / violation this week?
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                                {[...VIOLATION_REASONS, 'Impulse / Boredom', 'Over-leveraging'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setWorstViolation(v)}
                                        className={`p-3 rounded-lg border text-sm text-left transition-all ${worstViolation === v
                                                ? 'bg-red-900/50 border-red-500 text-red-200'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4 flex gap-3">
                                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                <p className="text-xs text-yellow-200">
                                    Example: "I will wait for a 5min candle close before entering."
                                </p>
                            </div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                3. Commitment: The ONE fix for next week.
                            </label>
                            <textarea
                                value={fixForNextWeek}
                                onChange={(e) => setFixForNextWeek(e.target.value)}
                                placeholder="Next week, I will..."
                                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-slate-700'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${canProceed()
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {step === 3 ? (
                            <>Complete Review <CheckCircle size={18} /></>
                        ) : (
                            'Next Step'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReviewModal;

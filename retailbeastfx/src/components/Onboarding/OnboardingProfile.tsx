'use client';

import React, { useState } from 'react';
import { DollarSign, Target, Clock, Lock } from 'lucide-react';

interface OnboardingProfileProps {
    onComplete: (profile: UserProfile) => void;
}

export interface UserProfile {
    startingBalance: number;
    primaryPair: string;
    primarySession: 'London' | 'New York';
    onboardingDate: string;
    maxDailyTrades: number;
}

const PAIRS = [
    'XAUUSD',
    'USDJPY',
    'GBPJPY',
    'EURUSD',
    'GBPUSD',
    'AUDUSD',
    'NZDUSD',
];

export default function OnboardingProfile({ onComplete }: OnboardingProfileProps) {
    const [balance, setBalance] = useState('');
    const [pair, setPair] = useState('');
    const [session, setSession] = useState<'London' | 'New York' | ''>('');
    const [error, setError] = useState('');

    const isValid = balance && parseFloat(balance) > 0 && pair && session;

    const handleSubmit = () => {
        if (!isValid) {
            setError('All fields are required.');
            return;
        }

        const profile: UserProfile = {
            startingBalance: parseFloat(balance),
            primaryPair: pair,
            primarySession: session as 'London' | 'New York',
            onboardingDate: new Date().toISOString(),
            maxDailyTrades: 3,
        };

        onComplete(profile);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Lock className="text-emerald-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Identity Lock</h2>
                    <p className="text-sm text-slate-400">
                        These settings are locked for 30 days. Choose wisely.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">

                    {/* Starting Balance */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <DollarSign size={14} className="text-emerald-400" />
                            Starting Balance
                        </label>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            placeholder="16.86"
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Cannot be changed for 30 days.
                        </p>
                    </div>

                    {/* Primary Pair */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Target size={14} className="text-emerald-400" />
                            Primary Pair
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {PAIRS.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPair(p)}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${pair === p
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                            : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Focus on one pair. Master it.
                        </p>
                    </div>

                    {/* Primary Session */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Clock size={14} className="text-emerald-400" />
                            Primary Session
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSession('London')}
                                className={`px-4 py-4 rounded-lg border transition-all ${session === 'London'
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                            >
                                <div className="font-bold">London</div>
                                <div className="text-xs opacity-70">03:00 - 06:00 EST</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSession('New York')}
                                className={`px-4 py-4 rounded-lg border transition-all ${session === 'New York'
                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                            >
                                <div className="font-bold">New York</div>
                                <div className="text-xs opacity-70">08:00 - 11:00 EST</div>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Other sessions hidden for first 7 days.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${isValid
                                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Lock Identity
                    </button>

                    <p className="text-xs text-center text-slate-500">
                        This cannot be undone. Discipline starts now.
                    </p>
                </div>
            </div>
        </div>
    );
}

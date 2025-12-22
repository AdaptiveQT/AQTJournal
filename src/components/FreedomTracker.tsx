'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, Lock, Unlock, Target, Calendar, Wallet } from 'lucide-react';

interface FreedomProps {
    currentBalance: number;
    monthlyAvgReturn: number; // e.g., 5 for 5%
    monthlyPnL?: number; // Actual $ made this month
    onSettingsChange?: (settings: { salary: number; withdrawalGoal: number }) => void;
    savedSettings?: { salary: number; withdrawalGoal: number };
}

export default function FreedomTracker({
    currentBalance,
    monthlyAvgReturn,
    monthlyPnL = 0,
    onSettingsChange,
    savedSettings
}: FreedomProps) {
    // Default: $4000/mo salary, Withdrawal goal $500
    const [salary, setSalary] = useState(savedSettings?.salary ?? 4000);
    const [withdrawalGoal, setWithdrawalGoal] = useState(savedSettings?.withdrawalGoal ?? 500);
    const [isEditing, setIsEditing] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    // Update state when saved settings change
    useEffect(() => {
        if (savedSettings) {
            setSalary(savedSettings.salary);
            setWithdrawalGoal(savedSettings.withdrawalGoal);
        }
    }, [savedSettings]);

    // Check for withdrawal celebration
    useEffect(() => {
        if (currentBalance >= withdrawalGoal && withdrawalGoal > 0) {
            setShowCelebration(true);
            const timer = setTimeout(() => setShowCelebration(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [currentBalance, withdrawalGoal]);

    const handleSave = () => {
        setIsEditing(false);
        onSettingsChange?.({ salary, withdrawalGoal });
    };

    // --- 🧮 THE FREEDOM ALGORITHM ---

    // 1. How much capital do you need to generate that salary at your current win rate?
    // Formula: RequiredCapital = (TargetSalary / MonthlyReturn%)
    const safeReturn = Math.max(monthlyAvgReturn, 1); // Assume min 1% for projection
    const requiredCapital = (salary / (safeReturn / 100));

    // 2. How far away are you?
    const progressPercent = Math.min((currentBalance / requiredCapital) * 100, 100);

    // 3. Time to Freedom (Compounding)
    // Formula: N = ln(Target/Current) / ln(1 + Rate)
    const monthsToFreedom = currentBalance >= requiredCapital
        ? 0
        : Math.log(requiredCapital / Math.max(currentBalance, 100)) / Math.log(1 + safeReturn / 100);
    const yearsToFreedom = (monthsToFreedom / 12).toFixed(1);

    // 4. Current Income Replacement
    const currentMonthlyIncome = currentBalance * (safeReturn / 100);
    const replacementRate = Math.min((currentMonthlyIncome / salary) * 100, 100);

    // 5. Freedom Date Projection
    const freedomDate = new Date();
    freedomDate.setMonth(freedomDate.getMonth() + Math.ceil(monthsToFreedom));
    const freedomDateStr = freedomDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // 6. Withdrawal progress
    const withdrawalProgress = Math.min((currentBalance / withdrawalGoal) * 100, 100);

    return (
        <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
            {/* Celebration Effect */}
            {showCelebration && (
                <div className="absolute inset-0 bg-[#39FF14]/10 animate-pulse pointer-events-none z-10" />
            )}

            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Briefcase size={120} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-20">
                <div>
                    <h3 className="text-[#39FF14] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Unlock size={16} /> FREEDOM TRACKER
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">Projecting your escape velocity</p>
                </div>
                <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className="text-xs text-gray-500 hover:text-[#39FF14] border border-gray-700 hover:border-[#39FF14] px-3 py-1 rounded transition-all"
                >
                    {isEditing ? '✓ Save' : '⚙ Edit Targets'}
                </button>
            </div>

            {/* INPUTS (Hidden unless editing) */}
            {isEditing && (
                <div className="grid grid-cols-2 gap-4 mb-6 bg-black/50 p-4 rounded-lg border border-gray-800 relative z-20">
                    <div>
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Briefcase size={12} /> Monthly Salary to Replace ($)
                        </label>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(Number(e.target.value))}
                            className="w-full bg-[#222] text-white border border-gray-700 rounded px-3 py-2 text-sm focus:border-[#39FF14] outline-none mt-1"
                            placeholder="4000"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Wallet size={12} /> Withdrawal Goal ($)
                        </label>
                        <input
                            type="number"
                            value={withdrawalGoal}
                            onChange={(e) => setWithdrawalGoal(Number(e.target.value))}
                            className="w-full bg-[#222] text-white border border-gray-700 rounded px-3 py-2 text-sm focus:border-[#39FF14] outline-none mt-1"
                            placeholder="500"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Alert when balance hits this target</p>
                    </div>
                </div>
            )}

            {/* MAIN METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 relative z-20">

                {/* 1. INCOME REPLACEMENT */}
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-500 text-xs uppercase flex items-center gap-1">
                        <TrendingUp size={12} /> Income Replaced
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className={`text-3xl font-bold ${replacementRate >= 100 ? 'text-[#39FF14]' : 'text-white'}`}>
                            {replacementRate.toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-400">of ${salary.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${replacementRate >= 100 ? 'bg-[#39FF14]' : 'bg-gradient-to-r from-[#39FF14]/50 to-[#39FF14]'}`}
                            style={{ width: `${replacementRate}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        Generating ~<span className="text-[#39FF14]">${currentMonthlyIncome.toFixed(0)}</span>/mo at {safeReturn}%
                    </p>
                </div>

                {/* 2. CAPITAL NEEDED */}
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-500 text-xs uppercase flex items-center gap-1">
                        <Target size={12} /> Capital Needed
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-white">
                            ${requiredCapital >= 1000 ? `${(requiredCapital / 1000).toFixed(0)}k` : requiredCapital.toFixed(0)}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500/50 to-blue-400 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        You have <span className="text-blue-400">{progressPercent.toFixed(1)}%</span> of target capital
                    </p>
                </div>

                {/* 3. TIME TO FREEDOM */}
                <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-500 text-xs uppercase flex items-center gap-1">
                        <Calendar size={12} /> Freedom Date
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                        {monthsToFreedom <= 0 ? (
                            <span className="text-3xl font-bold text-[#39FF14] animate-pulse">NOW</span>
                        ) : monthsToFreedom < 12 ? (
                            <span className="text-3xl font-bold text-[#39FF14]">{monthsToFreedom.toFixed(0)} <span className="text-lg">mo</span></span>
                        ) : (
                            <span className="text-3xl font-bold text-yellow-400">{yearsToFreedom} <span className="text-lg">yrs</span></span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3">
                        {monthsToFreedom <= 0
                            ? '🎉 You can replace your income!'
                            : `Target: ${freedomDateStr} (if you compound at ${safeReturn}%)`}
                    </p>
                </div>
            </div>

            {/* NEXT WITHDRAWAL TARGET */}
            <div className={`rounded-lg px-4 py-4 flex items-center justify-between border transition-all duration-300 relative z-20 ${currentBalance >= withdrawalGoal
                    ? 'bg-[#39FF14]/10 border-[#39FF14]/50'
                    : 'bg-[#1a1a1a] border-gray-700'
                }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full transition-colors ${currentBalance >= withdrawalGoal
                            ? 'bg-[#39FF14] text-black'
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Next Cash Out</p>
                        <p className="text-lg font-bold text-white">Target: ${withdrawalGoal.toLocaleString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    {currentBalance >= withdrawalGoal ? (
                        <div>
                            <span className="text-[#39FF14] text-sm font-bold animate-pulse block">🎯 READY TO WITHDRAW</span>
                            <span className="text-[10px] text-gray-400">Take profits, reset the target</span>
                        </div>
                    ) : (
                        <div>
                            <span className="text-white font-bold">${(withdrawalGoal - currentBalance).toFixed(2)}</span>
                            <span className="text-gray-500 text-xs block">to go ({withdrawalProgress.toFixed(0)}%)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* MOTIVATIONAL FOOTER */}
            <div className="mt-4 text-center relative z-20">
                <p className="text-[10px] text-gray-600 italic">
                    {monthsToFreedom <= 6
                        ? '"The escape pod is fueled. Stay disciplined."'
                        : monthsToFreedom <= 24
                            ? '"Every trade compounds. Every win accelerates the timeline."'
                            : '"Rome wasn\'t built in a day. Neither is financial freedom."'}
                </p>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Trophy, TrendingUp, Flame, Users, Shield, Eye, EyeOff, RefreshCw, Crown, Medal, Award } from 'lucide-react';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase';

// Types
interface CommunityStats {
    odStatsId: string;
    displayName: string;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    bestStreak: number;
    averageRR: number;
    rank: string;
    lastUpdated: number;
}

interface CommunityLeaderboardProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode?: boolean;
    // User's current stats
    userStats: {
        winRate: number;
        profitFactor: number;
        totalTrades: number;
        bestStreak: number;
        averageRR: number;
    };
    userId?: string;
}

// Rank calculation based on stats
const calculateRank = (winRate: number, profitFactor: number, totalTrades: number): string => {
    const score = (winRate * 0.4) + (Math.min(profitFactor, 5) * 10) + (Math.min(totalTrades, 100) * 0.1);

    if (score >= 80) return 'LEGEND';
    if (score >= 65) return 'MASTER';
    if (score >= 50) return 'EXPERT';
    if (score >= 35) return 'ADVANCED';
    if (score >= 20) return 'INTERMEDIATE';
    return 'SURVIVAL';
};

const rankColors: Record<string, string> = {
    LEGEND: 'from-yellow-400 to-amber-600',
    MASTER: 'from-purple-400 to-purple-600',
    EXPERT: 'from-blue-400 to-blue-600',
    ADVANCED: 'from-green-400 to-green-600',
    INTERMEDIATE: 'from-slate-400 to-slate-600',
    SURVIVAL: 'from-red-400 to-red-600',
};

const rankIcons: Record<string, React.ReactNode> = {
    LEGEND: <Crown size={16} className="text-yellow-400" />,
    MASTER: <Trophy size={16} className="text-purple-400" />,
    EXPERT: <Medal size={16} className="text-blue-400" />,
    ADVANCED: <Award size={16} className="text-green-400" />,
    INTERMEDIATE: <TrendingUp size={16} className="text-slate-400" />,
    SURVIVAL: <Flame size={16} className="text-red-400" />,
};

const APP_ID = 'aqt-journal';

const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({
    isOpen,
    onClose,
    darkMode = false,
    userStats,
    userId,
}) => {
    const [leaderboard, setLeaderboard] = useState<CommunityStats[]>([]);
    const [isSharing, setIsSharing] = useState(false);
    const [displayName, setDisplayName] = useState('Anonymous Trader');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'winRate' | 'profitFactor' | 'streak'>('winRate');

    // Generate anonymous ID for user
    const anonymousId = useMemo(() => {
        if (!userId) return null;
        // Create a hash of the userId for anonymity
        const hash = userId.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        return `trader_${Math.abs(hash).toString(16).slice(0, 8)}`;
    }, [userId]);

    // User's calculated rank
    const userRank = useMemo(() => {
        return calculateRank(userStats.winRate, userStats.profitFactor, userStats.totalTrades);
    }, [userStats]);

    // Load leaderboard from Firebase
    useEffect(() => {
        if (!isOpen || !firebaseReady || !db) {
            setIsLoading(false);
            return;
        }

        const leaderboardRef = collection(db, 'artifacts', APP_ID, 'community', 'leaderboard', 'stats');
        const q = query(leaderboardRef, orderBy('winRate', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const stats = snapshot.docs.map(doc => doc.data() as CommunityStats);
            setLeaderboard(stats);

            // Check if user is already sharing
            const userEntry = stats.find(s => s.odStatsId === anonymousId);
            if (userEntry) {
                setIsSharing(true);
                setDisplayName(userEntry.displayName);
            }

            setIsLoading(false);
        }, (error) => {
            console.error('Error loading leaderboard:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen, anonymousId]);

    // Share/update stats
    const handleShareStats = async () => {
        if (!firebaseReady || !db || !anonymousId) return;

        const stats: CommunityStats = {
            odStatsId: anonymousId,
            displayName: displayName || 'Anonymous Trader',
            winRate: userStats.winRate,
            profitFactor: userStats.profitFactor,
            totalTrades: userStats.totalTrades,
            bestStreak: userStats.bestStreak,
            averageRR: userStats.averageRR,
            rank: userRank,
            lastUpdated: Date.now(),
        };

        try {
            const statsRef = doc(db, 'artifacts', APP_ID, 'community', 'leaderboard', 'stats', anonymousId);
            await setDoc(statsRef, stats);
            setIsSharing(true);
        } catch (error) {
            console.error('Error sharing stats:', error);
        }
    };

    // Stop sharing
    const handleStopSharing = async () => {
        if (!firebaseReady || !db || !anonymousId) return;

        try {
            const statsRef = doc(db, 'artifacts', APP_ID, 'community', 'leaderboard', 'stats', anonymousId);
            await deleteDoc(statsRef);
            setIsSharing(false);
        } catch (error) {
            console.error('Error removing stats:', error);
        }
    };

    // Sort leaderboard based on active tab
    const sortedLeaderboard = useMemo(() => {
        const sorted = [...leaderboard];
        switch (activeTab) {
            case 'profitFactor':
                return sorted.sort((a, b) => b.profitFactor - a.profitFactor);
            case 'streak':
                return sorted.sort((a, b) => b.bestStreak - a.bestStreak);
            default:
                return sorted.sort((a, b) => b.winRate - a.winRate);
        }
    }, [leaderboard, activeTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600">
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Community Leaderboard</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Anonymized rankings • {leaderboard.length} traders
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Your Stats Card */}
                <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${rankColors[userRank]} text-white font-bold text-sm flex items-center gap-2`}>
                                {rankIcons[userRank]}
                                {userRank}
                            </div>
                            <div>
                                <div className="font-medium">Your Stats</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {userStats.winRate.toFixed(1)}% WR • {userStats.profitFactor.toFixed(2)} PF • {userStats.totalTrades} trades
                                </div>
                            </div>
                        </div>

                        {/* Share Controls */}
                        <div className="flex items-center gap-2">
                            {isSharing ? (
                                <>
                                    <span className="text-sm text-green-500 flex items-center gap-1">
                                        <Eye size={14} /> Sharing
                                    </span>
                                    <button
                                        onClick={handleStopSharing}
                                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors text-sm font-medium"
                                    >
                                        Stop Sharing
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleShareStats}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 transition-all font-medium text-sm flex items-center gap-2"
                                >
                                    <Users size={16} /> Join Leaderboard
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Display Name Input (when sharing) */}
                    {isSharing && (
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                                placeholder="Display Name"
                                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm flex-1 max-w-xs"
                            />
                            <button
                                onClick={handleShareStats}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                title="Update Stats"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Privacy Notice */}
                <div className="px-4 mt-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Shield size={12} />
                        Only aggregated stats are shared. No trade details, balances, or personal info.
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 px-4 mt-4">
                    {[
                        { key: 'winRate', label: 'Win Rate' },
                        { key: 'profitFactor', label: 'Profit Factor' },
                        { key: 'streak', label: 'Best Streak' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Leaderboard List */}
                <div className="p-4 overflow-y-auto max-h-[40vh]">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading leaderboard...</div>
                    ) : sortedLeaderboard.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Users size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No traders on the leaderboard yet.</p>
                            <p className="text-sm">Be the first to join!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sortedLeaderboard.map((trader, index) => (
                                <div
                                    key={trader.odStatsId}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${trader.odStatsId === anonymousId
                                        ? 'bg-blue-500/10 border border-blue-500/30'
                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Rank Number */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                            index === 1 ? 'bg-slate-400 text-white' :
                                                index === 2 ? 'bg-amber-600 text-white' :
                                                    'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {index + 1}
                                        </div>

                                        {/* Trader Info */}
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {trader.displayName}
                                                {trader.odStatsId === anonymousId && (
                                                    <span className="text-xs text-blue-500">(You)</span>
                                                )}
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded bg-gradient-to-r ${rankColors[trader.rank]} text-white inline-flex items-center gap-1`}>
                                                {rankIcons[trader.rank]}
                                                {trader.rank}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className={activeTab === 'winRate' ? 'font-bold text-blue-500' : ''}>
                                            {trader.winRate.toFixed(1)}% WR
                                        </div>
                                        <div className={activeTab === 'profitFactor' ? 'font-bold text-blue-500' : ''}>
                                            {trader.profitFactor.toFixed(2)} PF
                                        </div>
                                        <div className={activeTab === 'streak' ? 'font-bold text-blue-500' : ''}>
                                            {trader.bestStreak} 🔥
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400">
                                            {trader.totalTrades} trades
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityLeaderboard;

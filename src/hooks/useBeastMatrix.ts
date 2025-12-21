// hooks/useBeastMatrix.ts
// The Beast Brain - Gamifies discipline, not just profit
import { useMemo } from 'react';
import { Trade } from '@/types';

// Trinity confluence keywords to check in setup or tags
const TRINITY_CONFLUENCES = {
    FRESH_OB: ['fresh ob', 'order block', 'ob pullback', 'fresh'],
    BB_EXTREME: ['bb 2.0', 'bb extreme', 'bollinger', 'exhaustion', '2sd'],
    VOL_SPIKE: ['vol spike', 'volume', 'surge', 'delta', 'killzone volume'],
};

export interface BeastMetrics {
    beastScore: number;
    sessionStats: SessionStat[];
    winRate: string;
    totalTrades: number;
    trinityTrades: number;
    impulseTrades: number;
    avgRMultiple: number;
    streakBonus: number;
}

export interface SessionStat {
    session: string;
    count: number;
    wins: number;
    winRate: number;
    avgPnL: number;
}

// Helper to check if trade has a specific confluence
const hasConfluence = (trade: Trade, keywords: string[]): boolean => {
    const searchText = [
        trade.setup?.toLowerCase() || '',
        ...(trade.tags || []).map(t => t.toLowerCase()),
        trade.notes?.toLowerCase() || '',
    ].join(' ');

    return keywords.some(kw => searchText.includes(kw.toLowerCase()));
};

// Grade the trade quality based on Trinity conditions
const getTradeGrade = (trade: Trade): 'TRINITY' | 'STANDARD' | 'IMPULSE' => {
    const hasFreshOB = hasConfluence(trade, TRINITY_CONFLUENCES.FRESH_OB);
    const hasBB = hasConfluence(trade, TRINITY_CONFLUENCES.BB_EXTREME);
    const hasVol = hasConfluence(trade, TRINITY_CONFLUENCES.VOL_SPIKE);

    const confluenceCount = [hasFreshOB, hasBB, hasVol].filter(Boolean).length;

    if (confluenceCount >= 3) return 'TRINITY';
    if (confluenceCount === 0) return 'IMPULSE';
    return 'STANDARD';
};

export const useBeastMatrix = (trades: Trade[]): BeastMetrics => {
    return useMemo(() => {
        if (!trades || trades.length === 0) {
            return {
                beastScore: 0,
                sessionStats: [],
                winRate: '0.0',
                totalTrades: 0,
                trinityTrades: 0,
                impulseTrades: 0,
                avgRMultiple: 0,
                streakBonus: 0,
            };
        }

        let trinityCount = 0;
        let impulseCount = 0;
        let currentStreak = 0;
        let maxStreak = 0;

        // 1. CALCULATE BEAST SCORE (XP)
        // Measures discipline, not just profit
        const beastScore = trades.reduce((score, trade) => {
            const grade = getTradeGrade(trade);
            const isWin = trade.pnl > 0;
            let xp = 0;

            // Grade-based XP
            if (grade === 'TRINITY') {
                xp += 10; // Perfect execution
                trinityCount++;
            } else if (grade === 'IMPULSE') {
                xp -= 50; // Punishment for gambling
                impulseCount++;
            } else {
                xp += 2; // Standard trade
            }

            // Win/Loss modifier
            if (isWin) {
                xp += 5;
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                xp -= 2;
                currentStreak = 0;
            }

            // Risk-Reward bonus
            if (trade.riskRewardRatio && trade.riskRewardRatio >= 2) {
                xp += 3;
            }

            return score + xp;
        }, 0);

        // Streak bonus (5 XP per consecutive win in max streak)
        const streakBonus = maxStreak * 5;

        // 2. SESSION HEATMAP DATA
        const sessions = ['London', 'NewYork', 'Asian', 'Tokyo', 'Sydney', 'Overlap'];
        const sessionStats: SessionStat[] = sessions.map(session => {
            const sessTrades = trades.filter(t =>
                t.sessionType === session ||
                t.sessionType?.toLowerCase() === session.toLowerCase()
            );
            const wins = sessTrades.filter(t => t.pnl > 0);
            const totalPnL = sessTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

            return {
                session,
                count: sessTrades.length,
                wins: wins.length,
                winRate: sessTrades.length > 0
                    ? Math.round((wins.length / sessTrades.length) * 100)
                    : 0,
                avgPnL: sessTrades.length > 0
                    ? Math.round(totalPnL / sessTrades.length * 100) / 100
                    : 0,
            };
        }).filter(s => s.count > 0); // Only show sessions with trades

        // 3. OVERALL STATS
        const totalTrades = trades.length;
        const totalWins = trades.filter(t => t.pnl > 0).length;
        const winRate = totalTrades > 0
            ? ((totalWins / totalTrades) * 100).toFixed(1)
            : '0.0';

        // Average R-Multiple
        const rTrades = trades.filter(t => t.riskRewardRatio && t.riskRewardRatio > 0);
        const avgRMultiple = rTrades.length > 0
            ? Math.round(rTrades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / rTrades.length * 100) / 100
            : 0;

        return {
            beastScore: beastScore + streakBonus,
            sessionStats,
            winRate,
            totalTrades,
            trinityTrades: trinityCount,
            impulseTrades: impulseCount,
            avgRMultiple,
            streakBonus,
        };
    }, [trades]);
};

// Export grade function for use in trade logging UI
export { getTradeGrade };

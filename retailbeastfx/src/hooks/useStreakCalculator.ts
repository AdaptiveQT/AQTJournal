import { useMemo } from 'react';
import { Trade } from '../types';

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastProfitableDay: string | null;
}

export const useStreakCalculator = (trades: Trade[]): StreakData => {
    return useMemo(() => {
        if (trades.length === 0) {
            return { currentStreak: 0, longestStreak: 0, lastProfitableDay: null };
        }

        // Group trades by date and calculate daily P&L
        const dailyPnL = new Map<string, number>();
        trades.forEach(trade => {
            const date = trade.date;
            const currentTotal = dailyPnL.get(date) || 0;
            dailyPnL.set(date, currentTotal + (trade.pnl || 0));
        });

        // Sort dates in descending order (newest first)
        const sortedDates = Array.from(dailyPnL.keys()).sort((a, b) => {
            return new Date(b).getTime() - new Date(a).getTime();
        });

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastProfitableDay: string | null = null;

        // Calculate current streak (from most recent day backwards)
        for (let i = 0; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            const pnl = dailyPnL.get(date) || 0;

            if (pnl > 0) {
                tempStreak++;
                if (i === 0 || currentStreak > 0) {
                    currentStreak = tempStreak;
                }
                if (!lastProfitableDay) {
                    lastProfitableDay = date;
                }
            } else {
                // Break streak if we haven't started counting yet
                if (i === 0) {
                    tempStreak = 0;
                } else {
                    break; // Stop counting current streak
                }
            }
        }

        // Calculate longest streak (scan entire history)
        tempStreak = 0;
        sortedDates.reverse().forEach(date => {
            const pnl = dailyPnL.get(date) || 0;
            if (pnl > 0) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        });

        return {
            currentStreak,
            longestStreak: Math.max(longestStreak, currentStreak),
            lastProfitableDay
        };
    }, [trades]);
};

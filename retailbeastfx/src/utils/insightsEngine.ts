import { Trade } from '../types';

export interface Insight {
    id: string;
    type: 'success' | 'warning' | 'info' | 'danger';
    title: string;
    description: string;
    recommendation?: string;
    confidence: number; // 0-100
    data?: any;
}

export interface PerformancePattern {
    bestHours: number[];
    bestDays: string[];
    worstHours: number[];
    worstDays: string[];
    bestPairs: string[];
    worstPairs: string[];
    bestSetups: string[];
    worstSetups: string[];
}

export class InsightsEngine {
    private trades: Trade[];

    constructor(trades: Trade[]) {
        this.trades = trades;
    }

    /**
     * Generate all insights
     */
    public generateInsights(): Insight[] {
        const insights: Insight[] = [];

        if (this.trades.length < 10) {
            return [{
                id: 'insufficient-data',
                type: 'info',
                title: 'More data needed',
                description: 'Track at least 10 trades to unlock smart insights',
                confidence: 100,
            }];
        }

        insights.push(...this.detectBestPerformingTime());
        insights.push(...this.detectWorstPerformingTime());
        insights.push(...this.detectOvertrading());
        insights.push(...this.detectRevengeTrading());
        insights.push(...this.detectEmotionalPatterns());
        insights.push(...this.detectPairPerformance());
        insights.push(...this.detectSetupPerformance());
        insights.push(...this.detectStreakPatterns());

        return insights.sort((a, b) => {
            // Sort by type priority, then confidence
            const typePriority = { danger: 0, warning: 1, success: 2, info: 3 };
            const aPriority = typePriority[a.type];
            const bPriority = typePriority[b.type];
            if (aPriority !== bPriority) return aPriority - bPriority;
            return b.confidence - a.confidence;
        });
    }

    /**
     * Detect best performing hours/days
     */
    private detectBestPerformingTime(): Insight[] {
        const hourlyPnL: Record<number, { total: number; count: number }> = {};
        const dailyPnL: Record<string, { total: number; count: number }> = {};

        this.trades.forEach(trade => {
            const date = new Date(trade.date);
            const hour = date.getHours();
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (!hourlyPnL[hour]) hourlyPnL[hour] = { total: 0, count: 0 };
            hourlyPnL[hour].total += trade.pnl || 0;
            hourlyPnL[hour].count++;

            if (!dailyPnL[day]) dailyPnL[day] = { total: 0, count: 0 };
            dailyPnL[day].total += trade.pnl || 0;
            dailyPnL[day].count++;
        });

        const insights: Insight[] = [];

        // Best hours
        const hours = Object.entries(hourlyPnL)
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                avg: data.total / data.count,
                count: data.count,
            }))
            .filter(h => h.count >= 3)
            .sort((a, b) => b.avg - a.avg);

        if (hours.length > 0 && hours[0].avg > 0) {
            const bestHour = hours[0];
            insights.push({
                id: 'best-hour',
                type: 'success',
                title: `Peak Performance: ${bestHour.hour}:00-${bestHour.hour + 1}:00`,
                description: `You trade best around ${bestHour.hour}:00 with an average of $${bestHour.avg.toFixed(2)} per trade (${bestHour.count} trades)`,
                recommendation: `Schedule your most important trades during this time window.`,
                confidence: Math.min(95, Math.floor((bestHour.count / this.trades.length) * 100 + 50)),
            });
        }

        // Best days
        const days = Object.entries(dailyPnL)
            .map(([day, data]) => ({
                day,
                avg: data.total / data.count,
                count: data.count,
            }))
            .filter(d => d.count >= 3)
            .sort((a, b) => b.avg - a.avg);

        if (days.length > 0 && days[0].avg > 0) {
            const bestDay = days[0];
            insights.push({
                id: 'best-day',
                type: 'success',
                title: `${bestDay.day}s are your strongest day`,
                description: `Average P&L on ${bestDay.day}s: $${bestDay.avg.toFixed(2)} (${bestDay.count} trades)`,
                recommendation: `Focus your trading energy on ${bestDay.day}s.`,
                confidence: Math.min(90, Math.floor((bestDay.count / this.trades.length) * 100 + 40)),
            });
        }

        return insights;
    }

    /**
     * Detect worst performing times
     */
    private detectWorstPerformingTime(): Insight[] {
        const hourlyPnL: Record<number, { total: number; count: number }> = {};

        this.trades.forEach(trade => {
            const date = new Date(trade.date);
            const hour = date.getHours();

            if (!hourlyPnL[hour]) hourlyPnL[hour] = { total: 0, count: 0 };
            hourlyPnL[hour].total += trade.pnl || 0;
            hourlyPnL[hour].count++;
        });

        const hours = Object.entries(hourlyPnL)
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                avg: data.total / data.count,
                count: data.count,
            }))
            .filter(h => h.count >= 3 && h.avg < -10)
            .sort((a, b) => a.avg - b.avg);

        if (hours.length > 0) {
            const worstHour = hours[0];
            return [{
                id: 'worst-hour',
                type: 'warning',
                title: `Avoid trading around ${worstHour.hour}:00`,
                description: `Your average loss at ${worstHour.hour}:00 is $${Math.abs(worstHour.avg).toFixed(2)} (${worstHour.count} trades)`,
                recommendation: `Consider taking a break during this time or only take A+ setups.`,
                confidence: Math.min(90, Math.floor((worstHour.count / this.trades.length) * 100 + 40)),
            }];
        }

        return [];
    }

    /**
     * Detect overtrading patterns
     */
    private detectOvertrading(): Insight[] {
        const dailyTrades: Record<string, Trade[]> = {};

        this.trades.forEach(trade => {
            if (!dailyTrades[trade.date]) dailyTrades[trade.date] = [];
            dailyTrades[trade.date].push(trade);
        });

        const daysWithManyTrades = Object.entries(dailyTrades)
            .filter(([_, trades]) => trades.length >= 5)
            .map(([date, trades]) => ({
                date,
                count: trades.length,
                totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
            }));

        if (daysWithManyTrades.length >= 3) {
            const avgPnLManyTrades = daysWithManyTrades.reduce((sum, d) => sum + d.totalPnL, 0) / daysWithManyTrades.length;

            if (avgPnLManyTrades < 0) {
                return [{
                    id: 'overtrading',
                    type: 'danger',
                    title: 'Overtrading Detected',
                    description: `On days with 5+ trades, you average $${avgPnLManyTrades.toFixed(2)} loss`,
                    recommendation: `Set a max of 3-4 trades per day. Quality over quantity.`,
                    confidence: 85,
                    data: { daysAffected: daysWithManyTrades.length },
                }];
            }
        }

        return [];
    }

    /**
     * Detect revenge trading (trading after a loss)
     */
    private detectRevengeTrading(): Insight[] {
        const sortedTrades = [...this.trades].sort((a, b) => a.ts - b.ts);
        let revengeTradeCount = 0;
        let revengeTradesPnL = 0;

        for (let i = 1; i < sortedTrades.length; i++) {
            const prevTrade = sortedTrades[i - 1];
            const currentTrade = sortedTrades[i];

            // Check if trades are on same day
            if (prevTrade.date === currentTrade.date) {
                // Check if current trade was taken within 1 hour after a loss
                const timeDiff = currentTrade.ts - prevTrade.ts;
                if (prevTrade.pnl < 0 && timeDiff < 3600000) {
                    revengeTradeCount++;
                    revengeTradesPnL += currentTrade.pnl || 0;
                }
            }
        }

        if (revengeTradeCount >= 5) {
            const avgRevengePnL = revengeTradesPnL / revengeTradeCount;

            if (avgRevengePnL < 0) {
                return [{
                    id: 'revenge-trading',
                    type: 'danger',
                    title: 'Revenge Trading Pattern',
                    description: `${revengeTradeCount} trades taken within 1 hour of a loss, averaging $${avgRevengePnL.toFixed(2)}`,
                    recommendation: `Take a 2-hour break after any loss. Walk away and reset.`,
                    confidence: 90,
                    data: { revengeTradeCount, avgRevengePnL },
                }];
            }
        }

        return [];
    }

    /**
     * Detect emotional state correlations
     */
    private detectEmotionalPatterns(): Insight[] {
        const moodPnL: Record<string, { total: number; count: number }> = {};

        this.trades.forEach(trade => {
            if (trade.mood) {
                if (!moodPnL[trade.mood]) moodPnL[trade.mood] = { total: 0, count: 0 };
                moodPnL[trade.mood].total += trade.pnl || 0;
                moodPnL[trade.mood].count++;
            }
        });

        const moods = Object.entries(moodPnL)
            .map(([mood, data]) => ({
                mood,
                avg: data.total / data.count,
                count: data.count,
            }))
            .filter(m => m.count >= 5);

        const insights: Insight[] = [];

        // Best mood
        const bestMood = moods.sort((a, b) => b.avg - a.avg)[0];
        if (bestMood && bestMood.avg > 0) {
            insights.push({
                id: 'best-mood',
                type: 'success',
                title: `Trade best when ${bestMood.mood}`,
                description: `Your '${bestMood.mood}' trades average $${bestMood.avg.toFixed(2)}`,
                recommendation: `Only trade when you genuinely feel ${bestMood.mood}.`,
                confidence: Math.min(85, Math.floor((bestMood.count / this.trades.length) * 100 + 30)),
            });
        }

        // Worst mood
        const worstMood = moods.sort((a, b) => a.avg - b.avg)[0];
        if (worstMood && worstMood.avg < -10) {
            insights.push({
                id: 'worst-mood',
                type: 'warning',
                title: `Avoid trading when ${worstMood.mood}`,
                description: `Your '${worstMood.mood}' trades average $${Math.abs(worstMood.avg).toFixed(2)} loss`,
                recommendation: `Take a break when feeling ${worstMood.mood}. Journal instead of trading.`,
                confidence: Math.min(85, Math.floor((worstMood.count / this.trades.length) * 100 + 30)),
            });
        }

        return insights;
    }

    /**
     * Detect pair performance
     */
    private detectPairPerformance(): Insight[] {
        const pairPnL: Record<string, { total: number; count: number }> = {};

        this.trades.forEach(trade => {
            if (!pairPnL[trade.pair]) pairPnL[trade.pair] = { total: 0, count: 0 };
            pairPnL[trade.pair].total += trade.pnl || 0;
            pairPnL[trade.pair].count++;
        });

        const pairs = Object.entries(pairPnL)
            .map(([pair, data]) => ({
                pair,
                avg: data.total / data.count,
                total: data.total,
                count: data.count,
            }))
            .filter(p => p.count >= 5);

        const insights: Insight[] = [];

        // Best pair
        const bestPair = pairs.sort((a, b) => b.avg - a.avg)[0];
        if (bestPair && bestPair.avg > 10) {
            insights.push({
                id: 'best-pair',
                type: 'success',
                title: `${bestPair.pair} is your money-maker`,
                description: `Average: $${bestPair.avg.toFixed(2)} | Total: $${bestPair.total.toFixed(2)} (${bestPair.count} trades)`,
                recommendation: `Focus more on ${bestPair.pair} setups.`,
                confidence: Math.min(90, Math.floor((bestPair.count / this.trades.length) * 100 + 50)),
            });
        }

        // Worst pair
        const worstPair = pairs.sort((a, b) => a.avg - b.avg)[0];
        if (worstPair && worstPair.avg < -10) {
            insights.push({
                id: 'worst-pair',
                type: 'danger',
                title: `Stop trading ${worstPair.pair}`,
                description: `Average loss: $${Math.abs(worstPair.avg).toFixed(2)} | Total: $${Math.abs(worstPair.total).toFixed(2)} (${worstPair.count} trades)`,
                recommendation: `Avoid ${worstPair.pair} until you develop a winning strategy for it.`,
                confidence: Math.min(90, Math.floor((worstPair.count / this.trades.length) * 100 + 50)),
            });
        }

        return insights;
    }

    /**
     * Detect setup performance
     */
    private detectSetupPerformance(): Insight[] {
        const setupPnL: Record<string, { total: number; count: number; wins: number }> = {};

        this.trades.forEach(trade => {
            if (!setupPnL[trade.setup]) setupPnL[trade.setup] = { total: 0, count: 0, wins: 0 };
            setupPnL[trade.setup].total += trade.pnl || 0;
            setupPnL[trade.setup].count++;
            if ((trade.pnl || 0) > 0) setupPnL[trade.setup].wins++;
        });

        const setups = Object.entries(setupPnL)
            .map(([setup, data]) => ({
                setup,
                avg: data.total / data.count,
                winRate: (data.wins / data.count) * 100,
                count: data.count,
            }))
            .filter(s => s.count >= 5);

        const insights: Insight[] = [];

        // Best setup
        const bestSetup = setups.sort((a, b) => b.avg - a.avg)[0];
        if (bestSetup && bestSetup.avg > 10) {
            insights.push({
                id: 'best-setup',
                type: 'success',
                title: `${bestSetup.setup} setup is your edge`,
                description: `Win rate: ${bestSetup.winRate.toFixed(0)}% | Avg: $${bestSetup.avg.toFixed(2)} (${bestSetup.count} trades)`,
                recommendation: `Master this setup and trade it more frequently.`,
                confidence: Math.min(90, Math.floor((bestSetup.count / this.trades.length) * 100 + 40)),
            });
        }

        // Low win rate setup
        const lowWinRateSetup = setups.sort((a, b) => a.winRate - b.winRate)[0];
        if (lowWinRateSetup && lowWinRateSetup.winRate < 40) {
            insights.push({
                id: 'low-winrate-setup',
                type: 'warning',
                title: `${lowWinRateSetup.setup} needs improvement`,
                description: `Win rate: ${lowWinRateSetup.winRate.toFixed(0)}% (${lowWinRateSetup.count} trades)`,
                recommendation: `Review all ${lowWinRateSetup.setup} trades and refine your entry criteria.`,
                confidence: 75,
            });
        }

        return insights;
    }

    /**
     * Detect streak patterns
     */
    private detectStreakPatterns(): Insight[] {
        const insights: Insight[] = [];
        const recentTrades = this.trades.slice(-20);
        const wins = recentTrades.filter(t => (t.pnl || 0) > 0).length;
        const winRate = (wins / recentTrades.length) * 100;

        if (winRate >= 70) {
            insights.push({
                id: 'hot-streak',
                type: 'success',
                title: 'You\'re on fire! 🔥',
                description: `${winRate.toFixed(0)}% win rate in last 20 trades`,
                recommendation: `Keep following your process. Don't get overconfident.`,
                confidence: 80,
            });
        } else if (winRate <= 30) {
            insights.push({
                id: 'cold-streak',
                type: 'danger',
                title: 'Take a break',
                description: `Only ${winRate.toFixed(0)}% win rate in last 20 trades`,
                recommendation: `Stop trading. Review your journal, identify mistakes, and come back fresh.`,
                confidence: 85,
            });
        }

        return insights;
    }
}

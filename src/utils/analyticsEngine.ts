/**
 * Analytics Engine for AQT Journal
 * Provides core trading analytics calculations using R-multiple methodology
 */

import { Trade } from '../types';

// ============= TYPES =============

export interface SetupExpectancy {
    setup: string;
    trades: number;
    wins: number;
    losses: number;
    winRate: number;      // Decimal (0-1)
    avgWinR: number;      // Average R on winning trades
    avgLossR: number;     // Average R on losing trades (absolute value)
    expectancy: number;   // E = p × avgWin - (1-p) × avgLoss (in R)
    totalPnL: number;     // Absolute P&L
}

export interface SessionData {
    session: 'ASIA' | 'LONDON' | 'NY';
    hour: number;         // 0-23
    trades: number;
    wins: number;
    winRate: number;
    expectancy: number;
    totalPnL: number;
}

export interface ECDFPoint {
    r: number;            // R-multiple value
    cumulative: number;   // Cumulative probability (0-1)
}

export interface ExecutionQuality {
    tradeId: string;
    stretchRatio: number; // MFE / (Target - Entry)
    heatRatio: number;    // MAE / (Entry - Stop)
    category: 'optimal' | 'tight_stop' | 'conservative_target' | 'poor';
}

// ============= SESSION HELPERS =============

type Session = 'ASIA' | 'LONDON' | 'NY';

/**
 * Determines trading session based on UTC hour
 * Asia: 00:00-08:00 UTC (Tokyo/Sydney)
 * London: 08:00-16:00 UTC
 * New York: 13:00-22:00 UTC
 */
export function getSessionFromHour(utcHour: number): Session {
    if (utcHour >= 0 && utcHour < 8) return 'ASIA';
    if (utcHour >= 8 && utcHour < 16) return 'LONDON';
    return 'NY';
}

export function getSessionFromTrade(trade: Trade): Session {
    // Extract hour from trade time or timestamp
    if (trade.time) {
        const hour = parseInt(trade.time.split(':')[0], 10);
        return getSessionFromHour(hour);
    }
    if (trade.ts) {
        const date = new Date(trade.ts);
        return getSessionFromHour(date.getUTCHours());
    }
    // Fallback: use sessionType if available
    if (trade.sessionType) {
        switch (trade.sessionType) {
            case 'Tokyo':
            case 'Sydney':
            case 'Asian':
                return 'ASIA';
            case 'London':
                return 'LONDON';
            case 'NewYork':
            case 'Overlap':
                return 'NY';
        }
    }
    return 'LONDON'; // Default
}

// ============= R-MULTIPLE CALCULATIONS =============

/**
 * Calculates R-multiple for a trade
 * R = PnL / Initial Risk
 * For simplicity, we estimate initial risk as 1% of a base value or use stop loss if available
 */
export function calculateRMultiple(trade: Trade, baseRisk: number = 10): number {
    if (baseRisk === 0) return 0;
    return trade.pnl / baseRisk;
}

/**
 * Estimates risk per trade based on account size and risk percentage
 */
export function estimateRisk(accountSize: number, riskPercent: number = 1): number {
    return accountSize * (riskPercent / 100);
}

// ============= EXPECTANCY BY SETUP =============

/**
 * Calculates expectancy metrics for each trading setup
 * E = p × avgWin - (1-p) × avgLoss
 */
export function expectancyBySetup(trades: Trade[], baseRisk: number = 10): SetupExpectancy[] {
    // Group trades by setup
    const bySetup = new Map<string, Trade[]>();

    trades.forEach(trade => {
        const setup = trade.setup || 'Unknown';
        if (!bySetup.has(setup)) {
            bySetup.set(setup, []);
        }
        bySetup.get(setup)!.push(trade);
    });

    const results: SetupExpectancy[] = [];

    bySetup.forEach((setupTrades, setup) => {
        const wins = setupTrades.filter(t => t.pnl > 0);
        const losses = setupTrades.filter(t => t.pnl <= 0);

        const winRValues = wins.map(t => calculateRMultiple(t, baseRisk));
        const lossRValues = losses.map(t => Math.abs(calculateRMultiple(t, baseRisk)));

        const avgWinR = winRValues.length > 0
            ? winRValues.reduce((a, b) => a + b, 0) / winRValues.length
            : 0;
        const avgLossR = lossRValues.length > 0
            ? lossRValues.reduce((a, b) => a + b, 0) / lossRValues.length
            : 0;

        const winRate = setupTrades.length > 0 ? wins.length / setupTrades.length : 0;
        const expectancy = (winRate * avgWinR) - ((1 - winRate) * avgLossR);

        results.push({
            setup,
            trades: setupTrades.length,
            wins: wins.length,
            losses: losses.length,
            winRate,
            avgWinR,
            avgLossR,
            expectancy,
            totalPnL: setupTrades.reduce((sum, t) => sum + t.pnl, 0)
        });
    });

    // Sort by expectancy descending
    return results.sort((a, b) => b.expectancy - a.expectancy);
}

// ============= SESSION HEATMAP =============

/**
 * Generates heatmap data for session/hour analysis
 */
export function sessionHeatmap(trades: Trade[], baseRisk: number = 10): SessionData[][] {
    const sessions: Session[] = ['ASIA', 'LONDON', 'NY'];
    const hourBlocks = [0, 4, 8, 12, 16, 20]; // 4-hour blocks

    const result: SessionData[][] = [];

    sessions.forEach(session => {
        const sessionRow: SessionData[] = [];

        hourBlocks.forEach(hour => {
            const hourEnd = hour + 4;
            const relevantTrades = trades.filter(t => {
                const tradeSession = getSessionFromTrade(t);
                if (tradeSession !== session) return false;

                // Get hour from trade
                let tradeHour = 12;
                if (t.time) {
                    tradeHour = parseInt(t.time.split(':')[0], 10);
                } else if (t.ts) {
                    tradeHour = new Date(t.ts).getUTCHours();
                }

                return tradeHour >= hour && tradeHour < hourEnd;
            });

            const wins = relevantTrades.filter(t => t.pnl > 0);
            const winRate = relevantTrades.length > 0 ? wins.length / relevantTrades.length : 0;

            const rValues = relevantTrades.map(t => calculateRMultiple(t, baseRisk));
            const expectancy = rValues.length > 0
                ? rValues.reduce((a, b) => a + b, 0) / rValues.length
                : 0;

            sessionRow.push({
                session,
                hour,
                trades: relevantTrades.length,
                wins: wins.length,
                winRate,
                expectancy,
                totalPnL: relevantTrades.reduce((sum, t) => sum + t.pnl, 0)
            });
        });

        result.push(sessionRow);
    });

    return result;
}

// ============= R-MULTIPLE ECDF =============

/**
 * Calculates Empirical Cumulative Distribution Function for R-multiples
 * Groups by setup if provided
 */
export function rMultipleECDF(trades: Trade[], baseRisk: number = 10, setup?: string): ECDFPoint[] {
    let filteredTrades = trades;
    if (setup) {
        filteredTrades = trades.filter(t => t.setup === setup);
    }

    if (filteredTrades.length === 0) return [];

    // Calculate R-multiples and sort
    const rValues = filteredTrades
        .map(t => calculateRMultiple(t, baseRisk))
        .sort((a, b) => a - b);

    // Build ECDF
    const result: ECDFPoint[] = [];
    const n = rValues.length;

    rValues.forEach((r, i) => {
        result.push({
            r,
            cumulative: (i + 1) / n
        });
    });

    return result;
}

/**
 * Gets key percentiles from ECDF
 */
export function getECDFPercentiles(ecdf: ECDFPoint[]): {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
} {
    if (ecdf.length === 0) {
        return { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 };
    }

    const findPercentile = (target: number) => {
        for (const point of ecdf) {
            if (point.cumulative >= target) return point.r;
        }
        return ecdf[ecdf.length - 1].r;
    };

    return {
        p10: findPercentile(0.10),
        p25: findPercentile(0.25),
        p50: findPercentile(0.50),
        p75: findPercentile(0.75),
        p90: findPercentile(0.90)
    };
}

// ============= SUMMARY STATISTICS =============

export interface AnalyticsSummary {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    expectancy: number;
    avgWinR: number;
    avgLossR: number;
    bestSetup: string | null;
    worstSetup: string | null;
    bestSession: Session | null;
    sharpeRatio: number;
}

export function calculateSummary(trades: Trade[], baseRisk: number = 10): AnalyticsSummary {
    if (trades.length === 0) {
        return {
            totalTrades: 0,
            winRate: 0,
            profitFactor: 0,
            expectancy: 0,
            avgWinR: 0,
            avgLossR: 0,
            bestSetup: null,
            worstSetup: null,
            bestSession: null,
            sharpeRatio: 0
        };
    }

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);

    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

    const winRValues = wins.map(t => calculateRMultiple(t, baseRisk));
    const lossRValues = losses.map(t => Math.abs(calculateRMultiple(t, baseRisk)));

    const avgWinR = winRValues.length > 0
        ? winRValues.reduce((a, b) => a + b, 0) / winRValues.length
        : 0;
    const avgLossR = lossRValues.length > 0
        ? lossRValues.reduce((a, b) => a + b, 0) / lossRValues.length
        : 0;

    const winRate = wins.length / trades.length;
    const expectancy = (winRate * avgWinR) - ((1 - winRate) * avgLossR);

    // Setups analysis
    const setupStats = expectancyBySetup(trades, baseRisk);
    const bestSetup = setupStats.length > 0 ? setupStats[0].setup : null;
    const worstSetup = setupStats.length > 0 ? setupStats[setupStats.length - 1].setup : null;

    // Session analysis
    const sessionStats = new Map<Session, { pnl: number; count: number }>();
    trades.forEach(t => {
        const session = getSessionFromTrade(t);
        if (!sessionStats.has(session)) {
            sessionStats.set(session, { pnl: 0, count: 0 });
        }
        const stat = sessionStats.get(session)!;
        stat.pnl += t.pnl;
        stat.count++;
    });

    let bestSession: Session | null = null;
    let bestSessionPnL = -Infinity;
    sessionStats.forEach((stat, session) => {
        if (stat.pnl > bestSessionPnL) {
            bestSessionPnL = stat.pnl;
            bestSession = session;
        }
    });

    // Sharpe Ratio approximation (daily returns std dev)
    const rValues = trades.map(t => calculateRMultiple(t, baseRisk));
    const avgR = rValues.reduce((a, b) => a + b, 0) / rValues.length;
    const variance = rValues.reduce((sum, r) => sum + Math.pow(r - avgR, 2), 0) / rValues.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgR / stdDev : 0;

    return {
        totalTrades: trades.length,
        winRate,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
        expectancy,
        avgWinR,
        avgLossR,
        bestSetup,
        worstSetup,
        bestSession,
        sharpeRatio
    };
}

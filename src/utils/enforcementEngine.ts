/**
 * Behavior Enforcement Utilities
 * Handles cooldowns, locks, and discipline logic
 */

import { Trade, TradeLock, UserRule, DEFAULT_RULES } from '../types';

// ============= CONSTANTS =============

export const COOLDOWN_DURATIONS = {
    AFTER_2_LOSSES: 15 * 60 * 1000,     // 15 minutes
    AFTER_3_LOSSES: 60 * 60 * 1000,     // 1 hour
    REVENGE_TRADE: 5 * 60 * 1000,       // 5 minutes
};

export const LIMITS = {
    MAX_TRADES_PER_DAY: 3,
    VIOLATIONS_TO_LOCK_SESSION: 2,
    EDIT_LOCK_MINUTES: 30,
    CONSECUTIVE_LOSSES_FOR_COOLDOWN: 2,
};

// ============= COOLDOWN LOGIC =============

/**
 * Check if user needs a cooldown based on recent losses
 */
export function checkConsecutiveLosses(trades: Trade[]): TradeLock | null {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades
        .filter(t => t.date === today)
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    if (todayTrades.length < 2) return null;

    // Check for consecutive losses
    let lossStreak = 0;
    for (const trade of todayTrades) {
        if (trade.pnl < 0) {
            lossStreak++;
        } else {
            break;
        }
    }

    if (lossStreak >= 3) {
        return {
            type: 'cooldown',
            reason: 'Three consecutive losses detected. Trading paused for 1 hour.',
            expiresAt: Date.now() + COOLDOWN_DURATIONS.AFTER_3_LOSSES,
            createdAt: Date.now()
        };
    }

    if (lossStreak >= 2) {
        return {
            type: 'cooldown',
            reason: 'Two consecutive losses detected. Trading paused for 15 minutes.',
            expiresAt: Date.now() + COOLDOWN_DURATIONS.AFTER_2_LOSSES,
            createdAt: Date.now()
        };
    }

    return null;
}

/**
 * Check if trade was entered too quickly after a loss (revenge trade risk)
 */
export function checkRevengeTradeRisk(trades: Trade[], now: number = Date.now()): boolean {
    const recentTrades = trades
        .filter(t => t.ts && t.pnl < 0)
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    if (recentTrades.length === 0) return false;

    const lastLoss = recentTrades[0];
    const timeSinceLoss = now - (lastLoss.ts || 0);

    return timeSinceLoss < COOLDOWN_DURATIONS.REVENGE_TRADE;
}

// ============= DAILY LIMIT LOGIC =============

/**
 * Check if daily trade limit has been reached
 */
export function checkDailyLimit(trades: Trade[], maxTrades: number = LIMITS.MAX_TRADES_PER_DAY): TradeLock | null {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => t.date === today);

    if (todayTrades.length >= maxTrades) {
        return {
            type: 'daily_limit',
            reason: `Daily trade limit reached (${maxTrades} trades). Trading locked until tomorrow.`,
            expiresAt: getEndOfDay(),
            createdAt: Date.now()
        };
    }

    return null;
}

/**
 * Get timestamp for end of current day
 */
function getEndOfDay(): number {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return endOfDay.getTime();
}

// ============= SESSION VIOLATION LOGIC =============

/**
 * Check if session should be locked due to violations
 */
export function checkSessionViolations(
    trades: Trade[],
    currentSession: string
): TradeLock | null {
    const today = new Date().toISOString().split('T')[0];
    const sessionTrades = trades.filter(t =>
        t.date === today &&
        t.sessionType === currentSession &&
        t.ruleViolation
    );

    if (sessionTrades.length >= LIMITS.VIOLATIONS_TO_LOCK_SESSION) {
        return {
            type: 'violations',
            reason: `Session locked due to ${sessionTrades.length} violations.`,
            expiresAt: 0, // Manual unlock or session end
            sessionType: currentSession,
            createdAt: Date.now()
        };
    }

    return null;
}

// ============= EDIT LOCK LOGIC =============

/**
 * Check if a trade is locked for editing
 */
export function isTradeEditLocked(trade: Trade): boolean {
    if (!trade.ts) return false;
    const lockTime = trade.ts + (LIMITS.EDIT_LOCK_MINUTES * 60 * 1000);
    return Date.now() > lockTime;
}

/**
 * Get remaining edit time for a trade
 */
export function getEditTimeRemaining(trade: Trade): number {
    if (!trade.ts) return 0;
    const lockTime = trade.ts + (LIMITS.EDIT_LOCK_MINUTES * 60 * 1000);
    const remaining = lockTime - Date.now();
    return Math.max(0, remaining);
}

// ============= WEEKLY REVIEW LOGIC =============

/**
 * Check if weekly review is required before trading
 */
export function checkWeeklyReviewRequired(lastReviewDate: string | undefined): TradeLock | null {
    if (!lastReviewDate) {
        // First week, no review needed yet
        return null;
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const lastReview = new Date(lastReviewDate);

    // If it's after Sunday and last review was before this week
    if (dayOfWeek >= 1) { // Monday or later
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        if (lastReview < startOfWeek) {
            return {
                type: 'review',
                reason: 'Weekly review required before trading can resume.',
                expiresAt: 0, // Manual unlock
                createdAt: Date.now()
            };
        }
    }

    return null;
}

// ============= RULE HELPERS =============

/**
 * Initialize default rules for new users
 */
export function initializeDefaultRules(): UserRule[] {
    return DEFAULT_RULES.map((rule, index) => ({
        ...rule,
        id: `rule_${index}_${Date.now()}`,
        createdAt: Date.now()
    }));
}

/**
 * Get active lock (highest priority)
 */
export function getActiveLock(trades: Trade[], settings: {
    maxTradesPerDay?: number;
    currentSession?: string;
    lastWeeklyReview?: string;
}): TradeLock | null {
    // Priority order: review > violations > daily_limit > cooldown

    const reviewLock = checkWeeklyReviewRequired(settings.lastWeeklyReview);
    if (reviewLock) return reviewLock;

    if (settings.currentSession) {
        const sessionLock = checkSessionViolations(trades, settings.currentSession);
        if (sessionLock) return sessionLock;
    }

    const dailyLock = checkDailyLimit(trades, settings.maxTradesPerDay);
    if (dailyLock) return dailyLock;

    const cooldownLock = checkConsecutiveLosses(trades);
    if (cooldownLock) return cooldownLock;

    return null;
}

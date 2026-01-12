/**
 * Gamification Engine for RetailBeastFX Journal
 * 
 * XP System based on DISCIPLINE, not P&L
 * - Following rules = +XP
 * - Breaking rules = -XP or penalties
 * - Streaks amplify XP gains
 */

import { Trade } from '../types';

// ============= TYPES =============

export interface UserLevel {
    level: number;
    title: string;
    xpRequired: number;
    badge: string;
    perks: string[];
}

export interface XPEvent {
    type: 'trade_logged' | 'stop_respected' | 'streak_day' | 'rule_followed' |
    'violation' | 'daily_review' | 'weekly_review' | 'perfect_week' |
    'withdrawal_executed' | 'daily_limit_breach';  // New small account events
    xp: number;
    description: string;
    timestamp: number;
}

export interface GamificationState {
    totalXP: number;
    currentLevel: number;
    xpToNextLevel: number;
    currentStreak: number;       // Days trading with discipline
    longestStreak: number;
    tradesToday: number;
    violationsToday: number;
    perfectDays: number;         // Days with 0 violations
    lastActiveDate: string;      // YYYY-MM-DD
    xpHistory: XPEvent[];
    achievements: Achievement[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: number;
    progress?: number;
    target?: number;
}

// ============= LEVEL DEFINITIONS =============

export const LEVELS: UserLevel[] = [
    { level: 1, title: 'Rookie', xpRequired: 0, badge: '🥉', perks: ['Basic journal access'] },
    { level: 2, title: 'Apprentice', xpRequired: 100, badge: '🎯', perks: ['Streak tracking'] },
    { level: 3, title: 'Disciplined', xpRequired: 300, badge: '📊', perks: ['Trinity Matrix access'] },
    { level: 4, title: 'Consistent', xpRequired: 600, badge: '⚡', perks: ['Advanced analytics'] },
    { level: 5, title: 'Operator', xpRequired: 1000, badge: '🦁', perks: ['Beast Mode unlocked'] },
    { level: 6, title: 'Elite', xpRequired: 1500, badge: '👑', perks: ['Elite badge', 'Priority support'] },
    { level: 7, title: 'Master', xpRequired: 2500, badge: '💎', perks: ['Diamond badge', 'Beta features'] },
    { level: 8, title: 'Legend', xpRequired: 4000, badge: '🔥', perks: ['Legend status', 'Discord role'] },
    { level: 9, title: 'Beast', xpRequired: 6000, badge: '🐻', perks: ['Beast badge', 'Hall of Fame'] },
    { level: 10, title: 'Apex Predator', xpRequired: 10000, badge: '🏆', perks: ['Max prestige', 'Lifetime access'] },
];

// ============= ACHIEVEMENTS =============

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_trade', title: 'First Blood', description: 'Log your first trade', icon: '🎯' },
    { id: 'streak_3', title: 'Three-peat', description: '3-day discipline streak', icon: '🔥' },
    { id: 'streak_7', title: 'Weekly Warrior', description: '7-day discipline streak', icon: '⚔️' },
    { id: 'streak_30', title: 'Monthly Master', description: '30-day discipline streak', icon: '🏅' },
    { id: 'perfect_week', title: 'Flawless', description: '7 days with 0 violations', icon: '💎' },
    { id: 'trades_10', title: 'Getting Started', description: 'Log 10 trades', icon: '📈' },
    { id: 'trades_50', title: 'Active Trader', description: 'Log 50 trades', icon: '📊' },
    { id: 'trades_100', title: 'Century', description: 'Log 100 trades', icon: '💯' },
    { id: 'trades_500', title: 'Volume King', description: 'Log 500 trades', icon: '👑' },
    { id: 'win_streak_3', title: 'Hot Hand', description: '3 winning trades in a row', icon: '🔥' },
    { id: 'win_streak_5', title: 'On Fire', description: '5 winning trades in a row', icon: '🌋' },
    { id: 'stop_respected', title: 'Discipline', description: 'Never move your stop', icon: '🛡️' },
    { id: 'review_10', title: 'Reflector', description: 'Complete 10 daily reviews', icon: '📝' },
    { id: 'positive_expectancy', title: 'Edge Found', description: 'Achieve positive expectancy', icon: '📈' },
    { id: 'level_5', title: 'Beast Mode', description: 'Reach level 5', icon: '🦁' },
    { id: 'level_10', title: 'Apex', description: 'Reach max level', icon: '🏆' },

    // === SMALL ACCOUNT / WITHDRAWAL ACHIEVEMENTS ===
    { id: 'first_withdrawal', title: 'Cashed Out', description: 'Execute your first withdrawal', icon: '💵' },
    { id: 'withdrawal_goal', title: 'Goal Getter', description: 'Hit your $100 withdrawal target', icon: '🎯' },
    { id: 'triple_withdrawal', title: 'Serial Withdrawer', description: 'Complete 3 withdrawals', icon: '🏧' },
    { id: 'daily_discipline', title: 'Under Control', description: '7 days staying under 3 trades/day', icon: '⏱️' },
    { id: 'real_profit', title: 'Net Positive', description: 'Withdraw more than you deposited', icon: '💰' },
];

// ============= XP CALCULATIONS =============

/**
 * XP rewards for different actions (discipline-focused)
 */
export const XP_REWARDS = {
    TRADE_LOGGED: 5,            // Basic logging
    STOP_RESPECTED: 10,         // Didn't move stop loss
    PROPER_RISK: 8,             // Risk within limits
    DAILY_REVIEW: 15,           // Completed daily review
    WEEKLY_REVIEW: 50,          // Completed weekly review
    STREAK_DAY: 5,              // Multiplied by streak length
    PERFECT_DAY: 20,            // No violations
    PERFECT_WEEK: 100,          // 7 perfect days

    // === SMALL ACCOUNT / HIGH LEVERAGE REWARDS ===
    WITHDRAWAL_EXECUTED: 200,   // BIG bonus for taking money out!
    WITHDRAWAL_GOAL_MET: 100,   // Hit your $100 target
    STAYED_UNDER_DAILY_LIMIT: 25, // Traded 3 or fewer times

    // Penalties (negative)
    VIOLATION_STOP_MOVED: -25,  // Moved stop loss
    VIOLATION_OVERTRADED: -15,  // Too many trades
    VIOLATION_OVERSIZED: -20,   // Position too large
    VIOLATION_REVENGE: -30,     // Revenge trade detected
    VIOLATION_FOMO: -20,        // FOMO entry
    VIOLATION_DAILY_LIMIT: -50, // Breached 3-trade daily limit (harsh!)
};

/**
 * Get level from total XP
 */
export function getLevelFromXP(xp: number): UserLevel {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

/**
 * Get XP needed for next level
 */
export function getXPToNextLevel(xp: number): { current: number; required: number; progress: number } {
    const currentLevel = getLevelFromXP(xp);
    const nextLevel = LEVELS[currentLevel.level] || LEVELS[LEVELS.length - 1];

    if (currentLevel.level >= LEVELS.length) {
        return { current: xp, required: currentLevel.xpRequired, progress: 100 };
    }

    const xpIntoLevel = xp - currentLevel.xpRequired;
    const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
    const progress = (xpIntoLevel / xpForLevel) * 100;

    return {
        current: xpIntoLevel,
        required: xpForLevel,
        progress: Math.min(100, Math.max(0, progress))
    };
}

/**
 * Calculate XP for a logged trade
 */
export function calculateTradeXP(trade: Trade, state: GamificationState): XPEvent[] {
    const events: XPEvent[] = [];
    const now = Date.now();

    // Base XP for logging
    events.push({
        type: 'trade_logged',
        xp: XP_REWARDS.TRADE_LOGGED,
        description: 'Trade logged',
        timestamp: now
    });

    // Check for rule following
    if (trade.stopMoved === false || trade.stopMoved === undefined) {
        events.push({
            type: 'stop_respected',
            xp: XP_REWARDS.STOP_RESPECTED,
            description: 'Stop loss respected',
            timestamp: now
        });
    }

    // Streak bonus
    if (state.currentStreak > 0) {
        const streakBonus = Math.min(state.currentStreak * XP_REWARDS.STREAK_DAY, 50);
        events.push({
            type: 'streak_day',
            xp: streakBonus,
            description: `${state.currentStreak}-day streak bonus`,
            timestamp: now
        });
    }

    return events;
}

/**
 * Calculate XP for violations
 */
export function calculateViolationXP(
    violationType: 'stop_moved' | 'overtraded' | 'oversized' | 'revenge' | 'fomo'
): XPEvent {
    const penalties: Record<string, { xp: number; desc: string }> = {
        stop_moved: { xp: XP_REWARDS.VIOLATION_STOP_MOVED, desc: 'Stop loss moved' },
        overtraded: { xp: XP_REWARDS.VIOLATION_OVERTRADED, desc: 'Overtrade detected' },
        oversized: { xp: XP_REWARDS.VIOLATION_OVERSIZED, desc: 'Position oversized' },
        revenge: { xp: XP_REWARDS.VIOLATION_REVENGE, desc: 'Revenge trade' },
        fomo: { xp: XP_REWARDS.VIOLATION_FOMO, desc: 'FOMO entry' },
    };

    const penalty = penalties[violationType] || { xp: -10, desc: 'Violation' };

    return {
        type: 'violation',
        xp: penalty.xp,
        description: penalty.desc,
        timestamp: Date.now()
    };
}

/**
 * Update streak based on activity
 */
export function updateStreak(state: GamificationState, today: string): {
    streak: number;
    streakBroken: boolean;
    newLongest: boolean;
} {
    const lastDate = state.lastActiveDate;

    if (!lastDate) {
        // First day
        return { streak: 1, streakBroken: false, newLongest: true };
    }

    const last = new Date(lastDate);
    const now = new Date(today);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day, streak continues
        return {
            streak: state.currentStreak,
            streakBroken: false,
            newLongest: false
        };
    } else if (diffDays === 1) {
        // Next day, streak increases
        const newStreak = state.currentStreak + 1;
        return {
            streak: newStreak,
            streakBroken: false,
            newLongest: newStreak > state.longestStreak
        };
    } else {
        // Streak broken
        return { streak: 1, streakBroken: true, newLongest: false };
    }
}

/**
 * Check for newly unlocked achievements
 */
export function checkAchievements(
    state: GamificationState,
    trades: Trade[]
): Achievement[] {
    const unlocked: Achievement[] = [];
    const alreadyUnlocked = new Set(state.achievements.map(a => a.id));

    // Trade count achievements
    if (trades.length >= 1 && !alreadyUnlocked.has('first_trade')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'first_trade')!, unlockedAt: Date.now() });
    }
    if (trades.length >= 10 && !alreadyUnlocked.has('trades_10')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'trades_10')!, unlockedAt: Date.now() });
    }
    if (trades.length >= 50 && !alreadyUnlocked.has('trades_50')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'trades_50')!, unlockedAt: Date.now() });
    }
    if (trades.length >= 100 && !alreadyUnlocked.has('trades_100')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'trades_100')!, unlockedAt: Date.now() });
    }

    // Streak achievements
    if (state.currentStreak >= 3 && !alreadyUnlocked.has('streak_3')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'streak_3')!, unlockedAt: Date.now() });
    }
    if (state.currentStreak >= 7 && !alreadyUnlocked.has('streak_7')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'streak_7')!, unlockedAt: Date.now() });
    }
    if (state.currentStreak >= 30 && !alreadyUnlocked.has('streak_30')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'streak_30')!, unlockedAt: Date.now() });
    }

    // Level achievements
    const level = getLevelFromXP(state.totalXP);
    if (level.level >= 5 && !alreadyUnlocked.has('level_5')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'level_5')!, unlockedAt: Date.now() });
    }
    if (level.level >= 10 && !alreadyUnlocked.has('level_10')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'level_10')!, unlockedAt: Date.now() });
    }

    // Win streak detection
    const sortedTrades = [...trades].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    let winStreak = 0;
    for (const trade of sortedTrades) {
        if (trade.pnl > 0) {
            winStreak++;
        } else {
            break;
        }
    }
    if (winStreak >= 3 && !alreadyUnlocked.has('win_streak_3')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'win_streak_3')!, unlockedAt: Date.now() });
    }
    if (winStreak >= 5 && !alreadyUnlocked.has('win_streak_5')) {
        unlocked.push({ ...ACHIEVEMENTS.find(a => a.id === 'win_streak_5')!, unlockedAt: Date.now() });
    }

    return unlocked;
}

/**
 * Create initial gamification state
 */
export function createInitialState(): GamificationState {
    return {
        totalXP: 0,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        tradesToday: 0,
        violationsToday: 0,
        perfectDays: 0,
        lastActiveDate: '',
        xpHistory: [],
        achievements: []
    };
}

/**
 * Apply XP events to state
 */
export function applyXPEvents(state: GamificationState, events: XPEvent[]): GamificationState {
    let newXP = state.totalXP;
    const newHistory = [...state.xpHistory];

    events.forEach(event => {
        newXP = Math.max(0, newXP + event.xp); // XP can't go negative
        newHistory.push(event);
    });

    // Keep only last 100 events
    while (newHistory.length > 100) {
        newHistory.shift();
    }

    const newLevel = getLevelFromXP(newXP);
    const xpProgress = getXPToNextLevel(newXP);

    return {
        ...state,
        totalXP: newXP,
        currentLevel: newLevel.level,
        xpToNextLevel: xpProgress.required - xpProgress.current,
        xpHistory: newHistory
    };
}

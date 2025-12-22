/**
 * Shared TypeScript types for RetailBeastFX Journal
 */

export interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    entry: number;
    exit: number;
    setup: string;
    emotion: string;
    lots: number;
    pnl: number;
    date: string;
    ts: number;
    time?: string; // HH:MM format
    timestamp?: any;
    stopLoss?: string;
    takeProfit?: string;
    riskRewardRatio?: number;
    notes?: string;
    accountId?: string; // Link to TradingAccount

    // Phase 1 Enhancements
    tags?: string[]; // Array of tag IDs
    voiceNoteUrl?: string; // URL to Firebase Storage voice recording
    mood?: 'confident' | 'fearful' | 'neutral' | 'greedy' | 'disciplined' | 'anxious' | 'calm';
    sessionType?: 'London' | 'NewYork' | 'Tokyo' | 'Sydney' | 'Asian' | 'Overlap';
    strategyId?: string; // ID of strategy used
    imageUrl?: string; // Trade screenshot
    entryType?: 'Breakout' | 'Pullback' | 'Reversal' | 'Fade'; // Entry style categorization
}

/**
 * Trading Account from MT5/MT4 report or manual entry
 */
export interface TradingAccount {
    id: string;
    name: string;           // Account holder name (e.g., "Alvin Marshall")
    accountNumber: string;  // Account ID (e.g., "973451")
    broker: string;         // Company/Broker name (e.g., "Coinexx Limited")
    currency: string;       // Account currency (e.g., "USD")
    accountType?: string;   // Account type (e.g., "real, Hedge")
    server?: string;        // Server name (e.g., "Coinexx-Live")
    createdAt: number;      // Timestamp when account was added
    lastUpdated: number;    // Timestamp of last import
    lastReportDate?: string; // Date from last imported report
    startingBalance?: number; // Initial balance from first deposit
}

/**
 * Deposit or withdrawal from account (from MT5 Deals table)
 */
export interface BalanceOperation {
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;         // Always positive amount
    date: string;           // YYYY-MM-DD format
    ts: number;             // Timestamp for sorting
    balance: number;        // Running balance after operation
    comment?: string;       // e.g., "Auto-Account-Deposit"
    accountId?: string;     // Link to TradingAccount
}

export interface NewTradeInput {
    pair: string;
    direction: 'Long' | 'Short';
    entry: string;
    exit: string;
    setup: string;
    emotion: string;
    stopLoss?: string;
    takeProfit?: string;
    notes?: string;
}

export interface UserSettings {
    balance: number;
    broker: string;
    safeMode: boolean;
    isPremium: boolean;
    darkMode: boolean;
    flipMode: boolean;
    dailyGoal: number; // dynamic or static
    weeklyGoal?: number;
    monthlyGoal?: number;
    targetBalance: number;
    startBalance: number;
    maxDailyLossPercent: number;
    currentStreak?: number;
    longestStreak?: number;
    lastProfitableDay?: string;
    showBestStreak?: boolean;

    // Added from GlobalSettings
    dailyGrowth: number;
    pipValue: number;
    stopLoss: number;
    profitTarget: number;
    maxTradesPerDay?: number;
    showWeeklyGoals?: boolean;
    showStreakDetails?: boolean;
    maxDailyLoss?: number; // Fixed amount override
    leverage?: number;
    taxBracketIndex?: number;
    isSection1256?: boolean;

    // Phase 1 Enhancements
    settingsMode?: 'simple' | 'advanced'; // Settings UI mode
    collapsedSections?: string[]; // Array of collapsed section IDs
    tradingStyle?: 'scalper' | 'day' | 'swing'; // Trading Style Mode

    // Notification preferences
    notificationsEnabled?: boolean;
    notifyOnGoalReached?: boolean;
    notifyOnMaxLossWarning?: boolean;
    notifyOnStreakMilestone?: boolean;
    notifyOnWeeklySummary?: boolean;
    notificationSound?: boolean;

    // Backup preferences
    autoBackup?: boolean;
    backupFrequency?: 'daily' | 'weekly' | 'monthly';
    lastBackupDate?: number;

    // Multi-account
    activeAccountId?: string; // Currently selected trading account
}

export interface Tier {
    name: string;
    min: number;
    max: number;
    pairs: number;
    suggestedPairs?: string;
    desc: string;
}

export interface BrokerConfig {
    minLot: number;
    leverage: string[];
    default: string;
}

export interface DeletedTrade extends Trade {
    deletedAt: number;
}

description: string;
action: () => void;
}

// Violation Taxonomy - for non-Trinity trades
export const VIOLATION_REASONS = [
    'No Fresh OB',
    'No BB Touch',
    'EMA Mismatch',
    'Outside Killzone',
    'No Stop Loss',
    'Revenge / FOMO'
] as const;
export type ViolationReason = typeof VIOLATION_REASONS[number];
export type SetupQuality = 'TRINITY' | 'STANDARD' | 'IMPULSE';

// Weekly Review Gate
export interface WeeklyReview {
    id: string;
    weekEndingDate: string; // ISO date of the Sunday (or review date)
    bestSession: string;
    worstViolation: string; // Can be one of VIOLATION_REASONS or custom
    fixForNextWeek: string;
    timestamp: number;
}

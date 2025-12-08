/**
 * Shared TypeScript types for AQT Journal
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

    // Phase 1 Enhancements
    tags?: string[]; // Array of tag IDs
    voiceNoteUrl?: string; // URL to Firebase Storage voice recording
    mood?: 'confident' | 'fearful' | 'neutral' | 'greedy' | 'disciplined' | 'anxious' | 'calm';
    sessionType?: 'London' | 'NewYork' | 'Tokyo' | 'Sydney' | 'Asian' | 'Overlap';
    strategyId?: string; // ID of strategy used
    imageUrl?: string; // Trade screenshot
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

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
    action: () => void;
}

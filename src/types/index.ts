/**
 * Shared TypeScript types for AQT Journal
 */

export interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    entry: string;
    exit: string;
    setup: string;
    emotion: string;
    lots: number;
    pnl: number;
    date: string;
    timestamp?: any;
    stopLoss?: string;
    takeProfit?: string;
    riskRewardRatio?: number;
    notes?: string;
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
    dailyGoal: number;
    weeklyGoal?: number;
    monthlyGoal?: number;
    targetBalance: number;
    startBalance: number;
    maxDailyLossPercent: number;
    currentStreak?: number;
    longestStreak?: number;
    lastProfitableDay?: string;
}

export interface Tier {
    name: string;
    min: number;
    max: number;
    pairs: number;
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

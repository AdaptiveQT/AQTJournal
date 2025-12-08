// Strategy/Playbook Types
export type TradingSession = 'London' | 'NewYork' | 'Tokyo' | 'Sydney' | 'Asian' | 'Overlap';

export interface StrategyRule {
    type: 'entry' | 'exit' | 'risk' | 'time' | 'condition';
    description: string;
    required: boolean;
}

export interface Strategy {
    id: string;
    name: string;
    description: string;

    // Rules and guidelines
    entryRules: StrategyRule[];
    exitRules: StrategyRule[];
    riskRules: StrategyRule[];

    // Optimal conditions
    optimalSessions?: TradingSession[];
    optimalPairs?: string[];
    minRiskRewardRatio?: number;
    maxPositionSize?: number;

    // Performance tracking
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnL: number;
    averagePnL: number;
    bestTrade: number;
    worstTrade: number;

    // Metadata
    createdAt: number;
    updatedAt: number;
    isActive: boolean;
    tags: string[]; // Tag IDs
    notes?: string;
}

export interface StrategyTemplate {
    id: string;
    name: string;
    description: string;
    category: 'Breakout' | 'Reversal' | 'Trend Following' | 'Scalping' | 'Swing' | 'Custom';
    strategy: Omit<Strategy, 'id' | 'totalTrades' | 'winningTrades' | 'losingTrades' | 'totalPnL' | 'averagePnL' | 'bestTrade' | 'worstTrade' | 'createdAt' | 'updatedAt'>;
}

// Default strategy templates
export const DEFAULT_STRATEGY_TEMPLATES: StrategyTemplate[] = [
    {
        id: 'smc-sweep',
        name: 'SMC Order Block Sweep',
        description: 'Smart Money Concepts strategy targeting liquidity sweeps at order blocks',
        category: 'Reversal',
        strategy: {
            name: 'SMC Order Block Sweep',
            description: 'Look for liquidity grabs at key order blocks with BOS confirmation',
            entryRules: [
                { type: 'entry', description: 'Identify clear order block on HTF', required: true },
                { type: 'entry', description: 'Wait for liquidity sweep (stop hunt)', required: true },
                { type: 'entry', description: 'Confirm with BOS (Break of Structure)', required: true },
                { type: 'entry', description: 'Enter on pullback to order block', required: true },
            ],
            exitRules: [
                { type: 'exit', description: 'Target recent swing high/low', required: true },
                { type: 'exit', description: 'Trail stop at each new order block', required: false },
            ],
            riskRules: [
                { type: 'risk', description: 'Risk 1% of account per trade', required: true },
                { type: 'risk', description: 'Stop loss above/below order block', required: true },
                { type: 'risk', description: 'Minimum 1:2 RR', required: true },
            ],
            optimalSessions: ['London', 'NewYork'],
            optimalPairs: ['EURUSD', 'GBPUSD', 'XAUUSD'],
            minRiskRewardRatio: 2,
            isActive: true,
            tags: [],
        },
    },
    {
        id: 'london-breakout',
        name: 'London Open Breakout',
        description: 'Momentum breakout strategy at London session open',
        category: 'Breakout',
        strategy: {
            name: 'London Open Breakout',
            description: 'Trade breakouts of Asian session range at London open',
            entryRules: [
                { type: 'entry', description: 'Identify Asian session range (12AM-3AM EST)', required: true },
                { type: 'entry', description: 'Wait for London open (3AM EST)', required: true },
                { type: 'entry', description: 'Enter on strong breakout with volume', required: true },
            ],
            exitRules: [
                { type: 'exit', description: 'Target 1.5x Asian range', required: true },
                { type: 'exit', description: 'Exit before NY open if target not hit', required: false },
            ],
            riskRules: [
                { type: 'risk', description: 'Stop at opposite side of range', required: true },
                { type: 'risk', description: 'Risk max 2% per trade', required: true },
            ],
            optimalSessions: ['London'],
            optimalPairs: ['GBPUSD', 'EURUSD', 'GBPJPY'],
            minRiskRewardRatio: 1.5,
            isActive: true,
            tags: [],
        },
    },
];

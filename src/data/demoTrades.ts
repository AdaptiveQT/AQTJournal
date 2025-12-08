/**
 * Demo Trades Dataset
 * 100 realistic trades across 4 setups (Breakout, Pullback, Reversal, Trend)
 * Spanning 30 days, 3 sessions (London, NY, Asia)
 * ~55% win rate with realistic R-multiple distribution
 */

import { Trade } from '../types';

const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'GBPJPY'];
const SETUPS: Array<'Breakout' | 'Pullback' | 'Reversal' | 'Trend Following'> = ['Breakout', 'Pullback', 'Reversal', 'Trend Following'];
const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'FOMO', 'Disciplined'];
const SESSIONS = ['London', 'NewYork', 'Tokyo'] as const;

// Generate deterministic but realistic trades
function generateDemoTrades(): Trade[] {
    const trades: Trade[] = [];
    const baseDate = new Date('2024-11-01');

    // Seed for reproducibility
    let seed = 12345;
    const random = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    for (let i = 0; i < 100; i++) {
        const dayOffset = Math.floor(i / 3.5); // ~3-4 trades per day
        const tradeDate = new Date(baseDate);
        tradeDate.setDate(tradeDate.getDate() + dayOffset);

        // Session-based time
        const session = SESSIONS[Math.floor(random() * 3)];
        let hour: number;
        switch (session) {
            case 'London': hour = 8 + Math.floor(random() * 4); break;    // 08:00-12:00
            case 'NewYork': hour = 14 + Math.floor(random() * 4); break;  // 14:00-18:00
            case 'Tokyo': hour = 2 + Math.floor(random() * 4); break;     // 02:00-06:00
        }
        const minute = Math.floor(random() * 60);

        const pair = PAIRS[Math.floor(random() * PAIRS.length)];
        const setup = SETUPS[Math.floor(random() * SETUPS.length)];
        const emotion = EMOTIONS[Math.floor(random() * EMOTIONS.length)];
        const direction: 'Long' | 'Short' = random() > 0.5 ? 'Long' : 'Short';

        // Setup-specific win rates
        const setupWinRates: Record<string, number> = {
            'Breakout': 0.52,
            'Pullback': 0.58,
            'Reversal': 0.45,
            'Trend Following': 0.62
        };
        const isWin = random() < setupWinRates[setup];

        // Realistic entry prices
        let entry: number;
        switch (pair) {
            case 'EURUSD': entry = 1.0800 + (random() - 0.5) * 0.02; break;
            case 'GBPUSD': entry = 1.2700 + (random() - 0.5) * 0.03; break;
            case 'USDJPY': entry = 150.00 + (random() - 0.5) * 2; break;
            case 'XAUUSD': entry = 2650 + (random() - 0.5) * 50; break;
            case 'GBPJPY': entry = 191.00 + (random() - 0.5) * 2; break;
            default: entry = 1.1000;
        }

        // P&L calculation with realistic R-multiples
        // Winners: 0.5R to 3R, Losers: -0.5R to -1R
        const rMultiple = isWin
            ? 0.5 + random() * 2.5  // 0.5R to 3R
            : -(0.5 + random() * 0.5); // -0.5R to -1R

        const baseRisk = 10 + random() * 20; // $10-$30 risk per trade
        const pnl = Math.round(rMultiple * baseRisk * 100) / 100;

        // Exit calculation
        const pipValue = pair === 'XAUUSD' ? 10 : pair.includes('JPY') ? 0.01 : 0.0001;
        const pipsMove = pnl / (0.1 * 10); // Approximate
        const exit = direction === 'Long'
            ? entry + pipsMove * pipValue
            : entry - pipsMove * pipValue;

        const dateStr = tradeDate.toISOString().split('T')[0];
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        trades.push({
            id: `demo-${i + 1}`,
            pair,
            direction,
            entry: Math.round(entry * 100000) / 100000,
            exit: Math.round(exit * 100000) / 100000,
            date: dateStr,
            time: timeStr,
            ts: tradeDate.getTime() + hour * 3600000 + minute * 60000,
            lots: 0.01 + Math.round(random() * 9) / 100, // 0.01 to 0.10
            pnl,
            setup,
            emotion,
            notes: generateNote(isWin, setup, random),
            sessionType: session
        });
    }

    // Sort by timestamp descending (newest first)
    return trades.sort((a, b) => b.ts - a.ts);
}

function generateNote(isWin: boolean, setup: string, random: () => number): string {
    const winNotes = [
        'Followed plan perfectly. Clean entry.',
        'Setup played out as expected.',
        'Patience paid off. Let winner run.',
        'Textbook execution.',
        'Good R:R, managed risk well.'
    ];
    const lossNotes = [
        'Stopped out at planned level.',
        'Market reversed unexpectedly.',
        'Entry timing slightly off.',
        'Held too long, gave back gains.',
        'Need to review this setup.'
    ];

    const notes = isWin ? winNotes : lossNotes;
    return random() > 0.3 ? notes[Math.floor(random() * notes.length)] : '';
}

export const DEMO_TRADES = generateDemoTrades();

// Summary stats for demo data
export const DEMO_STATS = {
    totalTrades: DEMO_TRADES.length,
    winRate: DEMO_TRADES.filter(t => t.pnl > 0).length / DEMO_TRADES.length,
    totalPnL: DEMO_TRADES.reduce((sum, t) => sum + t.pnl, 0),
    bySetup: SETUPS.map(setup => {
        const setupTrades = DEMO_TRADES.filter(t => t.setup === setup);
        const wins = setupTrades.filter(t => t.pnl > 0);
        return {
            setup,
            count: setupTrades.length,
            winRate: wins.length / setupTrades.length,
            totalPnL: setupTrades.reduce((sum, t) => sum + t.pnl, 0)
        };
    })
};

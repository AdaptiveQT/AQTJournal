/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

/**
 * MetaApi Trade History Sync API
 * 
 * Fetches trade history from a connected MetaApi account.
 * 
 * POST /api/metaapi/sync
 * Body: { accountId, startDate?, endDate? }
 */

interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    entry: number;
    exit: number;
    pnl: number;
    lots: number;
    date: string;
    time: string;
    setup: string;
    emotion: string;
    notes: string;
    source: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accountId, startDate, endDate } = body;

        if (!accountId) {
            return NextResponse.json(
                { error: 'Missing required field: accountId' },
                { status: 400 }
            );
        }

        const metaApiToken = process.env.METAAPI_TOKEN;
        if (!metaApiToken) {
            return NextResponse.json(
                { error: 'MetaApi not configured' },
                { status: 500 }
            );
        }

        const MetaApi = (await import('metaapi.cloud-sdk')).default;
        const api = new MetaApi(metaApiToken);

        // Get account - use any to bypass SDK type issues
        const account = await (api.metatraderAccountApi as any).getAccount(accountId);

        // Get RPC connection
        const connection = account.getRPCConnection();
        await connection.connect();
        await connection.waitSynchronized();

        // Calculate date range (default: last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch deals (closed trades) - use any to bypass SDK type issues
        const deals: any[] = await connection.getDealsByTimeRange(start, end);

        // Group deals by position to create complete trades
        const positionMap = new Map<string, any[]>();

        for (const deal of deals) {
            if (deal.type === 'DEAL_TYPE_BALANCE' || !deal.symbol) continue;

            const posId = deal.positionId || deal.id;
            if (!positionMap.has(posId)) {
                positionMap.set(posId, []);
            }
            positionMap.get(posId)!.push(deal);
        }

        // Convert to Trade objects
        const trades: Trade[] = [];

        for (const [positionId, posDeals] of positionMap) {
            if (posDeals.length < 2) continue; // Need entry and exit

            // Sort by time
            posDeals.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

            const entryDeal = posDeals[0];
            const exitDeal = posDeals[posDeals.length - 1];

            // Determine direction from entry type
            const direction: 'Long' | 'Short' =
                entryDeal.type === 'DEAL_TYPE_BUY' ? 'Long' : 'Short';

            // Calculate total P&L
            const totalPnL = posDeals.reduce((sum: number, d: any) => {
                return sum + (d.profit || 0) + (d.commission || 0) + (d.swap || 0);
            }, 0);

            const tradeDate = new Date(entryDeal.time);

            trades.push({
                id: `mt5-${positionId}`,
                pair: entryDeal.symbol,
                direction,
                entry: entryDeal.price,
                exit: exitDeal.price,
                pnl: Math.round(totalPnL * 100) / 100,
                lots: entryDeal.volume,
                date: tradeDate.toISOString().split('T')[0],
                time: tradeDate.toTimeString().split(' ')[0].substring(0, 5),
                setup: 'Imported',
                emotion: 'Neutral',
                notes: `Imported from MT5. Position ID: ${positionId}`,
                source: 'metaapi'
            });
        }

        // Sort by date descending
        trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            success: true,
            trades,
            count: trades.length,
            dateRange: {
                start: start.toISOString(),
                end: end.toISOString()
            }
        });

    } catch (error: any) {
        console.error('MetaApi sync error:', error);

        const errorMessage = error?.message || 'Unknown error';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

/**
 * CTrader Open API Trade History Sync
 * 
 * Fetches trade history from a connected CTrader account.
 * Uses OAuth 2.0 + WebSocket for communication.
 * 
 * POST /api/ctrader/sync
 * Body: { accessToken, accountId, startDate?, endDate? }
 */

import { Trade } from '@/types';

// CTrader WebSocket endpoints
const CTRADER_WS_LIVE = 'wss://live.ctraderapi.com:5035';
const CTRADER_WS_DEMO = 'wss://demo.ctraderapi.com:5035';

interface CTraderDeal {
    dealId: string;
    positionId: string;
    orderId: string;
    symbolId: number;
    symbolName?: string;
    volume: number;
    filledVolume: number;
    dealStatus: string;
    tradeSide: 'BUY' | 'SELL';
    executionPrice: number;
    commission: number;
    swap: number;
    closePositionDetail?: {
        grossProfit: number;
        balance: number;
        closedVolume: number;
    };
    createTimestamp: number;
    executionTimestamp: number;
}

interface CTraderMessage {
    payloadType: number;
    payload: any;
    clientMsgId?: string;
}

// Payload types for CTrader Open API
const PAYLOAD_TYPES = {
    PROTO_OA_APPLICATION_AUTH_REQ: 2100,
    PROTO_OA_APPLICATION_AUTH_RES: 2101,
    PROTO_OA_ACCOUNT_AUTH_REQ: 2102,
    PROTO_OA_ACCOUNT_AUTH_RES: 2103,
    PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ: 2149,
    PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES: 2150,
    PROTO_OA_DEAL_LIST_REQ: 2133,
    PROTO_OA_DEAL_LIST_RES: 2134,
    PROTO_OA_SYMBOL_BY_ID_REQ: 2115,
    PROTO_OA_SYMBOL_BY_ID_RES: 2116,
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accessToken, accountId, startDate, endDate, isDemo = false } = body;

        if (!accessToken || !accountId) {
            return NextResponse.json(
                { error: 'Missing required fields: accessToken and accountId' },
                { status: 400 }
            );
        }

        const clientId = process.env.CTRADER_CLIENT_ID;
        const clientSecret = process.env.CTRADER_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'CTrader API not configured. Set CTRADER_CLIENT_ID and CTRADER_CLIENT_SECRET.' },
                { status: 500 }
            );
        }

        // Calculate date range (default: last 7 days - max allowed by CTrader API)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        // CTrader API limits to 7 days per request
        const MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > MAX_RANGE_MS) {
            return NextResponse.json(
                { error: 'Date range cannot exceed 7 days. Split into multiple requests.' },
                { status: 400 }
            );
        }

        // For server-side, we'll use the REST API approach via HTTP requests
        // The WebSocket approach requires persistent connection, so we'll use
        // the cTrader Connect endpoints instead

        const trades = await fetchCTraderDeals({
            clientId,
            clientSecret,
            accessToken,
            accountId,
            fromTimestamp: start.getTime(),
            toTimestamp: end.getTime(),
            isDemo
        });

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
        console.error('CTrader sync error:', error);

        return NextResponse.json(
            { error: error?.message || 'CTrader sync failed' },
            { status: 500 }
        );
    }
}

/**
 * Fetch deals from CTrader using their Connect API
 */
async function fetchCTraderDeals(params: {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    accountId: string;
    fromTimestamp: number;
    toTimestamp: number;
    isDemo: boolean;
}): Promise<Trade[]> {
    const { accessToken, accountId, fromTimestamp, toTimestamp, isDemo } = params;

    // CTrader Connect API base URL
    const baseUrl = isDemo
        ? 'https://demo.ctraderapi.com'
        : 'https://api.ctrader.com';

    // Fetch historical deals
    const dealsResponse = await fetch(`${baseUrl}/v2/deals?` + new URLSearchParams({
        from: fromTimestamp.toString(),
        to: toTimestamp.toString(),
        limit: '1000'
    }), {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'cTrader-Account-Id': accountId
        }
    });

    if (!dealsResponse.ok) {
        const errorText = await dealsResponse.text();
        throw new Error(`CTrader API error: ${dealsResponse.status} - ${errorText}`);
    }

    const dealsData = await dealsResponse.json();
    const deals: CTraderDeal[] = dealsData.deals || dealsData.data || [];

    // Group deals by position
    const positionMap = new Map<string, CTraderDeal[]>();

    for (const deal of deals) {
        if (!deal.positionId) continue;

        const posId = deal.positionId.toString();
        if (!positionMap.has(posId)) {
            positionMap.set(posId, []);
        }
        positionMap.get(posId)!.push(deal);
    }

    // Convert to Trade objects
    const trades: Trade[] = [];

    for (const [positionId, posDeals] of positionMap) {
        if (posDeals.length < 1) continue;

        // Sort by execution time
        posDeals.sort((a, b) => a.executionTimestamp - b.executionTimestamp);

        const entryDeal = posDeals[0];
        const exitDeal = posDeals.length > 1 ? posDeals[posDeals.length - 1] : null;

        // Skip if position is still open
        if (!exitDeal?.closePositionDetail) continue;

        const direction: 'Long' | 'Short' = entryDeal.tradeSide === 'BUY' ? 'Long' : 'Short';

        // Calculate P&L from close detail
        const grossProfit = exitDeal.closePositionDetail.grossProfit / 100; // CTrader uses cents
        const commission = posDeals.reduce((sum, d) => sum + (d.commission || 0), 0) / 100;
        const swap = posDeals.reduce((sum, d) => sum + (d.swap || 0), 0) / 100;
        const totalPnL = grossProfit + commission + swap;

        const tradeDate = new Date(entryDeal.executionTimestamp);

        // Volume in CTrader is in units, convert to lots (divide by 100000 for forex)
        const lots = entryDeal.filledVolume / 100000;

        trades.push({
            id: `ct-${positionId}`,
            pair: entryDeal.symbolName || `Symbol#${entryDeal.symbolId}`,
            direction,
            entry: entryDeal.executionPrice,
            exit: exitDeal.executionPrice,
            pnl: Math.round(totalPnL * 100) / 100,
            lots: Math.round(lots * 100) / 100,
            date: tradeDate.toISOString().split('T')[0],
            ts: tradeDate.getTime(),
            setup: 'Imported',
            notes: `Imported from CTrader. Position ID: ${positionId}`,
            source: 'ctrader',
            accountId: accountId
        });
    }

    // Sort by date descending
    trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return trades;
}

/**
 * GET endpoint to initiate OAuth flow
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    const clientId = process.env.CTRADER_CLIENT_ID;
    const redirectUri = process.env.CTRADER_REDIRECT_URI || `${request.nextUrl.origin}/api/ctrader/callback`;

    if (action === 'authorize') {
        // Redirect to CTrader OAuth authorization
        const authUrl = new URL('https://connect.spotware.com/oauth/authorize');
        authUrl.searchParams.set('client_id', clientId || '');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'accounts');

        return NextResponse.redirect(authUrl.toString());
    }

    return NextResponse.json({
        message: 'CTrader API endpoint',
        actions: {
            authorize: 'GET /api/ctrader/sync?action=authorize',
            sync: 'POST /api/ctrader/sync { accessToken, accountId, startDate?, endDate?, isDemo? }'
        }
    });
}

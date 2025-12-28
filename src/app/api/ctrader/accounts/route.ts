/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

/**
 * cTrader Accounts API
 * 
 * Fetches list of trading accounts for authenticated user.
 * 
 * POST /api/ctrader/accounts
 * Body: { accessToken }
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accessToken } = body;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Missing access token' },
                { status: 400 }
            );
        }

        // Fetch accounts from cTrader Open API
        const accountsResponse = await fetch('https://api.spotware.com/connect/tradingaccounts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        if (!accountsResponse.ok) {
            const errorData = await accountsResponse.json();
            return NextResponse.json(
                { error: errorData.errorDescription || 'Failed to fetch accounts' },
                { status: accountsResponse.status }
            );
        }

        const accountsData = await accountsResponse.json();

        // Map to simplified format
        const accounts = (accountsData.data || []).map((acc: any) => ({
            id: acc.accountId?.toString() || acc.traderLogin?.toString(),
            accountNumber: acc.traderLogin?.toString(),
            name: acc.accountName || `cTrader ${acc.traderLogin}`,
            broker: acc.brokerName || 'cTrader Broker',
            balance: acc.balance || 0,
            currency: acc.depositAssetId || 'USD',
            isLive: acc.isLive ?? false,
        }));

        return NextResponse.json({
            success: true,
            accounts,
        });

    } catch (error: any) {
        console.error('cTrader accounts error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}

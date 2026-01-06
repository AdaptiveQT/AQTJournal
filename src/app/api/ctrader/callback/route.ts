import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

/**
 * CTrader OAuth Callback
 * 
 * Handles the OAuth redirect from CTrader Connect.
 * Exchanges authorization code for access token.
 * 
 * GET /api/ctrader/callback?code=xxx
 */

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
        // Redirect to frontend with error
        const errorUrl = new URL('/settings', request.nextUrl.origin);
        errorUrl.searchParams.set('ctrader_error', errorDescription || error);
        return NextResponse.redirect(errorUrl.toString());
    }

    if (!code) {
        return NextResponse.json(
            { error: 'Missing authorization code' },
            { status: 400 }
        );
    }

    const clientId = process.env.CTRADER_CLIENT_ID;
    const clientSecret = process.env.CTRADER_CLIENT_SECRET;
    const redirectUri = process.env.CTRADER_REDIRECT_URI || `${request.nextUrl.origin}/api/ctrader/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'CTrader API not configured' },
            { status: 500 }
        );
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://connect.spotware.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        // Now get the user's trading accounts
        const accountsResponse = await fetch('https://connect.spotware.com/apps/accounts', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });

        let accounts: any[] = [];
        if (accountsResponse.ok) {
            const accountsData = await accountsResponse.json();
            accounts = accountsData.data || accountsData.accounts || [];
        }

        // Redirect to frontend with token in URL fragment (not query to avoid server logs)
        // The frontend will extract and store it securely
        const successUrl = new URL('/settings', request.nextUrl.origin);
        successUrl.searchParams.set('ctrader_success', 'true');
        successUrl.searchParams.set('ctrader_accounts', JSON.stringify(accounts.map((a: any) => ({
            accountId: a.ctidTraderAccountId || a.accountId,
            accountNumber: a.traderLogin || a.accountNumber,
            brokerName: a.brokerName || a.broker,
            isDemo: a.isLive === false || a.traderAccountType === 'DEMO',
            balance: a.balance,
            currency: a.depositCurrency || a.currency
        }))));

        // Store token in HTTP-only cookie for security
        const response = NextResponse.redirect(successUrl.toString());

        response.cookies.set('ctrader_access_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokenData.expires_in || 2628000, // 30 days default
            path: '/'
        });

        if (tokenData.refresh_token) {
            response.cookies.set('ctrader_refresh_token', tokenData.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 365 * 24 * 60 * 60, // 1 year
                path: '/'
            });
        }

        return response;

    } catch (error: any) {
        console.error('CTrader OAuth error:', error);

        const errorUrl = new URL('/settings', request.nextUrl.origin);
        errorUrl.searchParams.set('ctrader_error', error?.message || 'OAuth failed');
        return NextResponse.redirect(errorUrl.toString());
    }
}

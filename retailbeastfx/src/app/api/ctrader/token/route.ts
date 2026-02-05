/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

/**
 * cTrader OAuth Token Exchange
 * 
 * Exchanges authorization code for access token.
 * 
 * POST /api/ctrader/token
 * Body: { code, redirectUri }
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, redirectUri } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Missing authorization code' },
                { status: 400 }
            );
        }

        const clientId = process.env.CTRADER_CLIENT_ID;
        const clientSecret = process.env.CTRADER_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'cTrader not configured. Please set CTRADER_CLIENT_ID and CTRADER_CLIENT_SECRET.' },
                { status: 500 }
            );
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://openapi.ctrader.com/apps/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/api/ctrader/callback`,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json(
                { error: tokenData.error_description || 'Failed to exchange token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            tokenType: tokenData.token_type,
        });

    } catch (error: any) {
        console.error('cTrader token error:', error);
        return NextResponse.json(
            { error: error?.message || 'Token exchange failed' },
            { status: 500 }
        );
    }
}

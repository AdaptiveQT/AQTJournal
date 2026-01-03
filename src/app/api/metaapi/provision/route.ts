/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import MetaApi from 'metaapi.cloud-sdk';

/**
 * MetaApi Account Provisioning API
 * 
 * Creates a new MetaApi account connection for MT4/MT5.
 * 
 * POST /api/metaapi/provision
 * Body: { name, login, password, server, platform }
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, login, password, server, platform = 'mt5' } = body;

        // Validate required fields
        if (!login || !password || !server) {
            return NextResponse.json(
                { error: 'Missing required fields: login, password, server' },
                { status: 400 }
            );
        }

        // Check for MetaApi token
        const metaApiToken = process.env.METAAPI_TOKEN;
        if (!metaApiToken) {
            return NextResponse.json(
                { error: 'MetaApi not configured. Please set METAAPI_TOKEN environment variable.' },
                { status: 500 }
            );
        }



        const api = new MetaApi(metaApiToken);

        // Create account - use any to bypass SDK type issues
        const account = await (api.metatraderAccountApi as any).createAccount({
            name: name || `MT5 Account ${login}`,
            type: 'cloud',
            login: String(login),
            password: password,
            server: server,
            platform: platform,
            magic: 0
        });

        // Wait for account to be deployed (with timeout)
        const deployPromise = account.waitDeployed();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Deployment timeout')), 60000)
        );

        await Promise.race([deployPromise, timeoutPromise]);

        return NextResponse.json({
            success: true,
            accountId: account.id,
            name: account.name,
            server: account.server,
            state: account.state,
            connectionStatus: account.connectionStatus
        });

    } catch (error: any) {
        console.error('MetaApi provision error:', error);

        const errorMessage = error?.message || 'Unknown error';
        const errorCode = error?.code;

        // Handle specific MetaApi errors
        if (errorCode === 'INVALID_LOGIN' || errorMessage.includes('Invalid login')) {
            return NextResponse.json(
                { error: 'Invalid MT5 login credentials' },
                { status: 401 }
            );
        }

        if (errorMessage.includes('server not found')) {
            return NextResponse.json(
                { error: 'Server not found. Please check the broker server name.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

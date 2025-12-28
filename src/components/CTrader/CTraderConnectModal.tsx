'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    ExternalLink,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Shield,
    RefreshCw
} from 'lucide-react';

interface CTraderConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnected: (accountId: string, accountName: string) => void;
    darkMode?: boolean;
}

interface CTraderAccount {
    id: string;
    accountNumber: string;
    name: string;
    broker: string;
    balance: number;
    currency: string;
    isLive: boolean;
}

const CTraderConnectModal: React.FC<CTraderConnectModalProps> = ({
    isOpen,
    onClose,
    onConnected,
    darkMode = true
}) => {
    const [step, setStep] = useState<'intro' | 'waiting' | 'accounts' | 'success' | 'error'>('intro');
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<CTraderAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    // cTrader OAuth URL
    const getOAuthUrl = () => {
        const clientId = process.env.NEXT_PUBLIC_CTRADER_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/ctrader/callback`;
        const scope = 'accounts'; // Read-only access

        return `https://openapi.ctrader.com/apps/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    };

    const handleConnectClick = () => {
        // Open OAuth in new window
        const oauthUrl = getOAuthUrl();
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            oauthUrl,
            'cTrader OAuth',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        setStep('waiting');
    };

    // Listen for OAuth callback message
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'ctrader-oauth-callback') {
                const { code, error: oauthError } = event.data;

                if (oauthError) {
                    setError(oauthError);
                    setStep('error');
                    return;
                }

                if (code) {
                    try {
                        // Exchange code for token
                        const tokenResponse = await fetch('/api/ctrader/token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                code,
                                redirectUri: `${window.location.origin}/api/ctrader/callback`
                            }),
                        });

                        const tokenData = await tokenResponse.json();

                        if (!tokenResponse.ok) {
                            throw new Error(tokenData.error);
                        }

                        // Fetch accounts
                        const accountsResponse = await fetch('/api/ctrader/accounts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ accessToken: tokenData.accessToken }),
                        });

                        const accountsData = await accountsResponse.json();

                        if (!accountsResponse.ok) {
                            throw new Error(accountsData.error);
                        }

                        setAccounts(accountsData.accounts);
                        setStep('accounts');

                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Connection failed');
                        setStep('error');
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleAccountSelect = () => {
        if (!selectedAccount) return;

        const account = accounts.find(a => a.id === selectedAccount);
        if (account) {
            setStep('success');
            setTimeout(() => {
                onConnected(account.id, account.name);
            }, 1500);
        }
    };

    const handleReset = () => {
        setStep('intro');
        setError(null);
        setAccounts([]);
        setSelectedAccount(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-slate-700 bg-gradient-to-r from-cyan-900/50 to-blue-900/50' : 'border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            cT
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Connect cTrader</h2>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sync trades via OAuth
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {step === 'intro' && (
                        <div className="space-y-4">
                            <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'
                                }`}>
                                <Shield size={20} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className={darkMode ? 'text-cyan-300' : 'text-cyan-700'}>
                                        <strong>Secure OAuth Login</strong> - You'll be redirected to cTrader to authorize read-only access to your account history.
                                    </p>
                                </div>
                            </div>

                            <div className={`text-sm space-y-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                <p>✓ View trading history</p>
                                <p>✓ Sync closed positions</p>
                                <p>✓ No trading permissions required</p>
                            </div>

                            <button
                                onClick={handleConnectClick}
                                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} />
                                Connect with cTrader
                            </button>
                        </div>
                    )}

                    {step === 'waiting' && (
                        <div className="py-12 text-center">
                            <RefreshCw size={48} className="mx-auto mb-4 text-cyan-500 animate-spin" />
                            <p className="font-medium">Waiting for authorization...</p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Complete login in the popup window
                            </p>
                            <button
                                onClick={handleReset}
                                className={`mt-4 text-sm ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {step === 'accounts' && (
                        <div className="space-y-4">
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Select an account to connect:
                            </p>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {accounts.map(account => (
                                    <button
                                        key={account.id}
                                        onClick={() => setSelectedAccount(account.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${selectedAccount === account.id
                                                ? 'bg-cyan-500/20 border-2 border-cyan-500'
                                                : darkMode
                                                    ? 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
                                                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {account.name}
                                                </div>
                                                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {account.broker} • {account.accountNumber}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${account.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {account.currency} {account.balance.toLocaleString()}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${account.isLive
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {account.isLive ? 'Live' : 'Demo'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleAccountSelect}
                                disabled={!selectedAccount}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Connect Selected Account
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <p className="font-bold text-lg text-emerald-500">Connected!</p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Your cTrader account is now linked
                            </p>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="py-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>
                            <p className="font-bold text-lg text-red-500">Connection Failed</p>
                            <p className={`text-sm mt-2 max-w-xs mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {error}
                            </p>
                            <button
                                onClick={handleReset}
                                className="mt-4 px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CTraderConnectModal;

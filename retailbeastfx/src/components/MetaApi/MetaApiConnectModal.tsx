'use client';

import React, { useState } from 'react';
import {
    X,
    Server,
    Key,
    User,
    Loader2,
    CheckCircle,
    AlertTriangle,
    ExternalLink,
    Shield
} from 'lucide-react';

interface MetaApiConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnected: (accountId: string, accountName: string) => void;
    darkMode?: boolean;
}

// Common MT5 broker servers
const POPULAR_SERVERS = [
    { name: 'ICMarkets-Demo', display: 'IC Markets (Demo)' },
    { name: 'ICMarkets-Live', display: 'IC Markets (Live)' },
    { name: 'Pepperstone-Demo', display: 'Pepperstone (Demo)' },
    { name: 'Pepperstone-Live', display: 'Pepperstone (Live)' },
    { name: 'XMGlobal-MT5', display: 'XM Global' },
    { name: 'FPMarkets-Live', display: 'FP Markets' },
    { name: 'FTMO-Demo', display: 'FTMO (Demo)' },
    { name: 'FTMO-Live', display: 'FTMO (Live)' },
];

const MetaApiConnectModal: React.FC<MetaApiConnectModalProps> = ({
    isOpen,
    onClose,
    onConnected,
    darkMode = true
}) => {
    const [step, setStep] = useState<'form' | 'connecting' | 'success' | 'error'>('form');
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        login: '',
        password: '',
        server: '',
        customServer: '',
        platform: 'mt5' as 'mt4' | 'mt5',
        useInvestorPassword: true
    });

    const handleConnect = async () => {
        setStep('connecting');
        setError(null);

        const server = form.server === 'custom' ? form.customServer : form.server;

        try {
            const response = await fetch('/api/metaapi/provision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name || `MT5 ${form.login}`,
                    login: form.login,
                    password: form.password,
                    server: server,
                    platform: 'mt5'
                })
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Non-JSON response:', responseText);
                throw new Error(`Server Error: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Connection failed: ${response.statusText}`);
            }

            setStep('success');

            // Notify parent after short delay
            setTimeout(() => {
                onConnected(data.accountId, data.name);
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStep('error');
        }
    };

    const handleReset = () => {
        setStep('form');
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-slate-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            MT5
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Connect MetaTrader 5</h2>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sync trades automatically
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                            }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {step === 'form' && (
                        <div className="space-y-4">
                            {/* Security notice */}
                            <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                                }`}>
                                <Shield size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className={darkMode ? 'text-blue-300' : 'text-blue-700'}>
                                        <strong>Investor password recommended</strong> - Read-only access for trade history sync only.
                                    </p>
                                </div>
                            </div>

                            {/* Account Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Account Name (Optional)
                                </label>
                                <div className="relative">
                                    <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="My Trading Account"
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${darkMode
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                            : 'bg-white border-slate-300 placeholder:text-slate-400'
                                            } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                </div>
                            </div>

                            {/* Login */}
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    MT5 Login *
                                </label>
                                <div className="relative">
                                    <Key size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <input
                                        type="text"
                                        value={form.login}
                                        onChange={(e) => setForm(prev => ({ ...prev, login: e.target.value }))}
                                        placeholder="12345678"
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${darkMode
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                            : 'bg-white border-slate-300 placeholder:text-slate-400'
                                            } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {form.useInvestorPassword ? 'Investor Password *' : 'Master Password *'}
                                </label>
                                <div className="relative">
                                    <Key size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="••••••••"
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${darkMode
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                            : 'bg-white border-slate-300 placeholder:text-slate-400'
                                            } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                </div>
                            </div>

                            {/* Server */}
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Broker Server *
                                </label>
                                <div className="relative">
                                    <Server size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                    <select
                                        value={form.server}
                                        onChange={(e) => setForm(prev => ({ ...prev, server: e.target.value }))}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer ${darkMode
                                            ? 'bg-slate-800 border-slate-700 text-white'
                                            : 'bg-white border-slate-300'
                                            } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    >
                                        <option value="">Select your broker...</option>
                                        {POPULAR_SERVERS.map(s => (
                                            <option key={s.name} value={s.name}>{s.display}</option>
                                        ))}
                                        <option value="custom">Other (Enter manually)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Custom Server */}
                            {form.server === 'custom' && (
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        Custom Server Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.customServer}
                                        onChange={(e) => setForm(prev => ({ ...prev, customServer: e.target.value }))}
                                        placeholder="BrokerName-Live"
                                        className={`w-full px-4 py-2.5 rounded-xl text-sm ${darkMode
                                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                            : 'bg-white border-slate-300 placeholder:text-slate-400'
                                            } border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                </div>
                            )}

                            {/* Connect Button */}
                            <button
                                onClick={handleConnect}
                                disabled={!form.login || !form.password || (!form.server || (form.server === 'custom' && !form.customServer))}
                                className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                            >
                                Connect MT5 Account
                            </button>

                            {/* Help link */}
                            <div className="text-center">
                                <a
                                    href="https://www.metatrader5.com/en/terminal/help/startwork/acc_connect"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs flex items-center justify-center gap-1 ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ExternalLink size={12} />
                                    How to find your MT5 login details
                                </a>
                            </div>
                        </div>
                    )}

                    {step === 'connecting' && (
                        <div className="py-12 text-center">
                            <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                            <p className="font-medium">Connecting to MetaTrader 5...</p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                This may take up to 60 seconds
                            </p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <p className="font-bold text-lg text-emerald-500">Connected!</p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Your MT5 account is now linked
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

export default MetaApiConnectModal;

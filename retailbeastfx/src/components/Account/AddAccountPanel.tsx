'use client';

import React, { useState, useCallback } from 'react';
import {
    X,
    Upload,
    FileSpreadsheet,
    Plus,
    Download,
    RefreshCw,
    Check,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { TradingAccount, Trade } from '../../types';
import MetaApiConnectModal from '../MetaApi/MetaApiConnectModal';
import CTraderConnectModal from '../CTrader/CTraderConnectModal';

interface AddAccountPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenImportWizard: () => void;
    onCreateManualAccount: (account: Partial<TradingAccount>) => void;
    onImportTrades?: (trades: Trade[]) => void;
    darkMode?: boolean;
}

// Broker definitions with their capabilities
const BROKERS = [
    {
        id: 'metatrader',
        name: 'MetaTrader',
        logo: 'MT',
        color: 'from-blue-600 to-blue-800',
        markets: ['Forex', 'Crypto', 'CFD', 'Stocks', 'Futures', 'Options'],
        status: 'available' as const,
        description: 'Import via HTML report export'
    },
    {
        id: 'tradovate',
        name: 'Tradovate',
        logo: 'TV',
        color: 'from-cyan-500 to-cyan-700',
        markets: ['Futures', 'Options'],
        status: 'coming_soon' as const,
        description: 'API integration coming soon'
    },
    {
        id: 'ctrader',
        name: 'cTrader',
        logo: 'cT',
        color: 'from-cyan-500 to-blue-600',
        markets: ['Forex', 'Crypto', 'CFD', 'Stocks'],
        status: 'available' as const,
        description: 'OAuth integration'
    },
    {
        id: 'tradelocker',
        name: 'TradeLocker',
        logo: 'TL',
        color: 'from-purple-500 to-purple-700',
        markets: ['Forex', 'Crypto', 'CFD', 'Stocks'],
        status: 'coming_soon' as const,
        description: 'Integration under research'
    },
    {
        id: 'ninjatrader',
        name: 'NinjaTrader',
        logo: 'NT',
        color: 'from-yellow-500 to-yellow-700',
        markets: ['Futures'],
        status: 'coming_soon' as const,
        description: 'CSV import available'
    }
];

const CSV_TEMPLATES = [
    { id: 'generic', name: 'Universal Template', file: '/templates/generic_template.csv' },
    { id: 'metatrader', name: 'MetaTrader Template', file: '/templates/metatrader_template.csv' },
    { id: 'tradovate', name: 'Tradovate Template', file: '/templates/tradovate_template.csv' },
    { id: 'ctrader', name: 'cTrader Template', file: '/templates/ctrader_template.csv' }
];

const AddAccountPanel: React.FC<AddAccountPanelProps> = ({
    isOpen,
    onClose,
    onOpenImportWizard,
    onCreateManualAccount,
    onImportTrades,
    darkMode = true
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualForm, setManualForm] = useState({
        name: '',
        accountNumber: '',
        broker: '',
        currency: 'USD',
        startingBalance: ''
    });
    const [showMetaApiModal, setShowMetaApiModal] = useState(false);
    const [showCTraderModal, setShowCTraderModal] = useState(false);

    // Drag handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        // Let the import wizard handle the file
        onOpenImportWizard();
    }, [onOpenImportWizard]);

    const handleManualSubmit = () => {
        if (!manualForm.name || !manualForm.accountNumber) return;

        onCreateManualAccount({
            name: manualForm.name,
            accountNumber: manualForm.accountNumber,
            broker: manualForm.broker || 'Unknown',
            currency: manualForm.currency,
            startingBalance: parseFloat(manualForm.startingBalance) || 0
        });

        setManualForm({
            name: '',
            accountNumber: '',
            broker: '',
            currency: 'USD',
            startingBalance: ''
        });
        setShowManualForm(false);
        onClose();
    };

    const handleBrokerClick = (broker: typeof BROKERS[0]) => {
        if (broker.status === 'available') {
            if (broker.id === 'metatrader') {
                setShowMetaApiModal(true);
            } else if (broker.id === 'ctrader') {
                setShowCTraderModal(true);
            } else {
                onOpenImportWizard();
            }
        }
    };

    const handleMetaApiConnected = async (accountId: string, accountName: string) => {
        setShowMetaApiModal(false);
        // Create account from MetaApi connection
        onCreateManualAccount({
            name: accountName,
            accountNumber: accountId,
            broker: 'MetaTrader',
            currency: 'USD',
            startingBalance: 0
        });

        // Trigger Historical Sync
        if (onImportTrades) {
            try {
                const res = await fetch('/api/metaapi/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountId })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.trades) {
                        onImportTrades(data.trades);
                    }
                }
            } catch (err) {
                console.error('Auto-sync failed:', err);
            }
        }

        onClose();
    };

    const handleCTraderConnected = (accountId: string, accountName: string) => {
        setShowCTraderModal(false);
        // Create account from cTrader connection
        onCreateManualAccount({
            name: accountName,
            accountNumber: accountId,
            broker: 'cTrader',
            currency: 'USD',
            startingBalance: 0
        });
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Plus className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Add Account</h2>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Connect your trading account
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">

                    {/* Section 1: Upload File */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                Upload File
                            </h3>
                            <div className="relative group">
                                <button className={`text-xs flex items-center gap-1 ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'
                                    }`}>
                                    <Download size={12} />
                                    Download CSV template
                                </button>
                                {/* Dropdown */}
                                <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                                    }`}>
                                    {CSV_TEMPLATES.map(template => (
                                        <a
                                            key={template.id}
                                            href={template.file}
                                            download
                                            className={`block px-3 py-2 text-xs first:rounded-t-lg last:rounded-b-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                                                }`}
                                        >
                                            {template.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={onOpenImportWizard}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : darkMode
                                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                                }`}
                        >
                            <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-emerald-400' : 'text-slate-400'
                                }`} />
                            <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                Drag and drop files here to upload
                            </p>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                CSV, HTML (MT4/MT5 reports)
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        <span className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>or</span>
                        <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    </div>

                    {/* Section 2: Manual Account */}
                    <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            Manual
                        </h3>

                        {!showManualForm ? (
                            <button
                                onClick={() => setShowManualForm(true)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${darkMode
                                    ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                        <FileSpreadsheet size={20} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
                                    </div>
                                    <span className="font-medium">Create manual account</span>
                                </div>
                                <Plus size={20} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                            </button>
                        ) : (
                            <div className={`p-4 rounded-xl space-y-3 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'
                                }`}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Account Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.name}
                                            onChange={e => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="My Trading Account"
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                                                } border focus:ring-2 focus:ring-emerald-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Account Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.accountNumber}
                                            onChange={e => setManualForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            placeholder="123456"
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                                                } border focus:ring-2 focus:ring-emerald-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Broker
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.broker}
                                            onChange={e => setManualForm(prev => ({ ...prev, broker: e.target.value }))}
                                            placeholder="e.g., OANDA"
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                                                } border focus:ring-2 focus:ring-emerald-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Starting Balance
                                        </label>
                                        <input
                                            type="number"
                                            value={manualForm.startingBalance}
                                            onChange={e => setManualForm(prev => ({ ...prev, startingBalance: e.target.value }))}
                                            placeholder="10000"
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                                                } border focus:ring-2 focus:ring-emerald-500`}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setShowManualForm(false)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleManualSubmit}
                                        disabled={!manualForm.name || !manualForm.accountNumber}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Check size={16} /> Create Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        <span className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>or</span>
                        <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    </div>

                    {/* Section 3: Broker Sync */}
                    <div>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            Sync
                        </h3>

                        <div className="space-y-2">
                            {BROKERS.map(broker => (
                                <button
                                    key={broker.id}
                                    onClick={() => handleBrokerClick(broker)}
                                    disabled={broker.status === 'coming_soon'}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${broker.status === 'available'
                                        ? darkMode
                                            ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                        : darkMode
                                            ? 'bg-slate-800/30 border border-slate-800 opacity-60 cursor-not-allowed'
                                            : 'bg-slate-50/50 border border-slate-100 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Logo */}
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${broker.color} flex items-center justify-center text-white font-bold text-sm`}>
                                            {broker.logo}
                                        </div>

                                        <div className="text-left">
                                            <div className="font-medium">{broker.name}</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {broker.markets.slice(0, 4).map(market => (
                                                    <span
                                                        key={market}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded ${darkMode
                                                            ? 'bg-slate-700 text-slate-400'
                                                            : 'bg-slate-200 text-slate-500'
                                                            }`}
                                                    >
                                                        {market}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-2">
                                        {broker.status === 'available' ? (
                                            <span className="flex items-center gap-1 text-xs text-emerald-500">
                                                <Check size={14} />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-amber-500">
                                                <Clock size={14} />
                                                Coming soon
                                            </span>
                                        )}
                                        <ChevronRight size={16} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Help Link */}
                    <div className={`text-center pt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <a
                            href="#"
                            className="text-xs flex items-center justify-center gap-1 hover:text-emerald-500 transition-colors"
                        >
                            <ExternalLink size={12} />
                            How to export trades from your broker
                        </a>
                    </div>
                </div>
            </div>

            {/* MetaApi Connect Modal */}
            <MetaApiConnectModal
                isOpen={showMetaApiModal}
                onClose={() => setShowMetaApiModal(false)}
                onConnected={handleMetaApiConnected}
                darkMode={darkMode}
            />

            {/* cTrader Connect Modal */}
            <CTraderConnectModal
                isOpen={showCTraderModal}
                onClose={() => setShowCTraderModal(false)}
                onConnected={handleCTraderConnected}
                darkMode={darkMode}
            />
        </div>
    );
};

export default AddAccountPanel;

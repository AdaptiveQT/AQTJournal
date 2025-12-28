'use client';

import React, { useState } from 'react';
import {
    ChevronDown,
    Plus,
    Wallet,
    Check,
    TrendingUp,
    TrendingDown,
    Settings2
} from 'lucide-react';
import { TradingAccount } from '../../types';

interface AccountSwitcherProps {
    accounts: TradingAccount[];
    activeAccountId: string | null;
    balance: number;
    totalPnL: number;
    onSelectAccount: (accountId: string) => void;
    onAddAccount: () => void;
    onManageAccounts: () => void;
    darkMode?: boolean;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
    accounts,
    activeAccountId,
    balance,
    totalPnL,
    onSelectAccount,
    onAddAccount,
    onManageAccounts,
    darkMode = true
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const activeAccount = accounts.find(a => a.id === activeAccountId);
    const displayName = activeAccount?.name || 'No Account';
    const isProfit = totalPnL >= 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group
                    ${darkMode
                        ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10'
                        : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg'}`}
            >
                {/* Account Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                    ${darkMode
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'}`}
                >
                    <Wallet size={18} className={darkMode ? 'text-emerald-400' : 'text-blue-500'} />
                </div>

                {/* Account Info */}
                <div className="text-left hidden sm:block">
                    <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {displayName}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(balance)}
                        </span>
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200
                        ${darkMode
                            ? 'bg-slate-900 border border-slate-700/50'
                            : 'bg-white border border-slate-200'}`}
                    >
                        {/* Balance Summary */}
                        <div className={`p-4 border-b ${darkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                            <div className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Current Balance
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {formatCurrency(balance)}
                                </span>
                                <span className={`text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-lg
                                    ${isProfit
                                        ? 'text-emerald-400 bg-emerald-500/10'
                                        : 'text-red-400 bg-red-500/10'}`}
                                >
                                    {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
                                </span>
                            </div>
                        </div>

                        {/* Account List */}
                        <div className="max-h-48 overflow-y-auto">
                            {accounts.length === 0 ? (
                                <div className={`p-4 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    No accounts connected
                                </div>
                            ) : (
                                accounts.map(account => (
                                    <button
                                        key={account.id}
                                        onClick={() => {
                                            onSelectAccount(account.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-3 text-left transition-colors
                                            ${activeAccountId === account.id
                                                ? darkMode ? 'bg-emerald-500/10' : 'bg-blue-50'
                                                : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                                                ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                                            >
                                                {account.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {account.name}
                                                </div>
                                                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {account.broker} • {account.accountNumber}
                                                </div>
                                            </div>
                                        </div>
                                        {activeAccountId === account.id && (
                                            <Check size={16} className="text-emerald-500" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Actions */}
                        <div className={`p-2 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                            <button
                                onClick={() => {
                                    onAddAccount();
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${darkMode
                                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                                        : 'text-blue-600 hover:bg-blue-50'}`}
                            >
                                <Plus size={16} />
                                Add New Account
                            </button>
                            <button
                                onClick={() => {
                                    onManageAccounts();
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${darkMode
                                        ? 'text-slate-400 hover:bg-slate-800'
                                        : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Settings2 size={16} />
                                Manage Accounts
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccountSwitcher;

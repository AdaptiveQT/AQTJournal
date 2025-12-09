'use client';

import React, { useState } from 'react';
import { X, User, Edit2, Trash2, Check, ChevronRight, Building, CreditCard, Globe, Calendar, Plus, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { TradingAccount, BalanceOperation } from '../../types';

interface AccountManagerProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: TradingAccount[];
    activeAccountId: string | null;
    onSelectAccount: (accountId: string) => void;
    onUpdateAccount: (account: TradingAccount) => void;
    onDeleteAccount: (accountId: string) => void;
    balanceOperations?: BalanceOperation[];
    onAddBalanceOperation?: (operation: BalanceOperation) => void;
    darkMode?: boolean;
}

const AccountManager: React.FC<AccountManagerProps> = ({
    isOpen,
    onClose,
    accounts,
    activeAccountId,
    onSelectAccount,
    onUpdateAccount,
    onDeleteAccount,
    balanceOperations = [],
    onAddBalanceOperation,
    darkMode = true
}) => {
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<TradingAccount>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Deposit/Withdrawal Modal State
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [operationAmount, setOperationAmount] = useState('');
    const [operationComment, setOperationComment] = useState('');

    if (!isOpen) return null;

    const startEdit = (account: TradingAccount) => {
        setEditingAccountId(account.id);
        setEditForm({
            name: account.name,
            accountNumber: account.accountNumber,
            broker: account.broker,
            currency: account.currency,
            server: account.server,
            accountType: account.accountType,
            startingBalance: account.startingBalance
        });
    };

    const cancelEdit = () => {
        setEditingAccountId(null);
        setEditForm({});
    };

    const saveEdit = (account: TradingAccount) => {
        onUpdateAccount({
            ...account,
            ...editForm,
            lastUpdated: Date.now()
        });
        setEditingAccountId(null);
        setEditForm({});
    };

    const handleDelete = (accountId: string) => {
        if (deleteConfirm === accountId) {
            onDeleteAccount(accountId);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(accountId);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const handleAddOperation = () => {
        if (!onAddBalanceOperation || !operationAmount || !activeAccountId) return;

        const amount = parseFloat(operationAmount);
        if (isNaN(amount) || amount <= 0) return;

        const activeAccount = accounts.find(a => a.id === activeAccountId);
        const currentBalance = activeAccount?.startingBalance || 0;
        const newBalance = operationType === 'deposit'
            ? currentBalance + amount
            : currentBalance - amount;

        const operation: BalanceOperation = {
            id: `op-${Date.now()}`,
            type: operationType,
            amount,
            date: new Date().toISOString().split('T')[0],
            ts: Date.now(),
            balance: newBalance,
            comment: operationComment || (operationType === 'deposit' ? 'Manual Deposit' : 'Manual Withdrawal'),
            accountId: activeAccountId
        };

        onAddBalanceOperation(operation);
        setShowDepositModal(false);
        setOperationAmount('');
        setOperationComment('');
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const accountOperations = balanceOperations.filter(op => op.accountId === activeAccountId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <User className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Account Manager</h2>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onAddBalanceOperation && activeAccountId && (
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} /> Deposit/Withdraw
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Accounts List */}
                <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)] space-y-4">
                    {accounts.length === 0 ? (
                        <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <User className="mx-auto mb-4 opacity-50" size={48} />
                            <h3 className="font-bold mb-2">No Accounts Yet</h3>
                            <p className="text-sm">Import an MT5 trade report to add your first account.</p>
                        </div>
                    ) : (
                        accounts.map(account => (
                            <div
                                key={account.id}
                                className={`rounded-xl border transition-all ${activeAccountId === account.id
                                    ? darkMode
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-blue-500 bg-blue-50'
                                    : darkMode
                                        ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {editingAccountId === account.id ? (
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Name</label>
                                                <input type="text" value={editForm.name || ''} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Number</label>
                                                <input type="text" value={editForm.accountNumber || ''} onChange={e => setEditForm(prev => ({ ...prev, accountNumber: e.target.value }))} className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Starting Balance</label>
                                                <input type="number" value={editForm.startingBalance || ''} onChange={e => setEditForm(prev => ({ ...prev, startingBalance: parseFloat(e.target.value) || 0 }))} className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Broker</label>
                                                <input type="text" value={editForm.broker || ''} onChange={e => setEditForm(prev => ({ ...prev, broker: e.target.value }))} className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={cancelEdit} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Cancel</button>
                                            <button onClick={() => saveEdit(account)} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"><Check size={16} /> Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg">{account.name || 'Unknown'}</h3>
                                                    {activeAccountId === account.id && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">Active</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                    <div className="flex items-center gap-2"><CreditCard size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /><span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>#{account.accountNumber}</span></div>
                                                    <div className="flex items-center gap-2"><Building size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /><span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{account.broker || 'Unknown'}</span></div>
                                                    <div className="flex items-center gap-2"><Globe size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /><span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{account.currency}</span></div>
                                                    <div className="flex items-center gap-2"><Calendar size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /><span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{formatDate(account.lastUpdated)}</span></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {activeAccountId !== account.id && <button onClick={() => onSelectAccount(account.id)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><ChevronRight size={18} /></button>}
                                                <button onClick={() => startEdit(account)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(account.id)} className={`p-2 rounded-lg ${deleteConfirm === account.id ? 'bg-red-500 text-white' : darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                        {account.startingBalance && (
                                            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Starting Balance: <span className="font-bold text-green-500">${account.startingBalance.toFixed(2)}</span></span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Recent Operations */}
                    {activeAccountId && accountOperations.length > 0 && (
                        <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><DollarSign size={16} /> Recent Transactions</h4>
                            <div className="space-y-2">
                                {accountOperations.slice(-5).reverse().map(op => (
                                    <div key={op.id} className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <div className="flex items-center gap-2">
                                            {op.type === 'deposit' ? <ArrowUpCircle size={16} className="text-green-500" /> : <ArrowDownCircle size={16} className="text-red-500" />}
                                            <span className="text-sm">{op.comment || op.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${op.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>{op.type === 'deposit' ? '+' : '-'}${op.amount.toFixed(2)}</span>
                                            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{op.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit/Withdrawal Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                        <div className={`p-5 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <h3 className="text-lg font-bold">Log Transaction</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex gap-2">
                                <button onClick={() => setOperationType('deposit')} className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${operationType === 'deposit' ? 'bg-green-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}><ArrowUpCircle size={18} /> Deposit</button>
                                <button onClick={() => setOperationType('withdrawal')} className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${operationType === 'withdrawal' ? 'bg-red-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}><ArrowDownCircle size={18} /> Withdrawal</button>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Amount ($)</label>
                                <input type="number" value={operationAmount} onChange={e => setOperationAmount(e.target.value)} placeholder="0.00" className={`w-full px-4 py-3 rounded-lg text-lg font-bold ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Note (optional)</label>
                                <input type="text" value={operationComment} onChange={e => setOperationComment(e.target.value)} placeholder="e.g., Monthly deposit" className={`w-full px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} border focus:ring-2 focus:ring-blue-500`} />
                            </div>
                        </div>
                        <div className={`p-5 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex gap-3`}>
                            <button onClick={() => setShowDepositModal(false)} className={`flex-1 py-3 rounded-lg font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Cancel</button>
                            <button onClick={handleAddOperation} disabled={!operationAmount || parseFloat(operationAmount) <= 0} className={`flex-1 py-3 rounded-lg font-medium ${operationType === 'deposit' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-50`}>Log {operationType === 'deposit' ? 'Deposit' : 'Withdrawal'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManager;

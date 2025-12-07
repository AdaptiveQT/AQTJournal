'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit } from 'lucide-react';
import { Trade } from '../types';

interface TradeEditModalProps {
    trade: Trade | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedTrade: Trade) => void;
    TRADE_SETUPS: string[];
    EMOTIONS: string[];
}

const TradeEditModal: React.FC<TradeEditModalProps> = ({
    trade,
    isOpen,
    onClose,
    onSave,
    TRADE_SETUPS,
    EMOTIONS
}) => {
    const [editedTrade, setEditedTrade] = useState<Trade | null>(null);

    useEffect(() => {
        if (trade) {
            setEditedTrade({ ...trade });
        }
    }, [trade]);

    if (!isOpen || !editedTrade) return null;

    const handleSave = () => {
        if (editedTrade) {
            onSave(editedTrade);
            onClose();
        }
    };

    const handleChange = (field: keyof Trade, value: string) => {
        setEditedTrade(prev => prev ? { ...prev, [field]: value } : null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Edit size={24} className="text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">Edit Trade</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Pair</label>
                        <input
                            type="text"
                            value={editedTrade.pair}
                            onChange={(e) => handleChange('pair', e.target.value.toUpperCase())}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Direction</label>
                        <select
                            value={editedTrade.direction}
                            onChange={(e) => handleChange('direction', e.target.value)}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        >
                            <option value="Long">Long</option>
                            <option value="Short">Short</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Entry Price</label>
                        <input
                            type="number"
                            step="any"
                            value={editedTrade.entry}
                            onChange={(e) => handleChange('entry', e.target.value)}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Exit Price</label>
                        <input
                            type="number"
                            step="any"
                            value={editedTrade.exit}
                            onChange={(e) => handleChange('exit', e.target.value)}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Setup</label>
                        <select
                            value={editedTrade.setup}
                            onChange={(e) => handleChange('setup', e.target.value)}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        >
                            {TRADE_SETUPS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Emotion</label>
                        <select
                            value={editedTrade.emotion}
                            onChange={(e) => handleChange('emotion', e.target.value)}
                            className="w-full p-3 bg-slate-800 rounded text-white border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[44px]"
                        >
                            {EMOTIONS.map(em => (
                                <option key={em} value={em}>{em}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white transition-all min-h-[44px]"
                    >
                        Cancel
                    </button>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                    Note: Editing will recalculate P&L based on new entry/exit prices
                </p>
            </div>
        </div>
    );
};

export default TradeEditModal;

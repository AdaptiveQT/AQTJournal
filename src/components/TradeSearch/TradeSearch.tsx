'use client';

import React, { useState } from 'react';
import {
    Search,
    Filter,
    X,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    Save,
    Star,
    Trash2,
} from 'lucide-react';
import { Trade } from '../../types';

export interface SearchFilters {
    searchText?: string;
    pair?: string;
    direction?: 'Long' | 'Short' | '';
    minPnL?: number;
    maxPnL?: number;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    setup?: string;
    mood?: string;
    sessionType?: string;
    strategyId?: string;
}

export interface FilterPreset {
    id: string;
    name: string;
    filters: SearchFilters;
    icon?: string;
}

interface TradeSearchProps {
    onFilterChange: (filters: SearchFilters) => void;
    currentFilters: SearchFilters;
    availableTags?: Array<{ id: string; name: string; color: string }>;
    availableStrategies?: Array<{ id: string; name: string }>;
}

const QUICK_FILTERS: FilterPreset[] = [
    {
        id: 'today',
        name: 'Today',
        icon: '📅',
        filters: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
        },
    },
    {
        id: 'this-week',
        name: 'This Week',
        icon: '📆',
        filters: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    },
    {
        id: 'winners',
        name: 'Winners',
        icon: '🏆',
        filters: {
            minPnL: 0.01,
        },
    },
    {
        id: 'losers',
        name: 'Losers',
        icon: '📉',
        filters: {
            maxPnL: -0.01,
        },
    },
    {
        id: 'big-wins',
        name: 'Big Wins',
        icon: '💰',
        filters: {
            minPnL: 100,
        },
    },
];

const TradeSearch: React.FC<TradeSearchProps> = ({
    onFilterChange,
    currentFilters,
    availableTags = [],
    availableStrategies = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState<SearchFilters>(currentFilters);
    const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
    const [presetName, setPresetName] = useState('');
    const [showSavePreset, setShowSavePreset] = useState(false);

    const hasActiveFilters = Object.keys(localFilters).some(key => {
        const value = localFilters[key as keyof SearchFilters];
        return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    });

    const applyFilters = (filters: SearchFilters) => {
        setLocalFilters(filters);
        onFilterChange(filters);
    };

    const clearAllFilters = () => {
        const empty: SearchFilters = {};
        setLocalFilters(empty);
        onFilterChange(empty);
    };

    const applyQuickFilter = (preset: FilterPreset) => {
        const newFilters = { ...localFilters, ...preset.filters };
        applyFilters(newFilters);
    };

    const savePreset = () => {
        if (!presetName.trim()) {
            alert('Please enter a name for this preset');
            return;
        }

        const newPreset: FilterPreset = {
            id: Date.now().toString(),
            name: presetName.trim(),
            filters: localFilters,
        };

        const updated = [...savedPresets, newPreset];
        setSavedPresets(updated);

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('aqt_filter_presets', JSON.stringify(updated));
        }

        setPresetName('');
        setShowSavePreset(false);
    };

    const loadPreset = (preset: FilterPreset) => {
        applyFilters(preset.filters);
    };

    const deletePreset = (id: string) => {
        const updated = savedPresets.filter(p => p.id !== id);
        setSavedPresets(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem('aqt_filter_presets', JSON.stringify(updated));
        }
    };

    // Load saved presets on mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('aqt_filter_presets');
            if (stored) {
                try {
                    setSavedPresets(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to load filter presets');
                }
            }
        }
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search trades by pair, notes, setup..."
                        value={localFilters.searchText || ''}
                        onChange={(e) => {
                            const updated = { ...localFilters, searchText: e.target.value };
                            setLocalFilters(updated);
                            onFilterChange(updated);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isExpanded || hasActiveFilters
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                >
                    <Filter size={16} />
                    Filters
                    {hasActiveFilters && !isExpanded && (
                        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                            {Object.keys(localFilters).length}
                        </span>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="p-2.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Clear all filters"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_FILTERS.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => applyQuickFilter(preset)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm flex items-center gap-1.5"
                    >
                        <span>{preset.icon}</span>
                        {preset.name}
                    </button>
                ))}
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Pair Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Pair
                            </label>
                            <input
                                type="text"
                                placeholder="EURUSD, GBPUSD..."
                                value={localFilters.pair || ''}
                                onChange={(e) => applyFilters({ ...localFilters, pair: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Direction Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Direction
                            </label>
                            <select
                                value={localFilters.direction || ''}
                                onChange={(e) => applyFilters({ ...localFilters, direction: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            >
                                <option value="">All</option>
                                <option value="Long">Long</option>
                                <option value="Short">Short</option>
                            </select>
                        </div>

                        {/* Setup Filter */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Setup
                            </label>
                            <input
                                type="text"
                                placeholder="Breakout, Reversal..."
                                value={localFilters.setup || ''}
                                onChange={(e) => applyFilters({ ...localFilters, setup: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* P&L Range */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Min P&L
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={localFilters.minPnL || ''}
                                onChange={(e) => applyFilters({ ...localFilters, minPnL: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Max P&L
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={localFilters.maxPnL || ''}
                                onChange={(e) => applyFilters({ ...localFilters, maxPnL: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={localFilters.startDate || ''}
                                onChange={(e) => applyFilters({ ...localFilters, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={localFilters.endDate || ''}
                                onChange={(e) => applyFilters({ ...localFilters, endDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Save/Load Presets */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Filter Presets
                            </span>
                            <button
                                onClick={() => setShowSavePreset(!showSavePreset)}
                                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                            >
                                <Save size={12} />
                                Save Current
                            </button>
                        </div>

                        {showSavePreset && (
                            <div className="mb-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Preset name..."
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm"
                                />
                                <button
                                    onClick={savePreset}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm font-medium"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowSavePreset(false)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-500 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {savedPresets.map(preset => (
                                <div
                                    key={preset.id}
                                    className="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                >
                                    <button
                                        onClick={() => loadPreset(preset)}
                                        className="text-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5"
                                    >
                                        <Star size={12} />
                                        {preset.name}
                                    </button>
                                    <button
                                        onClick={() => deletePreset(preset.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeSearch;

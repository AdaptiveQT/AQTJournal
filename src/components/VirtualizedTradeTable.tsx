'use client';

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Filter,
    Search,
    X,
    Check,
    MessageSquare
} from 'lucide-react';

// Define Trade type locally to avoid import issues
interface Trade {
    id: string;
    pair: string;
    direction: 'Long' | 'Short';
    entry: number;
    exit: number;
    pnl: number;
    lots: number;
    date: string;
    time?: string;
    setup: string;
    emotion: string;
    notes?: string;
}

interface VirtualizedTradeTableProps {
    trades: Trade[];
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewNotes?: (id: string) => void;
    darkMode?: boolean;
}

type SortKey = 'date' | 'pair' | 'direction' | 'pnl' | 'setup';
type SortDir = 'asc' | 'desc';

const ROW_HEIGHT = 52;

const VirtualizedTradeTable: React.FC<VirtualizedTradeTableProps> = ({
    trades,
    onEdit,
    onDelete,
    onViewNotes,
    darkMode = false
}) => {
    const parentRef = useRef<HTMLDivElement>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [pairFilter, setPairFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState<'' | 'Long' | 'Short'>('');
    const [setupFilter, setSetupFilter] = useState('');

    // Sort state
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Get unique values for filters
    const pairs = useMemo(() => Array.from(new Set(trades.map(t => t.pair))).sort(), [trades]);
    const setups = useMemo(() => Array.from(new Set(trades.map(t => t.setup))).sort(), [trades]);

    // Filter and sort trades
    const filteredTrades = useMemo(() => {
        let result = [...trades];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.pair.toLowerCase().includes(q) ||
                t.setup.toLowerCase().includes(q) ||
                t.notes?.toLowerCase().includes(q)
            );
        }

        // Pair filter
        if (pairFilter) {
            result = result.filter(t => t.pair === pairFilter);
        }

        // Direction filter
        if (directionFilter) {
            result = result.filter(t => t.direction === directionFilter);
        }

        // Setup filter
        if (setupFilter) {
            result = result.filter(t => t.setup === setupFilter);
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'date':
                    cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'pair':
                    cmp = a.pair.localeCompare(b.pair);
                    break;
                case 'direction':
                    cmp = a.direction.localeCompare(b.direction);
                    break;
                case 'pnl':
                    cmp = a.pnl - b.pnl;
                    break;
                case 'setup':
                    cmp = a.setup.localeCompare(b.setup);
                    break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [trades, searchQuery, pairFilter, directionFilter, setupFilter, sortKey, sortDir]);

    // Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: filteredTrades.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 10,
    });

    // Sort handler
    const handleSort = useCallback((key: SortKey) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }, [sortKey]);

    // Clear filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setPairFilter('');
        setDirectionFilter('');
        setSetupFilter('');
    }, []);

    const hasFilters = searchQuery || pairFilter || directionFilter || setupFilter;

    const SortIcon: React.FC<{ column: SortKey }> = ({ column }) => {
        if (sortKey !== column) return null;
        return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <div className={`rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
            {/* Filter Bar */}
            <div className={`p-3 border-b ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 min-w-[200px] ${darkMode ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search trades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'}`}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Pair Filter */}
                    <select
                        value={pairFilter}
                        onChange={(e) => setPairFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white border border-slate-200'}`}
                    >
                        <option value="">All Pairs</option>
                        {pairs.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    {/* Direction Filter */}
                    <select
                        value={directionFilter}
                        onChange={(e) => setDirectionFilter(e.target.value as '' | 'Long' | 'Short')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white border border-slate-200'}`}
                    >
                        <option value="">All Directions</option>
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                    </select>

                    {/* Setup Filter */}
                    <select
                        value={setupFilter}
                        onChange={(e) => setSetupFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white border border-slate-200'}`}
                    >
                        <option value="">All Setups</option>
                        {setups.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1"
                        >
                            <X size={14} /> Clear
                        </button>
                    )}

                    {/* Count */}
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {filteredTrades.length} trades
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className={`grid grid-cols-[100px_80px_70px_90px_90px_80px_100px] gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-blue-500">
                    Date <SortIcon column="date" />
                </button>
                <button onClick={() => handleSort('pair')} className="flex items-center gap-1 hover:text-blue-500">
                    Pair <SortIcon column="pair" />
                </button>
                <button onClick={() => handleSort('direction')} className="flex items-center gap-1 hover:text-blue-500">
                    Dir <SortIcon column="direction" />
                </button>
                <div className="text-right">Entry</div>
                <div className="text-right">Exit</div>
                <button onClick={() => handleSort('pnl')} className="flex items-center gap-1 justify-end hover:text-blue-500">
                    P&L <SortIcon column="pnl" />
                </button>
                <div className="text-right">Actions</div>
            </div>

            {/* Virtualized List */}
            <div
                ref={parentRef}
                className="overflow-auto"
                style={{ height: Math.min(filteredTrades.length * ROW_HEIGHT, 400) }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const trade = filteredTrades[virtualRow.index];
                        return (
                            <div
                                key={trade.id}
                                className={`absolute top-0 left-0 w-full grid grid-cols-[100px_80px_70px_90px_90px_80px_100px] gap-2 items-center px-4 border-b ${darkMode
                                        ? 'border-slate-700 hover:bg-slate-700/50'
                                        : 'border-slate-100 hover:bg-slate-50'
                                    }`}
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {trade.date}
                                </div>
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {trade.pair}
                                </div>
                                <div className={`text-sm font-medium ${trade.direction === 'Long' ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.direction}
                                </div>
                                <div className={`text-sm text-right ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {trade.entry.toFixed(5)}
                                </div>
                                <div className={`text-sm text-right ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {trade.exit.toFixed(5)}
                                </div>
                                <div className={`text-sm font-bold text-right ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    {trade.notes && (
                                        <button
                                            onClick={() => onViewNotes?.(trade.id)}
                                            className={`p-1.5 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
                                            title="View notes"
                                        >
                                            <MessageSquare size={14} className="text-slate-400" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit?.(trade.id)}
                                        className={`p-1.5 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
                                        title="Edit"
                                    >
                                        <Edit2 size={14} className="text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(trade.id)}
                                        className={`p-1.5 rounded ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
                                        title="Delete"
                                    >
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {filteredTrades.length === 0 && (
                <div className={`p-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {hasFilters ? (
                        <>
                            <Filter size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No trades match your filters</p>
                            <button onClick={clearFilters} className="text-blue-500 text-sm mt-2">Clear filters</button>
                        </>
                    ) : (
                        <p>No trades yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default VirtualizedTradeTable;

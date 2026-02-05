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
    MessageSquare,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
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

const ROW_HEIGHT = 64; // Increased for more spacious design

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

    // Calculate stats
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winCount = filteredTrades.filter(t => t.pnl > 0).length;
    const winRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length * 100).toFixed(0) : '0';

    return (
        <div className={`rounded-2xl overflow-hidden ${darkMode
            ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/50 shadow-xl shadow-black/20'
            : 'bg-white border border-slate-200 shadow-lg shadow-slate-200/50'}`}
        >
            {/* Enhanced Filter Bar */}
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50/80'}`}>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search with glow effect */}
                    <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[220px] transition-all
                        ${darkMode
                            ? 'bg-slate-900/80 border border-slate-600/50 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10'
                            : 'bg-white border border-slate-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100'}`}
                    >
                        <Search size={18} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder="Search trades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent outline-none text-sm font-medium ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-slate-700/50">
                                <X size={14} className="text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2">
                        <select
                            value={pairFilter}
                            onChange={(e) => setPairFilter(e.target.value)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all
                                ${darkMode
                                    ? 'bg-slate-900/80 text-slate-200 border border-slate-600/50 hover:border-slate-500'
                                    : 'bg-white border border-slate-200 hover:border-slate-300'}`}
                        >
                            <option value="">All Pairs</option>
                            {pairs.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select
                            value={directionFilter}
                            onChange={(e) => setDirectionFilter(e.target.value as '' | 'Long' | 'Short')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all
                                ${darkMode
                                    ? 'bg-slate-900/80 text-slate-200 border border-slate-600/50 hover:border-slate-500'
                                    : 'bg-white border border-slate-200 hover:border-slate-300'}`}
                        >
                            <option value="">All Directions</option>
                            <option value="Long">🟢 Long</option>
                            <option value="Short">🔴 Short</option>
                        </select>

                        <select
                            value={setupFilter}
                            onChange={(e) => setSetupFilter(e.target.value)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all
                                ${darkMode
                                    ? 'bg-slate-900/80 text-slate-200 border border-slate-600/50 hover:border-slate-500'
                                    : 'bg-white border border-slate-200 hover:border-slate-300'}`}
                        >
                            <option value="">All Setups</option>
                            {setups.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center gap-1.5 transition-all"
                        >
                            <X size={14} /> Clear
                        </button>
                    )}

                    {/* Stats Badge */}
                    <div className={`ml-auto flex items-center gap-4 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Trades</span>
                            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{filteredTrades.length}</span>
                        </div>
                        <div className={`w-px h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Win Rate</span>
                            <span className="text-sm font-bold text-emerald-500">{winRate}%</span>
                        </div>
                        <div className={`w-px h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>P&L</span>
                            <span className={`text-sm font-bold ${totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Table Header */}
            <div className={`grid grid-cols-[minmax(110px,1fr)_minmax(90px,1fr)_minmax(80px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_100px] gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider
                ${darkMode ? 'bg-slate-800/80 text-slate-400 border-b border-slate-700/50' : 'bg-slate-100 text-slate-500 border-b border-slate-200'}`}
            >
                <button onClick={() => handleSort('date')} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                    <Calendar size={14} /> Date <SortIcon column="date" />
                </button>
                <button onClick={() => handleSort('pair')} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                    Pair <SortIcon column="pair" />
                </button>
                <button onClick={() => handleSort('direction')} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                    Type <SortIcon column="direction" />
                </button>
                <div className="text-right">Entry</div>
                <div className="text-right">Exit</div>
                <button onClick={() => handleSort('pnl')} className="flex items-center gap-1.5 justify-end hover:text-emerald-400 transition-colors">
                    P&L <SortIcon column="pnl" />
                </button>
                <div className="text-center">Actions</div>
            </div>

            {/* Virtualized List */}
            <div
                ref={parentRef}
                className="overflow-auto scroll-smooth"
                style={{ height: Math.min(filteredTrades.length * ROW_HEIGHT, 480) }}
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
                        const isWin = trade.pnl > 0;

                        return (
                            <div
                                key={trade.id}
                                className={`absolute top-0 left-0 w-full grid grid-cols-[minmax(110px,1fr)_minmax(90px,1fr)_minmax(80px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_100px] gap-3 items-center px-5 transition-all
                                    ${darkMode
                                        ? 'border-b border-slate-700/30 hover:bg-slate-700/30'
                                        : 'border-b border-slate-100 hover:bg-slate-50'
                                    }`}
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {/* Date */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-8 rounded-full ${isWin ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <div>
                                        <div className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {trade.date}
                                        </div>
                                        {trade.time && (
                                            <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {trade.time}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pair */}
                                <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {trade.pair}
                                </div>

                                {/* Direction Pill */}
                                <div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
                                        ${trade.direction === 'Long'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}
                                    >
                                        {trade.direction === 'Long'
                                            ? <ArrowUpRight size={12} />
                                            : <ArrowDownRight size={12} />
                                        }
                                        {trade.direction}
                                    </span>
                                </div>

                                {/* Entry */}
                                <div className={`text-sm text-right font-mono ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {trade.entry.toFixed(trade.pair.includes('JPY') ? 3 : 5)}
                                </div>

                                {/* Exit */}
                                <div className={`text-sm text-right font-mono ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {trade.exit.toFixed(trade.pair.includes('JPY') ? 3 : 5)}
                                </div>

                                {/* P&L with glow */}
                                <div className={`text-right`}>
                                    <span className={`text-sm font-bold ${isWin
                                        ? 'text-emerald-400'
                                        : 'text-red-400'}`}
                                    >
                                        {isWin ? '+' : ''}${trade.pnl.toFixed(2)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-center gap-1">
                                    {trade.notes && (
                                        <button
                                            onClick={() => onViewNotes?.(trade.id)}
                                            className={`p-2 rounded-lg transition-all ${darkMode
                                                ? 'hover:bg-slate-600/50 text-slate-400 hover:text-slate-200'
                                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                            title="View notes"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit?.(trade.id)}
                                        className={`p-2 rounded-lg transition-all ${darkMode
                                            ? 'hover:bg-blue-500/20 text-blue-400'
                                            : 'hover:bg-blue-50 text-blue-500'}`}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(trade.id)}
                                        className={`p-2 rounded-lg transition-all ${darkMode
                                            ? 'hover:bg-red-500/20 text-red-400'
                                            : 'hover:bg-red-50 text-red-500'}`}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {filteredTrades.length === 0 && (
                <div className={`p-12 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {hasFilters ? (
                        <div className="space-y-3">
                            <Filter size={40} className="mx-auto opacity-30" />
                            <p className="font-medium">No trades match your filters</p>
                            <button
                                onClick={clearFilters}
                                className="text-emerald-500 text-sm font-medium hover:text-emerald-400 transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <TrendingUp size={40} className="mx-auto opacity-30" />
                            <p className="font-medium">No trades yet</p>
                            <p className="text-sm opacity-70">Start adding trades to see your history here</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VirtualizedTradeTable;

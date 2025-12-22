'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Trade } from '../../types';

interface CalendarViewProps {
    trades: Trade[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarView: React.FC<CalendarViewProps> = ({ trades }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create a map of date string (YYYY-MM-DD) to daily stats
    const dailyStats = useMemo(() => {
        const stats = new Map<string, { pnl: number; count: number; wins: number }>();

        trades.forEach(trade => {
            // Ensure trade.date matches local YYYY-MM-DD format if not already
            // Assuming trade.date is YYYY-MM-DD based on existing code
            const dateStr = trade.date;

            const current = stats.get(dateStr) || { pnl: 0, count: 0, wins: 0 };

            stats.set(dateStr, {
                pnl: current.pnl + trade.pnl,
                count: current.count + 1,
                wins: current.wins + (trade.pnl > 0 ? 1 : 0)
            });
        });

        return stats;
    }, [trades]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = () => setCurrentDate(new Date());

    const getDayContent = (day: number) => {
        // Construct date string YYYY-MM-DD
        // Note: Month is 0-indexed, so add 1. Pad with 0.
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const stats = dailyStats.get(dateStr);

        if (!stats) return null;

        return stats;
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="text-blue-400" size={20} />
                    {MONTHS[month]} {year}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={today}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 bg-slate-800 border-b border-slate-700">
                {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[120px]">
                {/* Empty cells for padding */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-slate-800/50 border-r border-b border-slate-700" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const stats = getDayContent(day);

                    let bgClass = "bg-slate-800 hover:bg-slate-750";
                    let textClass = "text-slate-400";

                    if (stats) {
                        if (stats.pnl > 0) {
                            bgClass = "bg-green-900/20 hover:bg-green-900/30 border-green-900/30";
                            textClass = "text-green-400";
                        } else if (stats.pnl < 0) {
                            bgClass = "bg-red-900/20 hover:bg-red-900/30 border-red-900/30";
                            textClass = "text-red-400";
                        } else {
                            bgClass = "bg-slate-700/50";
                        }
                    }

                    return (
                        <div
                            key={day}
                            className={`relative p-2 border-r border-b border-slate-700 transition-colors ${bgClass} group flex flex-col justify-between`}
                        >
                            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300">
                                {day}
                            </span>

                            {stats && (
                                <div className="mt-1">
                                    <div className={`text-sm md:text-base font-bold ${textClass}`}>
                                        {stats.pnl > 0 ? '+' : ''}{stats.pnl.toFixed(2)}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                        <span className={stats.wins > 0 ? "text-green-500" : ""}>{stats.wins}W</span>
                                        <span>/</span>
                                        <span className={stats.count - stats.wins > 0 ? "text-red-500" : ""}>{stats.count - stats.wins}L</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;

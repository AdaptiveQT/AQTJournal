'use client';

import React from 'react';
import { BarChart2, Zap } from 'lucide-react';

interface FlipModeToggleProps {
    isFlipMode: boolean;
    onToggle: (enabled: boolean) => void;
}

const FlipModeToggle: React.FC<FlipModeToggleProps> = ({ isFlipMode, onToggle }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onToggle(!isFlipMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isFlipMode
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                title={isFlipMode ? 'Switch to Pro Mode' : 'Switch to Flip Mode'}
            >
                {isFlipMode ? (
                    <>
                        <Zap size={16} />
                        Flip Mode
                    </>
                ) : (
                    <>
                        <BarChart2 size={16} />
                        Pro Mode
                    </>
                )}
            </button>
        </div>
    );
};

export default FlipModeToggle;

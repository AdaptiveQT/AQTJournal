'use client';

import React from 'react';
import { Flame, Zap, Star } from 'lucide-react';

interface StreakBadgeProps {
    streak: number;
    longestStreak: number;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    darkMode?: boolean;
}

/**
 * Streak Badge - Visual indicator of current discipline streak
 * Changes appearance based on streak length
 */
const StreakBadge: React.FC<StreakBadgeProps> = ({
    streak,
    longestStreak,
    size = 'md',
    showTooltip = true,
    darkMode = true
}) => {
    // Streak tier styling
    const getStreakTier = () => {
        if (streak >= 30) return { tier: 'legendary', color: 'from-purple-500 to-pink-500', icon: Star, label: 'Legendary' };
        if (streak >= 14) return { tier: 'epic', color: 'from-orange-500 to-red-500', icon: Flame, label: 'Epic' };
        if (streak >= 7) return { tier: 'hot', color: 'from-yellow-500 to-orange-500', icon: Flame, label: 'Hot' };
        if (streak >= 3) return { tier: 'warm', color: 'from-green-400 to-emerald-500', icon: Zap, label: 'Building' };
        return { tier: 'cold', color: 'from-slate-400 to-slate-500', icon: Flame, label: 'Start' };
    };

    const tierInfo = getStreakTier();
    const IconComponent = tierInfo.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1 gap-1',
        md: 'text-sm px-3 py-1.5 gap-1.5',
        lg: 'text-base px-4 py-2 gap-2'
    };

    const iconSizes = {
        sm: 12,
        md: 16,
        lg: 20
    };

    if (streak === 0) {
        return (
            <div
                className={`
                    inline-flex items-center rounded-full
                    ${sizeClasses[size]}
                    ${darkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-500'}
                `}
                title={showTooltip ? 'Start your streak today!' : undefined}
            >
                <Flame size={iconSizes[size]} className="opacity-50" />
                <span>No streak</span>
            </div>
        );
    }

    return (
        <div
            className={`
                inline-flex items-center rounded-full
                bg-gradient-to-r ${tierInfo.color}
                text-white font-bold shadow-lg
                ${sizeClasses[size]}
                ${streak >= 7 ? 'animate-pulse' : ''}
            `}
            title={showTooltip ? `${streak}-day streak! Best: ${longestStreak} days` : undefined}
        >
            <IconComponent
                size={iconSizes[size]}
                className={streak >= 14 ? 'animate-bounce' : ''}
                fill={streak >= 7 ? 'currentColor' : 'none'}
            />
            <span>{streak}</span>
            {streak >= 7 && (
                <span className="text-[10px] opacity-75">🔥</span>
            )}
        </div>
    );
};

export default StreakBadge;

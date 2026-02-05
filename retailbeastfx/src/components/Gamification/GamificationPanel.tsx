'use client';

import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Flame,
    Star,
    TrendingUp,
    Award,
    Zap,
    ChevronUp,
    X
} from 'lucide-react';
import {
    GamificationState,
    getLevelFromXP,
    getXPToNextLevel,
    LEVELS,
    Achievement
} from '../../utils/gamificationEngine';

interface GamificationPanelProps {
    state: GamificationState;
    darkMode?: boolean;
    onClose?: () => void;
}

/**
 * Gamification Panel - Shows XP, Level, Streak, and Achievements
 */
const GamificationPanel: React.FC<GamificationPanelProps> = ({
    state,
    darkMode = true,
    onClose
}) => {
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [activeTab, setActiveTab] = useState<'progress' | 'achievements'>('progress');

    const currentLevel = getLevelFromXP(state.totalXP);
    const nextLevel = LEVELS[currentLevel.level] || currentLevel;
    const xpProgress = getXPToNextLevel(state.totalXP);

    // Level up animation trigger
    useEffect(() => {
        if (state.currentLevel > 1) {
            const timer = setTimeout(() => setShowLevelUp(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [state.currentLevel]);

    return (
        <div className={`rounded-2xl border overflow-hidden ${darkMode
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
            {/* Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${darkMode
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                                : 'bg-yellow-50'
                            }`}>
                            {currentLevel.badge}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Level {currentLevel.level}
                                </span>
                                <span className={`text-sm px-2 py-0.5 rounded-full ${darkMode
                                        ? 'bg-beast-green/20 text-beast-green'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                    {currentLevel.title}
                                </span>
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {state.totalXP.toLocaleString()} XP
                            </div>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* XP Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                            To Level {currentLevel.level + 1}
                        </span>
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                            {xpProgress.current} / {xpProgress.required} XP
                        </span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                            className="h-full bg-gradient-to-r from-beast-green to-emerald-400 transition-all duration-500 ease-out"
                            style={{ width: `${xpProgress.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 gap-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div className={`p-3 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <Flame className="mx-auto text-orange-500 mb-1" size={20} />
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {state.currentStreak}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Day Streak
                    </div>
                </div>
                <div className={`p-3 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <Trophy className="mx-auto text-yellow-500 mb-1" size={20} />
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {state.achievements.length}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Achievements
                    </div>
                </div>
                <div className={`p-3 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <Star className="mx-auto text-purple-500 mb-1" size={20} />
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {state.perfectDays}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Perfect Days
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                    onClick={() => setActiveTab('progress')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'progress'
                            ? darkMode
                                ? 'text-beast-green border-b-2 border-beast-green'
                                : 'text-green-600 border-b-2 border-green-600'
                            : darkMode
                                ? 'text-slate-400 hover:text-slate-300'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <TrendingUp className="inline mr-1" size={16} />
                    Progress
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'achievements'
                            ? darkMode
                                ? 'text-beast-green border-b-2 border-beast-green'
                                : 'text-green-600 border-b-2 border-green-600'
                            : darkMode
                                ? 'text-slate-400 hover:text-slate-300'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Award className="inline mr-1" size={16} />
                    Achievements
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
                {activeTab === 'progress' && (
                    <div className="space-y-3">
                        {/* Recent XP Events */}
                        <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            Recent Activity
                        </div>
                        {state.xpHistory.length === 0 ? (
                            <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                No activity yet. Start logging trades!
                            </div>
                        ) : (
                            state.xpHistory.slice(-5).reverse().map((event, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between py-2 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap
                                            size={14}
                                            className={event.xp >= 0 ? 'text-yellow-500' : 'text-red-500'}
                                        />
                                        <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {event.description}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${event.xp >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {event.xp >= 0 ? '+' : ''}{event.xp} XP
                                    </span>
                                </div>
                            ))
                        )}

                        {/* Level Progress */}
                        <div className={`mt-4 text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            Level Roadmap
                        </div>
                        <div className="space-y-2">
                            {LEVELS.slice(0, 5).map((level, i) => {
                                const isUnlocked = state.totalXP >= level.xpRequired;
                                const isCurrent = currentLevel.level === level.level;

                                return (
                                    <div
                                        key={level.level}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent
                                                ? darkMode
                                                    ? 'bg-beast-green/10 border border-beast-green/30'
                                                    : 'bg-green-50 border border-green-200'
                                                : ''
                                            }`}
                                    >
                                        <span className={`text-lg ${isUnlocked ? '' : 'opacity-30'}`}>
                                            {level.badge}
                                        </span>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isUnlocked
                                                    ? darkMode ? 'text-white' : 'text-slate-900'
                                                    : darkMode ? 'text-slate-500' : 'text-slate-400'
                                                }`}>
                                                {level.title}
                                            </div>
                                            <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {level.xpRequired.toLocaleString()} XP
                                            </div>
                                        </div>
                                        {isUnlocked && (
                                            <ChevronUp className="text-beast-green" size={16} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="grid grid-cols-3 gap-3">
                        {state.achievements.length === 0 ? (
                            <div className={`col-span-3 text-center py-4 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                No achievements yet. Keep trading!
                            </div>
                        ) : (
                            state.achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-3 rounded-xl text-center ${darkMode
                                            ? 'bg-slate-700/50 hover:bg-slate-700'
                                            : 'bg-slate-50 hover:bg-slate-100'
                                        } transition-colors cursor-default`}
                                    title={achievement.description}
                                >
                                    <div className="text-2xl mb-1">{achievement.icon}</div>
                                    <div className={`text-xs font-medium truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'
                                        }`}>
                                        {achievement.title}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Daily Challenge Banner */}
            <div className={`p-3 border-t ${darkMode
                    ? 'border-slate-700 bg-gradient-to-r from-purple-900/30 to-blue-900/30'
                    : 'border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-500" size={16} />
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Daily Challenge
                        </span>
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        +{20} XP
                    </span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Log 3 trades with proper stops today
                </p>
            </div>
        </div>
    );
};

export default GamificationPanel;

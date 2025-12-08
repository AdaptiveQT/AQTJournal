'use client';

import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    X,
    Search,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Zap,
    Bell,
    Save,
    Eye,
    Target,
    Calendar,
} from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
    onSave: (settings: UserSettings) => void;
}

interface SettingCategory {
    id: string;
    name: string;
    icon: any; // Lucide icon component
    description: string;
    settings: SettingItem[];
}

interface SettingItem {
    id: keyof UserSettings;
    label: string;
    description?: string;
    type: 'number' | 'boolean' | 'select' | 'text';
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
    step?: number;
    advancedOnly?: boolean;
}

const SETTING_CATEGORIES: SettingCategory[] = [
    {
        id: 'display',
        name: 'Display & UI',
        icon: Eye,
        description: 'Customize how your journal looks and feels',
        settings: [
            { id: 'darkMode', label: 'Dark Mode', description: 'Use dark color scheme', type: 'boolean' },
            { id: 'showBestStreak', label: 'Show Best Streak', description: 'Display all-time best streak', type: 'boolean', advancedOnly: true },
        ],
    },
    {
        id: 'risk',
        name: 'Risk Management',
        icon: Target,
        description: 'Configure your risk parameters',
        settings: [
            { id: 'maxDailyLossPercent', label: 'Max Daily Loss %', description: 'Maximum allowed daily loss', type: 'number', min: 0.5, max: 10, step: 0.5 },
            { id: 'safeMode', label: 'Safe Mode', description: 'Conservative risk calculations', type: 'boolean' },
        ],
    },
    {
        id: 'goals',
        name: 'Goals & Targets',
        icon: Calendar,
        description: 'Set and track your trading goals',
        settings: [
            { id: 'dailyGoal', label: 'Daily Goal ($)', type: 'number', min: 0, step: 10 },
            { id: 'weeklyGoal', label: 'Weekly Goal ($)', type: 'number', min: 0, step: 50, advancedOnly: true },
            { id: 'monthlyGoal', label: 'Monthly Goal ($)', type: 'number', min: 0, step: 100, advancedOnly: true },
            { id: 'targetBalance', label: 'Target Balance ($)', type: 'number', min: 0, step: 100 },
            { id: 'startBalance', label: 'Starting Balance ($)', type: 'number', min: 0, step: 100 },
        ],
    },
    {
        id: 'notifications',
        name: 'Notifications',
        icon: Bell,
        description: 'Control alerts and reminders',
        settings: [
            { id: 'notificationsEnabled', label: 'Enable Notifications', description: 'Master notification switch', type: 'boolean' },
            { id: 'notifyOnGoalReached', label: 'Goal Reached', description: 'Notify when daily goal is met', type: 'boolean', advancedOnly: true },
            { id: 'notifyOnMaxLossWarning', label: 'Max Loss Warning', description: 'Alert when approaching max loss', type: 'boolean', advancedOnly: true },
            { id: 'notifyOnStreakMilestone', label: 'Streak Milestones', description: 'Celebrate win streaks', type: 'boolean', advancedOnly: true },
            { id: 'notifyOnWeeklySummary', label: 'Weekly Summary', description: 'End-of-week performance report', type: 'boolean', advancedOnly: true },
            { id: 'notificationSound', label: 'Notification Sound', description: 'Play sound with notifications', type: 'boolean', advancedOnly: true },
        ],
    },
    {
        id: 'backup',
        name: 'Backup & Data',
        icon: Save,
        description: 'Manage your data backups',
        settings: [
            { id: 'autoBackup', label: 'Auto Backup', description: 'Automatically backup your data', type: 'boolean' },
            {
                id: 'backupFrequency',
                label: 'Backup Frequency',
                description: 'How often to auto-backup',
                type: 'select',
                options: [
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                ],
                advancedOnly: true
            },
        ],
    },
];

const SettingsManager: React.FC<SettingsManagerProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [local, setLocal] = useState<UserSettings>(settings);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['display', 'risk', 'goals']);

    const isAdvancedMode = local.settingsMode === 'advanced';

    if (!isOpen) return null;

    const handleReset = () => {
        const confirmed = window.confirm('Reset all settings to default values?');
        if (confirmed) {
            // Define defaults
            const defaults: Partial<UserSettings> = {
                darkMode: false,
                safeMode: true,
                maxDailyLossPercent: 2,
                dailyGoal: 100,
                weeklyGoal: 500,
                monthlyGoal: 2000,
                notificationsEnabled: true,
                notifyOnGoalReached: true,
                notifyOnMaxLossWarning: true,
                notifyOnStreakMilestone: true,
                notifyOnWeeklySummary: false,
                notificationSound: true,
                autoBackup: true,
                backupFrequency: 'weekly',
                settingsMode: 'simple',
            };
            setLocal({ ...local, ...defaults });
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSave = () => {
        onSave(local);
        onClose();
    };

    const filteredCategories = SETTING_CATEGORIES.map(category => ({
        ...category,
        settings: category.settings.filter(setting => {
            // Filter by search query
            const matchesSearch = searchQuery === '' ||
                setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by advanced mode
            const matchesMode = isAdvancedMode || !setting.advancedOnly;

            return matchesSearch && matchesMode;
        }),
    })).filter(category => category.settings.length > 0);

    const renderSetting = (setting: SettingItem) => {
        const value = local[setting.id];

        return (
            <div key={setting.id} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <label htmlFor={setting.id} className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer block">
                            {setting.label}
                        </label>
                        {setting.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {setting.description}
                            </p>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        {setting.type === 'boolean' && (
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    id={setting.id}
                                    type="checkbox"
                                    checked={!!value}
                                    onChange={(e) => setLocal({ ...local, [setting.id]: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        )}

                        {setting.type === 'number' && (
                            <input
                                id={setting.id}
                                type="number"
                                value={value as number || 0}
                                onChange={(e) => setLocal({ ...local, [setting.id]: parseFloat(e.target.value) || 0 })}
                                min={setting.min}
                                max={setting.max}
                                step={setting.step || 1}
                                className="w-24 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white text-right"
                            />
                        )}

                        {setting.type === 'select' && (
                            <select
                                id={setting.id}
                                value={value as string || ''}
                                onChange={(e) => setLocal({ ...local, [setting.id]: e.target.value })}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white"
                            >
                                {setting.options?.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <SettingsIcon className="text-blue-600 dark:text-blue-400" size={24} />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Close settings"
                        >
                            <X className="text-slate-500 dark:text-slate-400" size={20} />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            onClick={() => setLocal({ ...local, settingsMode: 'simple' })}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${!isAdvancedMode
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            Simple
                        </button>
                        <button
                            onClick={() => setLocal({ ...local, settingsMode: 'advanced' })}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${isAdvancedMode
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Zap size={14} />
                            Advanced
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Settings List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {filteredCategories.map(category => {
                        const Icon = category.icon;
                        const isExpanded = expandedCategories.includes(category.id);

                        return (
                            <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {category.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>

                                {isExpanded && (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {category.settings.map(renderSetting)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <RotateCcw size={16} />
                        Reset to Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsManager;

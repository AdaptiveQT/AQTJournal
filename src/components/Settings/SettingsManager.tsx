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
    DollarSign,
    Shield,
    Palette,
    Database,
    Check,
    TrendingUp
} from 'lucide-react';
import { UserSettings } from '../../types';

interface SettingsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
    onSave: (settings: UserSettings) => void;
    balance?: number;
    onSetBalance?: (balance: number) => void;
}

interface SettingCategory {
    id: string;
    name: string;
    icon: any;
    description: string;
    gradient: string;
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
    icon?: any;
}

const SETTING_CATEGORIES: SettingCategory[] = [
    {
        id: 'account',
        name: 'Account & Balance',
        icon: DollarSign,
        description: 'Your trading capital and risk settings',
        gradient: 'from-green-500 to-emerald-600',
        settings: [
            { id: 'startBalance', label: 'Starting Balance ($)', description: 'Your initial account size', type: 'number', min: 0, step: 100, icon: DollarSign },
            { id: 'targetBalance', label: 'Target Balance ($)', description: 'Your goal account size', type: 'number', min: 0, step: 100, icon: Target },
            { id: 'maxDailyLossPercent', label: 'Max Daily Loss %', description: 'Stop trading threshold', type: 'number', min: 0.5, max: 10, step: 0.5, icon: Shield },
            { id: 'safeMode', label: 'Safe Mode', description: 'Conservative risk calculations', type: 'boolean', icon: Shield },
        ],
    },
    {
        id: 'goals',
        name: 'Goals & Targets',
        icon: Target,
        description: 'Set and track your trading goals',
        gradient: 'from-purple-500 to-indigo-600',
        settings: [
            { id: 'dailyGoal', label: 'Daily Goal ($)', description: 'Target daily profit', type: 'number', min: 0, step: 10, icon: TrendingUp },
            { id: 'weeklyGoal', label: 'Weekly Goal ($)', type: 'number', min: 0, step: 50, advancedOnly: true, icon: Calendar },
            { id: 'monthlyGoal', label: 'Monthly Goal ($)', type: 'number', min: 0, step: 100, advancedOnly: true, icon: Calendar },
        ],
    },
    {
        id: 'display',
        name: 'Display & Theme',
        icon: Palette,
        description: 'Customize your journal appearance',
        gradient: 'from-pink-500 to-rose-600',
        settings: [
            { id: 'darkMode', label: 'Dark Mode', description: 'Use dark color scheme', type: 'boolean', icon: Eye },
            { id: 'showBestStreak', label: 'Show Best Streak', description: 'Display all-time best streak', type: 'boolean', advancedOnly: true, icon: Zap },
        ],
    },
    {
        id: 'notifications',
        name: 'Notifications',
        icon: Bell,
        description: 'Control alerts and reminders',
        gradient: 'from-blue-500 to-cyan-600',
        settings: [
            { id: 'notificationsEnabled', label: 'Enable Notifications', description: 'Master notification switch', type: 'boolean', icon: Bell },
            { id: 'notifyOnGoalReached', label: 'Goal Reached', description: 'Notify when daily goal is met', type: 'boolean', advancedOnly: true, icon: Target },
            { id: 'notifyOnMaxLossWarning', label: 'Max Loss Warning', description: 'Alert when approaching max loss', type: 'boolean', advancedOnly: true, icon: Shield },
            { id: 'notifyOnStreakMilestone', label: 'Streak Milestones', description: 'Celebrate win streaks', type: 'boolean', advancedOnly: true, icon: Zap },
            { id: 'notifyOnWeeklySummary', label: 'Weekly Summary', description: 'End-of-week report', type: 'boolean', advancedOnly: true, icon: Calendar },
            { id: 'notificationSound', label: 'Sound Effects', description: 'Play sound with notifications', type: 'boolean', advancedOnly: true, icon: Bell },
        ],
    },
    {
        id: 'backup',
        name: 'Backup & Data',
        icon: Database,
        description: 'Manage your data backups',
        gradient: 'from-amber-500 to-orange-600',
        settings: [
            { id: 'autoBackup', label: 'Auto Backup', description: 'Automatically backup your data', type: 'boolean', icon: Save },
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
                advancedOnly: true,
                icon: Calendar
            },
        ],
    },
];

const SettingsManager: React.FC<SettingsManagerProps> = ({
    isOpen,
    onClose,
    settings,
    onSave,
    balance = 0,
    onSetBalance
}) => {
    const [local, setLocal] = useState<UserSettings>(settings);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['account', 'goals']);
    const [balanceInput, setBalanceInput] = useState(balance.toString());

    const isAdvancedMode = local.settingsMode === 'advanced';

    if (!isOpen) return null;

    const handleReset = () => {
        const confirmed = window.confirm('Reset all settings to default values?');
        if (confirmed) {
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
        // Save balance if changed
        const newBalance = parseFloat(balanceInput.replace(/[,$]/g, ''));
        if (!isNaN(newBalance) && newBalance > 0 && onSetBalance) {
            onSetBalance(newBalance);
        }
        onSave(local);
        onClose();
    };

    const filteredCategories = SETTING_CATEGORIES.map(category => ({
        ...category,
        settings: category.settings.filter(setting => {
            const matchesSearch = searchQuery === '' ||
                setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMode = isAdvancedMode || !setting.advancedOnly;
            return matchesSearch && matchesMode;
        }),
    })).filter(category => category.settings.length > 0);

    const renderSetting = (setting: SettingItem) => {
        const value = local[setting.id];
        const Icon = setting.icon;

        return (
            <div key={setting.id} className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {Icon && (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                            </div>
                        )}
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
                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
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
                                className="w-28 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white text-right font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        )}

                        {setting.type === 'select' && (
                            <select
                                id={setting.id}
                                value={value as string || ''}
                                onChange={(e) => setLocal({ ...local, [setting.id]: e.target.value })}
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
            <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col">
                {/* Gradient Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <SettingsIcon className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Pro Settings</h2>
                                    <p className="text-white/70 text-sm">Advanced configuration</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                aria-label="Close settings"
                            >
                                <X className="text-white" size={24} />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex items-center gap-2 p-1 bg-white/20 rounded-lg">
                            <button
                                onClick={() => setLocal({ ...local, settingsMode: 'simple' })}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${!isAdvancedMode
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                Essential
                            </button>
                            <button
                                onClick={() => setLocal({ ...local, settingsMode: 'advanced' })}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${isAdvancedMode
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                <Zap size={14} />
                                Advanced
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Settings List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Quick Balance Input (Always Visible) */}
                    {onSetBalance && (
                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="text-green-600" size={18} />
                                <span className="font-bold text-green-700 dark:text-green-400">Account Balance</span>
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                                <input
                                    type="text"
                                    value={balanceInput}
                                    onChange={(e) => setBalanceInput(e.target.value)}
                                    placeholder="10000"
                                    className="w-full pl-10 pr-4 py-3 text-xl font-bold rounded-lg border-2 border-green-500/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {[5000, 10000, 25000, 50000, 100000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setBalanceInput(amount.toString())}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${balanceInput === amount.toString()
                                                ? 'bg-green-500 text-white'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
                                            }`}
                                    >
                                        ${amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredCategories.map(category => {
                        const Icon = category.icon;
                        const isExpanded = expandedCategories.includes(category.id);

                        return (
                            <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {category.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`p-1 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                        {category.settings.map(renderSetting)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <Check size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsManager;

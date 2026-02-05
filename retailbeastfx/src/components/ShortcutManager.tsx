'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Command, Keyboard } from 'lucide-react';

export interface KeyboardShortcut {
    id: string;
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
    action: () => void;
    category: 'navigation' | 'actions' | 'modals' | 'general';
}

interface ShortcutManagerProps {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

const ShortcutManager: React.FC<ShortcutManagerProps> = ({ shortcuts, enabled = true }) => {
    const [showCheatSheet, setShowCheatSheet] = useState(false);

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Find matching shortcut
            const shortcut = shortcuts.find((s) => {
                const keyMatches = event.key.toLowerCase() === s.key.toLowerCase();
                const ctrlMatches = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const shiftMatches = s.shift ? event.shiftKey : !event.shiftKey;
                const altMatches = s.alt ? event.altKey : !event.altKey;

                return keyMatches && ctrlMatches && shiftMatches && altMatches;
            });

            if (shortcut) {
                event.preventDefault();
                shortcut.action();
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Ctrl+/ to toggle cheat sheet
    useEffect(() => {
        const handleCheatSheet = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                setShowCheatSheet((prev) => !prev);
            }
            if (event.key === 'Escape' && showCheatSheet) {
                setShowCheatSheet(false);
            }
        };

        window.addEventListener('keydown', handleCheatSheet);
        return () => window.removeEventListener('keydown', handleCheatSheet);
    }, [showCheatSheet]);

    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    const formatShortcut = (shortcut: KeyboardShortcut) => {
        const parts: string[] = [];
        if (shortcut.ctrl) parts.push('Ctrl');
        if (shortcut.shift) parts.push('Shift');
        if (shortcut.alt) parts.push('Alt');
        parts.push(shortcut.key.toUpperCase());
        return parts.join(' + ');
    };

    const categoryNames = {
        navigation: 'Navigation',
        actions: 'Actions',
        modals: 'Modals & Views',
        general: 'General',
    };

    if (!showCheatSheet) {
        return (
            <button
                onClick={() => setShowCheatSheet(true)}
                className="fixed bottom-4 right-4 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors z-30 flex items-center gap-2"
                title="Keyboard Shortcuts (Ctrl + /)"
            >
                <Keyboard size={20} />
                <span className="text-xs font-medium hidden sm:inline">Ctrl + /</span>
            </button>
        );
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setShowCheatSheet(false)}
            />
            <div className="fixed inset-x-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[80vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Keyboard className="text-blue-600 dark:text-blue-400" size={24} />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Keyboard Shortcuts
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowCheatSheet(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <Command size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Esc</kbd> or{' '}
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Ctrl + /</kbd> to close
                    </p>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                    <div className="space-y-6">
                        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                    {categoryNames[category as keyof typeof categoryNames]}
                                </h3>
                                <div className="space-y-2">
                                    {categoryShortcuts.map((shortcut) => (
                                        <div
                                            key={shortcut.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <span className="text-sm text-slate-900 dark:text-white">
                                                {shortcut.description}
                                            </span>
                                            <div className="flex gap-1">
                                                {formatShortcut(shortcut)
                                                    .split(' + ')
                                                    .map((key, idx, arr) => (
                                                        <React.Fragment key={idx}>
                                                            <kbd className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                                                                {key}
                                                            </kbd>
                                                            {idx < arr.length - 1 && (
                                                                <span className="text-slate-400 mx-1">+</span>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShortcutManager;

// Default shortcuts helper
export const createDefaultShortcuts = (actions: {
    onNewTrade?: () => void;
    onSettings?: () => void;
    onBackup?: () => void;
    onAnalytics?: () => void;
    onHelp?: () => void;
    onFocusMode?: () => void;
    onSearch?: () => void;
}): KeyboardShortcut[] => [
        {
            id: 'new-trade',
            key: 'n',
            ctrl: true,
            description: 'New Trade',
            action: actions.onNewTrade || (() => { }),
            category: 'actions',
        },
        {
            id: 'settings',
            key: ',',
            ctrl: true,
            description: 'Open Settings',
            action: actions.onSettings || (() => { }),
            category: 'modals',
        },
        {
            id: 'backup',
            key: 's',
            ctrl: true,
            shift: true,
            description: 'Create Backup',
            action: actions.onBackup || (() => { }),
            category: 'actions',
        },
        {
            id: 'analytics',
            key: 'a',
            ctrl: true,
            description: 'View Analytics',
            action: actions.onAnalytics || (() => { }),
            category: 'modals',
        },
        {
            id: 'help',
            key: 'h',
            ctrl: true,
            description: 'Help Guide',
            action: actions.onHelp || (() => { }),
            category: 'modals',
        },
        {
            id: 'focus-mode',
            key: 'f',
            ctrl: true,
            shift: true,
            description: 'Toggle Focus Mode',
            action: actions.onFocusMode || (() => { }),
            category: 'general',
        },
        {
            id: 'search',
            key: 'k',
            ctrl: true,
            description: 'Quick Search',
            action: actions.onSearch || (() => { }),
            category: 'navigation',
        },
    ];

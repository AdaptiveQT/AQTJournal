'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'dark' | 'light';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

/**
 * Theme Provider - Handles dark/light mode with system preference detection
 * Persists preference to localStorage
 */
export function ThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'rbfx-theme'
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    // Load theme from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
        setMounted(true);
    }, [storageKey]);

    // Resolve system theme and update document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        let resolved: 'dark' | 'light';

        if (theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            resolved = theme;
        }

        setResolvedTheme(resolved);

        // Update HTML class
        root.classList.remove('dark', 'light');
        root.classList.add(resolved);

        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
        }
    }, [theme, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(storageKey, newTheme);
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    // Prevent flash by not rendering until mounted
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Theme Toggle Button Component
 */
interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme, theme, setTheme } = useTheme();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={toggleTheme}
                className={`
                    relative w-14 h-7 rounded-full transition-colors duration-300
                    ${resolvedTheme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }
                `}
                title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {/* Track icons */}
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">
                    🌙
                </span>
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">
                    ☀️
                </span>

                {/* Thumb */}
                <span
                    className={`
                        absolute top-1 w-5 h-5 rounded-full 
                        bg-white shadow-md
                        transition-transform duration-300
                        ${resolvedTheme === 'dark' ? 'left-1' : 'left-8'}
                    `}
                />
            </button>

            {showLabel && (
                <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                </span>
            )}
        </div>
    );
}

/**
 * Theme Selector Dropdown Component
 */
export function ThemeSelector({ className = '' }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const options: { value: Theme; label: string; icon: string }[] = [
        { value: 'light', label: 'Light', icon: '☀️' },
        { value: 'dark', label: 'Dark', icon: '🌙' },
        { value: 'system', label: 'System', icon: '💻' },
    ];

    return (
        <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className={`
                px-3 py-2 rounded-lg text-sm
                ${resolvedTheme === 'dark'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-white text-slate-900 border-slate-200'
                }
                border focus:ring-2 focus:ring-beast-green
                ${className}
            `}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                </option>
            ))}
        </select>
    );
}

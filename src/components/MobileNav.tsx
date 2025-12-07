'use client';

import React from 'react';
import { Home, TrendingUp, Settings, FileText } from 'lucide-react';

interface MobileNavProps {
    activeTab: 'dashboard' | 'trades' | 'settings' | 'reports';
    onTabChange: (tab: 'dashboard' | 'trades' | 'settings' | 'reports') => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard' as const, icon: Home, label: 'Home' },
        { id: 'trades' as const, icon: TrendingUp, label: 'Trades' },
        { id: 'reports' as const, icon: FileText, label: 'Reports' },
        { id: 'settings' as const, icon: Settings, label: 'Settings' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 z-40 safe-area-bottom">
            <div className="grid grid-cols-4 h-16">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${isActive ? 'text-blue-400' : 'text-slate-400'
                                }`}
                        >
                            <tab.icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;

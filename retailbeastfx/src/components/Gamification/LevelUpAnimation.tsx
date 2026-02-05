'use client';

import React, { useEffect, useState } from 'react';
import { UserLevel } from '../../utils/gamificationEngine';

interface LevelUpAnimationProps {
    newLevel: UserLevel;
    onComplete: () => void;
    darkMode?: boolean;
}

/**
 * Level Up Animation - Full screen celebration when user levels up
 */
const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
    newLevel,
    onComplete,
    darkMode = true
}) => {
    const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

    useEffect(() => {
        // Animation timeline
        const enterTimer = setTimeout(() => setPhase('show'), 100);
        const exitTimer = setTimeout(() => setPhase('exit'), 2500);
        const completeTimer = setTimeout(onComplete, 3000);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const getAnimationClass = () => {
        switch (phase) {
            case 'enter': return 'opacity-0 scale-50';
            case 'show': return 'opacity-100 scale-100';
            case 'exit': return 'opacity-0 scale-110';
        }
    };

    return (
        <div className={`
            fixed inset-0 z-[9999] flex items-center justify-center
            transition-opacity duration-300
            ${phase === 'enter' ? 'bg-black/0' : 'bg-black/80'}
        `}>
            {/* Particle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: ['#00FF00', '#FFD700', '#00FFFF', '#FF00FF'][i % 4],
                            animationDelay: `${Math.random() * 500}ms`,
                            animationDuration: `${1000 + Math.random() * 1000}ms`
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className={`
                text-center transition-all duration-500 ease-out
                ${getAnimationClass()}
            `}>
                {/* Badge */}
                <div className="text-8xl mb-4 animate-bounce">
                    {newLevel.badge}
                </div>

                {/* Level Up Text */}
                <div className={`
                    text-2xl font-bold uppercase tracking-widest mb-2
                    ${darkMode ? 'text-white' : 'text-slate-900'}
                `}>
                    Level Up!
                </div>

                {/* Level Info */}
                <div className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Level {newLevel.level}
                </div>

                <div className={`text-xl font-semibold ${darkMode ? 'text-beast-green' : 'text-green-600'}`}>
                    {newLevel.title}
                </div>

                {/* Perks */}
                {newLevel.perks.length > 0 && (
                    <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'
                        }`}>
                        <div className={`text-xs uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            New Perk Unlocked
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                            ✨ {newLevel.perks[0]}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LevelUpAnimation;

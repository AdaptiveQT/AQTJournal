'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MascotPeekProps {
    /** Delay before mascot peeks in (ms) */
    delay?: number;
    /** How long mascot stays visible (ms), 0 = forever */
    duration?: number;
    /** Position of the peek */
    position?: 'bottom-right' | 'bottom-left';
    /** Custom message tooltip */
    message?: string;
    /** Whether the peek is enabled */
    enabled?: boolean;
}

/**
 * Corner peek animation - mascot slides in from the edge of the screen.
 * Great for user engagement and brand personality.
 */
export const MascotPeek: React.FC<MascotPeekProps> = ({
    delay = 5000,
    duration = 0,
    position = 'bottom-right',
    message,
    enabled = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        let hideTimer: NodeJS.Timeout;
        if (duration > 0) {
            hideTimer = setTimeout(() => {
                setIsVisible(false);
            }, delay + duration);
        }

        return () => {
            clearTimeout(showTimer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [enabled, delay, duration]);

    if (!enabled) return null;

    const positionClasses = position === 'bottom-right'
        ? 'right-0 bottom-0'
        : 'left-0 bottom-0';

    const slideDirection = position === 'bottom-right'
        ? 'translate-x-full'
        : '-translate-x-full';

    return (
        <div
            data-testid="mascot-peek"
            className={`
                fixed ${positionClasses} z-50 pointer-events-auto
                transition-transform duration-500 ease-out
                ${isVisible ? 'translate-x-0' : slideDirection}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Speech bubble tooltip */}
            {message && isHovered && (
                <div
                    className={`
                        absolute bottom-full mb-2 
                        ${position === 'bottom-right' ? 'right-4' : 'left-4'}
                        bg-cyber-card border border-beast-green/30 
                        text-white text-sm px-3 py-2 rounded-lg
                        shadow-lg shadow-beast-green/20
                        animate-fade-in whitespace-nowrap
                    `}
                >
                    {message}
                    {/* Triangle pointer */}
                    <div
                        className={`
                            absolute -bottom-2 
                            ${position === 'bottom-right' ? 'right-6' : 'left-6'}
                            w-0 h-0 
                            border-l-8 border-r-8 border-t-8
                            border-l-transparent border-r-transparent 
                            border-t-beast-green/30
                        `}
                    />
                </div>
            )}

            {/* Mascot image */}
            <div
                className={`
                    relative cursor-pointer
                    transition-transform duration-300
                    ${isHovered ? 'scale-110 -translate-y-2' : ''}
                `}
                onClick={() => setIsVisible(false)}
            >
                <Image
                    src="/mascot/mascot-transparent.png"
                    alt="RetailBeastFX"
                    width={100}
                    height={100}
                    className="drop-shadow-[0_0_20px_rgba(0,230,118,0.4)]"
                />

                {/* Glow pulse effect */}
                <div className="absolute inset-0 -z-10 rounded-full bg-beast-green/20 blur-2xl animate-glow-pulse" />
            </div>
        </div>
    );
};

export default MascotPeek;



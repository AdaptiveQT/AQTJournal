'use client';

import React from 'react';
import Image from 'next/image';

interface MascotImageProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    animate?: boolean;
    alt?: string;
}

const sizes = {
    sm: 48,
    md: 80,
    lg: 120,
    xl: 200
};

/**
 * Lightweight 2D mascot component for empty states and decorative use.
 * Uses the transparent PNG for best performance.
 */
export const MascotImage: React.FC<MascotImageProps> = ({
    size = 'md',
    className = '',
    animate = true,
    alt = 'RetailBeastFX Mascot'
}) => {
    const dimension = sizes[size];

    return (
        <div
            className={`
                relative inline-block
                ${animate ? 'animate-bounce-subtle' : ''}
                ${className}
            `}
            style={{ width: dimension, height: dimension }}
        >
            <Image
                src="/mascot/mascot-transparent.png"
                alt={alt}
                width={dimension}
                height={dimension}
                className="object-contain drop-shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                priority={size === 'xl'}
            />
            {/* Subtle glow effect behind mascot */}
            <div
                className="absolute inset-0 -z-10 rounded-full bg-beast-green/10 blur-xl"
                style={{ transform: 'scale(0.8)' }}
            />
        </div>
    );
};

export default MascotImage;

'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Next.js Loading Screen with RetailBeastFX Mascot
 * Shows while app is loading or navigating between pages.
 */
export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-beast-green/5 via-transparent to-transparent" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20 bg-grid" />

            {/* Mascot */}
            <div className="relative mb-8 animate-bounce-subtle">
                <Image
                    src="/mascot/mascot-transparent.png"
                    alt="RetailBeastFX"
                    width={150}
                    height={150}
                    className="drop-shadow-[0_0_30px_rgba(0,230,118,0.5)]"
                    priority
                />
                {/* Glow behind mascot */}
                <div className="absolute inset-0 -z-10 blur-3xl bg-beast-green/30 rounded-full scale-150" />
            </div>

            {/* Brand name */}
            <h1 className="text-2xl font-bold text-white mb-4 tracking-wide">
                Retail<span className="text-beast-green">Beast</span>FX
            </h1>

            {/* Loading spinner */}
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-beast-green animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-beast-green animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-beast-green animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>

            {/* Footer */}
            <p className="absolute bottom-8 text-sm text-slate-500">
                Loading your trading journal...
            </p>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
    target: string;       // CSS selector
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    spotlightPadding?: number;
}

interface OnboardingTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
    storageKey?: string;
}

/**
 * Onboarding Tour - Interactive walkthrough for new users
 */
const OnboardingTour: React.FC<OnboardingTourProps> = ({
    steps,
    isOpen,
    onComplete,
    onSkip,
    storageKey = 'rbfx-onboarding-complete'
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [visible, setVisible] = useState(false);

    const step = steps[currentStep];

    // Find and highlight target element
    useEffect(() => {
        if (!isOpen || !step) return;

        const timer = setTimeout(() => {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);

                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setVisible(true);
        }, 200);

        return () => clearTimeout(timer);
    }, [isOpen, step, currentStep]);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setVisible(false);
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            localStorage.setItem(storageKey, 'true');
            onComplete();
        }
    }, [currentStep, steps.length, onComplete, storageKey]);

    const handlePrev = () => {
        if (currentStep > 0) {
            setVisible(false);
            setTimeout(() => setCurrentStep(prev => prev - 1), 150);
        }
    };

    const handleSkip = () => {
        localStorage.setItem(storageKey, 'true');
        onSkip();
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                handleSkip();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNext]);

    if (!isOpen || !step) return null;

    // Calculate tooltip position
    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const padding = step.spotlightPadding || 8;
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const gap = 16;

        const pos = step.position || 'bottom';

        switch (pos) {
            case 'top':
                return {
                    position: 'fixed',
                    top: targetRect.top - tooltipHeight - gap,
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2
                };
            case 'bottom':
                return {
                    position: 'fixed',
                    top: targetRect.bottom + gap,
                    left: Math.max(16, Math.min(
                        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                        window.innerWidth - tooltipWidth - 16
                    ))
                };
            case 'left':
                return {
                    position: 'fixed',
                    top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
                    left: targetRect.left - tooltipWidth - gap
                };
            case 'right':
                return {
                    position: 'fixed',
                    top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
                    left: targetRect.right + gap
                };
            default:
                return {
                    position: 'fixed',
                    top: targetRect.bottom + gap,
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2
                };
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />

            {/* Spotlight cutout */}
            {targetRect && (
                <div
                    className="fixed z-[9999] pointer-events-none transition-all duration-300 rounded-xl"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                        opacity: visible ? 1 : 0
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className={`
                    z-[10000] w-80 rounded-2xl overflow-hidden
                    bg-slate-900 border border-slate-700 shadow-2xl
                    transition-all duration-300
                    ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={getTooltipStyle()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-beast-green/20 to-emerald-500/20 px-5 py-4 border-b border-slate-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-beast-green" size={20} />
                            <span className="text-beast-green font-bold text-sm">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <h3 className="text-white font-bold text-lg mt-2">
                        {step.title}
                    </h3>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {step.content}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Skip tour
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-lg bg-beast-green text-black font-bold hover:bg-beast-green/90 transition-colors flex items-center gap-1"
                        >
                            {currentStep === steps.length - 1 ? 'Done' : 'Next'}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentStep
                                    ? 'bg-beast-green'
                                    : i < currentStep
                                        ? 'bg-beast-green/50'
                                        : 'bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

// ============= DEFAULT TOUR STEPS =============

export const DEFAULT_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="dashboard"]',
        title: 'Welcome to RetailBeastFX! 🦁',
        content: 'This is your command center. Track your performance, analyze patterns, and level up your trading.',
        position: 'bottom'
    },
    {
        target: '[data-tour="add-trade"]',
        title: 'Log Your Trades',
        content: 'Click here to log new trades. Include your setup, emotions, and notes for deeper insights.',
        position: 'bottom'
    },
    {
        target: '[data-tour="analytics"]',
        title: 'Deep Analytics',
        content: 'Explore your trading patterns with the Trinity Matrix, session analysis, and professional metrics.',
        position: 'left'
    },
    {
        target: '[data-tour="gamification"]',
        title: 'Earn XP & Level Up! 🎮',
        content: 'Stay disciplined to earn XP. Follow your rules, maintain streaks, and unlock achievements.',
        position: 'left'
    },
    {
        target: '[data-tour="settings"]',
        title: 'Customize Your Experience',
        content: 'Connect your broker accounts, adjust risk settings, and export your data.',
        position: 'left'
    }
];

/**
 * Hook to manage onboarding state
 */
export function useOnboarding(storageKey = 'rbfx-onboarding-complete') {
    const [showTour, setShowTour] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(storageKey) === 'true';
        setHasCompleted(completed);

        // Show tour for new users after a delay
        if (!completed) {
            const timer = setTimeout(() => setShowTour(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    const completeTour = () => {
        setShowTour(false);
        setHasCompleted(true);
    };

    const resetTour = () => {
        localStorage.removeItem(storageKey);
        setHasCompleted(false);
        setShowTour(true);
    };

    return {
        showTour,
        hasCompleted,
        setShowTour,
        completeTour,
        resetTour
    };
}

export default OnboardingTour;

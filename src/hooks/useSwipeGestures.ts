import { useRef, useEffect, useState, TouchEvent } from 'react';

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
}

export const useSwipeGestures = ({
    onSwipeLeft,
    onSwipeRight,
    threshold = 75
}: SwipeHandlers) => {
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const distance = touchStartX.current - touchEndX.current;
        const isSwipe = Math.abs(distance) > threshold;

        if (isSwipe) {
            if (distance > 0 && onSwipeLeft) {
                onSwipeLeft();
            }
            if (distance < 0 && onSwipeRight) {
                onSwipeRight();
            }
        }

        setIsSwiping(false);
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        isSwiping
    };
};

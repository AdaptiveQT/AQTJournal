import React, { useEffect, useState } from 'react';
import { Star, Zap } from 'lucide-react';

interface XPAnimationProps {
    amount: number;
    message: string;
    onComplete: () => void;
}

const XPAnimation: React.FC<XPAnimationProps> = ({ amount, message, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 500); // Allow exit animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <div className="animate-in zoom-in fade-in duration-500 ease-out flex flex-col items-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-50 animate-pulse"></div>
                    <Star className="text-yellow-400 fill-yellow-400 w-32 h-32 relative z-10 animate-bounce" />
                </div>
                <div className="mt-4 text-center">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg">
                        +{amount} XP
                    </h2>
                    <p className="text-white font-bold text-xl mt-2 drop-shadow-md">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default XPAnimation;

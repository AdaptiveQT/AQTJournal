'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, Undo } from 'lucide-react';

interface ToastNotificationProps {
    message: string | null;
    type?: 'success' | 'error' | 'info' | 'undo';
    onUndo?: () => void;
    onClose?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
    message,
    type = 'info',
    onUndo,
    onClose
}) => {
    if (!message) return null;

    const icons = {
        success: <CheckCircle2 size={20} className="text-green-400" />,
        error: <AlertCircle size={20} className="text-red-400" />,
        info: <Info size={20} className="text-blue-400" />,
        undo: <Undo size={20} className="text-amber-400" />
    };

    const bgColors = {
        success: 'bg-green-500/20 border-green-500',
        error: 'bg-red-500/20 border-red-500',
        info: 'bg-blue-500/20 border-blue-500',
        undo: 'bg-amber-500/20 border-amber-500'
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm">
            <div className={`${bgColors[type]} border-2 rounded-lg p-4 shadow-2xl backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                    {icons[type]}
                    <span className="text-white font-medium flex-1">{message}</span>
                    {type === 'undo' && onUndo && (
                        <button
                            onClick={onUndo}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 rounded text-white text-sm font-bold transition-all min-h-[36px]"
                        >
                            Undo
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;

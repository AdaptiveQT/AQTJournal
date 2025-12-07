'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { keys: ['Ctrl', 'N'], description: 'Focus trade entry form' },
        { keys: ['Enter'], description: 'Submit trade (when in form)' },
        { keys: ['Ctrl', 'Z'], description: 'Undo last deleted trade' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close modal dialogs' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Keyboard size={24} className="text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {shortcuts.map((shortcut, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                            <span className="text-slate-300">{shortcut.description}</span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <React.Fragment key={i}>
                                        <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-white min-w-[32px] text-center">
                                            {key}
                                        </kbd>
                                        {i < shortcut.keys.length - 1 && (
                                            <span className="text-slate-500 mx-1">+</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-200">
                        💡 <strong>Tip:</strong> Press <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-xs font-mono">?</kbd> anytime to see these shortcuts
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsModal;

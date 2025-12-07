import { useState, useCallback } from 'react';
import { Trade } from '../types';

interface DeletedTradeWithContext {
    trade: Trade;
    deletedAt: number;
    balance: number; // Balance before deletion, for restoration
}

const MAX_UNDO_HISTORY = 10;

export const useUndoDelete = () => {
    const [undoStack, setUndoStack] = useState<DeletedTradeWithContext[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    const addToUndoStack = useCallback((trade: Trade, currentBalance: number) => {
        setUndoStack(prev => {
            const newStack = [
                { trade, deletedAt: Date.now(), balance: currentBalance },
                ...prev.slice(0, MAX_UNDO_HISTORY - 1)
            ];
            return newStack;
        });
    }, []);

    const canUndo = undoStack.length > 0;

    const getLastDeleted = useCallback(() => {
        if (undoStack.length === 0) return null;
        return undoStack[0];
    }, [undoStack]);

    const clearLastDeleted = useCallback(() => {
        setUndoStack(prev => prev.slice(1));
    }, []);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return {
        addToUndoStack,
        getLastDeleted,
        clearLastDeleted,
        canUndo,
        notification,
        showNotification,
        hideNotification
    };
};

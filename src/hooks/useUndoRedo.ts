import { useRef, useCallback } from 'react';
import type { OutlineNode } from '../lib/outline';

const MAX_HISTORY = 50;
const DEBOUNCE_DELAY = 500;

interface UseUndoRedoOptions {
    outline: OutlineNode[] | undefined;
    onOutlineChange: (newOutline: OutlineNode[]) => void;
}

export function useUndoRedo({ outline, onOutlineChange }: UseUndoRedoOptions) {
    const undoStack = useRef<OutlineNode[][]>([]);
    const redoStack = useRef<OutlineNode[][]>([]);
    const debounceTimer = useRef<number | null>(null);

    const pushHistory = useCallback(() => {
        if (!outline) return;
        // Clone outline to avoid mutation issues in history
        undoStack.current.push(JSON.parse(JSON.stringify(outline)));
        if (undoStack.current.length > MAX_HISTORY) {
            undoStack.current.shift();
        }
        redoStack.current = []; // Clear redo stack on new action
    }, [outline]);

    const handleOutlineChangeWithHistory = useCallback((newOutline: OutlineNode[]) => {
        onOutlineChange(newOutline);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer to push history after delay
        debounceTimer.current = setTimeout(() => {
            pushHistory();
        }, DEBOUNCE_DELAY);
    }, [onOutlineChange, pushHistory]);

    const handleUndo = useCallback(() => {
        if (undoStack.current.length === 0 || !outline) return;

        // Push current state to redo stack
        redoStack.current.push(JSON.parse(JSON.stringify(outline)));

        // Pop from undo stack
        const previousOutline = undoStack.current.pop()!;
        onOutlineChange(previousOutline);
    }, [outline, onOutlineChange]);

    const handleRedo = useCallback(() => {
        if (redoStack.current.length === 0 || !outline) return;

        // Push current state to undo stack
        undoStack.current.push(JSON.parse(JSON.stringify(outline)));

        // Pop from redo stack
        const nextOutline = redoStack.current.pop()!;
        onOutlineChange(nextOutline);
    }, [outline, onOutlineChange]);

    const clearHistory = useCallback(() => {
        undoStack.current = [];
        redoStack.current = [];
    }, []);

    return {
        pushHistory,
        handleOutlineChangeWithHistory,
        handleUndo,
        handleRedo,
        clearHistory,
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
    };
}

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUndoRedo } from './useUndoRedo';
import type { OutlineNode } from '../lib/outline';

// Helper to create test nodes
const createTestNode = (id: string, text: string, children: OutlineNode[] = []): OutlineNode => ({
    id,
    text,
    content: '',
    level: 0,
    children,
});

describe('useUndoRedo', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('pushHistory', () => {
        it('should push current outline to undo stack and enable undo', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            act(() => {
                result.current.pushHistory();
            });

            // Try to undo - if pushHistory worked, this should call onOutlineChange
            act(() => {
                result.current.handleUndo();
            });

            // onOutlineChange being called proves the undo stack has content
            expect(onOutlineChange).toHaveBeenCalled();
        });

        it('should not push if outline is undefined', () => {
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline: undefined, onOutlineChange })
            );

            act(() => {
                result.current.pushHistory();
            });

            // Try undo - should not call onOutlineChange since nothing was pushed
            act(() => {
                result.current.handleUndo();
            });

            expect(onOutlineChange).not.toHaveBeenCalled();
        });

        it('should clear redo stack on new action', () => {
            let outline: OutlineNode[] = [createTestNode('1', 'Original')];
            const onOutlineChange = vi.fn((newOutline) => {
                outline = newOutline;
            });

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline } }
            );

            // Push initial state
            act(() => {
                result.current.pushHistory();
            });

            // Modify and push again
            outline = [createTestNode('1', 'Modified')];
            rerender({ outline });

            act(() => {
                result.current.pushHistory();
            });

            // Undo to put something in redo stack
            act(() => {
                result.current.handleUndo();
            });

            onOutlineChange.mockClear();

            // Now push new history - should clear redo stack
            act(() => {
                result.current.pushHistory();
            });

            // Try redo - should do nothing since redo stack was cleared
            act(() => {
                result.current.handleRedo();
            });

            // onOutlineChange should not have been called by redo
            expect(onOutlineChange).not.toHaveBeenCalled();
        });

        it('should limit history to MAX_HISTORY (50) entries', () => {
            let outline: OutlineNode[] = [createTestNode('1', 'Node 0')];
            const onOutlineChange = vi.fn();

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline } }
            );

            // Push 55 history entries
            for (let i = 0; i < 55; i++) {
                outline = [createTestNode('1', `Node ${i}`)];
                rerender({ outline });
                act(() => {
                    result.current.pushHistory();
                });
            }

            // We should be able to undo multiple times
            let undoCount = 0;
            for (let i = 0; i < 60; i++) {
                onOutlineChange.mockClear();
                act(() => {
                    result.current.handleUndo();
                });
                if (onOutlineChange.mock.calls.length > 0) {
                    undoCount++;
                }
            }

            // Should have limited to MAX_HISTORY (50)
            expect(undoCount).toBeLessThanOrEqual(50);
            expect(undoCount).toBeGreaterThan(0);
        });
    });

    describe('handleUndo', () => {
        it('should restore previous outline state', () => {
            const originalOutline: OutlineNode[] = [createTestNode('1', 'Original')];
            let currentOutline = originalOutline;
            const onOutlineChange = vi.fn((newOutline) => {
                currentOutline = newOutline;
            });

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline: currentOutline } }
            );

            // Push current state to history
            act(() => {
                result.current.pushHistory();
            });

            // Modify outline
            currentOutline = [createTestNode('1', 'Modified')];
            rerender({ outline: currentOutline });

            // Undo
            act(() => {
                result.current.handleUndo();
            });

            // Should have called onOutlineChange with original outline
            expect(onOutlineChange).toHaveBeenLastCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Original' })
                ])
            );
        });

        it('should do nothing if undo stack is empty', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            act(() => {
                result.current.handleUndo();
            });

            expect(onOutlineChange).not.toHaveBeenCalled();
        });

        it('should do nothing if outline is undefined', () => {
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline: undefined, onOutlineChange })
            );

            act(() => {
                result.current.handleUndo();
            });

            expect(onOutlineChange).not.toHaveBeenCalled();
        });

        it('should push current state to redo stack on undo', () => {
            let outline: OutlineNode[] = [createTestNode('1', 'Original')];
            const onOutlineChange = vi.fn((newOutline) => {
                outline = newOutline;
            });

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline } }
            );

            // Push to history
            act(() => {
                result.current.pushHistory();
            });

            // Modify
            outline = [createTestNode('1', 'Modified')];
            rerender({ outline });

            // Undo
            act(() => {
                result.current.handleUndo();
            });

            rerender({ outline });
            onOutlineChange.mockClear();

            // Redo - should work since undo pushed to redo stack
            act(() => {
                result.current.handleRedo();
            });

            expect(onOutlineChange).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Modified' })
                ])
            );
        });
    });

    describe('handleRedo', () => {
        it('should restore next outline state', () => {
            let outline: OutlineNode[] = [createTestNode('1', 'Original')];
            const onOutlineChange = vi.fn((newOutline) => {
                outline = newOutline;
            });

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline } }
            );

            // Push to history
            act(() => {
                result.current.pushHistory();
            });

            // Modify
            outline = [createTestNode('1', 'Modified')];
            rerender({ outline });

            // Undo
            act(() => {
                result.current.handleUndo();
            });

            rerender({ outline });

            // Redo
            act(() => {
                result.current.handleRedo();
            });

            expect(onOutlineChange).toHaveBeenLastCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Modified' })
                ])
            );
        });

        it('should do nothing if redo stack is empty', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            act(() => {
                result.current.handleRedo();
            });

            expect(onOutlineChange).not.toHaveBeenCalled();
        });

        it('should do nothing if outline is undefined', () => {
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline: undefined, onOutlineChange })
            );

            act(() => {
                result.current.handleRedo();
            });

            expect(onOutlineChange).not.toHaveBeenCalled();
        });
    });

    describe('handleOutlineChangeWithHistory', () => {
        it('should call onOutlineChange immediately', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            const newOutline = [createTestNode('1', 'Modified')];
            act(() => {
                result.current.handleOutlineChangeWithHistory(newOutline);
            });

            expect(onOutlineChange).toHaveBeenCalledWith(newOutline);
        });

        it('should debounce history push', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            act(() => {
                result.current.handleOutlineChangeWithHistory([createTestNode('1', 'A')]);
            });

            // Advance less than debounce delay
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Try undo - should not work yet (history not pushed)
            onOutlineChange.mockClear();
            act(() => {
                result.current.handleUndo();
            });
            expect(onOutlineChange).not.toHaveBeenCalled();

            // Advance past debounce delay
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Now undo should work
            act(() => {
                result.current.handleUndo();
            });
            expect(onOutlineChange).toHaveBeenCalled();
        });

        it('should reset debounce timer on rapid changes', () => {
            const outline: OutlineNode[] = [createTestNode('1', 'Node 1')];
            const onOutlineChange = vi.fn();

            const { result } = renderHook(() =>
                useUndoRedo({ outline, onOutlineChange })
            );

            // First change
            act(() => {
                result.current.handleOutlineChangeWithHistory([createTestNode('1', 'A')]);
            });

            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Second change before timer completes
            act(() => {
                result.current.handleOutlineChangeWithHistory([createTestNode('1', 'AB')]);
            });

            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Try undo - should not work yet
            onOutlineChange.mockClear();
            act(() => {
                result.current.handleUndo();
            });
            expect(onOutlineChange).not.toHaveBeenCalled();

            // Complete the timer
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Now undo should work
            act(() => {
                result.current.handleUndo();
            });
            expect(onOutlineChange).toHaveBeenCalled();
        });
    });

    describe('clearHistory', () => {
        it('should clear both undo and redo stacks', () => {
            let outline: OutlineNode[] = [createTestNode('1', 'Original')];
            const onOutlineChange = vi.fn((newOutline) => {
                outline = newOutline;
            });

            const { result, rerender } = renderHook(
                ({ outline }) => useUndoRedo({ outline, onOutlineChange }),
                { initialProps: { outline } }
            );

            // Push multiple states to history
            act(() => {
                result.current.pushHistory();
            });

            outline = [createTestNode('1', 'Second')];
            rerender({ outline });

            act(() => {
                result.current.pushHistory();
            });

            // Undo once to put something in redo stack
            act(() => {
                result.current.handleUndo();
            });

            rerender({ outline });

            // Clear history
            act(() => {
                result.current.clearHistory();
            });

            onOutlineChange.mockClear();

            // Both undo and redo should now do nothing
            act(() => {
                result.current.handleUndo();
            });
            expect(onOutlineChange).not.toHaveBeenCalled();

            act(() => {
                result.current.handleRedo();
            });
            expect(onOutlineChange).not.toHaveBeenCalled();
        });
    });
});

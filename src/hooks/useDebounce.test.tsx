import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCallback, useRef, useState } from 'react';

// Mock the debounced history push logic
function useDebouncedHistoryPush(delay: number = 500) {
    const [history, setHistory] = useState<string[]>([]);
    const debounceTimer = useRef<number | null>(null);
    const currentValue = useRef<string>('');

    const pushHistory = useCallback(() => {
        setHistory(prev => [...prev, currentValue.current]);
    }, []);

    const updateWithHistory = useCallback((newValue: string) => {
        currentValue.current = newValue;

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer to push history after delay
        debounceTimer.current = setTimeout(() => {
            pushHistory();
        }, delay) as unknown as number;
    }, [delay, pushHistory]);

    return { history, updateWithHistory };
}

describe('Debounced History Push', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should debounce history pushes', () => {
        const { result } = renderHook(() => useDebouncedHistoryPush(500));

        // Make first update
        act(() => {
            result.current.updateWithHistory('A');
        });

        // Advance time by less than debounce delay
        act(() => {
            vi.advanceTimersByTime(300);
        });

        // History should still be empty
        expect(result.current.history).toHaveLength(0);

        // Advance past debounce delay
        act(() => {
            vi.advanceTimersByTime(200);
        });

        // Now history should have one entry
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0]).toBe('A');
    });

    it('should reset debounce timer on rapid changes', () => {
        const { result } = renderHook(() => useDebouncedHistoryPush(500));

        // First update
        act(() => {
            result.current.updateWithHistory('A');
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Second update before debounce completes
        act(() => {
            result.current.updateWithHistory('AB');
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Third update
        act(() => {
            result.current.updateWithHistory('ABC');
        });

        // Still no history yet
        expect(result.current.history).toHaveLength(0);

        // Now advance past the last timer
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Should only have one history entry with the final value
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0]).toBe('ABC');
    });

    it('should allow multiple history entries with sufficient delays', () => {
        const { result } = renderHook(() => useDebouncedHistoryPush(500));

        // First update
        act(() => {
            result.current.updateWithHistory('First');
        });

        act(() => {
            vi.advanceTimersByTime(600); // Past debounce
        });

        expect(result.current.history).toHaveLength(1);

        // Second update
        act(() => {
            result.current.updateWithHistory('Second');
        });

        act(() => {
            vi.advanceTimersByTime(600); // Past debounce
        });

        expect(result.current.history).toHaveLength(2);
        expect(result.current.history[0]).toBe('First');
        expect(result.current.history[1]).toBe('Second');
    });
});

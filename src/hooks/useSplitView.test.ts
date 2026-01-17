import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSplitView } from './useSplitView';
import type { OutlineNode } from '../lib/outline';

// Helper to create test nodes
const createTestNode = (id: string, text: string, children: OutlineNode[] = []): OutlineNode => ({
    id,
    text,
    content: '',
    level: 0,
    children,
});

describe('useSplitView', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    describe('initial state', () => {
        it('should initialize with split view disabled by default', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.isSplitView).toBe(false);
            expect(result.current.activePane).toBe('primary');
            expect(result.current.secondaryNodeId).toBeNull();
        });

        it('should restore split view state from localStorage', () => {
            localStorage.setItem('splitView', 'true');
            localStorage.setItem('activePane', 'secondary');

            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.isSplitView).toBe(true);
            expect(result.current.activePane).toBe('secondary');
        });

        it('should default to primary pane if localStorage has invalid value', () => {
            localStorage.setItem('activePane', 'invalid');

            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.activePane).toBe('primary');
        });
    });

    describe('toggleSplitView', () => {
        it('should toggle split view state', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.isSplitView).toBe(false);

            act(() => {
                result.current.toggleSplitView();
            });

            expect(result.current.isSplitView).toBe(true);

            act(() => {
                result.current.toggleSplitView();
            });

            expect(result.current.isSplitView).toBe(false);
        });
    });

    describe('openInSecondaryPane', () => {
        it('should set secondary node id and active pane', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.openInSecondaryPane('node-1');
            });

            expect(result.current.secondaryNodeId).toBe('node-1');
            expect(result.current.activePane).toBe('secondary');
        });

        it('should enable split view if not already enabled', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.isSplitView).toBe(false);

            act(() => {
                result.current.openInSecondaryPane('node-1');
            });

            expect(result.current.isSplitView).toBe(true);
        });

        it('should keep split view enabled if already enabled', () => {
            localStorage.setItem('splitView', 'true');

            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            expect(result.current.isSplitView).toBe(true);

            act(() => {
                result.current.openInSecondaryPane('node-1');
            });

            expect(result.current.isSplitView).toBe(true);
        });
    });

    describe('closeSplitView', () => {
        it('should disable split view and clear secondary node', () => {
            localStorage.setItem('splitView', 'true');

            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.openInSecondaryPane('node-1');
            });

            expect(result.current.isSplitView).toBe(true);
            expect(result.current.secondaryNodeId).toBe('node-1');

            act(() => {
                result.current.closeSplitView();
            });

            expect(result.current.isSplitView).toBe(false);
            expect(result.current.secondaryNodeId).toBeNull();
        });
    });

    describe('localStorage persistence', () => {
        it('should persist split view state to localStorage', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.setIsSplitView(true);
            });

            expect(localStorage.getItem('splitView')).toBe('true');
        });

        it('should persist active pane to localStorage', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.setActivePane('secondary');
            });

            expect(localStorage.getItem('activePane')).toBe('secondary');
        });

        it('should persist secondary node text to localStorage', () => {
            const outline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
                createTestNode('node-2', 'Second Node'),
            ];

            const { result } = renderHook(() =>
                useSplitView({ outline })
            );

            act(() => {
                result.current.setSecondaryNodeId('node-1');
            });

            expect(localStorage.getItem('secondaryNodeText')).toBe('First Node');
        });

        it('should remove secondary node text when cleared', () => {
            const outline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
            ];

            const { result } = renderHook(() =>
                useSplitView({ outline })
            );

            act(() => {
                result.current.setSecondaryNodeId('node-1');
            });

            expect(localStorage.getItem('secondaryNodeText')).toBe('First Node');

            act(() => {
                result.current.setSecondaryNodeId(null);
            });

            expect(localStorage.getItem('secondaryNodeText')).toBeNull();
        });
    });

    describe('secondaryNodeId validation', () => {
        it('should reset to first node if secondary node no longer exists', () => {
            const outline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
                createTestNode('node-2', 'Second Node'),
            ];

            const { result, rerender } = renderHook(
                ({ outline }) => useSplitView({ outline }),
                { initialProps: { outline } }
            );

            // Enable split view and set secondary node
            act(() => {
                result.current.setIsSplitView(true);
                result.current.setSecondaryNodeId('node-2');
            });

            expect(result.current.secondaryNodeId).toBe('node-2');

            // Remove node-2 from outline
            const newOutline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
            ];

            rerender({ outline: newOutline });

            // Should have reset to first node
            expect(result.current.secondaryNodeId).toBe('node-1');
        });

        it('should not reset if secondary node still exists', () => {
            const outline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
                createTestNode('node-2', 'Second Node'),
            ];

            const { result, rerender } = renderHook(
                ({ outline }) => useSplitView({ outline }),
                { initialProps: { outline } }
            );

            act(() => {
                result.current.setIsSplitView(true);
                result.current.setSecondaryNodeId('node-2');
            });

            // Modify outline but keep node-2
            const newOutline: OutlineNode[] = [
                createTestNode('node-1', 'First Node Modified'),
                createTestNode('node-2', 'Second Node'),
            ];

            rerender({ outline: newOutline });

            expect(result.current.secondaryNodeId).toBe('node-2');
        });

        it('should not validate if split view is disabled', () => {
            const outline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
                createTestNode('node-2', 'Second Node'),
            ];

            const { result, rerender } = renderHook(
                ({ outline }) => useSplitView({ outline }),
                { initialProps: { outline } }
            );

            // Set secondary node but keep split view disabled
            act(() => {
                result.current.setSecondaryNodeId('node-2');
            });

            expect(result.current.isSplitView).toBe(false);

            // Remove node-2 from outline
            const newOutline: OutlineNode[] = [
                createTestNode('node-1', 'First Node'),
            ];

            rerender({ outline: newOutline });

            // Should NOT have reset since split view is disabled
            expect(result.current.secondaryNodeId).toBe('node-2');
        });
    });

    describe('setters', () => {
        it('should allow direct setting of isSplitView', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.setIsSplitView(true);
            });

            expect(result.current.isSplitView).toBe(true);
        });

        it('should allow direct setting of secondaryNodeId', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.setSecondaryNodeId('custom-node');
            });

            expect(result.current.secondaryNodeId).toBe('custom-node');
        });

        it('should allow direct setting of activePane', () => {
            const { result } = renderHook(() =>
                useSplitView({ outline: [] })
            );

            act(() => {
                result.current.setActivePane('secondary');
            });

            expect(result.current.activePane).toBe('secondary');
        });
    });
});

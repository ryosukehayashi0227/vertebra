import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import OutlineView from './OutlineView';
import { OutlineNode } from '../../types/outline';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock LanguageContext
vi.mock('../../contexts/LanguageContext', async () => {
    const actual = await vi.importActual('../../contexts/LanguageContext');
    return {
        ...actual,
        useLanguage: () => ({ t: (key: string) => key }),
        LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
    };
});

describe('OutlineView Focus Management', () => {
    const mockNodes: OutlineNode[] = [
        { id: '1', text: 'Node 1', content: '', level: 0, children: [] },
        { id: '2', text: 'Node 2', content: '', level: 0, children: [] },
    ];

    const defaultProps = {
        outline: mockNodes,
        selectedNodeId: null,
        highlightedNodeId: null,
        onSelectNode: vi.fn(),
        onUpdateNode: vi.fn(),
        onMoveNode: vi.fn(),
        onContextMenu: vi.fn(),
        onIndent: vi.fn(),
        onOutdent: vi.fn(),
        onInsertNode: vi.fn(),
        searchResult: null,
        collapsedNodes: new Set<string>(),
        onToggleCollapse: vi.fn(),
        structureUpdateTrigger: 0,
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should NOT focus input on initial render even if node is selected', () => {
        const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

        render(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                />
            </LanguageProvider>
        );

        act(() => {
            vi.runAllTimers();
        });

        // Initial render with selection should NOT trigger focus (prevent focus stealing)
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should focus input when structureUpdateTrigger increments', () => {
        const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

        const { rerender } = render(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                    structureUpdateTrigger={0}
                />
            </LanguageProvider>
        );

        // Simulate structure update (e.g., after Enter or Tab)
        rerender(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                    structureUpdateTrigger={1}
                />
            </LanguageProvider>
        );

        act(() => {
            vi.runAllTimers();
        });

        expect(focusSpy).toHaveBeenCalled();
    });

    it('should NOT focus input when only selectedNodeId changes (without structure trigger)', () => {
        const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

        const { rerender } = render(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                    structureUpdateTrigger={0}
                />
            </LanguageProvider>
        );

        // Simulate simple selection change (e.g., clicking another node)
        rerender(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='2'
                    structureUpdateTrigger={0}
                />
            </LanguageProvider>
        );

        act(() => {
            vi.runAllTimers();
        });

        // Should NOT focus validation of bug fix
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it('should NOT focus input when props update but trigger/selection unchanged', () => {
        const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');

        const { rerender } = render(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                    structureUpdateTrigger={0}
                />
            </LanguageProvider>
        );

        // Simulate text update or other prop change
        rerender(
            <LanguageProvider>
                <OutlineView
                    {...defaultProps}
                    selectedNodeId='1'
                    structureUpdateTrigger={0}
                    highlightedNodeId='2' // Irrelevant prop change
                />
            </LanguageProvider>
        );

        act(() => {
            vi.runAllTimers();
        });

        expect(focusSpy).not.toHaveBeenCalled();
    });
});

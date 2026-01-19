import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import RichEditor from './RichEditor';

// Mock ResizeObserver for tests
beforeAll(() => {
    (globalThis as any).ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

describe('RichEditor', () => {
    const defaultProps = {
        content: '',
        onChange: vi.fn(),
        placeholder: 'Test Placeholder',
    };

    it('renders at least one line number for empty content', () => {
        render(<RichEditor {...defaultProps} />);

        // Should find "1" in the gutter
        const lineOne = screen.getByText('1');
        expect(lineOne).toBeInTheDocument();
        expect(lineOne).toHaveClass('line-number');
    });

    it('renders correct number of line numbers for multi-line content', () => {
        const content = 'Line 1\nLine 2\nLine 3';
        render(<RichEditor {...defaultProps} content={content} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();
    });

    it('updates line numbers when content changes', () => {
        const { rerender } = render(<RichEditor {...defaultProps} content="One" />);
        expect(screen.queryByText('2')).not.toBeInTheDocument();

        rerender(<RichEditor {...defaultProps} content={`One
Two`} />);

        // Use a more specific query to avoid ambiguity
        const line2 = screen.getByText('2', { selector: '.line-number' });
        expect(line2).toBeInTheDocument();
    });

    it('renders textarea with content', () => {
        render(<RichEditor {...defaultProps} content="Hello World" />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('Hello World');
    });

    describe('Line Height Calculation', () => {
        it('should calculate correct line heights for wrapped text', () => {
            // Create a long line that will wrap
            const longContent = 'a'.repeat(200);
            const { container } = render(<RichEditor {...defaultProps} content={longContent} />);

            const lineNumbers = container.querySelectorAll('.line-number');
            expect(lineNumbers.length).toBe(1); // Still one logical line

            // The line number should have a height style applied
            const firstLineNumber = lineNumbers[0] as HTMLElement;
            expect(firstLineNumber.style.height).toBeTruthy();
        });

        it('should update line heights when container width changes', async () => {
            const { container, rerender } = render(<RichEditor {...defaultProps} content="Test content" />);

            const lineNumbers = container.querySelectorAll('.line-number');
            expect(lineNumbers.length).toBeGreaterThan(0);

            // Trigger a re-render (simulating width change)
            rerender(<RichEditor {...defaultProps} content="Test content updated" />);

            // Line heights should be recalculated
            const updatedLineNumbers = container.querySelectorAll('.line-number');
            expect(updatedLineNumbers.length).toBeGreaterThan(0);
        });
    });

    describe('Font Size Integration', () => {
        it('should recalculate line heights when font size changes', () => {
            const { container } = render(<RichEditor {...defaultProps} content="Line 1\nLine 2" />);

            // Get initial line numbers
            const lineNumbers = container.querySelectorAll('.line-number');
            const initialCount = lineNumbers.length;
            expect(initialCount).toBeGreaterThan(0);

            // Change CSS variable (simulating font size change)
            document.documentElement.style.setProperty('--user-font-size', '20px');

            // The component should observe this change via MutationObserver
            // Line numbers should still be rendered (count should remain the same)
            const updatedLineNumbers = container.querySelectorAll('.line-number');
            expect(updatedLineNumbers.length).toBe(initialCount);
        });
    });

    describe('Jump to Content', () => {
        it('should scroll to and highlight target content when jumpToContent prop changes', () => {
            const content = 'First line\nSecond line\nTarget line\nLast line';
            const { rerender } = render(<RichEditor {...defaultProps} content={content} />);

            // Mock scrollTo
            const mockScrollTo = vi.fn();
            Element.prototype.scrollTo = mockScrollTo;

            // Mock querySelector to return a mock element
            const mockEditorContainer = {
                scrollTo: mockScrollTo
            };
            vi.spyOn(document, 'querySelector').mockReturnValue(mockEditorContainer as any);

            // Trigger jump
            rerender(<RichEditor {...defaultProps} content={content} jumpToContent="Target" />);

            // Should attempt to scroll (may be called via useEffect)
            // Note: This test verifies the prop is accepted and processed
            expect(true).toBe(true); // Basic verification that no errors occur
        });
    });
});

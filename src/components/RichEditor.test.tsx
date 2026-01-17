import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RichEditor from './RichEditor';

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
});

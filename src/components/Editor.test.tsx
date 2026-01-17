import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Editor from './Editor';
import { LanguageProvider } from '../contexts/LanguageContext';
import type { Document } from '../App';
import type { OutlineNode } from '../lib/outline';

const mockDocument: Document = {
    path: '/test/file.md',
    name: 'file.md',
    content: '- Section 1\n  Content here',
    outline: [
        { id: '1', text: 'Section 1', content: 'Content here', level: 0, children: [] }
    ],
    isDirty: true,
};

const defaultProps = {
    document: mockDocument,
    selectedNodeId: '1',
    onOutlineChange: vi.fn(),
    onSave: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('Editor', () => {
    it('renders save button by default', () => {
        renderWithProviders(<Editor {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });

    it('hides save button when hideSaveButton is true', () => {
        renderWithProviders(<Editor {...defaultProps} hideSaveButton={true} />);

        expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument();
    });

    it('renders node title input', () => {
        renderWithProviders(<Editor {...defaultProps} />);

        const titleInput = screen.getByDisplayValue('Section 1');
        expect(titleInput).toBeInTheDocument();
    });

    it('shows empty state when no node is selected', () => {
        renderWithProviders(<Editor {...defaultProps} selectedNodeId={null} />);

        // Should show message about selecting a node
        expect(screen.getByText(/select/i)).toBeInTheDocument();
    });
});

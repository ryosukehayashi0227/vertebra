import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import Editor from './Editor';
import { LanguageProvider } from '../../contexts/LanguageContext';
import type { Document } from '../../App';

// Mock ResizeObserver for RichEditor component
beforeAll(() => {
    (globalThis as any).ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

// Mock Tauri OS detection
vi.mock('@tauri-apps/plugin-os', () => ({
    type: vi.fn().mockResolvedValue('macos'),
}));

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
    describe('Rendering', () => {
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

        it('renders RichEditor component', () => {
            const { container } = renderWithProviders(<Editor {...defaultProps} />);
            expect(container.querySelector('.content-editor')).toBeInTheDocument();
        });
    });

    describe('Title Editing', () => {
        it('calls onOutlineChange when title is edited', () => {
            const onOutlineChange = vi.fn();
            renderWithProviders(
                <Editor {...defaultProps} onOutlineChange={onOutlineChange} />
            );

            const titleInput = screen.getByDisplayValue('Section 1');
            fireEvent.change(titleInput, { target: { value: 'New Title' } });

            expect(onOutlineChange).toHaveBeenCalled();
            const updatedOutline = onOutlineChange.mock.calls[0][0];
            expect(updatedOutline[0].text).toBe('New Title');
        });

        it('updates title input value when typing', () => {
            renderWithProviders(<Editor {...defaultProps} />);

            const titleInput = screen.getByDisplayValue('Section 1') as HTMLInputElement;
            fireEvent.change(titleInput, { target: { value: 'Updated' } });

            // The component should call onOutlineChange which would update the document
            expect(defaultProps.onOutlineChange).toHaveBeenCalled();
        });
    });

    describe('Save Button', () => {
        it('calls onSave when save button is clicked', () => {
            const onSave = vi.fn();
            renderWithProviders(<Editor {...defaultProps} onSave={onSave} />);

            const saveButton = screen.getByRole('button', { name: /Save/i });
            fireEvent.click(saveButton);

            expect(onSave).toHaveBeenCalledTimes(1);
        });

        it('disables save button when document is not dirty', () => {
            const cleanDocument = { ...mockDocument, isDirty: false };
            renderWithProviders(
                <Editor {...defaultProps} document={cleanDocument} />
            );

            const saveButton = screen.getByRole('button', { name: /Save/i });
            expect(saveButton).toBeDisabled();
        });

        it('enables save button when document is dirty', () => {
            renderWithProviders(<Editor {...defaultProps} />);

            const saveButton = screen.getByRole('button', { name: /Save/i });
            expect(saveButton).not.toBeDisabled();
        });

        it('shows keyboard shortcut hint in save button', () => {
            renderWithProviders(<Editor {...defaultProps} />);

            // Should show either ⌘S or Ctrl+S depending on platform
            const saveButton = screen.getByRole('button', { name: /Save/i });
            expect(saveButton.textContent).toMatch(/Save \(.*S\)/);
        });
    });

    describe('Node Selection', () => {
        it('updates when different node is selected', () => {
            const documentWithMultipleNodes: Document = {
                ...mockDocument,
                outline: [
                    { id: '1', text: 'Section 1', content: 'Content 1', level: 0, children: [] },
                    { id: '2', text: 'Section 2', content: 'Content 2', level: 0, children: [] },
                ],
            };

            const { rerender } = renderWithProviders(
                <Editor {...defaultProps} document={documentWithMultipleNodes} selectedNodeId="1" />
            );

            expect(screen.getByDisplayValue('Section 1')).toBeInTheDocument();

            // Rerender with different selected node
            rerender(
                <LanguageProvider>
                    <Editor {...defaultProps} document={documentWithMultipleNodes} selectedNodeId="2" />
                </LanguageProvider>
            );

            expect(screen.getByDisplayValue('Section 2')).toBeInTheDocument();
        });

        it('shows empty state when selectedNodeId is null', () => {
            renderWithProviders(<Editor {...defaultProps} selectedNodeId={null} />);

            expect(screen.queryByDisplayValue('Section 1')).not.toBeInTheDocument();
            expect(screen.getByText(/select/i)).toBeInTheDocument();
        });
    });

    describe('Content Editing', () => {
        it('renders content in RichEditor', () => {
            const { container } = renderWithProviders(<Editor {...defaultProps} />);

            // RichEditor should be rendered with the content
            const contentEditor = container.querySelector('.content-editor');
            expect(contentEditor).toBeInTheDocument();
        });
    });
});

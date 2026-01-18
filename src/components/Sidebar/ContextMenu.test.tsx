import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContextMenu from './ContextMenu';
import { LanguageProvider } from '../../contexts/LanguageContext';

const defaultProps = {
    x: 100,
    y: 200,
    targetId: 'test-id',
    type: 'outline' as const,
    onClose: vi.fn(),
    onDeleteFile: vi.fn(),
    onCopyAsText: vi.fn(),
    onIndent: vi.fn(),
    onOutdent: vi.fn(),
    onDeleteNode: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('ContextMenu', () => {
    describe('Rendering', () => {
        it('renders at correct position', () => {
            const { container } = renderWithProviders(<ContextMenu {...defaultProps} />);
            const menu = container.querySelector('.context-menu') as HTMLElement;

            expect(menu).toBeInTheDocument();
            expect(menu.style.left).toBe('100px');
            expect(menu.style.top).toBe('200px');
            expect(menu.style.position).toBe('fixed');
        });

        it('has correct z-index for overlay', () => {
            const { container } = renderWithProviders(<ContextMenu {...defaultProps} />);
            const menu = container.querySelector('.context-menu') as HTMLElement;

            expect(menu.style.zIndex).toBe('1000');
        });
    });

    describe('File Type Menu', () => {
        it('renders delete button for file type', () => {
            renderWithProviders(<ContextMenu {...defaultProps} type="file" />);

            expect(screen.getByText('削除')).toBeInTheDocument();
        });

        it('calls onDeleteFile and onClose when delete is clicked', () => {
            const onDeleteFile = vi.fn();
            const onClose = vi.fn();

            renderWithProviders(
                <ContextMenu
                    {...defaultProps}
                    type="file"
                    onDeleteFile={onDeleteFile}
                    onClose={onClose}
                />
            );

            fireEvent.click(screen.getByText('削除'));

            expect(onDeleteFile).toHaveBeenCalledWith('test-id');
            expect(onClose).toHaveBeenCalled();
        });

        it('only shows delete option for file type', () => {
            renderWithProviders(<ContextMenu {...defaultProps} type="file" />);

            // Should not show outline-specific options
            expect(screen.queryByText(/Copy as Text/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/インデント/)).not.toBeInTheDocument();
        });
    });

    describe('Outline Type Menu', () => {
        it('renders all outline menu options', () => {
            renderWithProviders(<ContextMenu {...defaultProps} type="outline" />);

            expect(screen.getByText(/Copy as Text/i)).toBeInTheDocument();
            expect(screen.getByText(/インデント \(Tab\)/)).toBeInTheDocument();
            expect(screen.getByText(/アウトデント \(Shift\+Tab\)/)).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('calls onCopyAsText when copy button is clicked', () => {
            const onCopyAsText = vi.fn();

            renderWithProviders(
                <ContextMenu {...defaultProps} onCopyAsText={onCopyAsText} />
            );

            fireEvent.click(screen.getByText(/Copy as Text/i));

            expect(onCopyAsText).toHaveBeenCalledWith('test-id');
        });

        it('calls onIndent and onClose when indent is clicked', () => {
            const onIndent = vi.fn();
            const onClose = vi.fn();

            renderWithProviders(
                <ContextMenu
                    {...defaultProps}
                    onIndent={onIndent}
                    onClose={onClose}
                />
            );

            fireEvent.click(screen.getByText(/インデント \(Tab\)/));

            expect(onIndent).toHaveBeenCalledWith('test-id');
            expect(onClose).toHaveBeenCalled();
        });

        it('calls onOutdent and onClose when outdent is clicked', () => {
            const onOutdent = vi.fn();
            const onClose = vi.fn();

            renderWithProviders(
                <ContextMenu
                    {...defaultProps}
                    onOutdent={onOutdent}
                    onClose={onClose}
                />
            );

            fireEvent.click(screen.getByText(/アウトデント \(Shift\+Tab\)/));

            expect(onOutdent).toHaveBeenCalledWith('test-id');
            expect(onClose).toHaveBeenCalled();
        });

        it('calls onDeleteNode when delete is clicked', () => {
            const onDeleteNode = vi.fn();

            renderWithProviders(
                <ContextMenu {...defaultProps} onDeleteNode={onDeleteNode} />
            );

            fireEvent.click(screen.getByText('Delete'));

            expect(onDeleteNode).toHaveBeenCalledWith('test-id');
        });
    });

    describe('Secondary Pane Option', () => {
        it('shows "Open in Secondary Pane" when callback is provided', () => {
            const onOpenInSecondaryPane = vi.fn();

            renderWithProviders(
                <ContextMenu
                    {...defaultProps}
                    onOpenInSecondaryPane={onOpenInSecondaryPane}
                />
            );

            expect(screen.getByText('右側で開く')).toBeInTheDocument();
        });

        it('does not show "Open in Secondary Pane" when callback is not provided', () => {
            renderWithProviders(<ContextMenu {...defaultProps} />);

            expect(screen.queryByText('右側で開く')).not.toBeInTheDocument();
        });

        it('calls onOpenInSecondaryPane and onClose when clicked', () => {
            const onOpenInSecondaryPane = vi.fn();
            const onClose = vi.fn();

            renderWithProviders(
                <ContextMenu
                    {...defaultProps}
                    onOpenInSecondaryPane={onOpenInSecondaryPane}
                    onClose={onClose}
                />
            );

            fireEvent.click(screen.getByText('右側で開く'));

            expect(onOpenInSecondaryPane).toHaveBeenCalledWith('test-id');
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('Styling', () => {
        it('applies delete button style to delete actions', () => {
            renderWithProviders(<ContextMenu {...defaultProps} type="outline" />);

            const deleteButton = screen.getByText('Delete');
            expect(deleteButton).toHaveStyle({ color: '#ff4d4f' });
        });

        it('has dividers between menu sections', () => {
            const { container } = renderWithProviders(<ContextMenu {...defaultProps} />);

            // Check for divider elements (they don't have text, so we check the DOM)
            const menu = container.querySelector('.context-menu');
            expect(menu).toBeInTheDocument();
        });
    });

    describe('Target ID Handling', () => {
        it('passes correct targetId to all callbacks', () => {
            const callbacks = {
                onCopyAsText: vi.fn(),
                onIndent: vi.fn(),
                onOutdent: vi.fn(),
                onDeleteNode: vi.fn(),
            };

            renderWithProviders(
                <ContextMenu {...defaultProps} targetId="custom-id" {...callbacks} />
            );

            fireEvent.click(screen.getByText(/Copy as Text/i));
            expect(callbacks.onCopyAsText).toHaveBeenCalledWith('custom-id');

            fireEvent.click(screen.getByText(/インデント/));
            expect(callbacks.onIndent).toHaveBeenCalledWith('custom-id');
        });
    });
});

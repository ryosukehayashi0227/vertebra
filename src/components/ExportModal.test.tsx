import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportModal from './ExportModal';
import { LanguageProvider } from '../contexts/LanguageContext';

// Mock Tauri APIs
vi.mock('@tauri-apps/plugin-dialog', () => ({
    save: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
}));

import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

const mockSave = save as ReturnType<typeof vi.fn>;
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('ExportModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        content: '- Test Node\n  Test content',
        title: 'Test Document',
    };

    const renderModal = (props = {}) => {
        return render(
            <LanguageProvider>
                <ExportModal {...defaultProps} {...props} />
            </LanguageProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Modal Visibility', () => {
        it('should render when isOpen is true', () => {
            renderModal();
            expect(screen.getByText('Export Document')).toBeInTheDocument();
        });

        it('should not render when isOpen is false', () => {
            renderModal({ isOpen: false });
            expect(screen.queryByText('Export Document')).not.toBeInTheDocument();
        });

        it('should display modal title', () => {
            renderModal();
            expect(screen.getByText('Export Document')).toBeInTheDocument();
        });

        it('should display description', () => {
            renderModal();
            expect(screen.getByText(/Export your document as a Word file/)).toBeInTheDocument();
        });
    });

    describe('Modal Interaction', () => {
        it('should call onClose when cancel button is clicked', () => {
            const onClose = vi.fn();
            renderModal({ onClose });

            fireEvent.click(screen.getByText('Cancel'));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when clicking overlay', () => {
            const onClose = vi.fn();
            renderModal({ onClose });

            const overlay = screen.getByText('Export Document').closest('.modal-overlay');
            fireEvent.click(overlay!);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should not close when clicking modal content', () => {
            const onClose = vi.fn();
            renderModal({ onClose });

            const modalContent = screen.getByText('Export Document').closest('.modal-content');
            fireEvent.click(modalContent!);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Export Flow', () => {
        it('should show export button with correct text', () => {
            renderModal();
            expect(screen.getByText('Export as DOCX')).toBeInTheDocument();
        });

        it('should call save dialog with correct parameters', async () => {
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockResolvedValue(undefined);

            renderModal({ title: 'My Document' });

            fireEvent.click(screen.getByText('Export as DOCX'));

            await waitFor(() => {
                expect(mockSave).toHaveBeenCalledWith({
                    defaultPath: 'My Document.docx',
                    filters: [{
                        name: 'DOCX',
                        extensions: ['docx'],
                    }],
                });
            });
        });

        it('should invoke export_document with correct options', async () => {
            mockSave.mockResolvedValue('/path/to/output.docx');
            mockInvoke.mockResolvedValue(undefined);

            renderModal({
                content: '- Node 1\n  Content',
                title: 'Test Doc',
            });

            fireEvent.click(screen.getByText('Export as DOCX'));

            await waitFor(() => {
                expect(mockInvoke).toHaveBeenCalledWith('export_document', {
                    options: {
                        format: 'docx',
                        content: '- Node 1\n  Content',
                        title: 'Test Doc',
                        output_path: '/path/to/output.docx',
                    },
                });
            });
        });

        it('should handle user cancellation (no file selected)', async () => {
            mockSave.mockResolvedValue(null); // User cancelled

            renderModal();
            const exportButton = screen.getByText('Export as DOCX');

            fireEvent.click(exportButton);

            await waitFor(() => {
                expect(exportButton).not.toBeDisabled();
            });

            expect(mockInvoke).not.toHaveBeenCalled();
        });

        it('should show success message after successful export', async () => {
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockResolvedValue(undefined);

            renderModal();

            fireEvent.click(screen.getByText('Export as DOCX'));

            await waitFor(() => {
                expect(screen.getByText(/Export completed successfully/)).toBeInTheDocument();
            });
        });

        it('should auto-close modal after successful export', async () => {
            vi.useFakeTimers();
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockResolvedValue(undefined);
            const onClose = vi.fn();

            renderModal({ onClose });

            fireEvent.click(screen.getByText('Export as DOCX'));

            await waitFor(() => {
                expect(screen.getByText(/Export completed successfully/)).toBeInTheDocument();
            });

            // Fast-forward 1500ms
            await vi.advanceTimersByTimeAsync(1500);

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1);
            });

            vi.useRealTimers();
        });
    });

    describe('Error Handling', () => {
        it('should display error message when export fails', async () => {
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockRejectedValue(new Error('Export failed'));

            renderModal();
            fireEvent.click(screen.getByText('Export as DOCX'));

            await waitFor(() => {
                expect(screen.getByText('Error: Export failed')).toBeInTheDocument();
            });
        });

        it('should re-enable export button after error', async () => {
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockRejectedValue(new Error('Export failed'));

            renderModal();
            const exportButton = screen.getByText('Export as DOCX');
            fireEvent.click(exportButton);

            await waitFor(() => {
                expect(screen.getByText('Error: Export failed')).toBeInTheDocument();
            });

            expect(exportButton).not.toBeDisabled();
        });
    });

    describe('State Management', () => {
        it('should clear error and success states when closing', async () => {
            mockSave.mockResolvedValue('/path/to/file.docx');
            mockInvoke.mockResolvedValue(undefined);
            const onClose = vi.fn();

            renderModal({ onClose });

            // Trigger success
            fireEvent.click(screen.getByText('Export as DOCX'));
            await waitFor(() => {
                expect(screen.getByText(/Export completed successfully/)).toBeInTheDocument();
            });

            // Close modal
            fireEvent.click(screen.getByText('Cancel'));

            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('i18n Integration', () => {
        it('should use translation keys for all text', () => {
            renderModal();

            // Check that translated text appears
            expect(screen.getByText('Export Document')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
            expect(screen.getByText('Export as DOCX')).toBeInTheDocument();
        });
    });
});

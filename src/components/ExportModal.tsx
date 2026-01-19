import { useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage } from '../contexts/LanguageContext';
import ModalWindow from './ModalWindow';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';
import './Modal.css';

interface ExportOptions {
    format: string;
    content: string;
    title: string;
    output_path: string;
}

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    title: string;
}

// Icon components
const ExportIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

function ExportModal({ isOpen, onClose, content, title }: ExportModalProps) {
    const { t } = useLanguage();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setSuccess(false);
        setError(null);
        onClose();
    };

    const handleExport = async () => {
        setError(null);
        setSuccess(false);
        setIsExporting(true);

        try {
            const outputPath = await save({
                defaultPath: `${title}.docx`,
                filters: [{
                    name: 'DOCX',
                    extensions: ['docx'],
                }],
            });

            if (!outputPath) {
                setIsExporting(false);
                return; // User cancelled
            }

            const options: ExportOptions = {
                format: 'docx',
                content,
                title,
                output_path: outputPath,
            };

            await invoke('export_document', { options });
            setSuccess(true);
            // Auto close after a short delay
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate approximate word count for file info
    const wordCount = content.trim().split(/\s+/).length;
    const charCount = content.length;

    return (
        <ModalWindow isOpen={isOpen} onClose={handleClose} width="520px">
            <ModalHeader
                title={t('export.title')}
                icon={<ExportIcon />}
                onClose={handleClose}
            />

            <div className="desktop-modal-content">
                <p style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>
                    {t('export.docxDescription')}
                </p>

                {/* File Info Display */}
                <div className="desktop-modal-file-info">
                    <div className="desktop-modal-file-icon">
                        <FileIcon />
                    </div>
                    <div className="desktop-modal-file-details">
                        <div className="desktop-modal-file-name">{title}.docx</div>
                        <div className="desktop-modal-file-meta">
                            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'} · {charCount.toLocaleString()} characters
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                {isExporting && (
                    <div className="desktop-modal-progress">
                        <div className="desktop-modal-spinner" />
                        <span className="desktop-modal-progress-text">
                            {t('export.exporting')}
                        </span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="desktop-modal-status desktop-modal-status-success">
                        <div className="desktop-modal-status-icon">
                            <CheckIcon />
                        </div>
                        {t('export.success')}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="desktop-modal-status desktop-modal-status-error">
                        <div className="desktop-modal-status-icon">
                            <AlertIcon />
                        </div>
                        {error}
                    </div>
                )}
            </div>

            <ModalFooter>
                <button
                    className="btn-secondary"
                    onClick={handleClose}
                    disabled={isExporting}
                >
                    {t('common.cancel')}
                </button>
                <button
                    className="btn-primary"
                    onClick={handleExport}
                    disabled={isExporting || success}
                >
                    {isExporting ? t('export.exporting') : t('export.exportDocx')}
                </button>
            </ModalFooter>
        </ModalWindow>
    );
}

export default ExportModal;

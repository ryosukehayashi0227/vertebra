import { useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage } from '../contexts/LanguageContext';

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

function ExportModal({ isOpen, onClose, content, title }: ExportModalProps) {
    const { t } = useLanguage();
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{t('export.title')}</h2>

                <p className="export-description">
                    {t('export.docxDescription')}
                </p>

                {error && (
                    <div className="export-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="export-success">
                        ✓ {t('export.success')}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        {t('common.cancel')}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? t('export.exporting') : t('export.exportDocx')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportModal;

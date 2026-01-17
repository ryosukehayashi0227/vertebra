import type { FileEntry } from '../../lib/fileSystem';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileListProps {
    files: FileEntry[];
    currentPath: string | null;
    folderPath: string | null;
    selectedFilePath: string | null;
    isCreatingFile: boolean;
    newFileName: string;
    onNewFileNameChange: (name: string) => void;
    onCreateSubmit: (e: React.FormEvent) => void;
    onNavigateUp: () => void;
    onNavigateToFolder: (path: string) => void;
    onSelectFile: (path: string) => void;
    onSetIsCreatingFile: (value: boolean) => void;
    onContextMenu: (e: React.MouseEvent, path: string) => void;
}

function FileList({
    files,
    currentPath,
    folderPath,
    selectedFilePath,
    isCreatingFile,
    newFileName,
    onNewFileNameChange,
    onCreateSubmit,
    onNavigateUp,
    onNavigateToFolder,
    onSelectFile,
    onSetIsCreatingFile,
    onContextMenu,
}: FileListProps) {
    const { t } = useLanguage();

    return (
        <>
            <button
                className="sidebar-new-btn"
                onClick={() => onSetIsCreatingFile(true)}
            >
                <span>+</span> {t('sidebar.newFile')}
            </button>

            {isCreatingFile && (
                <form onSubmit={onCreateSubmit} className="new-file-form">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => onNewFileNameChange(e.target.value)}
                        placeholder={t('sidebar.fileNamePlaceholder')}
                        autoFocus
                        onBlur={() => !newFileName.trim() && onSetIsCreatingFile(false)}
                    />
                </form>
            )}

            <ul className="file-list">
                {currentPath && folderPath && currentPath !== folderPath && (
                    <li className="file-item folder-back" onClick={onNavigateUp}>
                        <span className="file-icon">⬆️</span>
                        <span className="file-name">..</span>
                    </li>
                )}
                {files.map((f) => (
                    <li
                        key={f.path}
                        className={`file-item ${selectedFilePath === f.path ? 'selected' : ''} ${f.is_dir ? 'folder' : ''}`}
                        onClick={() => f.is_dir ? onNavigateToFolder(f.path) : onSelectFile(f.path)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            if (!f.is_dir) {
                                onContextMenu(e, f.path);
                            }
                        }}
                    >
                        <span className="file-icon">{f.is_dir ? '📁' : '📄'}</span>
                        <span className="file-name">{f.name}</span>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default FileList;

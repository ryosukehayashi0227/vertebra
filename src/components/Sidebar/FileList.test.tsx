import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileList from './FileList';
import type { FileEntry } from '../../lib/fileSystem';
import { LanguageProvider } from '../../contexts/LanguageContext';

const mockFiles: FileEntry[] = [
    { name: 'folder1', path: '/test/folder1', is_dir: true },
    { name: 'file1.md', path: '/test/file1.md', is_dir: false },
    { name: 'file2.md', path: '/test/file2.md', is_dir: false },
];

const defaultProps = {
    files: mockFiles,
    currentPath: '/test',
    folderPath: '/test',
    selectedFilePath: null,
    isCreatingFile: false,
    newFileName: '',
    onNewFileNameChange: vi.fn(),
    onCreateSubmit: vi.fn((e) => e.preventDefault()),
    onNavigateUp: vi.fn(),
    onNavigateToFolder: vi.fn(),
    onSelectFile: vi.fn(),
    onSetIsCreatingFile: vi.fn(),
    onContextMenu: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('FileList', () => {
    describe('Rendering', () => {
        it('renders list of files and folders', () => {
            renderWithProviders(<FileList {...defaultProps} />);

            expect(screen.getByText('folder1')).toBeInTheDocument();
            expect(screen.getByText('file1.md')).toBeInTheDocument();
            expect(screen.getByText('file2.md')).toBeInTheDocument();
        });

        it('renders correct icons', () => {
            renderWithProviders(<FileList {...defaultProps} />);

            // Folder icon
            expect(screen.getAllByText('📁')).toHaveLength(1);
            // File icons
            expect(screen.getAllByText('📄')).toHaveLength(2);
        });

        it('highlights selected file', () => {
            renderWithProviders(
                <FileList {...defaultProps} selectedFilePath="/test/file1.md" />
            );

            const selectedFile = screen.getByText('file1.md').closest('li');
            expect(selectedFile).toHaveClass('selected');
        });
    });

    describe('Navigation', () => {
        it('calls onNavigateToFolder when folder is clicked', () => {
            const onNavigateToFolder = vi.fn();
            renderWithProviders(
                <FileList {...defaultProps} onNavigateToFolder={onNavigateToFolder} />
            );

            const folder = screen.getByText('folder1');
            fireEvent.click(folder);

            expect(onNavigateToFolder).toHaveBeenCalledWith('/test/folder1');
        });

        it('calls onSelectFile when file is clicked', () => {
            const onSelectFile = vi.fn();
            renderWithProviders(
                <FileList {...defaultProps} onSelectFile={onSelectFile} />
            );

            const file = screen.getByText('file1.md');
            fireEvent.click(file);

            expect(onSelectFile).toHaveBeenCalledWith('/test/file1.md');
        });

        it('renders back button when inside a subfolder', () => {
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    currentPath="/test/folder1"
                    folderPath="/test"
                />
            );

            expect(screen.getByText('..')).toBeInTheDocument();
        });

        it('calls onNavigateUp when back button is clicked', () => {
            const onNavigateUp = vi.fn();
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    currentPath="/test/folder1"
                    folderPath="/test"
                    onNavigateUp={onNavigateUp}
                />
            );

            fireEvent.click(screen.getByText('..'));

            expect(onNavigateUp).toHaveBeenCalled();
        });

        it('does not render back button at root', () => {
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    currentPath="/test"
                    folderPath="/test"
                />
            );

            expect(screen.queryByText('..')).not.toBeInTheDocument();
        });
    });

    describe('File Creation', () => {
        it('renders new file button', () => {
            renderWithProviders(<FileList {...defaultProps} />);

            expect(screen.getByText(/New File/i)).toBeInTheDocument();
        });

        it('calls onSetIsCreatingFile when new file button is clicked', () => {
            const onSetIsCreatingFile = vi.fn();
            renderWithProviders(
                <FileList {...defaultProps} onSetIsCreatingFile={onSetIsCreatingFile} />
            );

            fireEvent.click(screen.getByText(/New File/i));

            expect(onSetIsCreatingFile).toHaveBeenCalledWith(true);
        });

        it('renders input form when isCreatingFile is true', () => {
            renderWithProviders(<FileList {...defaultProps} isCreatingFile={true} />);

            expect(screen.getByPlaceholderText(/File Name/i)).toBeInTheDocument();
        });

        it('calls onNewFileNameChange when typing', () => {
            const onNewFileNameChange = vi.fn();
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    isCreatingFile={true}
                    onNewFileNameChange={onNewFileNameChange}
                />
            );

            const input = screen.getByPlaceholderText(/File Name/i);
            fireEvent.change(input, { target: { value: 'new.md' } });

            expect(onNewFileNameChange).toHaveBeenCalledWith('new.md');
        });

        it('calls onCreateSubmit when form is submitted', () => {
            const onCreateSubmit = vi.fn((e) => e.preventDefault());
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    isCreatingFile={true}
                    onCreateSubmit={onCreateSubmit}
                />
            );

            const input = screen.getByPlaceholderText(/File Name/i);
            fireEvent.submit(input);

            expect(onCreateSubmit).toHaveBeenCalled();
        });

        it('cancels creation on blur if name is empty', () => {
            const onSetIsCreatingFile = vi.fn();
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    isCreatingFile={true}
                    newFileName=""
                    onSetIsCreatingFile={onSetIsCreatingFile}
                />
            );

            const input = screen.getByPlaceholderText(/File Name/i);
            fireEvent.blur(input);

            expect(onSetIsCreatingFile).toHaveBeenCalledWith(false);
        });

        it('does not cancel creation on blur if name is not empty', () => {
            const onSetIsCreatingFile = vi.fn();
            renderWithProviders(
                <FileList
                    {...defaultProps}
                    isCreatingFile={true}
                    newFileName="test.md"
                    onSetIsCreatingFile={onSetIsCreatingFile}
                />
            );

            const input = screen.getByPlaceholderText(/File Name/i);
            fireEvent.blur(input);

            expect(onSetIsCreatingFile).not.toHaveBeenCalled();
        });
    });

    describe('Context Menu', () => {
        it('calls onContextMenu when file is right-clicked', () => {
            const onContextMenu = vi.fn();
            renderWithProviders(
                <FileList {...defaultProps} onContextMenu={onContextMenu} />
            );

            const file = screen.getByText('file1.md');
            fireEvent.contextMenu(file);

            expect(onContextMenu).toHaveBeenCalled();
            expect(onContextMenu.mock.calls[0][1]).toBe('/test/file1.md');
        });

        it('does not call onContextMenu when folder is right-clicked', () => {
            const onContextMenu = vi.fn();
            renderWithProviders(
                <FileList {...defaultProps} onContextMenu={onContextMenu} />
            );

            const folder = screen.getByText('folder1');
            fireEvent.contextMenu(folder);

            expect(onContextMenu).not.toHaveBeenCalled();
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { open, ask } from '@tauri-apps/plugin-dialog';
import {
    openFolderDialog,
    readDirectory,
    readFile,
    writeFile,
    createFile,
    deleteFile,
    renameFile,
    askConfirm,
} from './fileSystem';

// Mock Tauri plugin-dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: vi.fn(),
    ask: vi.fn(),
}));

// Note: @tauri-apps/api/core is already mocked in vitest.setup.ts

describe('fileSystem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('openFolderDialog', () => {
        it('should call open with directory options', async () => {
            vi.mocked(open).mockResolvedValue('/selected/folder');

            const result = await openFolderDialog();

            expect(open).toHaveBeenCalledWith({
                directory: true,
                multiple: false,
                title: 'Select a folder to open',
            });
            expect(result).toBe('/selected/folder');
        });

        it('should return null when dialog is cancelled', async () => {
            vi.mocked(open).mockResolvedValue(null);

            const result = await openFolderDialog();

            expect(result).toBeNull();
        });
    });

    describe('readDirectory', () => {
        it('should call invoke with correct command and path', async () => {
            const mockFiles = [
                { name: 'file1.md', path: '/test/file1.md', is_dir: false },
                { name: 'subfolder', path: '/test/subfolder', is_dir: true },
            ];
            vi.mocked(invoke).mockResolvedValue(mockFiles);

            const result = await readDirectory('/test');

            expect(invoke).toHaveBeenCalledWith('read_directory', { path: '/test' });
            expect(result).toEqual(mockFiles);
        });
    });

    describe('readFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue('file content');

            const result = await readFile('/test/file.md');

            expect(invoke).toHaveBeenCalledWith('read_file', { path: '/test/file.md' });
            expect(result).toBe('file content');
        });
    });

    describe('writeFile', () => {
        it('should call invoke with correct command, path and content', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await writeFile('/test/file.md', 'new content');

            expect(invoke).toHaveBeenCalledWith('write_file', {
                path: '/test/file.md',
                content: 'new content',
            });
        });
    });

    describe('createFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await createFile('/test/newfile.md');

            expect(invoke).toHaveBeenCalledWith('create_file', { path: '/test/newfile.md' });
        });
    });

    describe('deleteFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await deleteFile('/test/file.md');

            expect(invoke).toHaveBeenCalledWith('delete_file', { path: '/test/file.md' });
        });
    });

    describe('renameFile', () => {
        it('should call invoke with correct command and paths', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await renameFile('/test/old.md', '/test/new.md');

            expect(invoke).toHaveBeenCalledWith('rename_file', {
                oldPath: '/test/old.md',
                newPath: '/test/new.md',
            });
        });
    });

    describe('askConfirm', () => {
        it('should call ask with message and options', async () => {
            vi.mocked(ask).mockResolvedValue(true);

            const result = await askConfirm('Are you sure?');

            expect(ask).toHaveBeenCalledWith('Are you sure?', {
                title: 'Vertebra',
                kind: 'warning',
            });
            expect(result).toBe(true);
        });

        it('should return false when user cancels', async () => {
            vi.mocked(ask).mockResolvedValue(false);

            const result = await askConfirm('Delete this file?');

            expect(result).toBe(false);
        });
    });
});

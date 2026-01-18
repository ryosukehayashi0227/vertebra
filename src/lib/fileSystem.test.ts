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

        it('should handle empty directory', async () => {
            vi.mocked(invoke).mockResolvedValue([]);

            const result = await readDirectory('/empty');

            expect(result).toEqual([]);
        });

        it('should handle directory read errors', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('Permission denied'));

            await expect(readDirectory('/forbidden')).rejects.toThrow('Permission denied');
        });
    });

    describe('readFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue('file content');

            const result = await readFile('/test/file.md');

            expect(invoke).toHaveBeenCalledWith('read_file', { path: '/test/file.md' });
            expect(result).toBe('file content');
        });

        it('should handle empty file', async () => {
            vi.mocked(invoke).mockResolvedValue('');

            const result = await readFile('/test/empty.md');

            expect(result).toBe('');
        });

        it('should handle file not found error', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('File not found'));

            await expect(readFile('/test/missing.md')).rejects.toThrow('File not found');
        });

        it('should handle file with special characters in path', async () => {
            vi.mocked(invoke).mockResolvedValue('content');

            const result = await readFile('/test/file with spaces & special.md');

            expect(invoke).toHaveBeenCalledWith('read_file', { path: '/test/file with spaces & special.md' });
            expect(result).toBe('content');
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

        it('should handle empty content', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await writeFile('/test/file.md', '');

            expect(invoke).toHaveBeenCalledWith('write_file', {
                path: '/test/file.md',
                content: '',
            });
        });

        it('should handle write errors', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('Disk full'));

            await expect(writeFile('/test/file.md', 'content')).rejects.toThrow('Disk full');
        });
    });

    describe('createFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await createFile('/test/newfile.md');

            expect(invoke).toHaveBeenCalledWith('create_file', { path: '/test/newfile.md' });
        });

        it('should handle file already exists error', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('File already exists'));

            await expect(createFile('/test/existing.md')).rejects.toThrow('File already exists');
        });
    });

    describe('deleteFile', () => {
        it('should call invoke with correct command and path', async () => {
            vi.mocked(invoke).mockResolvedValue(undefined);

            await deleteFile('/test/file.md');

            expect(invoke).toHaveBeenCalledWith('delete_file', { path: '/test/file.md' });
        });

        it('should handle delete errors', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('File in use'));

            await expect(deleteFile('/test/locked.md')).rejects.toThrow('File in use');
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

        it('should handle rename to existing file error', async () => {
            vi.mocked(invoke).mockRejectedValue(new Error('Target file already exists'));

            await expect(renameFile('/test/old.md', '/test/existing.md')).rejects.toThrow('Target file already exists');
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

    describe('Concurrent Operations', () => {
        it('should handle multiple readFile calls concurrently', async () => {
            vi.mocked(invoke)
                .mockResolvedValueOnce('content1')
                .mockResolvedValueOnce('content2')
                .mockResolvedValueOnce('content3');

            const results = await Promise.all([
                readFile('/test/file1.md'),
                readFile('/test/file2.md'),
                readFile('/test/file3.md'),
            ]);

            expect(results).toEqual(['content1', 'content2', 'content3']);
            expect(invoke).toHaveBeenCalledTimes(3);
        });

        it('should handle concurrent read and write operations', async () => {
            vi.mocked(invoke)
                .mockResolvedValueOnce('read content')
                .mockResolvedValueOnce(undefined);

            const [readResult] = await Promise.all([
                readFile('/test/file1.md'),
                writeFile('/test/file2.md', 'write content'),
            ]);

            expect(readResult).toBe('read content');
            expect(invoke).toHaveBeenCalledTimes(2);
        });
    });
});

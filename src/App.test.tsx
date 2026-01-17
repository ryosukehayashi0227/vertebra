import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import App from './App';
import * as fileSystem from './lib/fileSystem';

// Mock Tauri file system calls
vi.mock('./lib/fileSystem', () => ({
    openFolderDialog: vi.fn(),
    readDirectory: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    createFile: vi.fn(),
}));


// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('App Session Restoration', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should restore folder from localStorage on mount', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'lastFolderPath') return '/saved/path';
            return null;
        });

        (fileSystem.readDirectory as any).mockResolvedValue([
            { name: 'file1.md', path: '/saved/path/file1.md', is_dir: false }
        ]);

        await act(async () => {
            render(<App />);
        });

        // Resolve promises and run effects
        await act(async () => {
            vi.runAllTimers();
        });

        // Check expectation immediately after timers run
        expect(fileSystem.readDirectory).toHaveBeenCalledWith('/saved/path');
    });

    it('should restore file from localStorage on mount', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'lastFolderPath') return '/saved/path';
            if (key === 'lastFilePath') return '/saved/path/file1.md';
            return null;
        });

        (fileSystem.readDirectory as any).mockResolvedValue([
            { name: 'file1.md', path: '/saved/path/file1.md', is_dir: false }
        ]);
        (fileSystem.readFile as any).mockResolvedValue('# Test Content');

        await act(async () => {
            render(<App />);
        });

        // Allow loadFolder to complete
        await act(async () => {
            await Promise.resolve(); // Flush microtasks
        });

        // Run timers for setTimeout (restoring file)
        await act(async () => {
            vi.runAllTimers();
        });

        expect(fileSystem.readDirectory).toHaveBeenCalledWith('/saved/path');
        expect(fileSystem.readFile).toHaveBeenCalledWith('/saved/path/file1.md');
    });

    it('should not crash and remove invalid path from localStorage', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'lastFolderPath') return '/saved/path';
            if (key === 'lastFilePath') return '/saved/path/missing.md';
            return null;
        });

        (fileSystem.readDirectory as any).mockResolvedValue([]);
        (fileSystem.readFile as any).mockRejectedValue(new Error('File not found'));

        await act(async () => {
            render(<App />);
        });

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            vi.runAllTimers();
        });

        expect(fileSystem.readFile).toHaveBeenCalledWith('/saved/path/missing.md');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('lastFilePath');
    });
});

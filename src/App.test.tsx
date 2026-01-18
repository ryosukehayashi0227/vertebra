import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
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

// Mock Tauri event system
vi.mock('@tauri-apps/api/event', () => ({
    listen: vi.fn(() => {
        // Store callback for later invocation
        return Promise.resolve(() => { });
    }),
    emit: vi.fn(),
}));

describe('App Session Restoration', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        localStorage.clear();
        // Reset localStorage.getItem implementation in case it was modified
        vi.mocked(localStorage.getItem).mockImplementation(() => {
            // Access the underlying store from the setup file if possible,
            // but since we can't easily access the closure 'store',
            // we should rely on setItem/getItem behavior if we didn't mock implementation.
            // BUT, the previous tests mocked implementation.
            // Best practice: Don't mock implementation of localStorage if it's already mocked in setup.
            // Just use setItem.
            return null;
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should restore folder from localStorage on mount', async () => {
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === 'lastFolderPath') return '/saved/path';
            return null;
        });

        (fileSystem.readDirectory as any).mockResolvedValue([
            { name: 'file1.md', path: '/saved/path/file1.md', is_dir: false }
        ]);

        await act(async () => {
            render(<App />);
        });

        // Wait for useEffect to complete (useSessionRestore hook)
        await act(async () => {
            await Promise.resolve(); // Flush microtasks
            await Promise.resolve(); // Allow useEffect to run
        });

        // Check expectation
        expect(fileSystem.readDirectory).toHaveBeenCalledWith('/saved/path');
    });

    it('should restore file from localStorage on mount', async () => {
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
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

        // Wait for useEffect to complete and all async operations
        await act(async () => {
            await Promise.resolve(); // Flush microtasks
            await Promise.resolve(); // Allow useEffect to run
            await Promise.resolve(); // Allow nested async calls
        });

        expect(fileSystem.readDirectory).toHaveBeenCalledWith('/saved/path');
        expect(fileSystem.readFile).toHaveBeenCalledWith('/saved/path/file1.md');
    });

    it('should not crash and remove invalid path from localStorage', async () => {
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === 'lastFolderPath') return '/saved/path';
            if (key === 'lastFilePath') return '/saved/path/missing.md';
            return null;
        });

        (fileSystem.readDirectory as any).mockResolvedValue([]);
        (fileSystem.readFile as any).mockRejectedValue(new Error('File not found'));

        await act(async () => {
            render(<App />);
        });

        // Wait for all async operations including error handling
        await act(async () => {
            await Promise.resolve(); // Flush microtasks
            await Promise.resolve(); // Allow useEffect to run
            await Promise.resolve(); // Allow error handling
        });

        // Should have attempted to read the file
        expect(fileSystem.readFile).toHaveBeenCalledWith('/saved/path/missing.md');
        // Should have removed the invalid path
        expect(localStorage.removeItem).toHaveBeenCalledWith('lastFilePath');
    });
});

describe('App Menu Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Restore default behavior of localStorage.getItem which returns null for cleared storage
        vi.mocked(localStorage.getItem).mockImplementation(() => null);
    });

    it('should render without crashing', async () => {
        render(<App />);
        // Wait for welcome message
        expect(await screen.findByText(/Vertebra/i)).toBeInTheDocument();
    });

    it('should show splash screen when no folder is open', async () => {
        render(<App />);
        // Wait for initialization to complete and show "Open Folder to Start"
        expect(await screen.findByText(/Open Folder to Start/i)).toBeInTheDocument();
    });

    it('should have main layout structure', async () => {
        const { container } = render(<App />);
        await screen.findByText(/Vertebra/i);
        expect(container.querySelector('.app-container')).toBeInTheDocument();
    });
});

describe('App Export Modal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(localStorage.getItem).mockImplementation(() => null);
    });

    it('should not show export modal initially', async () => {
        render(<App />);
        await screen.findByText(/Vertebra/i);
        expect(screen.queryByText('Export Document')).not.toBeInTheDocument();
    });
});

describe('App State Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(localStorage.getItem).mockImplementation(() => null);
    });

    it('should initialize with empty state', async () => {
        render(<App />);
        // Expect Vertebra title when no folder is open
        expect(await screen.findByText(/Vertebra/i)).toBeInTheDocument();
    });

    it('should render without errors', () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });
});

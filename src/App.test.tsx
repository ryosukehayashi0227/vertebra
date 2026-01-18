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

        // Resolve promises and run effects
        await act(async () => {
            vi.runAllTimers();
        });

        // Check expectation immediately after timers run
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

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            vi.runAllTimers();
        });

        expect(fileSystem.readFile).toHaveBeenCalledWith('/saved/path/missing.md');
        expect(localStorage.removeItem).toHaveBeenCalledWith('lastFilePath');
    });
});

describe('App Menu Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render without crashing', () => {
        render(<App />);
        expect(screen.getByText(/Welcome to Vertebra/i)).toBeInTheDocument();
    });

    it('should show splash screen when no folder is open', () => {
        render(<App />);
        expect(screen.getByText(/Open a folder to get started/i)).toBeInTheDocument();
    });

    it('should have main layout structure', () => {
        const { container } = render(<App />);
        // App renders LanguageProvider and ThemeProvider wrappers
        expect(container.querySelector('.splash-screen')).toBeInTheDocument();
    });
});

describe('App Export Modal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should not show export modal initially', () => {
        render(<App />);
        expect(screen.queryByText('Export Document')).not.toBeInTheDocument();
    });
});

describe('App State Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with empty state', () => {
        const { container } = render(<App />);
        // App starts with splash screen when no folder is loaded
        expect(container.querySelector('.splash-screen')).toBeInTheDocument();
    });

    it('should render without errors', () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });
});

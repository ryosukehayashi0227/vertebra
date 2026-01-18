import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock MutationObserver if not already available
if (typeof (globalThis as any).MutationObserver === 'undefined') {
    (globalThis as any).MutationObserver = class MutationObserver {
        constructor(_callback: MutationCallback) { }
        observe() { }
        disconnect() { }
        takeRecords() { return []; }
    };
}

// Mock Tauri APIs for testing
const mockInvoke = vi.fn();
const mockOpen = vi.fn();
const mockListen = vi.fn().mockReturnValue(Promise.resolve(() => { }));

vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: mockOpen,
}));

vi.mock('@tauri-apps/api/event', () => ({
    listen: mockListen,
}));

// Export mocks for use in tests
export { mockInvoke, mockOpen, mockListen };

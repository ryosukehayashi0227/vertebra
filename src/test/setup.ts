import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Tauri APIs for testing
const mockInvoke = vi.fn();
const mockOpen = vi.fn();
const mockListen = vi.fn(() => Promise.resolve(() => { }));

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

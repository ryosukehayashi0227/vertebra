import { useState, useCallback } from 'react';

export interface UseModalsReturn {
    // Settings Modal
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;

    // Export Modal
    isExportOpen: boolean;
    openExport: () => void;
    closeExport: () => void;

    // Search Modal
    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
}

/**
 * Custom hook to manage modal states
 * Centralizes modal open/close logic for Settings, Export, and Search modals
 */
export function useModals(): UseModalsReturn {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    const openExport = useCallback(() => setIsExportOpen(true), []);
    const closeExport = useCallback(() => setIsExportOpen(false), []);

    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => setIsSearchOpen(false), []);

    return {
        isSettingsOpen,
        openSettings,
        closeSettings,
        isExportOpen,
        openExport,
        closeExport,
        isSearchOpen,
        openSearch,
        closeSearch,
    };
}

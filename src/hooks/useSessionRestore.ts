import { useState, useEffect, useRef } from 'react';

interface UseSessionRestoreProps {
    onRestoreFolder: (path: string) => Promise<void>;
    onRestoreFile: (path: string) => Promise<void>;
}

interface UseSessionRestoreReturn {
    isInitializing: boolean;
    isSessionRestored: boolean;
}

export function useSessionRestore({
    onRestoreFolder,
    onRestoreFile
}: UseSessionRestoreProps): UseSessionRestoreReturn {
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSessionRestored, setIsSessionRestored] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const restoreSession = async () => {
            try {
                const savedFolderPath = localStorage.getItem('lastFolderPath');
                const savedFilePath = localStorage.getItem('lastFilePath');

                console.log('[Session Restore] Saved folder:', savedFolderPath);
                console.log('[Session Restore] Saved file:', savedFilePath);

                if (savedFolderPath) {
                    // First restore the folder
                    await onRestoreFolder(savedFolderPath);

                    // Then restore the file if it was saved
                    if (savedFilePath) {
                        try {
                            console.log('[Session Restore] Attempting to open file:', savedFilePath);
                            await onRestoreFile(savedFilePath);
                            console.log('[Session Restore] File opened successfully');
                        } catch (error) {
                            console.error('[Session Restore] Failed to open file:', error);
                            // Clear invalid file path
                            localStorage.removeItem('lastFilePath');
                        }
                    }
                }
            } catch (error) {
                console.error('[Session Restore] Failed to restore session:', error);
            } finally {
                // Mark session as restored to enable state saving
                setIsSessionRestored(true);
                setIsInitializing(false); // Hide splash screen
                console.log('[Session Restore] Session restoration complete');
            }
        };

        restoreSession();
    }, [onRestoreFolder, onRestoreFile]);

    return {
        isInitializing,
        isSessionRestored
    };
}

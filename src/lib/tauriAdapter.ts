/**
 * Tauri API Adapter
 * 
 * This module provides a safe abstraction over Tauri APIs that gracefully
 * handles non-Tauri environments (like E2E tests in a browser).
 */

// Check if we're running in a Tauri environment
export const isTauriEnvironment = (): boolean => {
    return typeof window !== 'undefined' &&
        // @ts-ignore
        (window.__TAURI__ !== undefined || window.__TAURI_INTERNALS__ !== undefined);
};

// Safe invoke wrapper - returns null if not in Tauri
export const safeInvoke = async <T>(cmd: string, args?: any): Promise<T | null> => {
    if (!isTauriEnvironment()) {
        console.warn(`[TauriAdapter] Not in Tauri environment, skipping invoke: ${cmd}`);
        return null;
    }

    try {
        // @ts-ignore
        const invoke = window.__TAURI_INTERNALS__?.invoke || window.__TAURI__?.core?.invoke;
        if (invoke) {
            return await invoke(cmd, args);
        }
        return null;
    } catch (e) {
        console.error(`[TauriAdapter] invoke failed: ${cmd}`, e);
        return null;
    }
};

// OS detection with fallback
let cachedIsMac: boolean | null = null;

export const getIsMacOs = async (): Promise<boolean> => {
    if (cachedIsMac !== null) return cachedIsMac;

    // Try Tauri API first
    if (isTauriEnvironment()) {
        try {
            const osType = await safeInvoke<string>('plugin:os|type');
            if (osType) {
                cachedIsMac = osType === 'macos';
                return cachedIsMac;
            }
        } catch (e) {
            // Fall through to browser detection
        }
    }

    // Browser fallback - check user agent
    cachedIsMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    return cachedIsMac;
};

export const getMetaKeyLabel = async (): Promise<string> => {
    const isMac = await getIsMacOs();
    return isMac ? '⌘' : 'Ctrl+';
};

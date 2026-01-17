import { type } from '@tauri-apps/plugin-os';

// Cache the result
let isMacOs: boolean | null = null;

export const getIsMacOs = async (): Promise<boolean> => {
    if (isMacOs !== null) return isMacOs;

    try {
        const osType = await type();
        isMacOs = osType === 'macos';
    } catch (e) {
        console.error('Failed to detect OS:', e);
        // Fallback or assume false
        isMacOs = false;
    }
    return isMacOs;
};

export const getMetaKeyLabel = async (): Promise<string> => {
    const isMac = await getIsMacOs();
    return isMac ? '⌘' : 'Ctrl+';
};

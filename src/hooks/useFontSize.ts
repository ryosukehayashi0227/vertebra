import { useState, useEffect, useCallback } from 'react';

const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;

export function useFontSize() {
    const [fontSize, setFontSize] = useState<number>(() => {
        const saved = localStorage.getItem('userFontSize');
        if (saved) {
            const size = parseInt(saved, 10);
            if (!isNaN(size)) return size;
        }
        return DEFAULT_FONT_SIZE;
    });

    // Apply font size to CSS variable and persist
    useEffect(() => {
        document.documentElement.style.setProperty('--user-font-size', `${fontSize}px`);
        localStorage.setItem('userFontSize', fontSize.toString());
    }, [fontSize]);

    const zoomIn = useCallback(() => {
        setFontSize(prev => Math.min(prev + 1, MAX_FONT_SIZE));
    }, []);

    const zoomOut = useCallback(() => {
        setFontSize(prev => Math.max(prev - 1, MIN_FONT_SIZE));
    }, []);

    const resetZoom = useCallback(() => {
        setFontSize(DEFAULT_FONT_SIZE);
    }, []);

    return {
        fontSize,
        zoomIn,
        zoomOut,
        resetZoom,
    };
}

import { useState, useEffect, useCallback } from 'react';

const MIN_WIDTH = 150;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 240;

export function useSidebarResize() {
    const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
        const saved = localStorage.getItem('sidebarWidth');
        const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
        return isNaN(parsed) ? DEFAULT_WIDTH : parsed;
    });
    const [isResizing, setIsResizing] = useState(false);

    // Persist sidebar width
    useEffect(() => {
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    }, [sidebarWidth]);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing) {
            setSidebarWidth(() => {
                const newWidth = e.clientX;
                if (newWidth < MIN_WIDTH) return MIN_WIDTH;
                if (newWidth > MAX_WIDTH) return MAX_WIDTH;
                return newWidth;
            });
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, handleMouseMove, stopResizing]);

    return {
        sidebarWidth,
        isResizing,
        startResizing,
    };
}

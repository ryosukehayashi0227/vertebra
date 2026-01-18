import { useState, useCallback } from 'react';

interface UseFocusModeReturn {
    focusRootId: string | null;
    enterFocusMode: (nodeId: string) => void;
    exitFocusMode: () => void;
    isCurrentFocus: (nodeId: string) => boolean;
}

export function useFocusMode(): UseFocusModeReturn {
    const [focusRootId, setFocusRootId] = useState<string | null>(null);

    const enterFocusMode = useCallback((nodeId: string) => {
        setFocusRootId(nodeId);
    }, []);

    const exitFocusMode = useCallback(() => {
        setFocusRootId(null);
    }, []);

    const isCurrentFocus = useCallback((nodeId: string) => {
        return focusRootId === nodeId;
    }, [focusRootId]);

    return {
        focusRootId,
        enterFocusMode,
        exitFocusMode,
        isCurrentFocus
    };
}

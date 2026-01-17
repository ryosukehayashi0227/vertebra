import { useState, useEffect, useCallback } from 'react';
import type { OutlineNode } from '../lib/outline';
import { findNodeById } from '../lib/outline';

interface UseSplitViewOptions {
    outline: OutlineNode[] | undefined;
}

export function useSplitView({ outline }: UseSplitViewOptions) {
    const [isSplitView, setIsSplitView] = useState(() => {
        return localStorage.getItem('splitView') === 'true';
    });
    const [secondaryNodeId, setSecondaryNodeId] = useState<string | null>(null);
    const [activePane, setActivePane] = useState<'primary' | 'secondary'>(() => {
        const saved = localStorage.getItem('activePane');
        return (saved === 'primary' || saved === 'secondary') ? saved : 'primary';
    });

    // Persist split view state
    useEffect(() => {
        localStorage.setItem('splitView', String(isSplitView));
    }, [isSplitView]);

    // Persist secondary node text (for restoration after ID changes)
    useEffect(() => {
        if (!outline) return;
        if (secondaryNodeId) {
            const node = findNodeById(outline, secondaryNodeId);
            if (node) {
                localStorage.setItem('secondaryNodeText', node.text);
            }
        } else {
            localStorage.removeItem('secondaryNodeText');
        }
    }, [secondaryNodeId, outline]);

    // Persist active pane
    useEffect(() => {
        localStorage.setItem('activePane', activePane);
    }, [activePane]);

    // Validate secondaryNodeId when outline changes
    useEffect(() => {
        if (outline && isSplitView && secondaryNodeId) {
            const nodeExists = findNodeById(outline, secondaryNodeId);
            if (!nodeExists && outline.length > 0) {
                setSecondaryNodeId(outline[0].id);
            }
        }
    }, [outline, isSplitView, secondaryNodeId]);

    const toggleSplitView = useCallback(() => {
        setIsSplitView(prev => !prev);
    }, []);

    const openInSecondaryPane = useCallback((nodeId: string) => {
        setSecondaryNodeId(nodeId);
        if (!isSplitView) {
            setIsSplitView(true);
        }
        setActivePane('secondary');
    }, [isSplitView]);

    const closeSplitView = useCallback(() => {
        setIsSplitView(false);
        setSecondaryNodeId(null);
    }, []);

    return {
        isSplitView,
        secondaryNodeId,
        setSecondaryNodeId,
        activePane,
        setActivePane,
        toggleSplitView,
        openInSecondaryPane,
        closeSplitView,
    };
}

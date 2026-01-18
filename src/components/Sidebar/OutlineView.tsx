import { useState, useEffect, useCallback } from 'react';
import type { OutlineNode } from '../../lib/outline';
import { countStats } from '../../lib/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import type { DragOverInfo } from './types';
import './OutlineView.css';

interface OutlineViewProps {
    outline: OutlineNode[];
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    onMoveNode: (sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
    onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
    searchResult: { visibleIds: Set<string>; matchedIds: Set<string> } | null;
    collapsedNodes: Set<string>;
    onToggleCollapse: (nodeId: string) => void;
}

export default function OutlineView({
    outline,
    selectedNodeId,
    onSelectNode,
    onMoveNode,
    onContextMenu,
    searchResult,
    collapsedNodes,
    onToggleCollapse
}: OutlineViewProps) {
    const { t } = useLanguage();
    const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Find the target node from mouse coordinates
    const findTargetFromPoint = useCallback((x: number, y: number) => {
        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
            const nodeEl = el.closest('.sidebar-outline-node') as HTMLElement;
            if (nodeEl && nodeEl.dataset.nodeId) {
                const nodeId = nodeEl.dataset.nodeId;
                // Skip if it's the element being dragged
                if (nodeId === draggingId) continue;

                const itemEl = nodeEl.querySelector('.sidebar-outline-item');
                if (itemEl) {
                    const rect = itemEl.getBoundingClientRect();
                    const relY = y - rect.top;
                    const h = rect.height;

                    let position: 'before' | 'after' | 'inside';
                    if (relY < h * 0.25) position = 'before';
                    else if (relY > h * 0.75) position = 'after';
                    else position = 'inside';

                    return { id: nodeId, position };
                }
            }
        }
        return null;
    }, [draggingId]);

    // Handle drag events using mouse position
    useEffect(() => {
        if (!draggingId) return;

        const handleMouseMove = (e: MouseEvent) => {
            const target = findTargetFromPoint(e.clientX, e.clientY);
            if (target) {
                if (dragOverInfo?.id !== target.id || dragOverInfo?.position !== target.position) {
                    console.log("[Vertebra D&D] Over:", target.id, target.position);
                    setDragOverInfo(target);
                }
            }
        };

        const handleMouseUp = () => {
            if (draggingId && dragOverInfo) {
                console.log("[Vertebra D&D] Drop:", { source: draggingId, target: dragOverInfo.id, pos: dragOverInfo.position });
                onMoveNode(draggingId, dragOverInfo.id, dragOverInfo.position);
            }
            setDraggingId(null);
            setDragOverInfo(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, dragOverInfo, findTargetFromPoint, onMoveNode]);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        // Only start drag on left mouse button
        if (e.button !== 0) return;
        console.log("[Vertebra D&D] Start:", id);
        setDraggingId(id);
    };

    // Render outline items with mousedown handler for dragging
    const renderOutlineItem = (node: OutlineNode): React.ReactNode => {
        // Search: Check visibility
        if (searchResult && !searchResult.visibleIds.has(node.id)) {
            return null;
        }

        const isSelected = selectedNodeId === node.id;
        const hasChildren = node.children.length > 0;
        const isCollapsed = searchResult ? false : collapsedNodes.has(node.id);
        const isTarget = dragOverInfo?.id === node.id;
        const isSelf = draggingId === node.id;
        const isMatched = searchResult?.matchedIds.has(node.id);

        const isDraggable = !searchResult;

        return (
            <li
                key={node.id}
                className={`sidebar-outline-node ${isTarget ? `drag-over-${dragOverInfo?.position}` : ""} ${isSelf ? "is-dragging" : ""} ${isMatched ? "search-match" : ""}`}
                data-node-id={node.id}
            >
                <div
                    className={`sidebar-outline-item ${isSelected ? "selected" : ""}`}
                    style={{ paddingLeft: `${node.level * 20 + 8}px`, cursor: isDraggable ? 'grab' : 'default' }}
                    onMouseDown={isDraggable ? (e) => handleMouseDown(e, node.id) : undefined}
                    onClick={() => !draggingId && onSelectNode(node.id)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        onContextMenu(e, node.id);
                    }}
                    tabIndex={0}
                >
                    <button
                        className={`sidebar-collapse-btn ${hasChildren ? "has-children" : ""}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasChildren) {
                                onToggleCollapse(node.id);
                            }
                        }}
                        style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                    >
                        {hasChildren ? (isCollapsed ? '▸' : '▾') : ''}
                    </button>
                    <span className="sidebar-outline-text">{node.text || t('sidebar.newSection')}</span>
                    <span className="sidebar-node-stats">{countStats("", node.content).chars}</span>
                </div>
                {hasChildren && !isCollapsed && (
                    <ul className="sidebar-outline-children">
                        {node.children.map(renderOutlineItem)}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <ul className="sidebar-outline-list">
            {outline.map(renderOutlineItem)}
        </ul>
    );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { OutlineNode } from '../../types/outline';
import { OutlineItem } from './OutlineItem';
import type { DragOverInfo } from './types';
import './OutlineView.css';

interface OutlineViewProps {
    outline: OutlineNode[];
    selectedNodeId: string | null;
    highlightedNodeId?: string | null;
    onSelectNode: (id: string) => void;
    onUpdateNode: (id: string, text: string) => void;
    onMoveNode: (sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
    onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
    // New keyboard ops
    onIndent: (id: string) => void;
    onOutdent: (id: string) => void;
    onInsertNode: (afterId: string, text?: string) => void;
    //
    searchResult: { visibleIds: Set<string>; matchedIds: Set<string> } | null;
    collapsedNodes: Set<string>;
    onToggleCollapse: (nodeId: string) => void;
}

export default function OutlineView({
    outline,
    selectedNodeId,
    highlightedNodeId,
    onSelectNode,
    onUpdateNode,
    onMoveNode,
    onContextMenu,
    onIndent,
    onOutdent,
    onInsertNode,
    searchResult,
    collapsedNodes,
    onToggleCollapse
}: OutlineViewProps) {
    const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Refs for scrolling and focus
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // Scroll to highlighted node
    useEffect(() => {
        if (highlightedNodeId) {
            setTimeout(() => {
                const element = itemRefs.current.get(highlightedNodeId);
                const scrollContainer = document.querySelector('.sidebar-scroll-container');
                if (element && scrollContainer) {
                    element.scrollIntoView({ block: 'nearest' });
                }
            }, 100);
        }
    }, [highlightedNodeId]);

    // Focus selected node input
    useEffect(() => {
        if (selectedNodeId) {
            // Need a small timeout to ensure ref is mounted if node was just created/rendered
            setTimeout(() => {
                const input = inputRefs.current.get(selectedNodeId);
                if (input && document.activeElement !== input) {
                    input.focus();
                }
            }, 50);
        }
    }, [selectedNodeId, outline]);

    // Handle keyboard events from items
    const handleItemKeyDown = (e: React.KeyboardEvent, node: OutlineNode) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // We want to insert AFTER this node
            onInsertNode(node.id);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                onOutdent(node.id);
            } else {
                onIndent(node.id);
            }
        }
        // Arrow keys can be handled here or by default behavior if inputs are focused.
        // For standard "App-like" feel, we might want custom arrow navigation.
        // For "Minimum and Clean", let's stick to requested features first.
    };

    // Find the target node from mouse coordinates (for D&D)
    const findTargetFromPoint = useCallback((x: number, y: number) => {
        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
            const nodeEl = el.closest('.sidebar-outline-node') as HTMLElement;
            if (nodeEl && nodeEl.dataset.nodeId) {
                const nodeId = nodeEl.dataset.nodeId;
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

    // Handle drag events (Global)
    useEffect(() => {
        if (!draggingId) return;

        const handleMouseMove = (e: MouseEvent) => {
            const target = findTargetFromPoint(e.clientX, e.clientY);
            if (target) {
                if (dragOverInfo?.id !== target.id || dragOverInfo?.position !== target.position) {
                    setDragOverInfo(target);
                }
            }
        };

        const handleMouseUp = () => {
            if (draggingId && dragOverInfo) {
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
        if (e.button !== 0) return;
        setDraggingId(id);
    };

    const renderNodes = (nodes: OutlineNode[]): React.ReactNode[] => {
        return nodes.map(node => {
            // Check visibility based on search
            if (searchResult && !searchResult.visibleIds.has(node.id)) {
                return null;
            }

            const isSelected = selectedNodeId === node.id;
            const isHighlighted = node.id === highlightedNodeId;
            const hasChildren = node.children.length > 0;
            const isCollapsed = searchResult ? false : collapsedNodes.has(node.id);
            const isTarget = dragOverInfo?.id === node.id;
            const isSelf = draggingId === node.id;
            const isMatched = searchResult?.matchedIds.has(node.id);

            const positionClass = isTarget ? `drag-over-${dragOverInfo?.position}` : "";

            return (
                <li
                    key={node.id}
                    className={`sidebar-outline-node ${positionClass} ${isSelf ? "is-dragging" : ""} ${isMatched ? "search-match" : ""}`}
                    data-node-id={node.id}
                    ref={(el) => {
                        if (el instanceof HTMLDivElement) itemRefs.current.set(node.id, el);
                        else itemRefs.current.delete(node.id);
                    }}
                >
                    <OutlineItem
                        node={node}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        isCollapsed={isCollapsed}
                        hasChildren={hasChildren}
                        onSelect={onSelectNode}
                        onUpdate={onUpdateNode}
                        onToggleCollapse={onToggleCollapse}
                        onKeyDown={handleItemKeyDown}
                        onContextMenu={onContextMenu}
                        onMouseDown={!searchResult ? handleMouseDown : undefined}
                        inputRef={(el) => {
                            if (el) inputRefs.current.set(node.id, el);
                            else inputRefs.current.delete(node.id);
                        }}
                    />
                    {hasChildren && !isCollapsed && (
                        <ul className="sidebar-outline-children">
                            {renderNodes(node.children)}
                        </ul>
                    )}
                </li>
            );
        });
    };

    return (
        <ul className="sidebar-outline-list">
            {renderNodes(outline)}
        </ul>
    );
}

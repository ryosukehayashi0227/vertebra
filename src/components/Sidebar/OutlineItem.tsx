import React from 'react';
import { OutlineNode } from '../../types/outline';
import { countStats } from '../../lib/outline';
import { useLanguage } from '../../contexts/LanguageContext';

interface OutlineItemProps {
    node: OutlineNode;
    isSelected: boolean;
    isHighlighted: boolean;
    isCollapsed: boolean;
    hasChildren: boolean;
    onSelect: (id: string) => void;
    onUpdate: (id: string, text: string) => void;
    onToggleCollapse: (id: string) => void;
    onKeyDown: (e: React.KeyboardEvent, node: OutlineNode) => void;
    onContextMenu: (e: React.MouseEvent, id: string) => void;
    // Drag & Drop
    onMouseDown?: (e: React.MouseEvent, id: string) => void;
    // Focus ref
    inputRef: (el: HTMLInputElement | null) => void;
}

export const OutlineItem: React.FC<OutlineItemProps> = ({
    node,
    isSelected,
    isHighlighted,
    isCollapsed,
    hasChildren,
    onSelect,
    onUpdate,
    onToggleCollapse,
    onKeyDown,
    onContextMenu,
    onMouseDown,
    inputRef
}) => {
    const { t } = useLanguage();


    // Auto-focus logic is handled by the parent using the ref, 
    // but we can also ensure focus if selected
    // (Optional: depending on whether we want valid focus on click)

    return (
        <div
            className={`sidebar-outline-item ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
            style={{ paddingLeft: `${node.level * 20 + 8}px` }}
            onClick={() => onSelect(node.id)}
            onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(e, node.id);
            }}
            onMouseDown={onMouseDown ? (e) => onMouseDown(e, node.id) : undefined}
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
                tabIndex={-1} // Prevent tab focus on collapse button
            >
                {hasChildren ? (isCollapsed ? '▸' : '▾') : ''}
            </button>

            <input
                ref={inputRef}
                type="text"
                className="sidebar-outline-input"
                value={node.text}
                onChange={(e) => onUpdate(node.id, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, node)}
                // Prevent click propagation to avoid re-selecting in parent click handler if needed
                onClick={(e) => e.stopPropagation()}
                onFocus={() => onSelect(node.id)}
                placeholder={t('sidebar.newSection')}
            />

            <span className="sidebar-node-stats">{countStats("", node.content).chars}</span>
        </div>
    );
};

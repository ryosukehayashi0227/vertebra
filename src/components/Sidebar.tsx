import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { FileEntry } from "../lib/fileSystem";
import { type OutlineNode, createNode, findNodeById, appendChildNode, serializeNodesToText, filterNodes } from "../lib/outline";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
    folderPath: string | null;
    files: FileEntry[];
    selectedFilePath: string | null;
    onSelectFile: (path: string) => void;
    onOpenFolder: () => void;
    onCreateFile: (name: string) => void;
    onDeleteFile: (path: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isCreatingFile: boolean;
    setIsCreatingFile: (value: boolean) => void;
    outline: OutlineNode[];
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    onOutlineChange: (outline: OutlineNode[]) => void;
    onIndent: (id: string) => void;
    onOutdent: (id: string) => void;
    onMoveNode: (sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => void;
    width?: number;
    onResizeStart?: () => void;
}

function Sidebar({
    folderPath,
    files,
    selectedFilePath,
    onSelectFile,
    onOpenFolder,
    onCreateFile,
    onDeleteFile,
    isCollapsed,
    onToggleCollapse,
    isCreatingFile,
    setIsCreatingFile,
    outline,
    selectedNodeId,
    onSelectNode,
    onOutlineChange,
    onIndent,
    onOutdent,
    onMoveNode,
    width,
    onResizeStart
}: SidebarProps) {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<"files" | "outline">("outline");
    const [newFileName, setNewFileName] = useState("");
    const [dragOverInfo, setDragOverInfo] = useState<{ id: string; position: 'before' | 'after' | 'inside' } | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const listRef = useRef<HTMLUListElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, targetId: string, type: "file" | "outline" } | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Calculate visible nodes based on search query
    const searchResult = useMemo(() => {
        if (!searchQuery.trim()) return null; // null means "show all"
        return filterNodes(outline, searchQuery);
    }, [outline, searchQuery]);

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isCreatingFile) setViewMode("files");
    }, [isCreatingFile]);

    // フォルダを開いた時にファイルビューに切り替え
    useEffect(() => {
        if (folderPath && !selectedFilePath) {
            setViewMode("files");
        }
    }, [folderPath, selectedFilePath]);

    // ファイルを選択したらアウトラインビューに切り替え
    useEffect(() => {
        if (selectedFilePath) {
            setViewMode("outline");
        }
    }, [selectedFilePath]);

    // Toggle node collapse state
    const toggleNodeCollapse = useCallback((nodeId: string) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

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


    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFileName.trim()) {
            onCreateFile(newFileName.trim());
            setNewFileName("");
            setIsCreatingFile(false);
        }
    };

    // Copy node as text
    const handleCopyAsText = useCallback(async (nodeId: string) => {
        const node = findNodeById(outline, nodeId);
        if (node) {
            const text = serializeNodesToText([node], "\t", node.level);
            try {
                await navigator.clipboard.writeText(text);
                console.log("Copied to clipboard");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
        setContextMenu(null);
    }, [outline]);

    // Render outline items with mousedown handler for dragging
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
                        setContextMenu({ x: e.clientX, y: e.clientY, targetId: node.id, type: "outline" });
                    }}
                    tabIndex={0}
                >
                    <button
                        className={`sidebar-collapse-btn ${hasChildren ? "has-children" : ""}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasChildren) {
                                toggleNodeCollapse(node.id);
                            }
                        }}
                        style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                    >
                        {hasChildren ? (isCollapsed ? '▸' : '▾') : ''}
                    </button>
                    <span className="sidebar-outline-text">{node.text}</span>
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
        <aside
            className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
            onClick={() => setContextMenu(null)}
            style={width ? { width: `${width}px`, minWidth: `${width}px`, flexBasis: `${width}px` } : undefined}
        >
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div className="view-selector">
                        <button className={viewMode === "outline" ? "active" : ""} onClick={() => setViewMode("outline")}>{t('sidebar.outline')}</button>
                        <button className={viewMode === "files" ? "active" : ""} onClick={() => setViewMode("files")}>{t('sidebar.files')}</button>
                    </div>
                )}
                <div className="sidebar-actions">
                    {folderPath && !isCollapsed && (
                        <button className="action-btn" onClick={() => {
                            if (viewMode === "files") setIsCreatingFile(true);
                            else {
                                let l = 0;
                                if (selectedNodeId) {
                                    const n = findNodeById(outline, selectedNodeId);
                                    if (n) l = n.level + 1;
                                }
                                const n = createNode(t('sidebar.newSection'), l);
                                if (selectedNodeId) {
                                    onOutlineChange(appendChildNode(outline, selectedNodeId, n));
                                    onSelectNode(n.id);
                                } else {
                                    onOutlineChange([...outline, n]);
                                    onSelectNode(n.id);
                                }
                            }
                        }}>+</button>
                    )}
                    <button className="toggle-btn" onClick={onToggleCollapse}>{isCollapsed ? "▶" : "◀"}</button>
                </div>
            </div>

            {!isCollapsed && (
                <nav className="sidebar-content">
                    {!folderPath ? (
                        <div className="sidebar-empty">
                            <button className="open-folder-sidebar-btn" onClick={onOpenFolder}>{t('sidebar.openFolder')}</button>
                        </div>
                    ) : (
                        <div className="sidebar-scrollable">
                            {viewMode === "files" ? (
                                <>
                                    <button className="sidebar-new-btn" onClick={() => setIsCreatingFile(true)}><span>+</span> {t('sidebar.newFile')}</button>
                                    {isCreatingFile && (
                                        <form onSubmit={handleCreateSubmit} className="new-file-form">
                                            <input type="text" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder={t('sidebar.fileNamePlaceholder')} autoFocus onBlur={() => !newFileName.trim() && setIsCreatingFile(false)} />
                                        </form>
                                    )}
                                    <ul className="file-list">
                                        {files.map(f => (
                                            <li key={f.path} className={`file-item ${selectedFilePath === f.path ? "selected" : ""}`} onClick={() => !f.is_dir && onSelectFile(f.path)} onContextMenu={(e) => { e.preventDefault(); !f.is_dir && setContextMenu({ x: e.clientX, y: e.clientY, targetId: f.path, type: "file" }); }}>
                                                <span className="file-icon">{f.is_dir ? "📁" : "📄"}</span>
                                                <span className="file-name">{f.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className="sidebar-outline-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ padding: '8px 8px 4px 8px' }}>
                                        <input
                                            type="text"
                                            placeholder={t('sidebar.searchPlaceholder')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-bg-secondary)',
                                                color: 'var(--color-text-primary)',
                                                fontSize: '0.9rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {outline.length === 0 ? (
                                            <p className="sidebar-empty-hint">項目がありません</p>
                                        ) : (
                                            <ul ref={listRef} className="sidebar-outline-list">
                                                {outline.map(node => renderOutlineItem(node))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            )}

            {contextMenu && (
                <div
                    className="context-menu"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                        position: 'fixed',
                        zIndex: 1000,
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '160px'
                    }}
                >
                    {contextMenu.type === "file" ? (
                        <button style={{ textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }} onClick={() => confirm("削除しますか？") && onDeleteFile(contextMenu.targetId)}>削除</button>
                    ) : (
                        <>
                            <button style={{ textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }} onClick={() => handleCopyAsText(contextMenu.targetId)}>{t('sidebar.copyAsText')}</button>
                            <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                            <button style={{ textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }} onClick={() => { onIndent(contextMenu.targetId); setContextMenu(null); }}>インデント (Tab)</button>
                            <button style={{ textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }} onClick={() => { onOutdent(contextMenu.targetId); setContextMenu(null); }}>アウトデント (Shift+Tab)</button>
                        </>
                    )}
                </div>
            )}
            {onResizeStart && (
                <div
                    className="sidebar-resizer"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onResizeStart();
                    }}
                />
            )}
        </aside>
    );
}

export default Sidebar;

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { FileEntry } from "../lib/fileSystem";
import { askConfirm } from "../lib/fileSystem";
import { type OutlineNode, createNode, findNodeById, appendChildNode, serializeNodesToText, filterNodes } from "../lib/outline";
import { useLanguage } from "../contexts/LanguageContext";
import FileList from "./Sidebar/FileList";
import ContextMenu from "./Sidebar/ContextMenu";
import SidebarFooter from "./Sidebar/SidebarFooter";
import ViewSelector from "./Sidebar/ViewSelector";
import SearchInput from "./Sidebar/SearchInput";
import OutlineView from "./Sidebar/OutlineView";
import type { ViewMode, ContextMenuInfo } from "./Sidebar/types";

interface SidebarProps {
    folderPath: string | null;
    currentPath: string | null;
    files: FileEntry[];
    selectedFilePath: string | null;
    onSelectFile: (path: string) => void;
    onOpenFolder: () => void;
    onNavigateToFolder: (path: string) => void;
    onNavigateUp: () => void;
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
    onDeleteNode: (id: string) => void;
    width?: number;
    onResizeStart?: () => void;
    // Split View
    isSplitView?: boolean;
    onToggleSplitView?: () => void;
    onOpenInSecondaryPane?: (nodeId: string) => void;
    // Settings
    onOpenSettings?: () => void;
}

function Sidebar({
    folderPath,
    currentPath,
    files,
    selectedFilePath,
    onSelectFile,
    onOpenFolder,
    onNavigateToFolder,
    onNavigateUp,
    onCreateFile,
    onDeleteFile,
    onDeleteNode,
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
    onResizeStart,
    isSplitView,
    onToggleSplitView,
    onOpenInSecondaryPane,
    onOpenSettings
}: SidebarProps) {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>("outline");
    const [newFileName, setNewFileName] = useState("");
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const listRef = useRef<HTMLUListElement>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuInfo | null>(null);

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

    // Delete node
    const handleDeleteNode = useCallback(async (nodeId: string) => {
        const node = findNodeById(outline, nodeId);
        if (node) {
            const hasChildren = node.children.length > 0;
            const confirmMsg = t('sidebar.confirmDeleteNode');
            if (!hasChildren || await askConfirm(confirmMsg)) {
                onDeleteNode(nodeId);
            }
        }
        setContextMenu(null);
    }, [outline, onDeleteNode, t]);

    // Handle file deletion with confirmation
    const handleDeleteFile = useCallback(async (path: string) => {
        if (await askConfirm("削除しますか？")) {
            onDeleteFile(path);
        }
    }, [onDeleteFile]);

    const handleOutlineContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
        setContextMenu({ x: e.clientX, y: e.clientY, targetId: nodeId, type: "outline" });
    }, []);

    return (
        <aside
            className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
            onClick={() => setContextMenu(null)}
            style={width && !isCollapsed ? { width: `${width}px`, minWidth: `${width}px`, flexBasis: `${width}px` } : undefined}
        >
            <div className="sidebar-header">
                {!isCollapsed && (
                    <ViewSelector
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                )}
                <div className="sidebar-actions">
                    {folderPath && !isCollapsed && (
                        <button className="action-btn add-node-btn" title={t('sidebar.newSection')} onClick={() => {
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
                                <FileList
                                    files={files}
                                    currentPath={currentPath}
                                    folderPath={folderPath}
                                    selectedFilePath={selectedFilePath}
                                    isCreatingFile={isCreatingFile}
                                    newFileName={newFileName}
                                    onNewFileNameChange={setNewFileName}
                                    onCreateSubmit={handleCreateSubmit}
                                    onNavigateUp={onNavigateUp}
                                    onNavigateToFolder={onNavigateToFolder}
                                    onSelectFile={onSelectFile}
                                    onSetIsCreatingFile={setIsCreatingFile}
                                    onContextMenu={(e, path) => {
                                        setContextMenu({ x: e.clientX, y: e.clientY, targetId: path, type: "file" });
                                    }}
                                />
                            ) : (
                                <div className="sidebar-outline-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ padding: '8px 8px 4px 8px' }}>
                                        <SearchInput
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                        />
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {outline.length === 0 ? (
                                            <p className="sidebar-empty-hint">項目がありません</p>
                                        ) : (
                                            <OutlineView
                                                outline={outline}
                                                selectedNodeId={selectedNodeId}
                                                onSelectNode={onSelectNode}
                                                onMoveNode={onMoveNode}
                                                onContextMenu={handleOutlineContextMenu}
                                                searchResult={searchResult}
                                                collapsedNodes={collapsedNodes}
                                                onToggleCollapse={toggleNodeCollapse}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            )}

            <SidebarFooter
                isCollapsed={isCollapsed}
                isSplitView={isSplitView}
                onToggleSplitView={onToggleSplitView}
                onOpenSettings={onOpenSettings}
                onToggleCollapse={onToggleCollapse}
            />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetId={contextMenu.targetId}
                    type={contextMenu.type}
                    onClose={() => setContextMenu(null)}
                    onDeleteFile={handleDeleteFile}
                    onCopyAsText={handleCopyAsText}
                    onIndent={onIndent}
                    onOutdent={onOutdent}
                    onDeleteNode={handleDeleteNode}
                    onOpenInSecondaryPane={onOpenInSecondaryPane}
                />
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

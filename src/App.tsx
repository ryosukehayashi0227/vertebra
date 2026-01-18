import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import StatusBar from "./components/StatusBar";
import SplashScreen from "./components/SplashScreen";
import { listen } from "@tauri-apps/api/event";
import {
  openFolderDialog,
  readDirectory,
  readFile,
  writeFile,
  createFile,
  deleteFile,
  type FileEntry,
} from "./lib/fileSystem";
import {
  parseMarkdownToOutline,
  outlineToMarkdown,
  type OutlineNode,
  indentNode,
  outdentNode,
  moveNode,
  removeNode,
  calculateTotalStats,
} from "./lib/outline";
import "./App.css";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import SettingsModal from "./components/SettingsModal";
import ExportModal from "./components/ExportModal";
import { useSidebarResize } from "./hooks/useSidebarResize";
import { useFontSize } from "./hooks/useFontSize";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useSplitView } from "./hooks/useSplitView";
import { useSessionRestore } from "./hooks/useSessionRestore";


export interface Document {
  path: string;
  name: string;
  content: string;
  outline: OutlineNode[];
  isDirty: boolean;
}

function AppContent() {
  const { t, setLanguage } = useLanguage();
  const [folderPath, setFolderPath] = useState<string | null>(null); // Root folder (cannot navigate above)
  const [currentPath, setCurrentPath] = useState<string | null>(null); // Currently viewed folder
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const isSessionRestore = useRef(true); // Flag to track if we're restoring session
  const [isLoading, setIsLoading] = useState(false);
  // Font Size (from hook)
  const { zoomIn, zoomOut, resetZoom } = useFontSize();

  // Sidebar resize (from hook)
  const { sidebarWidth, startResizing } = useSidebarResize();

  // Split View (from hook)
  const {
    isSplitView,
    setIsSplitView,
    secondaryNodeId,
    setSecondaryNodeId,
    activePane,
    setActivePane,
  } = useSplitView({ outline: currentDocument?.outline });

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Export modal state
  const [isExportOpen, setIsExportOpen] = useState(false);







  // Load folder contents (updates currentPath and files, but not folderPath)
  const loadFolder = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      const entries = await readDirectory(path);
      setFiles(entries);
      setCurrentPath(path);
    } catch (error) {
      console.error("Failed to load folder:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open folder dialog (sets both root and current path)
  const handleOpenFolder = useCallback(async () => {
    const path = await openFolderDialog();
    if (path) {
      setFolderPath(path); // Set root folder
      await loadFolder(path);
      setSelectedFilePath(null);
      setCurrentDocument(null);
    }
  }, [loadFolder]);

  // Navigate into a subfolder
  const navigateToFolder = useCallback(async (path: string) => {
    await loadFolder(path);
  }, [loadFolder]);

  // Navigate up to parent folder (respecting root boundary)
  const navigateUp = useCallback(async () => {
    if (!currentPath || !folderPath) return;
    if (currentPath === folderPath) return; // Already at root
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (parentPath.length >= folderPath.length) {
      await loadFolder(parentPath);
    }
  }, [currentPath, folderPath, loadFolder]);

  // Load file content
  const handleSelectFile = useCallback(async (filePath: string) => {
    console.log('[handleSelectFile] Opening file:', filePath);
    setIsLoading(true);
    try {
      const content = await readFile(filePath);
      const outline = parseMarkdownToOutline(content);
      const name = filePath.split("/").pop() || filePath;

      setCurrentDocument({
        path: filePath,
        name,
        content,
        outline,
        isDirty: false,
      });
      setSelectedFilePath(filePath);
      console.log('[handleSelectFile] File selected, path saved:', filePath);

      // Clear undo/redo history on file switch
      clearHistory();

      // Restore saved node IDs or fallback to first node
      if (outline.length > 0) {
        // Only restore saved node selection during session restoration
        if (isSessionRestore.current) {
          const savedSelectedText = localStorage.getItem('selectedNodeText');
          const savedSecondaryText = localStorage.getItem('secondaryNodeText');

          // Helper to find node by text
          const findNodeByText = (nodes: OutlineNode[], text: string): OutlineNode | null => {
            for (const node of nodes) {
              if (node.text === text) return node;
              if (node.children) {
                const found = findNodeByText(node.children, text);
                if (found) return found;
              }
            }
            return null;
          };

          // Restore primary selection
          let restoredPrimary = false;
          if (savedSelectedText) {
            const node = findNodeByText(outline, savedSelectedText);
            if (node) {
              setSelectedNodeId(node.id);
              restoredPrimary = true;
            }
          }
          if (!restoredPrimary) {
            setSelectedNodeId(outline[0].id);
          }

          // Restore secondary selection (split view)
          if (savedSecondaryText) {
            const node = findNodeByText(outline, savedSecondaryText);
            if (node) {
              setSecondaryNodeId(node.id);
            }
          }

          // Clear the flag after first restoration
          isSessionRestore.current = false;
        } else {
          // Normal file switch: always select first node
          setSelectedNodeId(outline[0].id);
        }
      } else {
        setSelectedNodeId(null);
      }
    } catch (error) {
      console.error("Failed to load file:", error);
      throw error; // Re-throw to let caller handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Session Restore Hook (must be after handleSelectFile is defined)
  const { isInitializing, isSessionRestored } = useSessionRestore({
    onRestoreFolder: async (path) => {
      setFolderPath(path);
      await loadFolder(path);
    },
    onRestoreFile: handleSelectFile
  });

  // Save state when folder or file changes (skip until session is restored)
  useEffect(() => {
    if (!isSessionRestored) return;
    if (folderPath) {
      localStorage.setItem('lastFolderPath', folderPath);
    }
  }, [folderPath, isSessionRestored]);

  useEffect(() => {
    if (!isSessionRestored) return;
    if (selectedFilePath) {
      console.log('[State Save] Saving file path to localStorage:', selectedFilePath);
      localStorage.setItem('lastFilePath', selectedFilePath);
    } else {
      console.log('[State Save] Removing file path from localStorage');
      localStorage.removeItem('lastFilePath');
    }
  }, [selectedFilePath, isSessionRestored]);

  // Update outline (called from Editor)
  const handleOutlineChange = useCallback((newOutline: OutlineNode[]) => {
    setCurrentDocument((prev) => {
      if (!prev) return null;
      const newContent = outlineToMarkdown(newOutline);
      return {
        ...prev,
        outline: newOutline,
        content: newContent,
        isDirty: true,
      };
    });
  }, []);

  // Undo/Redo (from hook)
  const {
    pushHistory,
    handleOutlineChangeWithHistory,
    handleUndo,
    handleRedo,
    clearHistory,
  } = useUndoRedo({
    outline: currentDocument?.outline,
    onOutlineChange: handleOutlineChange,
  });

  // Save file
  const handleSave = useCallback(async () => {
    if (!currentDocument) return;

    try {
      await writeFile(currentDocument.path, currentDocument.content);
      setCurrentDocument((prev) => (prev ? { ...prev, isDirty: false } : null));
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  }, [currentDocument]);

  // Create new file (in current directory)
  const handleCreateFile = useCallback(
    async (fileName: string) => {
      if (!currentPath) return;

      const newPath = `${currentPath}/${fileName}.md`;
      try {
        await createFile(newPath);
        await loadFolder(currentPath);
        await handleSelectFile(newPath);
      } catch (error) {
        console.error("Failed to create file:", error);
      }
    },
    [currentPath, loadFolder, handleSelectFile]
  );

  const handleStartCreateFile = useCallback(async () => {
    let currentPath = folderPath;
    if (!currentPath) {
      const path = await openFolderDialog();
      if (path) {
        await loadFolder(path);
        currentPath = path;
      } else {
        return;
      }
    }
    setIsCreatingFile(true);
  }, [folderPath, loadFolder]);

  // Delete file
  const handleDeleteFile = useCallback(
    async (filePath: string) => {
      try {
        await deleteFile(filePath);
        if (folderPath) {
          await loadFolder(folderPath);
        }
        if (selectedFilePath === filePath) {
          setSelectedFilePath(null);
          setCurrentDocument(null);
        }
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    },
    [folderPath, loadFolder, selectedFilePath]
  );

  const handleIndent = useCallback((id: string) => {
    if (!currentDocument) return;
    pushHistory();
    const newOutline = indentNode(currentDocument.outline, id);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange, pushHistory]);

  const handleOutdent = useCallback((id: string) => {
    if (!currentDocument) return;
    pushHistory();
    const newOutline = outdentNode(currentDocument.outline, id);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange, pushHistory]);

  const handleMoveNode = useCallback((sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => {
    if (!currentDocument) return;
    pushHistory();
    const newOutline = moveNode(currentDocument.outline, sourceId, targetId, position);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange, pushHistory]);

  const handleDeleteNode = useCallback((id: string) => {
    if (!currentDocument) return;
    pushHistory();
    const newOutline = removeNode(currentDocument.outline, id);
    handleOutlineChange(newOutline);
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [currentDocument, handleOutlineChange, selectedNodeId, pushHistory]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleUndo, handleRedo]);

  // Menu event listeners
  useEffect(() => {
    let unlisten: (() => void)[] = [];

    const setupMenuListeners = async () => {
      // Static import is used now
      unlisten.push(await listen("menu-new-file", async () => {
        if (folderPath) {
          setIsCreatingFile(true);
        } else {
          // フォルダが開かれていない場合、まずフォルダを開く
          const path = await openFolderDialog();
          if (path) {
            await loadFolder(path);
            setIsCreatingFile(true);
          }
        }
      }));

      unlisten.push(await listen("menu-open-folder", () => {
        handleOpenFolder();
      }));

      unlisten.push(await listen("menu-save", () => {
        handleSave();
      }));

      unlisten.push(await listen("menu-close-file", () => {
        setSelectedFilePath(null);
        setCurrentDocument(null);
        setSelectedNodeId(null);
      }));

      unlisten.push(await listen("menu-change-lang-en", () => {
        setLanguage('en');
      }));
      unlisten.push(await listen("menu-change-lang-ja", () => {
        setLanguage('ja');
      }));

      unlisten.push(await listen("menu-settings", () => {
        setIsSettingsOpen(true);
      }));

      unlisten.push(await listen("menu-zoom-in", () => {
        console.log("Zoom In Event Received");
        zoomIn();
      }));

      unlisten.push(await listen("menu-zoom-out", () => {
        console.log("Zoom Out Event Received");
        zoomOut();
      }));

      unlisten.push(await listen("menu-zoom-reset", () => {
        console.log("Zoom Reset Event Received");
        resetZoom();
      }));

      unlisten.push(await listen("menu-undo", () => {
        handleUndo();
      }));

      unlisten.push(await listen("menu-redo", () => {
        handleRedo();
      }));

      unlisten.push(await listen("menu-export", () => {
        if (currentDocument) {
          setIsExportOpen(true);
        }
      }));
    };

    setupMenuListeners();

    return () => {
      unlisten.forEach(fn => fn());
    };
  }, [folderPath, handleOpenFolder, handleSave, handleUndo, handleRedo]);

  if (isInitializing) {
    return (
      <ThemeProvider>
        <SplashScreen />
      </ThemeProvider>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        folderPath={folderPath}
        currentPath={currentPath}
        files={files}
        selectedFilePath={selectedFilePath}
        onSelectFile={handleSelectFile}
        onOpenFolder={handleOpenFolder}
        onNavigateToFolder={navigateToFolder}
        onNavigateUp={navigateUp}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCreatingFile={isCreatingFile}
        setIsCreatingFile={setIsCreatingFile}
        outline={currentDocument?.outline || []}
        selectedNodeId={activePane === 'primary' ? selectedNodeId : secondaryNodeId}
        onSelectNode={(nodeId) => {
          if (isSplitView && activePane === 'secondary') {
            setSecondaryNodeId(nodeId);
          } else {
            setSelectedNodeId(nodeId);
          }
        }}
        onOutlineChange={handleOutlineChange}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onMoveNode={handleMoveNode}
        onDeleteNode={handleDeleteNode}
        width={sidebarWidth}
        onResizeStart={startResizing}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(!isSplitView)}
        onOpenInSecondaryPane={(nodeId) => {
          setSecondaryNodeId(nodeId);
          if (!isSplitView) setIsSplitView(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="main-content">
        {isLoading ? (
          <div className="loading-state">
            <p>{t('loading')}</p>
          </div>
        ) : currentDocument ? (
          <div className={`editor-area ${isSplitView ? 'split-view' : ''}`}>
            {isSplitView && (
              <div className="editor-toolbar">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={!currentDocument.isDirty}
                >
                  {t('editor.save')} (⌘S)
                </button>
              </div>
            )}
            <div className="editor-panes-container">
              <div
                className={`editor-pane ${isSplitView && activePane === 'primary' ? 'active' : ''}`}
                onClick={() => setActivePane('primary')}
              >
                {isSplitView && (
                  <button
                    className="pane-close-btn"
                    onClick={(e) => { e.stopPropagation(); setIsSplitView(false); setActivePane('primary'); }}
                    title="Close pane"
                  >
                    ×
                  </button>
                )}
                <Editor
                  document={currentDocument}
                  selectedNodeId={selectedNodeId}
                  onOutlineChange={handleOutlineChangeWithHistory}
                  onSave={handleSave}
                  hideSaveButton={isSplitView}
                />
              </div>
              {isSplitView && (
                <>
                  <div className="split-divider" />
                  <div
                    className={`editor-pane ${activePane === 'secondary' ? 'active' : ''}`}
                    onClick={() => setActivePane('secondary')}
                  >
                    <button
                      className="pane-close-btn"
                      onClick={(e) => { e.stopPropagation(); setIsSplitView(false); setActivePane('primary'); }}
                      title="Close pane"
                    >
                      ×
                    </button>
                    <Editor
                      document={currentDocument}
                      selectedNodeId={secondaryNodeId}
                      onOutlineChange={handleOutlineChangeWithHistory}
                      onSave={handleSave}
                      hideSaveButton={true}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            {folderPath ? (
              <div className="welcome-message">
                <div className="workflow-step completed">
                  <span className="step-number">✓</span>
                  <span className="step-text">{t('welcome.step1')}</span>
                </div>
                <div className="workflow-step current">
                  <span className="step-number">2</span>
                  <span className="step-text">{t('welcome.step2')}</span>
                </div>
                <div className="workflow-step">
                  <span className="step-number">3</span>
                  <span className="step-text">{t('welcome.step3')}</span>
                </div>
                <div className="welcome-actions">
                  <button className="create-file-btn" onClick={handleStartCreateFile}>
                    {t('welcome.createFileBtn')}
                  </button>
                </div>
                <p className="welcome-hint">{t('welcome.hint')}</p>
              </div>
            ) : (
              <div className="welcome-message">
                <h2>{t('app.title')}</h2>
                <p className="welcome-subtitle">{t('welcome.subtitle')}</p>
                <div className="workflow-steps">
                  <div className="workflow-step current">
                    <span className="step-number">1</span>
                    <span className="step-text">{t('welcome.step1')}</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">2</span>
                    <span className="step-text">{t('welcome.step2')}</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">3</span>
                    <span className="step-text">{t('welcome.step3')}</span>
                  </div>
                </div>
                <div className="welcome-actions">
                  <button className="open-folder-btn" onClick={handleOpenFolder}>
                    {t('welcome.startBtn')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {currentDocument && (
          <StatusBar
            chars={calculateTotalStats(currentDocument.outline).chars}
            words={calculateTotalStats(currentDocument.outline).words}
          />
        )}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        content={currentDocument ? outlineToMarkdown(currentDocument.outline) : ''}
        title={currentDocument?.name.replace(/\.md$/, '') || 'document'}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

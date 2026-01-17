import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
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
} from "./lib/outline";
import "./App.css";

export interface Document {
  path: string;
  name: string;
  content: string;
  outline: OutlineNode[];
  isDirty: boolean;
}

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Font Size state
  const [fontSize, setFontSize] = useState<number>(14);

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  // Restore sidebar width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width)) {
        setSidebarWidth(width);
      }
    }
  }, []);

  // Persist sidebar width
  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  // Sidebar Resize Handlers
  const startResizing = useCallback(() => {
    setIsResizingSidebar(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingSidebar(false);
  }, []);

  const resizeCallback = useCallback((e: MouseEvent) => {
    if (isResizingSidebar) {
      setSidebarWidth(_ => {
        const newWidth = e.clientX;
        if (newWidth < 150) return 150;
        if (newWidth > 600) return 600;
        return newWidth;
      });
    }
  }, [isResizingSidebar]);

  useEffect(() => {
    if (isResizingSidebar) {
      window.addEventListener("mousemove", resizeCallback);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resizeCallback);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resizeCallback);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingSidebar, resizeCallback, stopResizing]);

  // Restore font size from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('userFontSize');
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      if (!isNaN(size)) {
        setFontSize(size);
      }
    }
  }, []);

  // Apply font size to CSS variable and persist
  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-size', `${fontSize}px`);
    localStorage.setItem('userFontSize', fontSize.toString());
  }, [fontSize]);

  const zoomIn = useCallback(() => {
    setFontSize(prev => Math.min(prev + 1, 24));
  }, []);

  const zoomOut = useCallback(() => {
    setFontSize(prev => Math.max(prev - 1, 10));
  }, []);

  const resetZoom = useCallback(() => {
    setFontSize(14);
  }, []);

  const isSessionRestored = useRef(false);

  // Save state when folder or file changes (skip until session is restored)
  useEffect(() => {
    if (!isSessionRestored.current) return;
    if (folderPath) {
      localStorage.setItem('lastFolderPath', folderPath);
    }
  }, [folderPath]);

  useEffect(() => {
    if (!isSessionRestored.current) return;
    if (selectedFilePath) {
      console.log('[State Save] Saving file path to localStorage:', selectedFilePath);
      localStorage.setItem('lastFilePath', selectedFilePath);
    } else {
      console.log('[State Save] Removing file path from localStorage');
      localStorage.removeItem('lastFilePath');
    }
  }, [selectedFilePath]);

  // Load folder contents
  const loadFolder = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      const entries = await readDirectory(path);
      setFiles(entries);
      setFolderPath(path);
    } catch (error) {
      console.error("Failed to load folder:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open folder dialog
  const handleOpenFolder = useCallback(async () => {
    const path = await openFolderDialog();
    if (path) {
      await loadFolder(path);
      setSelectedFilePath(null);
      setCurrentDocument(null);
    }
  }, [loadFolder]);

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
      // Select the first node by default if it exists
      if (outline.length > 0) {
        setSelectedNodeId(outline[0].id);
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

  // Create new file
  const handleCreateFile = useCallback(
    async (fileName: string) => {
      if (!folderPath) return;

      const newPath = `${folderPath}/${fileName}.md`;
      try {
        await createFile(newPath);
        await loadFolder(folderPath);
        await handleSelectFile(newPath);
      } catch (error) {
        console.error("Failed to create file:", error);
      }
    },
    [folderPath, loadFolder, handleSelectFile]
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
    const newOutline = indentNode(currentDocument.outline, id);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange]);

  const handleOutdent = useCallback((id: string) => {
    if (!currentDocument) return;
    const newOutline = outdentNode(currentDocument.outline, id);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange]);

  const handleMoveNode = useCallback((sourceId: string, targetId: string | null, position: 'before' | 'after' | 'inside') => {
    if (!currentDocument) return;
    const newOutline = moveNode(currentDocument.outline, sourceId, targetId, position);
    handleOutlineChange(newOutline);
  }, [currentDocument, handleOutlineChange]);

  // Restore previous session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedFolderPath = localStorage.getItem('lastFolderPath');
        const savedFilePath = localStorage.getItem('lastFilePath');

        console.log('[Session Restore] Saved folder:', savedFolderPath);
        console.log('[Session Restore] Saved file:', savedFilePath);

        if (savedFolderPath) {
          // First load the folder
          await loadFolder(savedFolderPath);

          // Then open the file if it was saved
          if (savedFilePath) {
            // Small delay to ensure files state is updated
            setTimeout(async () => {
              try {
                console.log('[Session Restore] Attempting to open file:', savedFilePath);
                await handleSelectFile(savedFilePath);
                console.log('[Session Restore] File opened successfully');
              } catch (error) {
                console.error('[Session Restore] Failed to open file:', error);
                // Clear invalid file path
                localStorage.removeItem('lastFilePath');
              }
            }, 200);
          }
        }
      } catch (error) {
        console.error('[Session Restore] Failed to restore session:', error);
      } finally {
        // Mark session as restored to enable state saving
        isSessionRestored.current = true;
        console.log('[Session Restore] Session restoration complete');
      }
    };

    restoreSession();
  }, [loadFolder, handleSelectFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

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
    };

    setupMenuListeners();

    return () => {
      unlisten.forEach(fn => fn());
    };
  }, [folderPath, handleOpenFolder, handleSave]);

  return (
    <div className="app-container">
      <Sidebar
        folderPath={folderPath}
        files={files}
        selectedFilePath={selectedFilePath}
        onSelectFile={handleSelectFile}
        onOpenFolder={handleOpenFolder}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCreatingFile={isCreatingFile}
        setIsCreatingFile={setIsCreatingFile}
        outline={currentDocument?.outline || []}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        onOutlineChange={handleOutlineChange}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onMoveNode={handleMoveNode}
        width={sidebarWidth}
        onResizeStart={startResizing}
      />
      <main className="main-content">
        {isLoading ? (
          <div className="loading-state">
            <p>読み込み中...</p>
          </div>
        ) : currentDocument ? (
          <Editor
            document={currentDocument}
            selectedNodeId={selectedNodeId}
            onOutlineChange={handleOutlineChange}
            onSave={handleSave}
          />
        ) : (
          <div className="empty-state">
            {folderPath ? (
              <div className="welcome-message">
                <div className="workflow-step completed">
                  <span className="step-number">✓</span>
                  <span className="step-text">フォルダを開く</span>
                </div>
                <div className="workflow-step current">
                  <span className="step-number">2</span>
                  <span className="step-text">ファイルを選択または作成</span>
                </div>
                <div className="workflow-step">
                  <span className="step-number">3</span>
                  <span className="step-text">アウトラインを編集</span>
                </div>
                <div className="welcome-actions">
                  <button className="create-file-btn" onClick={handleStartCreateFile}>
                    新規ファイルを作成
                  </button>
                </div>
                <p className="welcome-hint">または、サイドバーからファイルを選択してください</p>
              </div>
            ) : (
              <div className="welcome-message">
                <h2>Vertebra</h2>
                <p className="welcome-subtitle">執筆のためのアウトラインエディタ</p>
                <div className="workflow-steps">
                  <div className="workflow-step current">
                    <span className="step-number">1</span>
                    <span className="step-text">フォルダを開く</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">2</span>
                    <span className="step-text">ファイルを選択または作成</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">3</span>
                    <span className="step-text">アウトラインを編集</span>
                  </div>
                </div>
                <div className="welcome-actions">
                  <button className="open-folder-btn" onClick={handleOpenFolder}>
                    フォルダを開いて始める
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

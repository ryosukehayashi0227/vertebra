import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import "./App.css";

// サンプルドキュメントデータ
const sampleDocuments = [
  { id: "1", title: "はじめに", content: "- プロジェクト概要\n  - 目的\n  - スコープ" },
  { id: "2", title: "第1章 序論", content: "- 背景\n- 問題提起\n- 研究の目的" },
  { id: "3", title: "第2章 関連研究", content: "- 先行研究\n  - 研究A\n  - 研究B" },
];

export interface Document {
  id: string;
  title: string;
  content: string;
}

function App() {
  const [documents] = useState<Document[]>(sampleDocuments);
  const [selectedDocId, setSelectedDocId] = useState<string | null>("1");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null;

  return (
    <div className="app-container">
      <Sidebar
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={setSelectedDocId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="main-content">
        {selectedDoc ? (
          <Editor document={selectedDoc} />
        ) : (
          <div className="empty-state">
            <p>ドキュメントを選択してください</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

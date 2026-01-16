import type { Document } from "../App";

interface SidebarProps {
    documents: Document[];
    selectedDocId: string | null;
    onSelectDoc: (id: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function Sidebar({
    documents,
    selectedDocId,
    onSelectDoc,
    isCollapsed,
    onToggleCollapse,
}: SidebarProps) {
    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <span className="sidebar-title">ドキュメント</span>
                <button
                    className="toggle-btn"
                    onClick={onToggleCollapse}
                    aria-label={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
                >
                    {isCollapsed ? "▶" : "◀"}
                </button>
            </div>
            <nav className="sidebar-content">
                <ul className="doc-list">
                    {documents.map((doc) => (
                        <li
                            key={doc.id}
                            className={`doc-item ${selectedDocId === doc.id ? "selected" : ""}`}
                            onClick={() => onSelectDoc(doc.id)}
                        >
                            {doc.title}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;

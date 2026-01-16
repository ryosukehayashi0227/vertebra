import type { Document } from "../App";

interface EditorProps {
    document: Document;
}

// Markdownのリスト記法をパースしてアウトラインアイテムに変換
function parseOutline(content: string): { text: string; level: number }[] {
    const lines = content.split("\n");
    const items: { text: string; level: number }[] = [];

    for (const line of lines) {
        // インデントを計測（2スペース = 1レベル）
        const match = line.match(/^(\s*)-\s*(.*)$/);
        if (match) {
            const indent = match[1].length;
            const level = Math.floor(indent / 2);
            const text = match[2];
            items.push({ text, level });
        }
    }

    return items;
}

function Editor({ document }: EditorProps) {
    const outlineItems = parseOutline(document.content);

    return (
        <div className="editor-container">
            <header className="editor-header">
                <h1 className="editor-title">{document.title}</h1>
            </header>
            <div className="outline-container">
                <ul className="outline-list">
                    {outlineItems.map((item, index) => (
                        <li
                            key={index}
                            className={`outline-item level-${item.level}`}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Editor;

import { useCallback, useMemo } from "react";
import type { Document } from "../App";
import type { OutlineNode } from "../lib/outline";
import { findNodeById } from "../lib/outline";

interface EditorProps {
    document: Document;
    selectedNodeId: string | null;
    onOutlineChange: (outline: OutlineNode[]) => void;
    onSave: () => void;
}

import RichEditor from "./RichEditor";

function Editor({ document, selectedNodeId, onOutlineChange, onSave }: EditorProps) {
    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return findNodeById(document.outline, selectedNodeId);
    }, [document.outline, selectedNodeId]);

    // Update node property
    const handleUpdateNode = useCallback(
        (id: string, updates: Partial<OutlineNode>) => {
            const updateInNodes = (nodes: OutlineNode[]): OutlineNode[] =>
                nodes.map((node) =>
                    node.id === id
                        ? { ...node, ...updates }
                        : { ...node, children: updateInNodes(node.children) }
                );

            onOutlineChange(updateInNodes(document.outline));
        },
        [document.outline, onOutlineChange]
    );

    if (!selectedNode) {
        return (
            <div className="editor-container empty">
                <p>サイドバーで項目を選択してください</p>
            </div>
        );
    }

    return (
        <div className="editor-container">
            <header className="editor-header">
                <input
                    type="text"
                    className="node-title-input"
                    value={selectedNode.text}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { text: e.target.value })}
                    placeholder="セクション名を入力..."
                />
                <div className="editor-actions">
                    <button
                        className="save-btn"
                        onClick={onSave}
                        disabled={!document.isDirty}
                    >
                        保存 (⌘S)
                    </button>
                </div>
            </header>
            <div className="content-editor">
                <RichEditor
                    content={selectedNode.content}
                    onChange={(markdown) => handleUpdateNode(selectedNode.id, { content: markdown })}
                    placeholder="ここから本文を入力..."
                />
            </div>
        </div>
    );
}

export default Editor;

import { useCallback, useMemo } from "react";
import type { Document } from "../../App";
import type { OutlineNode } from "../../lib/outline";
import { findNodeById } from "../../lib/outline";
import { useLanguage } from "../../contexts/LanguageContext";
import { getMetaKeyLabel } from "../../lib/os";
import { useEffect, useState } from "react";
import "./Editor.css";

interface EditorProps {
    document: Document;
    selectedNodeId: string | null;
    onOutlineChange: (outline: OutlineNode[]) => void;
    onSave: () => void;
    hideSaveButton?: boolean;
    jumpToContent?: string | null;
}

import RichEditor from "./RichEditor";

function Editor({ document, selectedNodeId, onOutlineChange, onSave, hideSaveButton, jumpToContent }: EditorProps) {
    const { t, language } = useLanguage();
    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return findNodeById(document.outline, selectedNodeId);
    }, [document.outline, selectedNodeId]);

    const [metaKeyLabel, setMetaKeyLabel] = useState(() => {
        return navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl+';
    });

    useEffect(() => {
        getMetaKeyLabel().then(setMetaKeyLabel);
    }, []);

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
                <p>{t('editor.selectNode')}</p>
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
                    placeholder={t('editor.sectionNamePlaceholder')}
                    spellCheck={true}
                    lang={language}
                />
                {!hideSaveButton && (
                    <div className="editor-actions">
                        <button
                            className="save-btn"
                            onClick={onSave}
                            disabled={!document.isDirty}
                        >
                            {t('editor.save')} ({metaKeyLabel}S)
                        </button>
                    </div>
                )}
            </header>
            <div className="content-editor">
                <RichEditor
                    content={selectedNode.content}
                    onChange={(markdown) => handleUpdateNode(selectedNode.id, { content: markdown })}
                    placeholder={t('editor.contentPlaceholder')}
                    jumpToContent={jumpToContent}
                />
            </div>
        </div>
    );
}

export default Editor;

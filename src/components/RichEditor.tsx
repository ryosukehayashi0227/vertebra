import { useEffect, useRef } from 'react';

interface RichEditorProps {
    content: string;
    onChange: (markdown: string) => void;
    placeholder?: string;
    jumpToContent?: string | null;
}

const RichEditor = ({ content, onChange, placeholder, jumpToContent }: RichEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea to fit content
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [content]);

    // Handle jump to content
    useEffect(() => {
        if (jumpToContent && content) {
            const lines = content.split('\n');
            // Remove leading backslashes for markdown escape characters which might be present in search result
            const cleanTarget = jumpToContent.replace(/^\\/, '');

            // Try flexible matching
            let targetLineIndex = lines.findIndex(line => line.includes(cleanTarget));

            // If not found, try stripping whitespace
            if (targetLineIndex === -1) {
                targetLineIndex = lines.findIndex(line => line.trim().includes(cleanTarget.trim()));
            }

            if (targetLineIndex >= 0) {
                console.log('[RichEditor] Jumping to line:', targetLineIndex + 1);
                const editorContainer = document.querySelector('.content-editor');
                if (editorContainer) {
                    // Line height calculation: 1.125rem (18px) * 1.7 (line-height) ≈ 30.6px
                    const lineHeight = 18 * 1.7;
                    const scrollTop = targetLineIndex * lineHeight - 100; // Offset for visibility

                    editorContainer.scrollTo({
                        top: Math.max(0, scrollTop),
                        behavior: 'smooth'
                    });

                    // Highlight by selecting the text
                    // We need to find the exact start index of the match in the full content
                    const matchIndex = content.indexOf(cleanTarget);

                    // Fallback to fuzzy match if exact match fails (e.g. whitespace)
                    // Note: This simple fallback might select the wrong instance if duplicates exist,
                    // but it's better than nothing for now.
                    const finalIndex = matchIndex !== -1
                        ? matchIndex
                        : content.indexOf(cleanTarget.trim());

                    if (finalIndex !== -1 && textareaRef.current) {
                        const textarea = textareaRef.current;
                        const matchLength = matchIndex !== -1 ? cleanTarget.length : cleanTarget.trim().length;

                        textarea.focus();
                        textarea.setSelectionRange(finalIndex, finalIndex + matchLength);
                    }
                }
            } else {
                console.log('[RichEditor] Target content not found in current node:', cleanTarget);
            }
        }
    }, [jumpToContent, content]);

    const lines = content.split('\n');
    const lineNumbers = lines.length > 0 ? lines.length : 1;

    return (
        <div className="simple-editor-wrapper">
            <div className="line-numbers">
                {Array.from({ length: lineNumbers }).map((_, i) => (
                    <div key={i + 1} className="line-number">
                        {i + 1}
                    </div>
                ))}
            </div>
            <textarea
                ref={textareaRef}
                className="simple-textarea"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'ここから本文を入力...'}
                spellCheck={false}
            />
        </div>
    );
};

export default RichEditor;

import { useEffect, useRef } from 'react';

interface RichEditorProps {
    content: string;
    onChange: (markdown: string) => void;
    placeholder?: string;
}

const RichEditor = ({ content, onChange, placeholder }: RichEditorProps) => {
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

    return (
        <div className="simple-editor-wrapper">
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

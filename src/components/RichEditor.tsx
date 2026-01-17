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

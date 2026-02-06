import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface RichEditorProps {
    content: string;
    onChange: (markdown: string) => void;
    placeholder?: string;
    jumpToContent?: string | null;
}

const RichEditor = ({ content, onChange, placeholder, jumpToContent }: RichEditorProps) => {
    const { language } = useLanguage();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const [lineHeights, setLineHeights] = useState<number[]>([]);
    const prevWidthRef = useRef<number>(0);

    // Auto-resize textarea to fit content and calculate line heights
    const adjustHeightAndCalculateLines = useCallback(() => {
        const textarea = textareaRef.current;
        const mirror = mirrorRef.current;
        if (!textarea || !mirror) return;

        // Resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        // Copy styles relevant to layout
        const computedStyle = window.getComputedStyle(textarea);

        // Match width - subtract 1px buffer to account for sub-pixel rendering differences
        // where textarea might wrap slightly earlier than the div
        const width = textarea.clientWidth;
        const safeWidth = width;

        // Apply styles to mirror
        mirror.style.width = `${safeWidth}px`;

        // Font styles
        mirror.style.fontSize = computedStyle.fontSize;
        mirror.style.fontFamily = computedStyle.fontFamily;
        mirror.style.fontWeight = computedStyle.fontWeight;
        mirror.style.lineHeight = computedStyle.lineHeight;
        mirror.style.letterSpacing = computedStyle.letterSpacing;
        mirror.style.textIndent = computedStyle.textIndent;
        mirror.style.textTransform = computedStyle.textTransform;
        mirror.style.wordSpacing = computedStyle.wordSpacing;

        // Wrapping behavior - FORCE these to match CSS
        mirror.style.whiteSpace = 'pre-wrap';
        mirror.style.wordBreak = 'break-all'; // Force break-all for CJK
        mirror.style.overflowWrap = 'break-word'; // Force break-word
        mirror.style.tabSize = computedStyle.tabSize;

        // Box model
        mirror.style.boxSizing = 'border-box';
        mirror.style.paddingLeft = computedStyle.paddingLeft;
        mirror.style.paddingRight = computedStyle.paddingRight;
        mirror.style.paddingTop = '0px';
        mirror.style.paddingBottom = '0px';
        mirror.style.border = 'none';

        // Calculate Heights (Hidden Mirror)
        const lines = content.split('\n');
        const heights: number[] = [];
        lines.forEach(line => {
            // Use zero-width space for empty lines to preserve height
            mirror.textContent = line + '\u200b';
            // IMPORTANT: clientHeight returns rounded integers, causing sub-pixel drift over many lines.
            // getBoundingClientRect().height returns precise floats.
            const rect = mirror.getBoundingClientRect();
            heights.push(rect.height);
        });

        setLineHeights(heights);
    }, [content]);

    useEffect(() => {
        // Initial calculation
        adjustHeightAndCalculateLines();

        // Store initial width
        if (textareaRef.current) prevWidthRef.current = textareaRef.current.clientWidth;

        let rafId: number;
        const debouncedAdjust = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                // Prevent infinite loop: only adjust if width changed or it's a non-textarea resize (e.g. font change)
                if (textareaRef.current) {
                    const currentWidth = textareaRef.current.clientWidth;
                    // Check if width changed significantly or if forced check (like font change)
                    // Using a small epsilon for float/layout comparison
                    if (Math.abs(currentWidth - prevWidthRef.current) > 0.5) {
                        prevWidthRef.current = currentWidth;
                        adjustHeightAndCalculateLines();
                    } else {
                        // Even if width didn't change, height might have (due to font size).
                        // We run calculation safely.
                        adjustHeightAndCalculateLines();
                    }
                }
            });
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === textareaRef.current) {
                    // Only update if WIDTH changed to avoid height-loop
                    if (entry.contentRect.width !== prevWidthRef.current) {
                        prevWidthRef.current = entry.contentRect.width;
                        debouncedAdjust();
                    }
                } else {
                    // Body/Root resize logic (zoom etc) - Always update
                    debouncedAdjust();
                }
            }
        });

        if (textareaRef.current) resizeObserver.observe(textareaRef.current);
        resizeObserver.observe(document.body);

        const mutationObserver = new MutationObserver(() => {
            debouncedAdjust();
        });

        mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        window.addEventListener('resize', debouncedAdjust);

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', debouncedAdjust);
            cancelAnimationFrame(rafId);
        };
    }, [adjustHeightAndCalculateLines]);

    // Handle jump to content
    useEffect(() => {
        if (jumpToContent && content) {
            const lines = content.split('\n');
            const cleanTarget = jumpToContent.replace(/^\\/, '');

            let targetLineIndex = lines.findIndex(line => line.includes(cleanTarget));
            if (targetLineIndex === -1) {
                targetLineIndex = lines.findIndex(line => line.trim().includes(cleanTarget.trim()));
            }

            if (targetLineIndex >= 0) {
                console.log('[RichEditor] Jumping to line:', targetLineIndex + 1);
                const editorContainer = document.querySelector('.content-editor');
                if (editorContainer) {
                    const scrollTop = lineHeights.slice(0, targetLineIndex).reduce((sum, h) => sum + h, 0) - 100;

                    editorContainer.scrollTo({
                        top: Math.max(0, scrollTop),
                        behavior: 'smooth'
                    });

                    const matchIndex = content.indexOf(cleanTarget);
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
            }
        }
    }, [jumpToContent, content, lineHeights]);

    const lines = content.split('\n');

    return (
        <div className="simple-editor-wrapper">
            {/* Hidden mirror for calculations */}
            <div
                ref={mirrorRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    height: 'auto',
                    pointerEvents: 'none',
                    zIndex: -1000,
                    top: 0,
                    left: 0,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                }}
            />
            <div className="line-numbers">
                {lines.map((_, i) => (
                    <div
                        key={i + 1}
                        className="line-number"
                        style={{
                            height: lineHeights[i] ? `${lineHeights[i]}px` : 'auto',
                            // Removed minHeight to ensure exact match with Mirror Div calculation
                        }}
                    >
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
                spellCheck={true}
                lang={language}
            />
        </div>
    );
};

export default RichEditor;

import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "../contexts/LanguageContext";
import "./SearchModal.css";

interface SearchResult {
    file_path: string;
    file_name: string;
    line_number: number;
    line_content: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderPath: string | null;
    onSelectResult: (filePath: string, lineContent: string) => void;
}

export default function SearchModal({ isOpen, onClose, folderPath, onSelectResult }: SearchModalProps) {
    const { t } = useLanguage();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!isOpen || !folderPath || !query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const searchResults = await invoke<SearchResult[]>("search_files", {
                    dirPath: folderPath,
                    query: query.trim(),
                });
                setResults(searchResults);
                setSelectedIndex(0);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, folderPath, isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (results[selectedIndex]) {
                    onSelectResult(results[selectedIndex].file_path, results[selectedIndex].line_content);
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-header">
                    <div className="search-icon">🔍</div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search.placeholder') || "Search in all files..."}
                    />
                </div>

                <div className="search-results">
                    {isLoading ? (
                        <div className="search-loading">{t('loading')}</div>
                    ) : results.length > 0 ? (
                        <ul>
                            {results.map((result, index) => (
                                <li
                                    key={`${result.file_path}-${result.line_number}`}
                                    className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
                                    onClick={() => {
                                        onSelectResult(result.file_path, result.line_content);
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="result-file">{result.file_name}</div>
                                    <div className="result-line">
                                        <span className="line-number">{result.line_number}:</span>
                                        <span className="line-content">{result.line_content}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : query.trim() ? (
                        <div className="search-empty">{t('search.noResults') || "No results found"}</div>
                    ) : (
                        <div className="search-hint">{t('search.hint') || "Type to search..."}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

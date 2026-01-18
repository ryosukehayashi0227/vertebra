import { useLanguage } from '../../contexts/LanguageContext';
import './SearchInput.css';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function SearchInput({ value, onChange, placeholder, disabled }: SearchInputProps) {
    const { t } = useLanguage();

    return (
        <div className="search-input-container">
            <input
                type="text"
                className="search-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || t('sidebar.searchPlaceholder')}
                disabled={disabled}
            />
            {value && (
                <button
                    className="search-clear-btn"
                    onClick={() => onChange('')}
                    title={t('sidebar.clearSearch')}
                >
                    ×
                </button>
            )}
        </div>
    );
}

import { useLanguage } from '../../contexts/LanguageContext';
import type { ViewMode } from './types';
import './ViewSelector.css';

interface ViewSelectorProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    disabled?: boolean;
}

export default function ViewSelector({ viewMode, onViewModeChange, disabled }: ViewSelectorProps) {
    const { t } = useLanguage();

    return (
        <div className="view-selector">
            <button
                className={viewMode === 'files' ? 'active' : ''}
                onClick={() => onViewModeChange('files')}
                disabled={disabled}
            >
                {t('sidebar.files')}
            </button>
            <button
                className={viewMode === 'outline' ? 'active' : ''}
                onClick={() => onViewModeChange('outline')}
                disabled={disabled}
            >
                {t('sidebar.outline')}
            </button>
        </div>
    );
}

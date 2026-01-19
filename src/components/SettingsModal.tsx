import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModalWindow from './ModalWindow';
import ModalHeader from './ModalHeader';
import SegmentedControl from './SegmentedControl';
import './Modal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Icon components (inline SVG)
const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const AutoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m5.196-15.804L13.5 6.893m-3 3L7.804 6.196M23 12h-6m-6 0H1m15.804 5.196l-3.697-3.697m-3 3L6.196 17.804" />
    </svg>
);

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();

    const themeOptions = [
        { value: 'auto', label: t('settings.themeAuto'), icon: <AutoIcon /> },
        { value: 'light', label: t('settings.themeLight'), icon: <SunIcon /> },
        { value: 'dark', label: t('settings.themeDark'), icon: <MoonIcon /> },
    ];

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'ja', label: '日本語' },
    ];

    return (
        <ModalWindow isOpen={isOpen} onClose={onClose} width="420px">
            <ModalHeader
                title={t('settings.title')}
                icon={<SettingsIcon />}
                onClose={onClose}
            />

            <div className="desktop-modal-content">
                <div className="desktop-modal-section">
                    <label className="desktop-modal-section-label">
                        {t('settings.theme')}
                    </label>
                    <SegmentedControl
                        options={themeOptions}
                        value={theme}
                        onChange={(value) => setTheme(value as 'auto' | 'light' | 'dark')}
                    />
                </div>

                <div className="desktop-modal-divider" />

                <div className="desktop-modal-section">
                    <label className="desktop-modal-section-label">
                        {t('settings.language')}
                    </label>
                    <SegmentedControl
                        options={languageOptions}
                        value={language}
                        onChange={(value) => setLanguage(value as 'en' | 'ja')}
                    />
                </div>
            </div>
        </ModalWindow>
    );
}

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <header className="settings-header">
                    <h2>{t('settings.title')}</h2>
                    <button className="settings-close-btn" onClick={onClose}>×</button>
                </header>
                <div className="settings-content">
                    <div className="settings-section">
                        <label className="settings-label">{t('settings.theme')}</label>
                        <div className="settings-options">
                            <button
                                className={`settings-option ${theme === 'auto' ? 'active' : ''}`}
                                onClick={() => setTheme('auto')}
                            >
                                {t('settings.themeAuto')}
                            </button>
                            <button
                                className={`settings-option ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                {t('settings.themeLight')}
                            </button>
                            <button
                                className={`settings-option ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                {t('settings.themeDark')}
                            </button>
                        </div>
                    </div>
                    <div className="settings-section">
                        <label className="settings-label">{t('settings.language')}</label>
                        <div className="settings-options">
                            <button
                                className={`settings-option ${language === 'en' ? 'active' : ''}`}
                                onClick={() => setLanguage('en')}
                            >
                                English
                            </button>
                            <button
                                className={`settings-option ${language === 'ja' ? 'active' : ''}`}
                                onClick={() => setLanguage('ja')}
                            >
                                日本語
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

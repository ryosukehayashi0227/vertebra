import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatusBarProps {
    chars: number;
    words: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ chars, words }) => {
    const { t } = useLanguage();

    return (
        <div className="status-bar" data-testid="status-bar">
            <div className="status-item">
                <span className="status-label">{t('stats.total')}:</span>
            </div>
            <div className="status-item">
                <span className="status-value">{chars}</span>
                <span className="status-label">{t('stats.chars')}</span>
            </div>
            <div className="status-item">
                <span className="status-value">{words}</span>
                <span className="status-label">{t('stats.words')}</span>
            </div>
        </div>
    );
};

export default StatusBar;

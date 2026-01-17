import { render, screen, act, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { invoke } from '@tauri-apps/api/core';
import { vi } from 'vitest';

// Mock Component
const TestComponent = () => {
    const { language, setLanguage, t } = useLanguage();
    return (
        <div>
            <span data-testid="lang">{language}</span>
            <span data-testid="text">{t('app.title')}</span>
            <button onClick={() => setLanguage('ja')}>Change to JA</button>
            <button onClick={() => setLanguage('en')}>Change to EN</button>
        </div>
    );
};

describe('LanguageContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Default mock implementation specific to this test file if needed
        (invoke as any).mockResolvedValue(undefined);
    });

    it('initializes with default language (en) if navigator is not ja', async () => {
        Object.defineProperty(window, 'navigator', {
            value: { language: 'en-US' },
            writable: true
        });

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('lang')).toHaveTextContent('en');
        });
        expect(invoke).toHaveBeenCalledWith('update_menu_language', { lang: 'en' });
    });

    it('initializes with ja if navigator is ja', async () => {
        Object.defineProperty(window, 'navigator', {
            value: { language: 'ja-JP' },
            writable: true
        });

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('lang')).toHaveTextContent('ja');
        });
        expect(invoke).toHaveBeenCalledWith('update_menu_language', { lang: 'ja' });
    });

    it('respects localStorage over navigator', async () => {
        localStorage.setItem('userLanguage', 'ja');
        Object.defineProperty(window, 'navigator', {
            value: { language: 'en-US' },
            writable: true
        });

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('lang')).toHaveTextContent('ja');
        });
    });

    it('changes language and persists', async () => {
        Object.defineProperty(window, 'navigator', {
            value: { language: 'en-US' },
            writable: true
        });

        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'));

        const btnJa = screen.getByText('Change to JA');
        await act(async () => {
            btnJa.click();
        });

        expect(screen.getByTestId('lang')).toHaveTextContent('ja');
        expect(localStorage.getItem('userLanguage')).toBe('ja');
        expect(invoke).toHaveBeenCalledWith('update_menu_language', { lang: 'ja' });
    });
});

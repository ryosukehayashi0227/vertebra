import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { en } from '../locales/en';
import { ja } from '../locales/ja';
import { Language, TranslationDictionary } from '../locales/types';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, TranslationDictionary> = {
    en,
    ja
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [language, setLanguageState] = useState<Language>('en'); // Default initial state to avoid hydration mismatch if using SSR, though Tauri is SPA.

    useEffect(() => {
        const initLanguage = async () => {
            // 1. Check localStorage
            const savedLang = localStorage.getItem('userLanguage') as Language;
            if (savedLang && (savedLang === 'en' || savedLang === 'ja')) {
                setLanguageState(savedLang);
                await invoke('update_menu_language', { lang: savedLang });
                return;
            }

            // 2. Check navigator.language
            const browserLang = navigator.language;
            const detectedLang: Language = browserLang.startsWith('ja') ? 'ja' : 'en';
            setLanguageState(detectedLang);
            await invoke('update_menu_language', { lang: detectedLang });
        };

        initLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('userLanguage', lang);
        await invoke('update_menu_language', { lang });
    };

    const t = (key: keyof TranslationDictionary) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

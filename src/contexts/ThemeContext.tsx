import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'vertebra_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('auto');
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

    // Detect system theme
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Load saved theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (saved && ['light', 'dark', 'auto'].includes(saved)) {
            setThemeState(saved);
        }
    }, []);

    // Calculate effective theme
    const effectiveTheme = theme === 'auto' ? systemTheme : theme;

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', effectiveTheme);
    }, [effectiveTheme]);

    // Set theme and persist to localStorage
    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

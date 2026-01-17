import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component to access theme context
function ThemeTestComponent() {
    const { theme, setTheme, effectiveTheme } = useTheme();
    return (
        <div>
            <div data-testid="current-theme">{theme}</div>
            <div data-testid="effective-theme">{effectiveTheme}</div>
            <button onClick={() => setTheme('light')}>Light</button>
            <button onClick={() => setTheme('dark')}>Dark</button>
            <button onClick={() => setTheme('auto')}>Auto</button>
        </div>
    );
}

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('defaults to auto theme', () => {
        render(
            <ThemeProvider>
                <ThemeTestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('current-theme')).toHaveTextContent('auto');
    });

    it('switches to light theme', () => {
        render(
            <ThemeProvider>
                <ThemeTestComponent />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByText('Light'));
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
        expect(screen.getByTestId('effective-theme')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('switches to dark theme', () => {
        render(
            <ThemeProvider>
                <ThemeTestComponent />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByText('Dark'));
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('effective-theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persists theme to localStorage', () => {
        render(
            <ThemeProvider>
                <ThemeTestComponent />
            </ThemeProvider>
        );

        fireEvent.click(screen.getByText('Dark'));
        expect(localStorage.getItem('vertebra_theme')).toBe('dark');
    });

    it('loads theme from localStorage on mount', () => {
        localStorage.setItem('vertebra_theme', 'light');

        render(
            <ThemeProvider>
                <ThemeTestComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
});

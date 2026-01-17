import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBar from './StatusBar';
import { LanguageProvider } from '../contexts/LanguageContext';

// Wrap component with LanguageProvider for translations
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('StatusBar', () => {
    it('renders character and word counts correctly', () => {
        renderWithProviders(<StatusBar chars={123} words={45} />);

        // Check for character count
        expect(screen.getByText('123')).toBeInTheDocument();
        // Check for word count
        expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('displays translated labels', () => {
        renderWithProviders(<StatusBar chars={0} words={0} />);

        // By default it uses English if localStorage is empty in test
        expect(screen.getByText(/Total/i)).toBeInTheDocument();
        expect(screen.getByText(/chars/i)).toBeInTheDocument();
        expect(screen.getByText(/words/i)).toBeInTheDocument();
    });
});

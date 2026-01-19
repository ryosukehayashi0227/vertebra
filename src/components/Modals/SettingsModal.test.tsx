import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsModal from './SettingsModal';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider>
            <LanguageProvider>
                {ui}
            </LanguageProvider>
        </ThemeProvider>
    );
};

describe('SettingsModal', () => {
    it('does not render when isOpen is false', () => {
        renderWithProviders(<SettingsModal isOpen={false} onClose={vi.fn()} />);

        expect(screen.queryByText(/Settings/i)).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
        renderWithProviders(<SettingsModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        renderWithProviders(<SettingsModal isOpen={true} onClose={onClose} />);

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
        const onClose = vi.fn();
        renderWithProviders(<SettingsModal isOpen={true} onClose={onClose} />);

        const overlay = screen.getByText(/Settings/i).closest('.settings-overlay');
        if (overlay) {
            fireEvent.click(overlay);
            expect(onClose).toHaveBeenCalledTimes(1);
        }
    });

    it('displays theme options', () => {
        renderWithProviders(<SettingsModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByText(/Auto/i)).toBeInTheDocument();
        expect(screen.getByText(/Light/i)).toBeInTheDocument();
        expect(screen.getByText(/Dark/i)).toBeInTheDocument();
    });

    it('displays language options', () => {
        renderWithProviders(<SettingsModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('日本語')).toBeInTheDocument();
    });

    it('switches theme when theme button is clicked', () => {
        renderWithProviders(<SettingsModal isOpen={true} onClose={vi.fn()} />);

        const darkButton = screen.getByText(/Dark/i);
        fireEvent.click(darkButton);

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('switches language when language button is clicked', () => {
        renderWithProviders(<SettingsModal isOpen={true} onClose={vi.fn()} />);

        const japaneseButton = screen.getByText('日本語');
        fireEvent.click(japaneseButton);

        // Verify button has active class after click
        expect(japaneseButton).toHaveClass('active');
    });

    it('does not close when clicking modal content', () => {
        const onClose = vi.fn();
        const { container } = renderWithProviders(<SettingsModal isOpen={true} onClose={onClose} />);

        const modalContent = container.querySelector('.settings-modal');
        if (modalContent) {
            fireEvent.click(modalContent);
            expect(onClose).not.toHaveBeenCalled();
        }
    });
});

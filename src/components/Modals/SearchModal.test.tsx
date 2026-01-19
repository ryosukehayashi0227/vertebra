import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SearchModal from './SearchModal';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Mock Tauri invoke
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
    invoke: (...args: any[]) => mockInvoke(...args),
}));

// Mock LanguageProvider
const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <LanguageProvider>
            {component}
        </LanguageProvider>
    );
};

describe('SearchModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when isOpen is false', () => {
        const { container } = renderWithProviders(
            <SearchModal
                isOpen={false}
                onClose={() => { }}
                folderPath="/test/path"
                onSelectResult={() => { }}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders search input when isOpen is true', () => {
        renderWithProviders(
            <SearchModal
                isOpen={true}
                onClose={() => { }}
                folderPath="/test/path"
                onSelectResult={() => { }}
            />
        );
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('calls search_files invoke when typing', async () => {
        mockInvoke.mockResolvedValue([]);

        renderWithProviders(
            <SearchModal
                isOpen={true}
                onClose={() => { }}
                folderPath="/test/path"
                onSelectResult={() => { }}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test query' } });

        await waitFor(() => {
            // Debounce might cause delay, but waitFor handles it
            expect(mockInvoke).toHaveBeenCalledWith('search_files', {
                dirPath: '/test/path',
                query: 'test query'
            });
        }, { timeout: 1000 });
    });

    it('displays results and handles selection', async () => {
        mockInvoke.mockResolvedValue([
            {
                file_path: '/test/path/file1.md',
                file_name: 'file1.md',
                line_number: 10,
                line_content: 'Found test query here'
            }
        ]);

        const onSelectResult = vi.fn();
        const onClose = vi.fn();

        renderWithProviders(
            <SearchModal
                isOpen={true}
                onClose={onClose}
                folderPath="/test/path"
                onSelectResult={onSelectResult}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test query' } });

        await waitFor(() => {
            expect(screen.getByText('file1.md')).toBeInTheDocument();
            expect(screen.getByText('Found test query here')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('file1.md'));

        expect(onSelectResult).toHaveBeenCalledWith('/test/path/file1.md', 'Found test query here');
        expect(onClose).toHaveBeenCalled();
    });
});

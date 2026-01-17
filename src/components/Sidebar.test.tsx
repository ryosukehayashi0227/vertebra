import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { LanguageProvider } from '../contexts/LanguageContext';
import { vi } from 'vitest';

// Mock props
const defaultProps = {
    folderPath: '/test/folder',
    files: [
        { name: 'test.md', path: '/test/folder/test.md', is_dir: false }
    ],
    selectedFilePath: null,
    onSelectFile: vi.fn(),
    onOpenFolder: vi.fn(),
    onCreateFile: vi.fn(),
    onDeleteFile: vi.fn(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    isCreatingFile: false,
    setIsCreatingFile: vi.fn(),
    outline: [],
    selectedNodeId: null,
    onSelectNode: vi.fn(),
    onOutlineChange: vi.fn(),
    onIndent: vi.fn(),
    onOutdent: vi.fn(),
    onMoveNode: vi.fn(),
    width: 200,
    onResizeStart: vi.fn(),
};

describe('Sidebar', () => {
    it('renders file list correctly', () => {
        render(
            <LanguageProvider>
                <Sidebar {...defaultProps} />
            </LanguageProvider>
        );
        // Switch to files tab
        const fileBtn = screen.getByText('Files');
        fireEvent.click(fileBtn);
        expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    it('calls onResizeStart when resizer is clicked', () => {
        const { container } = render(
            <LanguageProvider>
                <Sidebar {...defaultProps} />
            </LanguageProvider>
        );

        // Find resizer by class
        const resizer = container.querySelector('.sidebar-resizer');
        expect(resizer).toBeInTheDocument();

        if (resizer) {
            fireEvent.mouseDown(resizer);
            expect(defaultProps.onResizeStart).toHaveBeenCalled();
        }
    });

    it('applies width style', () => {
        const width = 350;
        const { container } = render(
            <LanguageProvider>
                <Sidebar {...defaultProps} width={width} />
            </LanguageProvider>
        );
        const sidebar = container.querySelector('.sidebar');
        expect(sidebar).toHaveStyle(`width: ${width}px`);
    });
});

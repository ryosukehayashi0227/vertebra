import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from './Sidebar';
import { LanguageProvider } from '../contexts/LanguageContext';
import { vi } from 'vitest';

// Mock fileSystem
vi.mock('../lib/fileSystem', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../lib/fileSystem')>();
    return {
        ...actual,
        askConfirm: vi.fn(),
    };
});

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
    onDeleteNode: vi.fn(),
    width: 200,
    onResizeStart: vi.fn(),
};

describe('Sidebar', () => {
    it('renders file list correctly', () => {
        const { rerender } = render(
            <LanguageProvider>
                <Sidebar {...defaultProps} />
            </LanguageProvider>
        );
        // Switch to files tab
        const fileBtn = screen.getByText('Files');
        fireEvent.click(fileBtn);
        expect(screen.getByText('test.md')).toBeInTheDocument();

        // Check for "New File" button (translation check)
        const newFileBtn = screen.getByRole('button', { name: /\+ New File/ });
        expect(newFileBtn).toBeInTheDocument();

        // Click new file button
        fireEvent.click(newFileBtn);
        expect(defaultProps.setIsCreatingFile).toHaveBeenCalledWith(true);

        // Re-render with isCreatingFile=true to simulate parent state update
        rerender(
            <LanguageProvider>
                <Sidebar {...defaultProps} isCreatingFile={true} />
            </LanguageProvider>
        );

        // Check placeholder translation
        expect(screen.getByPlaceholderText('File Name')).toBeInTheDocument();
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

    it('shows context menu and handles copy action', async () => {
        const outline = [{ id: '1', text: 'Section 1', content: '', level: 0, children: [] }];
        render(
            <LanguageProvider>
                <Sidebar {...defaultProps} outline={outline} />
            </LanguageProvider>
        );

        // Ensure we are in outline view (default)
        // Ensure we are in outline view
        fireEvent.click(screen.getByText('Outline'));

        // Right click on the item
        const item = screen.getByText('Section 1');
        fireEvent.contextMenu(item);

        // Expect menu item to appear
        const copyBtn = screen.getByText('Copy as Text');
        expect(copyBtn).toBeInTheDocument();

        // Click it
        fireEvent.click(copyBtn);

        // Verify clipboard API call
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Section 1'));
    });

    it('filters outline nodes by search query', () => {
        const outline = [
            { id: '1', text: 'Section A', content: '', level: 0, children: [] },
            { id: '2', text: 'Section B', content: '', level: 0, children: [] },
        ];
        render(
            <LanguageProvider>
                <Sidebar {...defaultProps} outline={outline} />
            </LanguageProvider>
        );

        // Switch to outline view
        fireEvent.click(screen.getByText('Outline'));

        // Find search input
        const searchInput = screen.getByPlaceholderText('Search outline...');
        fireEvent.change(searchInput, { target: { value: 'Section A' } });

        // 'Section A' should be visible and highlighted
        const sectionA = screen.getByText('Section A');
        expect(sectionA).toBeInTheDocument();
        const listItem = sectionA.closest('li');
        expect(listItem).toHaveClass('search-match');

        // 'Section B' should NOT be visible
        expect(screen.queryByText('Section B')).not.toBeInTheDocument();
    });

    it('shows confirm dialog and calls onDeleteNode', async () => {
        const outline = [
            {
                id: '1', text: 'Parent', content: '', level: 0, children: [
                    { id: '2', text: 'Child', content: '', level: 1, children: [] }
                ]
            }
        ];
        render(
            <LanguageProvider>
                <Sidebar {...defaultProps} outline={outline} />
            </LanguageProvider>
        );

        // Mock askConfirm
        const { askConfirm } = await import('../lib/fileSystem');
        vi.mocked(askConfirm).mockResolvedValue(true);

        // Switch to outline view
        fireEvent.click(screen.getByText('Outline'));

        // Open context menu
        fireEvent.contextMenu(screen.getByText('Parent'));

        // Click delete
        const deleteBtn = screen.getByText('Delete');
        fireEvent.click(deleteBtn);

        expect(askConfirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(defaultProps.onDeleteNode).toHaveBeenCalledWith('1');
        });
    });

    it('displays character counts for outline nodes', () => {
        const outline = [
            { id: '1', text: 'Section 1', content: 'Five chars', level: 0, children: [] },
        ];
        render(
            <LanguageProvider>
                <Sidebar {...defaultProps} outline={outline} />
            </LanguageProvider>
        );

        // Switch to outline view
        fireEvent.click(screen.getByText('Outline'));

        // countStats("", node.content).chars -> "Five chars" is 10 length
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('10')).toHaveClass('sidebar-node-stats');
    });
});

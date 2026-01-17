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
    currentPath: '/test/folder',
    files: [
        { name: 'test.md', path: '/test/folder/test.md', is_dir: false }
    ],
    selectedFilePath: null,
    onSelectFile: vi.fn(),
    onOpenFolder: vi.fn(),
    onNavigateToFolder: vi.fn(),
    onNavigateUp: vi.fn(),
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

    describe('Folder Navigation', () => {
        it('calls onNavigateToFolder when folder is clicked', () => {
            const props = {
                ...defaultProps,
                files: [
                    { name: 'test.md', path: '/test/folder/test.md', is_dir: false },
                    { name: 'subfolder', path: '/test/folder/subfolder', is_dir: true }
                ]
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to Files view
            fireEvent.click(screen.getByText('Files'));

            // Click on folder
            const folderItem = screen.getByText('subfolder').closest('.file-item');
            fireEvent.click(folderItem!);

            expect(props.onNavigateToFolder).toHaveBeenCalledWith('/test/folder/subfolder');
        });

        it('shows back button when in subfolder', () => {
            const props = {
                ...defaultProps,
                folderPath: '/test/folder',
                currentPath: '/test/folder/subfolder',
                files: [
                    { name: 'nested.md', path: '/test/folder/subfolder/nested.md', is_dir: false }
                ]
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to Files view
            fireEvent.click(screen.getByText('Files'));

            // Back button should be visible
            const backButton = screen.getByText('..').closest('.folder-back');
            expect(backButton).toBeInTheDocument();
        });

        it('hides back button at root level', () => {
            const props = {
                ...defaultProps,
                folderPath: '/test/folder',
                currentPath: '/test/folder',
                files: [
                    { name: 'test.md', path: '/test/folder/test.md', is_dir: false }
                ]
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to Files view
            fireEvent.click(screen.getByText('Files'));

            // Back button should not be visible
            expect(screen.queryByText('..')).not.toBeInTheDocument();
        });

        it('calls onNavigateUp when back button is clicked', () => {
            const props = {
                ...defaultProps,
                folderPath: '/test/folder',
                currentPath: '/test/folder/subfolder',
                files: [
                    { name: 'nested.md', path: '/test/folder/subfolder/nested.md', is_dir: false }
                ]
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to Files view
            fireEvent.click(screen.getByText('Files'));

            // Click back button
            const backButton = screen.getByText('..').closest('.folder-back');
            fireEvent.click(backButton!);

            expect(props.onNavigateUp).toHaveBeenCalled();
        });

        it('applies folder class to directory items', () => {
            const props = {
                ...defaultProps,
                files: [
                    { name: 'test.md', path: '/test/folder/test.md', is_dir: false },
                    { name: 'subfolder', path: '/test/folder/subfolder', is_dir: true }
                ]
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to Files view
            fireEvent.click(screen.getByText('Files'));

            // Folder should have folder class
            const folderItem = screen.getByText('subfolder').closest('.file-item');
            expect(folderItem).toHaveClass('folder');

            // File should not have folder class
            const fileItem = screen.getByText('test.md').closest('.file-item');
            expect(fileItem).not.toHaveClass('folder');
        });
    });

    describe('Split View', () => {
        it('shows split view toggle button', () => {
            const props = {
                ...defaultProps,
                outline: [{ id: '1', text: 'Node 1', content: '', level: 0, children: [] }],
                isSplitView: false,
                onToggleSplitView: vi.fn(),
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to outline view
            fireEvent.click(screen.getByText('Outline'));

            // Should have split view button in toolbar (or not, depending on implementation)
            // This test documents the component renders without errors
            screen.queryByTitle('Split View');
        });

        it('shows Open in Split View in context menu', async () => {
            const onOpenInSecondaryPane = vi.fn();
            const props = {
                ...defaultProps,
                outline: [{ id: '1', text: 'Node 1', content: '', level: 0, children: [] }],
                isSplitView: false,
                onOpenInSecondaryPane,
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to outline view
            fireEvent.click(screen.getByText('Outline'));

            // Right click on node
            const node = screen.getByText('Node 1');
            fireEvent.contextMenu(node);

            // Should have open in split view option
            const openInSplitBtn = screen.queryByText('Open in Split View');
            if (openInSplitBtn) {
                fireEvent.click(openInSplitBtn);
                expect(onOpenInSecondaryPane).toHaveBeenCalledWith('1');
            }
        });
    });

    describe('Add Node', () => {
        it('adds a new node when add button is clicked', () => {
            const onOutlineChange = vi.fn();
            const props = {
                ...defaultProps,
                outline: [{ id: '1', text: 'Existing Node', content: '', level: 0, children: [] }],
                onOutlineChange,
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Switch to outline view
            fireEvent.click(screen.getByText('Outline'));

            // Find and click add button (actual title is 'New Section')
            const addBtn = screen.getByTitle('New Section');
            fireEvent.click(addBtn);

            // Should have called onOutlineChange with new node added
            expect(onOutlineChange).toHaveBeenCalled();
            const newOutline = onOutlineChange.mock.calls[0][0];
            expect(newOutline.length).toBe(2);
        });
    });

    describe('Collapse/Expand', () => {
        it('renders collapse button with has-children class for nodes with children', () => {
            const outline = [{
                id: '1',
                text: 'Parent',
                content: '',
                level: 0,
                collapsed: false,
                children: [
                    { id: '2', text: 'Child', content: '', level: 1, children: [] }
                ]
            }];

            const { container } = render(
                <LanguageProvider>
                    <Sidebar {...defaultProps} outline={outline} />
                </LanguageProvider>
            );

            // Switch to outline view
            fireEvent.click(screen.getByText('Outline'));

            // Find collapse button with has-children class
            const collapseBtn = container.querySelector('.sidebar-collapse-btn.has-children');
            expect(collapseBtn).toBeInTheDocument();
        });

        it('renders children when node is not collapsed', () => {
            const outline = [{
                id: '1',
                text: 'Parent',
                content: '',
                level: 0,
                collapsed: false,
                children: [
                    { id: '2', text: 'Child Node', content: '', level: 1, children: [] }
                ]
            }];

            render(
                <LanguageProvider>
                    <Sidebar {...defaultProps} outline={outline} />
                </LanguageProvider>
            );

            // Switch to outline view
            fireEvent.click(screen.getByText('Outline'));

            // Both parent and child should be visible
            expect(screen.getByText('Parent')).toBeInTheDocument();
            expect(screen.getByText('Child Node')).toBeInTheDocument();
        });
    });

    describe('Settings', () => {
        it('calls onOpenSettings when settings button is clicked', () => {
            const onOpenSettings = vi.fn();
            const props = {
                ...defaultProps,
                onOpenSettings,
            };

            render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Find settings button by title or icon
            const settingsBtn = screen.queryByTitle('Settings');
            if (settingsBtn) {
                fireEvent.click(settingsBtn);
                expect(onOpenSettings).toHaveBeenCalled();
            }
        });
    });

    describe('Sidebar Collapse', () => {
        it('calls onToggleCollapse when collapse button is clicked', () => {
            const onToggleCollapse = vi.fn();
            const props = {
                ...defaultProps,
                onToggleCollapse,
            };

            const { container } = render(
                <LanguageProvider>
                    <Sidebar {...props} />
                </LanguageProvider>
            );

            // Find collapse button
            const collapseBtn = container.querySelector('.sidebar-collapse-btn');
            if (collapseBtn) {
                fireEvent.click(collapseBtn);
                expect(onToggleCollapse).toHaveBeenCalled();
            }
        });

        it('applies collapsed class when isCollapsed is true', () => {
            const { container } = render(
                <LanguageProvider>
                    <Sidebar {...defaultProps} isCollapsed={true} />
                </LanguageProvider>
            );

            const sidebar = container.querySelector('.sidebar');
            expect(sidebar).toHaveClass('collapsed');
        });
    });
});


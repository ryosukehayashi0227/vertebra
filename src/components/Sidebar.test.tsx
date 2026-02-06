import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import { createNode } from '../lib/outline';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../lib/fileSystem', () => ({
    readDirectory: vi.fn(),
    openFolderDialog: vi.fn(),
    askConfirm: vi.fn().mockResolvedValue(true),
}));

// Mock OutlineView to simplify tests and avoid D&D backend issues
vi.mock('./Sidebar/OutlineView', () => ({
    default: ({ outline, onSelectNode, onContextMenu }: any) => (
        <ul>
            {outline.map((node: any) => (
                <li key={node.id} data-testid={`node-${node.id}`} onContextMenu={(e) => onContextMenu(e, node.id)}>
                    <span onClick={() => onSelectNode(node.id)}>{node.text}</span>
                    {node.children && node.children.length > 0 && (
                        <ul>
                            {node.children.map((child: any) => (
                                <li key={child.id} data-testid={`node-${child.id}`}>
                                    <span>{child.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    )
}));

const mockOutline = [
    createNode('Node 1'),
    createNode('Node 2'),
];
// Add a child to Node 2 for testing focus
mockOutline[1].children = [createNode('Child 2.1')];

describe('Sidebar Integration', () => {
    const defaultProps = {
        folderPath: '/test',
        currentPath: '/test',
        files: [],
        selectedFilePath: '/test/file.md',
        onSelectFile: vi.fn(),
        onOpenFolder: vi.fn(),
        onNavigateToFolder: vi.fn(),
        onNavigateUp: vi.fn(),
        onCreateFile: vi.fn(),
        onDeleteFile: vi.fn(),
        onDeleteNode: vi.fn(),
        isCollapsed: false,
        onToggleCollapse: vi.fn(),
        isCreatingFile: false,
        setIsCreatingFile: vi.fn(),
        outline: mockOutline,
        selectedNodeId: null,
        onSelectNode: vi.fn(),
        onOutlineChange: vi.fn(),
        onUpdateNode: vi.fn(),
        onInsertNode: vi.fn(),
        onIndent: vi.fn(),
        onOutdent: vi.fn(),
        onMoveNode: vi.fn(),
        focusRootId: null,
        onEnterFocus: vi.fn(),
        onExitFocus: vi.fn(),
    };

    const renderSidebar = (props = {}) => {
        return render(
            <LanguageProvider>
                <Sidebar {...defaultProps} {...props} />
            </LanguageProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders outline when file is selected', () => {
        renderSidebar();
        expect(screen.getByText('Node 1')).toBeInTheDocument();
        expect(screen.getByText('Node 2')).toBeInTheDocument();
    });

    it('calls onEnterFocus when Focus is clicked in context menu', async () => {
        const onEnterFocus = vi.fn();
        renderSidebar({ onEnterFocus });

        // Right click on Node 2
        const node = screen.getByTestId(`node-${mockOutline[1].id}`);
        fireEvent.contextMenu(node);

        // Click focus option
        await waitFor(() => {
            expect(screen.getByText('Focus')).toBeInTheDocument();
        });
        const focusBtn = screen.getByText('Focus');
        fireEvent.click(focusBtn);

        expect(onEnterFocus).toHaveBeenCalledWith(mockOutline[1].id);
    });

    it('renders filtered outline when in focus mode', () => {
        const focusRootId = mockOutline[1].id;
        renderSidebar({ focusRootId });

        // Should see Node 2 (focused) - Header + Outline Item
        const nodes = screen.getAllByText('Node 2');
        expect(nodes.length).toBeGreaterThan(0);

        // Use test id to verify the actual outline node
        const treeNode = screen.getByTestId(`node-${mockOutline[1].id}`);
        expect(treeNode).toBeInTheDocument();

        // Should see Child 2.1 (descendant)
        expect(screen.getByText('Child 2.1')).toBeInTheDocument();
        // Should NOT see Node 1 (sibling)
        expect(screen.queryByText('Node 1')).not.toBeInTheDocument();

        // Should see Exit Focus button
        expect(screen.getByTitle('Exit Focus Mode')).toBeInTheDocument();
    });

    it('calls onExitFocus when Exit button is clicked', () => {
        const onExitFocus = vi.fn();
        const focusRootId = mockOutline[1].id;
        renderSidebar({ focusRootId, onExitFocus });

        const exitBtn = screen.getByTitle('Exit Focus Mode');
        fireEvent.click(exitBtn);

        expect(onExitFocus).toHaveBeenCalled();
    });

    // Auto-exit handled by effect, verifying it calls the prop
    it('calls onExitFocus if focused node is removed from outline', () => {
        const onExitFocus = vi.fn();
        const focusRootId = 'deleted-node-id';
        // Provide an outline where the focused node does not exist
        renderSidebar({ focusRootId, onExitFocus });

        expect(onExitFocus).toHaveBeenCalled();
    });
});

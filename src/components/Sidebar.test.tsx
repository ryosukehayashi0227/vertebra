import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
import type { OutlineNode } from '../lib/outline';
import type { FileEntry } from '../lib/fileSystem';

// Mock data
const mockFiles: FileEntry[] = [
    { name: 'test.md', path: '/folder/test.md', is_dir: false },
    { name: 'another.md', path: '/folder/another.md', is_dir: false },
    { name: 'subfolder', path: '/folder/subfolder', is_dir: true },
];

const mockOutline: OutlineNode[] = [
    {
        id: 'node1',
        text: 'First Node',
        content: 'Some content',
        level: 0,
        children: [
            { id: 'node1-1', text: 'Child Node', content: '', level: 1, children: [] },
        ],
    },
    { id: 'node2', text: 'Second Node', content: '', level: 0, children: [] },
];

const defaultProps = {
    folderPath: '/test/folder',
    files: mockFiles,
    selectedFilePath: null,
    onSelectFile: vi.fn(),
    onOpenFolder: vi.fn(),
    onCreateFile: vi.fn(),
    onDeleteFile: vi.fn(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    isCreatingFile: false,
    setIsCreatingFile: vi.fn(),
    outline: mockOutline,
    selectedNodeId: null,
    onSelectNode: vi.fn(),
    onOutlineChange: vi.fn(),
    onIndent: vi.fn(),
    onOutdent: vi.fn(),
    onMoveNode: vi.fn(),
};

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('View Mode Switching', () => {
        it('should render with view selector buttons', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByText('アウトライン')).toBeInTheDocument();
            expect(screen.getByText('ファイル')).toBeInTheDocument();
        });

        it('should switch to files view when folder is opened without selected file', () => {
            render(<Sidebar {...defaultProps} folderPath="/some/path" selectedFilePath={null} />);

            // Should be in files view - check for file items
            expect(screen.getByText('test.md')).toBeInTheDocument();
        });

        it('should switch to outline view when file is selected', () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" />);

            // Should be in outline view - check for outline items
            expect(screen.getByText('First Node')).toBeInTheDocument();
        });
    });

    describe('File List', () => {
        it('should display file list when in files view', async () => {
            render(<Sidebar {...defaultProps} selectedFilePath={null} />);

            // Click on files tab
            const filesButton = screen.getByText('ファイル');
            await userEvent.click(filesButton);

            expect(screen.getByText('test.md')).toBeInTheDocument();
            expect(screen.getByText('another.md')).toBeInTheDocument();
        });

        it('should call onSelectFile when clicking a file', async () => {
            render(<Sidebar {...defaultProps} selectedFilePath={null} />);

            const filesButton = screen.getByText('ファイル');
            await userEvent.click(filesButton);

            const fileItem = screen.getByText('test.md');
            await userEvent.click(fileItem);

            expect(defaultProps.onSelectFile).toHaveBeenCalledWith('/folder/test.md');
        });



        it('should show new file form when isCreatingFile is true', () => {
            render(<Sidebar {...defaultProps} isCreatingFile={true} />);

            expect(screen.getByPlaceholderText('ファイル名')).toBeInTheDocument();
        });
    });

    describe('Outline View', () => {
        it('should display outline nodes', () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" />);

            expect(screen.getByText('First Node')).toBeInTheDocument();
            expect(screen.getByText('Second Node')).toBeInTheDocument();
        });

        it('should display child nodes', () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" />);

            expect(screen.getByText('Child Node')).toBeInTheDocument();
        });

        it('should call onSelectNode when clicking an outline item', async () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" />);

            const nodeItem = screen.getByText('First Node');
            await userEvent.click(nodeItem);

            expect(defaultProps.onSelectNode).toHaveBeenCalledWith('node1');
        });

        it('should highlight selected node', () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" selectedNodeId="node1" />);

            const nodeItem = screen.getByText('First Node').closest('.sidebar-outline-item');
            expect(nodeItem).toHaveClass('selected');
        });
    });

    describe('Empty States', () => {
        it('should show open folder button when no folder is selected', () => {
            render(<Sidebar {...defaultProps} folderPath={null} />);

            expect(screen.getByText('フォルダを開く')).toBeInTheDocument();
        });

        it('should show empty outline message when outline is empty', () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" outline={[]} />);

            expect(screen.getByText('項目がありません')).toBeInTheDocument();
        });
    });

    describe('Collapsed State', () => {
        it('should hide content when collapsed', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            expect(screen.queryByText('アウトライン')).not.toBeInTheDocument();
            expect(screen.queryByText('ファイル')).not.toBeInTheDocument();
        });

        it('should call onToggleCollapse when toggle button is clicked', async () => {
            render(<Sidebar {...defaultProps} />);

            const toggleButton = screen.getByText('◀');
            await userEvent.click(toggleButton);

            expect(defaultProps.onToggleCollapse).toHaveBeenCalled();
        });
    });

    describe('File Creation', () => {
        it('should submit new file name on form submit', async () => {
            render(<Sidebar {...defaultProps} isCreatingFile={true} />);

            const input = screen.getByPlaceholderText('ファイル名');
            await userEvent.type(input, 'newfile.md');

            fireEvent.submit(input.closest('form')!);

            expect(defaultProps.onCreateFile).toHaveBeenCalledWith('newfile.md');
        });

        it('should not submit empty file name', async () => {
            render(<Sidebar {...defaultProps} isCreatingFile={true} />);

            const input = screen.getByPlaceholderText('ファイル名');
            fireEvent.submit(input.closest('form')!);

            expect(defaultProps.onCreateFile).not.toHaveBeenCalled();
        });
    });

    describe('Drag and Drop', () => {
        it('should set dragging state on mouse down', async () => {
            render(<Sidebar {...defaultProps} selectedFilePath="/folder/test.md" />);

            const nodeItem = screen.getByText('First Node').closest('.sidebar-outline-item');

            if (nodeItem) {
                fireEvent.mouseDown(nodeItem, { button: 0 });

                // The node should have is-dragging class on its parent li
                await waitFor(() => {
                    const listItem = nodeItem.closest('.sidebar-outline-node');
                    expect(listItem).toHaveClass('is-dragging');
                });
            }
        });
    });
});

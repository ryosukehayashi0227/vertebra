import { Page } from '@playwright/test';

export async function mockTauri(page: Page) {
    await page.addInitScript(() => {
        // Virtual File System State
        const vfs: Record<string, string> = {};
        const vfsDirs: Set<string> = new Set();
        const DUMMY_ROOT = '/mock/root';

        // Setup initial files and folders
        vfs[`${DUMMY_ROOT}/test.md`] = '- Test Node\\n  - Child Node';
        vfs[`${DUMMY_ROOT}/subfolder/nested.md`] = '- Nested Node';
        vfsDirs.add(`${DUMMY_ROOT}/subfolder`);

        // Mock Tauri IPC
        const mockInvoke = async (cmd: string, args: any) => {
            console.log(`[MockTauri] invoke: ${cmd}`, args);

            switch (cmd) {
                // File System
                case 'read_directory': {
                    const requestedPath = args.path;
                    const entries: any[] = [];

                    // Find all direct children of the requested path
                    // 1. Files
                    Object.keys(vfs).forEach(filePath => {
                        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
                        if (dir === requestedPath) {
                            entries.push({
                                name: filePath.split('/').pop() || 'unknown',
                                path: filePath,
                                is_dir: false
                            });
                        }
                    });

                    // 2. Directories
                    vfsDirs.forEach(dirPath => {
                        const parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
                        if (parentDir === requestedPath) {
                            entries.push({
                                name: dirPath.split('/').pop() || 'unknown',
                                path: dirPath,
                                is_dir: true
                            });
                        }
                    });

                    return entries;
                }
                case 'read_file':
                    return vfs[args.path] || '';
                case 'write_file':
                    vfs[args.path] = args.content;
                    return;
                case 'create_file':
                    vfs[args.path] = '';
                    return;
                case 'delete_file':
                    delete vfs[args.path];
                    return;
                case 'rename_file':
                    if (vfs[args.oldPath]) {
                        vfs[args.newPath] = vfs[args.oldPath];
                        delete vfs[args.oldPath];
                    }
                    return;

                // Dialog
                case 'plugin:dialog|open':
                    return DUMMY_ROOT;

                // App State
                case 'get_locale':
                    return 'en-US';
                case 'set_size':
                case 'set_font_size':
                    return;

                default:
                    console.warn(`[MockTauri] Ignored command: ${cmd}`);
                    return;
            }
        };

        // Mocking __TAURI_INTERNALS__ for Tauri v2
        (window as any).__TAURI_INTERNALS__ = {
            invoke: mockInvoke
        };

        // Also mock __TAURI__.invoke for compatibility/plugin usage if needed
        (window as any).__TAURI__ = {
            invoke: mockInvoke
        };
    });
}

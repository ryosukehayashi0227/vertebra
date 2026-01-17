import { Page } from '@playwright/test';

export async function mockTauri(page: Page) {
    await page.addInitScript(() => {
        // Virtual File System State
        const vfs: Record<string, string> = {};
        const DUMMY_ROOT = '/mock/root';

        // Setup initial files
        vfs[`${DUMMY_ROOT}/test.md`] = '- Test Node\n  - Child Node';

        // Mock Tauri IPC
        const mockInvoke = async (cmd: string, args: any) => {
            console.log(`[MockTauri] invoke: ${cmd}`, args);

            switch (cmd) {
                // File System
                case 'read_directory': {
                    // Return all files in VFS that start with DUMMY_ROOT (simple flat list simulation)
                    const files = Object.keys(vfs)
                        .filter(path => path.startsWith(DUMMY_ROOT))
                        .map(path => ({
                            name: path.split('/').pop() || 'unknown',
                            path: path,
                            is_dir: false
                        }));
                    return files;
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

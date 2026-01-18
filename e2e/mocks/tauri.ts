import { Page } from '@playwright/test';

export async function mockTauri(page: Page) {
    await page.addInitScript(() => {
        // Mock the specific structure Tauri v2 uses
        // @ts-ignore
        window.__TAURI__ = {
            core: {
                invoke: async (cmd: string, args: any) => {
                    console.log(`[Tauri Mock] Invoke: ${cmd}`, args);

                    if (cmd === 'search_files') {
                        return [
                            {
                                file_path: '/path/foo.md',
                                file_name: 'foo.md',
                                line_number: 10,
                                line_content: 'Found result'
                            }
                        ];
                    }
                    if (cmd === 'read_directory') {
                        // Return root files structure or empty
                        return [];
                    }
                    if (cmd === 'read_file') {
                        return '# Mock content';
                    }
                    // Default success
                    return null;
                }
            }
        };

        // Also mock internal ipc if needed, but core.invoke is usually enough for frontend imports
        // Recent tauri-apps/api versions might look for specific internals.
        // Ideally we should import from a shared mock file if possible.
    });
}

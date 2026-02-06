import { Page } from '@playwright/test';

/**
 * Simple Tauri mock for E2E tests.
 * Provides minimal mocking to prevent errors in browser environment.
 */
export async function mockTauri(page: Page) {
    await page.addInitScript(() => {
        // Simple mock - just define the objects so they exist
        // @ts-ignore
        window.__TAURI__ = {
            core: {
                invoke: async (cmd: string, args?: any) => {
                    console.log(`[Tauri Mock] invoke: ${cmd}`);
                    return null;
                }
            }
        };

        // @ts-ignore
        window.__TAURI_INTERNALS__ = {
            invoke: async (cmd: string, args?: any) => {
                console.log(`[Tauri Mock] invoke: ${cmd}`);
                return null;
            }
        };
    });
}

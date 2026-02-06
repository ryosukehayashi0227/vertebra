import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.describe('Outline Operations', () => {
    test.beforeEach(async ({ page }) => {
        await mockTauri(page);

        // Add the mock overrides as init script so they persist after reload
        await page.addInitScript(() => {
            // @ts-ignore
            if (!window.__TAURI__) {
                // Fallback if mockTauri didn't run or order issue, but it should be fine.
                // @ts-ignore
                window.__TAURI__ = { core: { invoke: async () => { } } };
            }

            // @ts-ignore
            const originalInvoke = window.__TAURI__.core.invoke;
            // @ts-ignore
            window.__TAURI__.core.invoke = async (cmd, args) => {
                if (cmd === 'plugin:fs|read_dir' || cmd === 'read_directory') {
                    return [
                        { name: 'note.md', path: '/test/notebook/note.md', is_dir: false }
                    ];
                }
                if (cmd === 'plugin:fs|read_text_file' || cmd === 'read_file') {
                    return '- Root Note';
                }
                if (cmd === 'plugin:fs|write_text_file' || cmd === 'write_file') {
                    return null;
                }
                return originalInvoke(cmd, args);
            };
        });
    });

    test('should support basic editing flow (Enter, Tab, Shift+Tab)', async ({ page }) => {
        // 1. Initial load
        await page.goto('/');

        // 2. Set localStorage to simulate saved session
        await page.evaluate(() => {
            localStorage.setItem('lastFolderPath', '/test/notebook');
            localStorage.setItem('lastFilePath', '/test/notebook/note.md');
        });

        // 3. Reload to trigger session restore
        await page.reload();

        // 4. Wait for the file to be loaded and editor to appear
        const firstInput = page.locator('.sidebar-outline-input').first();
        await expect(firstInput).toBeVisible({ timeout: 10000 });
        await expect(firstInput).toHaveValue('Root Note');

        // Focus the input
        await firstInput.click();

        // 5. Press Enter to create new line
        await firstInput.press('Enter');

        // Check for second input
        const inputs = page.locator('.sidebar-outline-input');
        await expect(inputs).toHaveCount(2);

        const secondInput = inputs.nth(1);
        await expect(secondInput).toBeFocused();

        // Type "Child Note"
        await secondInput.fill('Child Note');
        await expect(secondInput).toHaveValue('Child Note');

        // 6. Press Tab to indent
        await secondInput.press('Tab');

        // Wait for style update (padding-left: 28px)
        // We check the parent div's style
        await page.waitForTimeout(100);
        const secondItemDiv = page.locator('.sidebar-outline-item').nth(1);
        await expect(secondItemDiv).toHaveAttribute('style', /padding-left: 28px/);

        // 7. Press Shift+Tab to outdent
        await secondInput.press('Shift+Tab');

        await page.waitForTimeout(100);
        // Verify indentation returned to root level (padding-left: 8px)
        await expect(secondItemDiv).toHaveAttribute('style', /padding-left: 8px/);
    });
});

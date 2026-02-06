import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);

    // Additional test-specific overrides can go here if needed
    // But basic export mocking is now in mockTauri
});

test.describe('Export Flow', () => {
    test('should export document to DOCX from menu', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Trigger export via mock event
        await page.evaluate(() => {
            // @ts-ignore
            window.__mockEmit('menu-export');
        });

        // Wait for export modal to appear
        await expect(page.locator('.export-modal')).toBeVisible({ timeout: 5000 });

        // Click export button
        const exportButton = page.getByRole('button', { name: /Export as DOCX/i });
        await expect(exportButton).toBeVisible();
        await exportButton.click();

        // Wait for success message
        await expect(page.getByText(/Export successful/i)).toBeVisible({ timeout: 5000 });

        // Modal should auto-close after success
        await expect(page.locator('.export-modal')).not.toBeVisible({ timeout: 3000 });
    });

    test('should handle export cancellation', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        await expect(page.getByText('Test Node')).toBeVisible();

        // Trigger export
        await page.evaluate(() => {
            // @ts-ignore
            window.__mockEmit('menu-export');
        });

        await expect(page.locator('.export-modal')).toBeVisible();

        // Click cancel button
        const cancelButton = page.getByRole('button', { name: /Cancel/i });
        await cancelButton.click();

        await expect(page.locator('.export-modal')).not.toBeVisible();
    });

    test('should show error message on export failure', async ({ page }) => {
        // Override invoke to fail ONLY for this test
        await page.addInitScript(() => {
            // @ts-ignore
            const core = window.__TAURI__.core;
            const originalInvoke = core.invoke;
            core.invoke = async (cmd: string, args: any) => {
                if (cmd === 'export_document') {
                    throw new Error('Export failed');
                }
                return originalInvoke(cmd, args);
            };
        });

        await page.goto('/');

        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        await page.evaluate(() => {
            // @ts-ignore
            window.__mockEmit('menu-export');
        });

        await expect(page.locator('.export-modal')).toBeVisible();

        const exportButton = page.getByRole('button', { name: /Export as DOCX/i });
        await exportButton.click();

        await expect(page.getByText(/Error/i)).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.export-modal')).toBeVisible();
    });

    test('should not show export option when no document is open', async ({ page }) => {
        await page.goto('/');

        // Try to trigger export without opening a document
        await page.evaluate(() => {
            // @ts-ignore
            window.__mockEmit('menu-export');
        });

        await page.waitForTimeout(1000);
        await expect(page.locator('.export-modal')).not.toBeVisible();
    });
});

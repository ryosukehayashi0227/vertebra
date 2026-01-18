import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);

    // Mock export_document command
    await page.addInitScript(() => {
        const originalInvoke = (window as any).__TAURI_INTERNALS__.invoke;
        (window as any).__TAURI_INTERNALS__.invoke = async (cmd: string, args: any) => {
            if (cmd === 'export_document') {
                console.log('[MockTauri] export_document called with:', args);
                // Simulate successful export
                return { success: true };
            }
            if (cmd === 'plugin:dialog|save') {
                console.log('[MockTauri] save dialog called');
                // Return a mock file path
                return '/mock/export/document.docx';
            }
            return originalInvoke(cmd, args);
        };
    });
});

test.describe('Export Flow', () => {
    test('should export document to DOCX from menu', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Trigger export via menu (simulated via keyboard shortcut or button)
        // Note: In real app, this would be triggered via menu event
        // For E2E, we'll click the export button if available, or use keyboard

        // Open settings to access export (or use menu if available)
        // For now, we'll simulate the export modal opening
        await page.evaluate(() => {
            // Trigger menu-export event
            (window as any).__TAURI_INTERNALS__.invoke('menu-export', {});
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
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Trigger export
        await page.evaluate(() => {
            (window as any).__TAURI_INTERNALS__.invoke('menu-export', {});
        });

        // Wait for export modal
        await expect(page.locator('.export-modal')).toBeVisible();

        // Click cancel button
        const cancelButton = page.getByRole('button', { name: /Cancel/i });
        await cancelButton.click();

        // Modal should close
        await expect(page.locator('.export-modal')).not.toBeVisible();
    });

    test('should show error message on export failure', async ({ page }) => {
        // Override export to fail
        await page.addInitScript(() => {
            const originalInvoke = (window as any).__TAURI_INTERNALS__.invoke;
            (window as any).__TAURI_INTERNALS__.invoke = async (cmd: string, args: any) => {
                if (cmd === 'export_document') {
                    throw new Error('Export failed');
                }
                if (cmd === 'plugin:dialog|save') {
                    return '/mock/export/document.docx';
                }
                return originalInvoke(cmd, args);
            };
        });

        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Trigger export
        await page.evaluate(() => {
            (window as any).__TAURI_INTERNALS__.invoke('menu-export', {});
        });

        // Wait for export modal
        await expect(page.locator('.export-modal')).toBeVisible();

        // Click export button
        const exportButton = page.getByRole('button', { name: /Export as DOCX/i });
        await exportButton.click();

        // Should show error message
        await expect(page.getByText(/Error/i)).toBeVisible({ timeout: 5000 });

        // Modal should remain open on error
        await expect(page.locator('.export-modal')).toBeVisible();
    });

    test('should not show export option when no document is open', async ({ page }) => {
        await page.goto('/');

        // Try to trigger export without opening a document
        await page.evaluate(() => {
            (window as any).__TAURI_INTERNALS__.invoke('menu-export', {});
        });

        // Export modal should not appear
        await page.waitForTimeout(1000);
        await expect(page.locator('.export-modal')).not.toBeVisible();
    });
});

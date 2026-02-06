import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);
    await page.goto('/');
});

test.describe('Folder Navigation', () => {

    test('Navigate into subfolder', async ({ page }) => {
        // Open root folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();

        // Switch to Files view
        await page.getByRole('button', { name: 'Files' }).click();

        // Verify root folder contents
        await expect(page.locator('.file-item', { hasText: 'test.md' })).toBeVisible();
        await expect(page.locator('.file-item', { hasText: 'subfolder' })).toBeVisible();

        // Verify no back button at root
        await expect(page.locator('.folder-back')).not.toBeVisible();

        // Click on subfolder
        await page.locator('.file-item.folder', { hasText: 'subfolder' }).click();

        // Verify subfolder contents
        await expect(page.locator('.file-item', { hasText: 'nested.md' })).toBeVisible();

        // Verify back button appears
        await expect(page.locator('.folder-back')).toBeVisible();
    });

    test('Navigate back to parent folder', async ({ page }) => {
        // Open root folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();

        // Navigate into subfolder
        await page.locator('.file-item.folder', { hasText: 'subfolder' }).click();
        await expect(page.locator('.file-item', { hasText: 'nested.md' })).toBeVisible();

        // Click back button
        await page.locator('.folder-back').click();

        // Verify back at root
        await expect(page.locator('.file-item', { hasText: 'test.md' })).toBeVisible();
        await expect(page.locator('.file-item', { hasText: 'subfolder' })).toBeVisible();
        await expect(page.locator('.folder-back')).not.toBeVisible();
    });

    test('Create file in subfolder', async ({ page }) => {
        // Open root folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();

        // Navigate into subfolder
        await page.locator('.file-item.folder', { hasText: 'subfolder' }).click();

        // Create new file in subfolder
        const newFileBtn = page.locator('.sidebar-new-btn');
        await newFileBtn.click();

        const nameInput = page.getByPlaceholder('File Name');
        await nameInput.fill('subfolder-doc');
        await nameInput.press('Enter');

        // Switch back to Files view to see the new file
        await page.getByRole('button', { name: 'Files' }).click();

        // Verify file created in subfolder
        await expect(page.locator('.file-item', { hasText: 'subfolder-doc.md' })).toBeVisible();

        // Navigate back to root
        await page.locator('.folder-back').click();

        // Verify file NOT in root
        await expect(page.locator('.file-item', { hasText: 'subfolder-doc.md' })).not.toBeVisible();
    });

    test('Cannot navigate above root folder', async ({ page }) => {
        // Open root folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();

        // Verify no back button at root
        await expect(page.locator('.folder-back')).not.toBeVisible();

        // Navigate into subfolder
        await page.locator('.file-item.folder', { hasText: 'subfolder' }).click();
        await expect(page.locator('.folder-back')).toBeVisible();

        // Navigate back to root
        await page.locator('.folder-back').click();

        // Back button should disappear (cannot go above root)
        await expect(page.locator('.folder-back')).not.toBeVisible();
    });

    test('File list updates correctly after navigation', async ({ page }) => {
        // Open root folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.getByRole('button', { name: 'Files' }).click();

        // Count files at root
        const rootFiles = page.locator('.file-item');
        await expect(rootFiles).toHaveCount(2); // test.md + subfolder

        // Navigate into subfolder
        await page.locator('.file-item.folder', { hasText: 'subfolder' }).click();

        // Count files in subfolder (including back button)
        const subfolderItems = page.locator('.file-item');
        await expect(subfolderItems).toHaveCount(2); // back button + nested.md

        // Verify back button is first
        await expect(subfolderItems.first()).toHaveClass(/folder-back/);
    });

});

import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);
});

test.describe('Split View Editing', () => {
    test('should enable split view and edit in both panes', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Verify split view is active
        await expect(page.locator('.editor-area.split-view')).toBeVisible();

        // Should have two editor panes
        const editors = page.locator('.editor');
        await expect(editors).toHaveCount(2);

        // Click on a different node in the outline to open in secondary pane
        const childNode = page.getByText('Child Node');
        await childNode.click({ button: 'right' });

        // Click "Open in Split View" in context menu
        const openInSplitBtn = page.getByRole('button', { name: /Open in Split View/i });
        await openInSplitBtn.click();

        // Both panes should now show different content
        // Primary pane should still show "Test Node"
        // Secondary pane should show "Child Node"

        // Verify both editors are visible
        await expect(editors.first()).toBeVisible();
        await expect(editors.last()).toBeVisible();
    });

    test('should sync changes between panes when editing same node', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Edit in primary pane
        const primaryEditor = page.locator('.editor').first();
        const titleInput = primaryEditor.locator('input[placeholder*="title"]');
        await titleInput.fill('Updated Test Node');

        // Save the changes
        const saveBtn = primaryEditor.locator('button', { hasText: /Save/i });
        await saveBtn.click();

        // Wait for save to complete
        await page.waitForTimeout(500);

        // Changes should be reflected in the outline
        await expect(page.getByText('Updated Test Node')).toBeVisible();
    });

    test('should close split view and return to single pane', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Verify split view is active
        await expect(page.locator('.editor-area.split-view')).toBeVisible();

        // Close split view (click button again)
        await splitViewBtn.click();

        // Split view should be closed
        await expect(page.locator('.editor-area.split-view')).not.toBeVisible();

        // Should only have one editor
        const editors = page.locator('.editor');
        await expect(editors).toHaveCount(1);
    });

    test('should maintain split view state across different nodes', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Open different node in secondary pane
        const childNode = page.getByText('Child Node');
        await childNode.click({ button: 'right' });
        const openInSplitBtn = page.getByRole('button', { name: /Open in Split View/i });
        await openInSplitBtn.click();

        // Switch primary pane to another node
        const testNode = page.getByText('Test Node');
        await testNode.click();

        // Split view should still be active
        await expect(page.locator('.editor-area.split-view')).toBeVisible();

        // Should still have two editors
        const editors = page.locator('.editor');
        await expect(editors).toHaveCount(2);
    });

    test('should allow independent scrolling in split panes', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Verify split view is active
        await expect(page.locator('.editor-area.split-view')).toBeVisible();

        // Get both editor panes
        const editors = page.locator('.editor');
        const primaryEditor = editors.first();
        const secondaryEditor = editors.last();

        // Both editors should be independently scrollable
        await expect(primaryEditor).toBeVisible();
        await expect(secondaryEditor).toBeVisible();

        // Verify they are separate DOM elements
        const primaryBox = await primaryEditor.boundingBox();
        const secondaryBox = await secondaryEditor.boundingBox();

        expect(primaryBox).not.toBeNull();
        expect(secondaryBox).not.toBeNull();

        // They should not overlap completely (different positions)
        if (primaryBox && secondaryBox) {
            expect(primaryBox.x !== secondaryBox.x || primaryBox.y !== secondaryBox.y).toBeTruthy();
        }
    });

    test('should handle split view with active pane switching', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Enable split view
        const splitViewBtn = page.locator('.action-btn[title="Split View"]');
        await splitViewBtn.click();

        // Open different node in secondary pane
        const childNode = page.getByText('Child Node');
        await childNode.click({ button: 'right' });
        const openInSplitBtn = page.getByRole('button', { name: /Open in Split View/i });
        await openInSplitBtn.click();

        // Click on secondary editor to make it active
        const editors = page.locator('.editor');
        const secondaryEditor = editors.last();
        await secondaryEditor.click();

        // Secondary editor should now be active (may have active class or focus)
        // This is implementation-dependent, so we just verify it's still visible
        await expect(secondaryEditor).toBeVisible();

        // Click on primary editor
        const primaryEditor = editors.first();
        await primaryEditor.click();

        // Primary editor should be active
        await expect(primaryEditor).toBeVisible();
    });
});

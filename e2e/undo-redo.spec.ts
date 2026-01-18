import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);
});

test.describe('Undo/Redo Operations', () => {
    test('should undo and redo node additions', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Add a new node
        const addNodeBtn = page.locator('.action-btn[title="Add Node"]');
        await addNodeBtn.click();

        // Type in new node
        const newNodeInput = page.locator('.outline-node input[value=""]').first();
        await newNodeInput.fill('New Test Node');
        await newNodeInput.press('Enter');

        // Verify node was added
        await expect(page.getByText('New Test Node')).toBeVisible();

        // Undo the addition (Ctrl+Z)
        await page.keyboard.press('Control+z');

        // Wait a bit for undo to process
        await page.waitForTimeout(500);

        // New node should be gone
        await expect(page.getByText('New Test Node')).not.toBeVisible();

        // Redo the addition (Ctrl+Shift+Z or Ctrl+Y)
        await page.keyboard.press('Control+y');

        // Wait for redo to process
        await page.waitForTimeout(500);

        // New node should be back
        await expect(page.getByText('New Test Node')).toBeVisible();
    });

    test('should undo and redo node deletions', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Right-click on a node to open context menu
        const childNode = page.getByText('Child Node');
        await childNode.click({ button: 'right' });

        // Click delete in context menu
        const deleteBtn = page.getByRole('button', { name: /Delete/i });
        await deleteBtn.click();

        // Node should be deleted
        await expect(page.getByText('Child Node')).not.toBeVisible();

        // Undo deletion
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);

        // Node should be restored
        await expect(page.getByText('Child Node')).toBeVisible();

        // Redo deletion
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);

        // Node should be deleted again
        await expect(page.getByText('Child Node')).not.toBeVisible();
    });

    test('should undo and redo text edits', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Click on a node to edit
        const testNode = page.locator('.outline-node', { hasText: 'Test Node' }).first();
        const input = testNode.locator('input');

        // Get original text
        const originalText = await input.inputValue();

        // Edit the text
        await input.fill('Modified Test Node');
        await input.press('Enter');

        // Verify text changed
        await expect(page.getByText('Modified Test Node')).toBeVisible();

        // Undo the edit
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);

        // Text should be restored
        await expect(page.getByText(originalText)).toBeVisible();

        // Redo the edit
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);

        // Text should be modified again
        await expect(page.getByText('Modified Test Node')).toBeVisible();
    });

    test('should handle multiple undo operations in sequence', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Perform multiple operations
        const addNodeBtn = page.locator('.action-btn[title="Add Node"]');

        // Add first node
        await addNodeBtn.click();
        const firstInput = page.locator('.outline-node input[value=""]').first();
        await firstInput.fill('First Node');
        await firstInput.press('Enter');
        await page.waitForTimeout(300);

        // Add second node
        await addNodeBtn.click();
        const secondInput = page.locator('.outline-node input[value=""]').first();
        await secondInput.fill('Second Node');
        await secondInput.press('Enter');
        await page.waitForTimeout(300);

        // Add third node
        await addNodeBtn.click();
        const thirdInput = page.locator('.outline-node input[value=""]').first();
        await thirdInput.fill('Third Node');
        await thirdInput.press('Enter');
        await page.waitForTimeout(300);

        // Verify all nodes exist
        await expect(page.getByText('First Node')).toBeVisible();
        await expect(page.getByText('Second Node')).toBeVisible();
        await expect(page.getByText('Third Node')).toBeVisible();

        // Undo three times
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);
        await expect(page.getByText('Third Node')).not.toBeVisible();

        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);
        await expect(page.getByText('Second Node')).not.toBeVisible();

        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);
        await expect(page.getByText('First Node')).not.toBeVisible();

        // Redo all three
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);
        await expect(page.getByText('First Node')).toBeVisible();

        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);
        await expect(page.getByText('Second Node')).toBeVisible();

        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);
        await expect(page.getByText('Third Node')).toBeVisible();
    });

    test('should clear redo stack after new operation', async ({ page }) => {
        await page.goto('/');

        // Open folder and select file
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Wait for document to load
        await expect(page.getByText('Test Node')).toBeVisible();

        // Add a node
        const addNodeBtn = page.locator('.action-btn[title="Add Node"]');
        await addNodeBtn.click();
        const input = page.locator('.outline-node input[value=""]').first();
        await input.fill('Temporary Node');
        await input.press('Enter');
        await page.waitForTimeout(300);

        // Undo
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(500);
        await expect(page.getByText('Temporary Node')).not.toBeVisible();

        // Perform a new operation (this should clear redo stack)
        await addNodeBtn.click();
        const newInput = page.locator('.outline-node input[value=""]').first();
        await newInput.fill('New Node');
        await newInput.press('Enter');
        await page.waitForTimeout(300);

        // Try to redo - should not bring back "Temporary Node"
        await page.keyboard.press('Control+y');
        await page.waitForTimeout(500);

        // "Temporary Node" should still not be visible
        await expect(page.getByText('Temporary Node')).not.toBeVisible();
        // "New Node" should still be visible
        await expect(page.getByText('New Node')).toBeVisible();
    });
});

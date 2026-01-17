import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    await mockTauri(page);
    await page.goto('/');
});

test.afterEach(async ({ page }) => {
    // Optional: screenshot on failure handles by playwright config usually
});

test.describe('Functional Tests', () => {

    test('File Management Flow', async ({ page }) => {
        // 1. Initial State: Welcome Screen
        await expect(page.getByText('Open Folder to Start')).toBeVisible();

        // 2. Open Folder (Mocked)
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();

        // 3. Verify Sidebar opens and shows file list
        const sidebar = page.locator('.sidebar');
        await expect(sidebar).toBeVisible();
        await expect(page.locator('.file-item', { hasText: 'test.md' })).toBeVisible();

        // 4. Create New File
        // Use specific class to avoid conflict with welcome screen
        const newFileBtn = page.locator('.sidebar-new-btn');
        await newFileBtn.click();

        // 5. Enter File Name
        const nameInput = page.getByPlaceholder('File Name');
        await expect(nameInput).toBeVisible();
        await nameInput.fill('new-doc');
        await nameInput.press('Enter');

        // Confirm form submitted and input hidden
        await expect(nameInput).not.toBeVisible();

        // 6. Verify New File appears
        // Creating a file automatically opens it and switches to Outline view.
        // We need to switch back to Files view to see the file list.
        await page.getByRole('button', { name: 'Files' }).click();

        await expect(page.locator('.file-item', { hasText: 'new-doc.md' })).toBeVisible();
    });

    test('Outline & Search Flow', async ({ page }) => {
        // Open Folder
        await page.getByRole('button', { name: 'Open Folder to Start' }).click();

        // Select 'test.md'
        await page.locator('.file-item', { hasText: 'test.md' }).click();

        // Should automatically switch to Outline view
        await expect(page.getByText('Test Node')).toBeVisible();
        await expect(page.getByText('Child Node')).toBeVisible();

        // Search Test
        // Find search input
        const searchInput = page.getByPlaceholder('Search outline...');
        await expect(searchInput).toBeVisible();

        // Type 'Child'
        await searchInput.fill('Child');

        // 'Child Node' should be visible
        // Use regex for exact content matching to avoid parent nodes
        const childNodeText = page.locator('.sidebar-outline-text', { hasText: /^Child Node$/ });
        await expect(childNodeText).toBeVisible();

        // 'Test Node' (parent) should be visible (context)
        await expect(page.locator('.sidebar-outline-text', { hasText: /^Test Node$/ })).toBeVisible();

        // Check for Highlight class
        // Directly find the highlighted element and verify its content
        const matchedItem = page.locator('li.sidebar-outline-node.search-match');
        await expect(matchedItem).toBeVisible();
        await expect(matchedItem).toContainText('Child Node');
    });

});

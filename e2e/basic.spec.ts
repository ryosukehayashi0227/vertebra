import { test, expect } from '@playwright/test';

test.describe('Welcome Screen', () => {
    test('should display welcome message with workflow steps', async ({ page }) => {
        await page.goto('/');

        // Check for app title
        await expect(page.getByRole('heading', { name: 'Vertebra' })).toBeVisible();

        // Check for workflow steps (use .step-text to avoid button text conflicts)
        const stepTexts = page.locator('.step-text');
        await expect(stepTexts.filter({ hasText: 'Open Folder' })).toBeVisible();
        await expect(stepTexts.filter({ hasText: 'Select or Create File' })).toBeVisible();
        await expect(stepTexts.filter({ hasText: 'Edit Outline' })).toBeVisible();

        // Check for main CTA button
        await expect(page.getByRole('button', { name: 'Open Folder to Start' })).toBeVisible();
    });

    test('should have visible sidebar with view selector', async ({ page }) => {
        await page.goto('/');

        // Sidebar should be visible
        const sidebar = page.locator('.sidebar');
        await expect(sidebar).toBeVisible();

        // Should show either view selector or empty state
        const hasViewSelector = await page.locator('.view-selector').count() > 0;
        const hasSidebarEmpty = await page.locator('.sidebar-empty').count() > 0;
        expect(hasViewSelector || hasSidebarEmpty).toBeTruthy();
    });
});

test.describe('Sidebar Navigation', () => {
    test('should show open folder button in sidebar when no folder selected', async ({ page }) => {
        await page.goto('/');

        // Look for open folder button in sidebar
        // Note: Use exact: true to distinguish from "Open Folder to Start" in main area
        const openFolderBtn = page.locator('.sidebar .open-folder-sidebar-btn');
        await expect(openFolderBtn).toBeVisible();
    });

    test('should have collapsible sidebar', async ({ page }) => {
        await page.goto('/');

        // Find collapse button
        const collapseBtn = page.getByRole('button', { name: '◀' });
        await expect(collapseBtn).toBeVisible();

        // Click to collapse
        await collapseBtn.click();

        // Sidebar should now be collapsed
        const sidebar = page.locator('.sidebar');
        await expect(sidebar).toHaveClass(/collapsed/);

        // Expand button should now show
        const expandBtn = page.getByRole('button', { name: '▶' });
        await expect(expandBtn).toBeVisible();
    });
});

test.describe('UI Elements', () => {
    test('should have proper layout structure', async ({ page }) => {
        await page.goto('/');

        // Check main layout elements
        await expect(page.locator('.app-container')).toBeVisible();
        await expect(page.locator('.sidebar')).toBeVisible();
        await expect(page.locator('.main-content')).toBeVisible();
    });

    test('should display step indicators with correct styling', async ({ page }) => {
        await page.goto('/');

        // Check for workflow step elements
        const currentStep = page.locator('.workflow-step.current');
        await expect(currentStep).toBeVisible();

        // Current step should have step number "1"
        await expect(currentStep.locator('.step-number')).toContainText('1');
    });
});

test.describe('Keyboard Navigation', () => {
    test('should respond to keyboard shortcuts', async ({ page }) => {
        await page.goto('/');

        // Press Ctrl+S (save shortcut) - should not cause errors even with no file
        await page.keyboard.press('Control+s');

        // App should still be responsive
        await expect(page.locator('.app-container')).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should work on smaller screens', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        await page.goto('/');

        // App should still be usable
        await expect(page.locator('.app-container')).toBeVisible();
        await expect(page.locator('.sidebar')).toBeVisible();
    });

    test('should work on larger screens', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        // App should fill available space
        await expect(page.locator('.app-container')).toBeVisible();
    });
});

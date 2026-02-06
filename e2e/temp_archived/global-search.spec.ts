import { test, expect } from '@playwright/test';
import { mockTauri } from './mocks/tauri';

test.describe('Global Search', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        await mockTauri(page);
        await page.goto('/');
    });

    test('opens search modal with shortcut', async ({ page }) => {
        // Trigger Cmd+Shift+F or Ctrl+Shift+F
        await page.keyboard.press('Meta+Shift+F');
        await page.waitForTimeout(500); // Wait a bit
        if (await page.locator('.search-modal').count() === 0) {
            console.log('Retrying with Control+Shift+F');
            await page.keyboard.press('Control+Shift+F');
        }

        const modal = page.locator('.search-modal');
        await expect(modal).toBeVisible();
        const input = page.locator('.search-input');
        await expect(input).toBeFocused();
    });

    test('closes modal with Escape', async ({ page }) => {
        await page.goto('/');
        await page.keyboard.press('Meta+Shift+F');
        await expect(page.locator('.search-modal')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('.search-modal')).not.toBeVisible();
    });
});

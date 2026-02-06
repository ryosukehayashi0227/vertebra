import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testIgnore: ['**/temp_archived/**'],
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
        baseURL: 'http://localhost:1420', // Tauri default dev port
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev', // Use Vite dev server for fast UI testing
        port: 1420,
        reuseExistingServer: !process.env.CI,
    },
});

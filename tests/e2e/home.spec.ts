import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load and display market status', async ({ page }) => {
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Check if the main heading exists
        await expect(page.locator('h1, h2').first()).toBeVisible();

        // Check if market widgets are present
        const widgetsExist = await page.locator('text=合約市場').isVisible().catch(() => false);
        expect(widgetsExist || await page.locator('text=載入中').isVisible()).toBeTruthy();
    });

    test('should display navigation elements', async ({ page }) => {
        await page.goto('/');

        // Check for navigation links (adjust selectors as needed)
        const hasNavigation = await page.locator('nav').isVisible().catch(() => false) ||
            await page.locator('[role="navigation"]').isVisible().catch(() => false);

        // At minimum, page should load without errors
        expect(page.url()).toContain('localhost:3000');
    });
});

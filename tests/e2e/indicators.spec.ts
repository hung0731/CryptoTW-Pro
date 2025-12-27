import { test, expect } from '@playwright/test';

test.describe('Indicators Page', () => {
    test('should load fear & greed indicator', async ({ page }) => {
        await page.goto('/indicators/fear-greed');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Check if page loaded successfully
        expect(page.url()).toContain('/indicators/fear-greed');

        // Look for chart or data visualization elements
        const hasChart = await page.locator('canvas, svg').first().isVisible({ timeout: 5000 }).catch(() => false);
        const hasContent = await page.locator('text=恐懼').isVisible().catch(() => false) ||
            await page.locator('text=貪婪').isVisible().catch(() => false);

        expect(hasChart || hasContent).toBeTruthy();
    });

    test('should display indicator explanation', async ({ page }) => {
        await page.goto('/indicators/funding-rate');

        await page.waitForLoadState('networkidle');

        // Page should load
        expect(page.url()).toContain('/indicators/funding-rate');

        // Should have some content (chart or text)
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).toBeTruthy();
        expect(bodyText!.length).toBeGreaterThan(100);
    });
});

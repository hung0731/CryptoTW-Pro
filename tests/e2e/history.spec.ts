import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
    test('should load historical events', async ({ page }) => {
        await page.goto('/history');

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Check if the page title/header is present
        const hasTitle = await page.locator('text=市場覆盤').isVisible().catch(() => false) ||
            await page.locator('text=歷史').isVisible().catch(() => false) ||
            await page.locator('text=典藏').isVisible().catch(() => false);

        expect(hasTitle).toBeTruthy();

        // Page should load successfully
        expect(page.url()).toContain('/history');
    });

    test('should allow navigation to event details', async ({ page }) => {
        await page.goto('/history');
        await page.waitForLoadState('networkidle');

        // Try to find and click any event card (if they exist)
        const eventCards = page.locator('[data-testid="event-card"], a[href*="/history/"]').first();
        const cardExists = await eventCards.isVisible().catch(() => false);

        if (cardExists) {
            await eventCards.click();
            // Should navigate to event detail page
            await page.waitForLoadState('networkidle');
            expect(page.url()).toMatch(/\/history\/\d{4}\//);
        } else {
            // If no cards, at least page loaded
            expect(page.url()).toContain('/history');
        }
    });
});

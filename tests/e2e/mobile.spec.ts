import { expect, test } from '@playwright/test';

test.describe('mobile', () => {
  test('menu opens as a native popover and navigates', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.site-header__nav')).toBeHidden();
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-nav');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'FAQ' }).click();
    await expect(page).toHaveURL(/\/en\/faq\/$/);
  });

  test('emergency call button stays visible in the sticky header', async ({ page }) => {
    await page.goto('/');
    const emergency = page.locator('[data-emergency-link]');
    await expect(emergency).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(emergency).toBeInViewport();
  });

  test('no horizontal scrolling on any key page', async ({ page }) => {
    for (const path of ['/', '/en/', '/start-a-case/', '/services/raid-nas-server-recovery/', '/contact/']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('touch targets in the header are at least 44px', async ({ page }) => {
    await page.goto('/');
    for (const selector of ['[data-emergency-link]', '.mobile-nav__open', '.site-header__logo']) {
      const box = await page.locator(selector).first().boundingBox();
      expect(box?.height ?? 0, selector).toBeGreaterThanOrEqual(44);
    }
  });
});

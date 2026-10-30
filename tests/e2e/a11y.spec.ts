import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, localized } from './pages';

/**
 * axe-core WCAG 2.2 AA checks on every page, in both languages and both
 * themes. Any violation fails the build.
 */
for (const lang of ['ar', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`${lang} · ${theme}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('recovik-theme', value), theme);
        await page.emulateMedia({ reducedMotion: 'reduce' });
      });

      for (const path of PAGES) {
        const url = localized(path, lang);
        test(`${url} has no accessibility violations`, async ({ page }) => {
          await page.goto(url);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const summary = results.violations.map(
            (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
          );
          expect(summary).toEqual([]);
        });
      }
    });
  }
}

test('keyboard users can skip to the main content', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

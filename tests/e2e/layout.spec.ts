import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { extractUnitsInPage, findDuplicates } from '../../scripts/lib/content-audit.mjs';

const WIDTHS = [375, 768, 1280, 1366, 1440, 1536, 1920];
const KEY_PAGES = [
  '/',
  '/services/',
  '/services/ransomware-recovery/',
  '/process/',
  '/sectors/',
  '/start-a-case/',
  '/contact/',
];

test.describe('layout at every width', () => {
  for (const lang of ['ar', 'en'] as const) {
    test(`no horizontal overflow (${lang})`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of KEY_PAGES) {
          await page.goto(lang === 'ar' ? path : `/en${path}`);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow, `${lang} ${path} @ ${width}px`).toBeLessThanOrEqual(0);
        }
      }
    });
  }

  test('content uses most of a 1366px laptop screen', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/en/');
    const width = await page
      .locator('main .container')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return el.clientWidth - parseFloat(style.paddingInlineStart) - parseFloat(style.paddingInlineEnd);
      });
    expect(width / 1366).toBeGreaterThan(0.9);
  });

  test('headings are not capped to a narrow measure', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    for (const path of [
      '/en/services/ransomware-recovery/',
      '/services/ransomware-recovery/',
      '/en/process/',
    ]) {
      await page.goto(path);
      const maxWidth = await page.locator('h1').evaluate((el) => getComputedStyle(el).maxInlineSize);
      expect(maxWidth, path).toBe('none');
    }
  });
});

test.describe('header', () => {
  test('compacts after scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/en/');
    const header = page.locator('[data-header]');
    await expect(header).not.toHaveAttribute('data-scrolled', '');
    await page.mouse.wheel(0, 600);
    await expect(header).toHaveAttribute('data-scrolled', '');
  });

  test('services menu lists every service with a description', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/en/');
    const menu = page.locator('#services-menu');
    await expect(menu).toBeHidden();
    await page.getByRole('button', { name: 'Show services' }).click();
    await expect(menu).toBeVisible();
    await expect(menu.locator('.mega__item')).toHaveCount(6);
    await expect(menu.locator('.mega__desc').first()).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('incident action is visible at every width', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.locator('[data-emergency-link]'), `${width}px`).toBeVisible();
    }
  });
});

test.describe('brand', () => {
  test('Arabic pages show the bilingual lockup and both names in the title', async ({ page }) => {
    for (const path of ['/', '/services/', '/contact/']) {
      await page.goto(path);
      const logo = page.locator('.site-header__logo [data-logo]');
      await expect(logo).toHaveAttribute('data-logo', 'bilingual');
      await expect(logo).toContainText('ريكوفِك');
      await expect(logo).toContainText('Recovik');
      await expect(page).toHaveTitle(/ريكوفِك/);
      await expect(page).toHaveTitle(/Recovik/);
    }
  });

  test('English pages use the Latin lockup in the header', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.site-header__logo [data-logo]')).toHaveAttribute('data-logo', 'latin');
    await expect(page.locator('.site-header__logo [data-logo]')).not.toContainText('ريكوفِك');
  });

  test('JSON-LD carries both names', async ({ page }) => {
    await page.goto('/');
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json ?? '[]') as { name?: string; alternateName?: string }[];
    expect(data[0]?.name).toBe('ريكوفِك');
    expect(data[0]?.alternateName).toBe('Recovik');
  });
});

test.describe('content', () => {
  test('no headline or sentence is repeated across pages', async ({ page }) => {
    const sitemap = readFileSync('dist/client/sitemap-0.xml', 'utf8');
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '').pathname);
    const pages = [];
    for (const path of paths) {
      await page.goto(path);
      pages.push({
        url: path,
        lang: path.startsWith('/en/') ? 'en' : 'ar',
        units: await page.evaluate(extractUnitsInPage),
      });
    }
    const { exact, near } = findDuplicates(pages);
    expect([...exact, ...near]).toEqual([]);
  });

  test('no hardware-repair language remains', async ({ page }) => {
    const banned =
      /hard drive repair|clean room|clean-room|platter|write-blocker|clicking|water damage|غرفة نظيفة|أسطح القرص|صوت نقر/i;
    for (const path of [
      '/',
      '/en/',
      '/services/',
      '/en/services/',
      '/process/',
      '/en/process/',
      '/about/',
      '/en/about/',
    ]) {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      expect(text, path).not.toMatch(banned);
    }
  });
});

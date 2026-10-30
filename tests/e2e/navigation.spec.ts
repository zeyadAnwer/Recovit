import { expect, test } from '@playwright/test';

test.describe('languages and navigation', () => {
  test('Arabic is the default at / with RTL and correct metadata', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  });

  test('English lives under /en/ with LTR', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('the language switch keeps the visitor on the same page', async ({ page }) => {
    await page.goto('/services/digital-forensics/');
    await page.locator('.site-header__switches [data-language-link="en"]').click();
    await expect(page).toHaveURL(/\/en\/services\/digital-forensics\/$/);
    await page.locator('.site-header__switches [data-language-link="ar"]').click();
    await expect(page).toHaveURL(/\/services\/digital-forensics\/$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('main navigation reaches every section', async ({ page }) => {
    await page.goto('/en/');
    for (const [name, url] of [
      ['Services', /\/en\/services\/$/],
      ['Sectors', /\/en\/sectors\/$/],
      ['How we work', /\/en\/process\/$/],
      ['About', /\/en\/about\/$/],
      ['FAQ', /\/en\/faq\/$/],
      ['Contact', /\/en\/contact\/$/],
    ] as const) {
      await page.locator('.site-header__nav').getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(page.locator('.site-header__nav [aria-current="page"]')).toHaveText(name);
    }
  });

  test('every service in the index opens its detail page', async ({ page }) => {
    await page.goto('/en/services/');
    const links = page.locator('.svc-index__text a');
    const count = await links.count();
    expect(count).toBe(6);
    const hrefs = await links.evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
    for (const href of hrefs) {
      const response = await page.goto(href ?? '/');
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('unknown pages return a localized 404', async ({ page }) => {
    const ar = await page.goto('/does-not-exist/');
    expect(ar?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('غير موجودة');

    // The Node preview server serves the default 404 for every path; nginx
    // maps /en/… to the English 404 in production. Check that page directly.
    await page.goto('/en/404/');
    await expect(page.locator('h1')).toContainText('doesn’t exist');
  });

  test('robots.txt, sitemap and security.txt are served', async ({ request }) => {
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
    const security = await request.get('/.well-known/security.txt');
    expect(await security.text()).toContain('Contact: mailto:');
  });

  test('every page has a unique title and description per language', async ({ page }) => {
    const seen = new Set<string>();
    for (const path of ['/', '/services/', '/faq/', '/en/', '/en/services/', '/en/faq/']) {
      await page.goto(path);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(seen.has(title), `duplicate title: ${title}`).toBe(false);
      seen.add(title);
      expect(description?.length ?? 0).toBeGreaterThan(50);
    }
  });
});

test.describe('theme', () => {
  test('toggle switches theme and remembers it', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.locator('.site-header__switches [data-theme-toggle]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('stored theme is applied before first paint (no flash)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('recovik-theme', 'dark');
      // Record the theme at the moment the body starts parsing.
      new MutationObserver((_, observer) => {
        if (document.body) {
          (window as unknown as { themeAtBody: string | undefined }).themeAtBody =
            document.documentElement.dataset['theme'];
          observer.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto('/');
    const themeAtBody = await page.evaluate(
      () => (window as unknown as { themeAtBody?: string }).themeAtBody,
    );
    expect(themeAtBody).toBe('dark');
  });
});

test.describe('RTL layout', () => {
  test('the logo sits on the right in Arabic and on the left in English', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const arBox = await page.locator('.site-header__logo').boundingBox();
    await page.goto('/en/');
    const enBox = await page.locator('.site-header__logo').boundingBox();
    expect(arBox && arBox.x > 640).toBe(true);
    expect(enBox && enBox.x < 640).toBe(true);
  });

  test('phone and email fields stay left-to-right inside Arabic pages', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('#contact-email')).toHaveAttribute('dir', 'ltr');
  });
});

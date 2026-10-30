import { expect, test, type Page } from '@playwright/test';

const CASE_REF = /^RCV-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

async function fillContactStep(page: Page) {
  await page.locator('#case-name').fill('Sara Ahmed');
  await page.locator('#case-phone').fill('+966 50 123 4567');
  await page.locator('#case-email').fill('sara@example.com');
  await page.locator('label[for="case-contactMethod-whatsapp"]').click();
  await page.locator('#case-consent').check();
}

test.describe('case form (JavaScript)', () => {
  test('walks through all steps, validates, reviews and submits', async ({ page }) => {
    await page.goto('/en/start-a-case/');
    const next = page.locator('[data-step-next]');
    const step = (i: number) => page.locator(`[data-step="${i}"]`);

    // Only the first step is visible.
    await expect(step(0)).toBeVisible();
    await expect(step(1)).toBeHidden();
    await expect(page.locator('[data-progress-item="0"]')).toHaveAttribute('aria-current', 'step');

    // Validation blocks moving on without a choice.
    await next.click();
    await expect(page.locator('[data-error-for="systemType"]')).toHaveText('Choose one of the options.');
    await expect(step(1)).toBeHidden();

    await page.locator('label[for="case-systemType-databases"]').click();
    await page.locator('#case-systemDetails').fill('SQL Server 2019');
    await next.click();

    await expect(step(1)).toBeVisible();
    await page.locator('label[for="case-incident-ransomware"]').click();
    await page.locator('#case-details').fill('Files renamed to .locked and a ransom note on the server.');
    await next.click();

    await page.locator('label[for="case-urgency-priority"]').click();
    await next.click();

    // Invalid email is caught on the contact step.
    await fillContactStep(page);
    await page.locator('#case-email').fill('not-an-email');
    await next.click();
    await expect(page.locator('#case-email')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#case-email').fill('sara@example.com');
    await next.click();

    // Review shows what was entered, as text.
    const review = page.locator('[data-review]');
    await expect(review).toContainText('Databases');
    await expect(review).toContainText('SQL Server 2019');
    await expect(review).toContainText('sara@example.com');

    // Going back keeps answers.
    await page.locator('[data-step-back]').click();
    await expect(page.locator('#case-name')).toHaveValue('Sara Ahmed');
    await next.click();

    await page.locator('[data-submit]').click();
    const receipt = page.locator('[data-receipt]');
    await expect(receipt).toBeVisible();
    await expect(receipt.locator('[data-receipt-title]')).toBeFocused();
    await expect(page.locator('[data-case-ref]')).toHaveText(CASE_REF);
  });

  test('works in Arabic too', async ({ page }) => {
    await page.goto('/start-a-case/');
    await page.locator('[data-step-next]').click();
    await expect(page.locator('[data-error-for="systemType"]')).toHaveText('اختر أحد الخيارات.');
  });
});

test.describe('case form (no JavaScript)', () => {
  test.use({ javaScriptEnabled: false });

  test('shows every step and submits to the receipt page', async ({ page }) => {
    await page.goto('/en/start-a-case/');
    for (let i = 0; i < 5; i += 1) await expect(page.locator(`[data-step="${i}"]`)).toBeVisible();

    await page.locator('label[for="case-systemType-cloud"]').click();
    await page.locator('label[for="case-incident-deleted"]').click();
    await page.locator('#case-details').fill('A departing employee deleted shared folders in OneDrive.');
    await page.locator('label[for="case-urgency-emergency"]').click();
    await fillContactStep(page);
    await page.locator('[data-submit]').click();

    await expect(page).toHaveURL(/\/en\/start-a-case\/sent\//);
    await expect(page.locator('[data-case-ref]')).toHaveText(CASE_REF);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('a direct visit to the receipt page redirects back to the form', async ({ page }) => {
    await page.goto('/start-a-case/sent/');
    await expect(page).toHaveURL(/\/start-a-case\/$/);
  });
});

test.describe('contact form', () => {
  test('sends a message in place', async ({ page }) => {
    await page.goto('/en/contact/');
    await page.locator('[data-submit]').click();
    await expect(page.locator('[data-error-for="name"]')).toHaveText('This field is required.');

    await page.locator('#contact-name').fill('Omar');
    await page.locator('#contact-email').fill('omar@example.com');
    await page.locator('#contact-subject').fill('Backup review before an audit');
    await page.locator('#contact-message').fill('We would like a review of our backups and admin access.');
    await page.locator('#contact-consent').check();
    await page.locator('[data-submit]').click();
    await expect(page.locator('[data-receipt]')).toBeVisible();
  });
});

test.describe('server-side protections', () => {
  test('rejects invalid input with field codes, never echoing values', async ({ request }) => {
    const response = await request.post('/_actions/submitCase/', {
      multipart: { name: '<b>x</b>', email: 'nope', consent: 'on' },
      headers: { Origin: 'http://localhost:4400' },
    });
    expect(response.status()).toBe(400);
    const body = await response.text();
    expect(body).not.toContain('<b>x</b>');
    expect(body).toContain('email');
  });

  test('rejects cross-site posts', async ({ request }) => {
    const response = await request.post('/_actions/submitCase/', {
      multipart: { name: 'x' },
      headers: { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' },
    });
    expect(response.status()).toBe(403);
  });

  test('server responses carry security headers', async ({ request }) => {
    const response = await request.get('/start-a-case/sent/', { maxRedirects: 0 });
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['strict-transport-security']).toContain('max-age=');
  });
});

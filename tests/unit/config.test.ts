import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { enabledItems, filled, site } from '../../src/config';
import { isPlaceholder, phoneSchema, siteConfigSchema } from '../../src/config/schema';
import { siteConfig } from '../../src/config/site.config';

const CONTENT = join(process.cwd(), 'src/content');

describe('site.config.ts', () => {
  it('passes its zod schema', () => {
    expect(siteConfigSchema.safeParse(siteConfig).success).toBe(true);
  });

  it('has every phone either well-formed (E.164) or an explicit placeholder', () => {
    for (const phone of [site.phones.main, site.phones.emergency, site.whatsapp]) {
      expect(isPlaceholder(phone) || phoneSchema.safeParse(phone).success, phone).toBe(true);
    }
  });

  it('has well-formed emails on the site domain', () => {
    for (const email of [...Object.values(site.emails), site.securityContact]) {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/);
    }
  });

  it('routes form submissions to existing mailboxes', () => {
    expect(site.emails[site.formRecipients.cases]).toBeTruthy();
    expect(site.emails[site.formRecipients.messages]).toBeTruthy();
  });

  it('rejects malformed values with a readable message', () => {
    const broken = { ...siteConfig, phones: { ...siteConfig.phones, main: '0500 000' } };
    const result = siteConfigSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['phones', 'main']);
  });

  it('rejects duplicate service slugs', () => {
    const first = siteConfig.services[0];
    const broken = { ...siteConfig, services: [...siteConfig.services, first] };
    expect(siteConfigSchema.safeParse(broken).success).toBe(false);
  });

  for (const collection of ['services', 'sectors'] as const) {
    it(`has AR and EN content for every enabled ${collection} slug`, () => {
      for (const item of enabledItems(site[collection])) {
        for (const locale of site.languages.supported) {
          const file = join(CONTENT, collection, locale, `${item.slug}.md`);
          expect(existsSync(file), `missing ${file}`).toBe(true);
        }
      }
    });
  }

  it('has the same FAQ and legal entries in every language', () => {
    for (const collection of ['faq', 'legal']) {
      const [first, ...others] = site.languages.supported.map((locale) =>
        readdirSync(join(CONTENT, collection, locale)).sort(),
      );
      for (const list of others) expect(list).toEqual(first);
    }
  });
});

describe('filled()', () => {
  it('hides placeholders and empty values', () => {
    expect(filled('[PHONE_MAIN]')).toBeUndefined();
    expect(filled('')).toBeUndefined();
    expect(filled('  ')).toBeUndefined();
    expect(filled('+966500000000')).toBe('+966500000000');
  });
});

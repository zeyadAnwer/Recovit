import { describe, expect, it } from 'vitest';
import { site } from '../../src/config';
import { assertContentCoverage, MissingContentError, parseEntryId } from '../../src/lib/content-integrity';
import { formatPhone, socialLinks, telHref, whatsappHref } from '../../src/lib/contact';
import { faqJsonLd, organizationJsonLd, serializeJsonLd } from '../../src/lib/seo';
import { progressFor } from '../../src/scripts/reveal-math';

describe('content coverage', () => {
  it('passes when every slug exists in every locale', () => {
    expect(() => assertContentCoverage('services', ['a'], ['ar/a', 'en/a'], ['ar', 'en'])).not.toThrow();
  });

  it('fails with the exact files to create', () => {
    expect(() =>
      assertContentCoverage('services', ['a', 'b'], ['ar/a', 'en/a', 'ar/b'], ['ar', 'en']),
    ).toThrow(MissingContentError);
    try {
      assertContentCoverage('services', ['b'], ['ar/b'], ['ar', 'en']);
    } catch (error) {
      expect((error as Error).message).toContain('src/content/services/en/b.md');
    }
  });

  it('parses entry ids', () => {
    expect(parseEntryId('en/ssd-recovery')).toEqual({ locale: 'en', slug: 'ssd-recovery' });
  });
});

describe('contact helpers', () => {
  it('build links only for real values', () => {
    expect(telHref('[PHONE_MAIN]')).toBeUndefined();
    expect(telHref('+966500000000')).toBe('tel:+966500000000');
    expect(whatsappHref('+966 50 000 0000')).toBe('https://wa.me/966500000000');
    expect(formatPhone('+966500000000')).toBe('+966 50 000 0000');
  });

  it('lists only filled social profiles', () => {
    expect(
      socialLinks({ linkedin: 'https://linkedin.com/x', x: '', instagram: '', facebook: '', youtube: '' }),
    ).toEqual([{ network: 'linkedin', url: 'https://linkedin.com/x', label: 'LinkedIn' }]);
  });
});

describe('JSON-LD', () => {
  it('never publishes placeholder values', () => {
    const json = JSON.stringify(organizationJsonLd('en', 'https://recovik.com/'));
    expect(json).not.toMatch(/\[[A-Z_]+\]/);
    expect(json).toContain(site.emails.info);
  });

  it('escapes "<" so content cannot close the script element', () => {
    const out = serializeJsonLd(faqJsonLd([{ question: '</script><script>x', answer: 'a' }]));
    expect(out).not.toContain('</script>');
  });
});

describe('process progress line', () => {
  it('maps scroll position to 0–1', () => {
    expect(progressFor({ top: 1000, height: 400 }, 800)).toBe(0);
    expect(progressFor({ top: 400, height: 400 }, 800)).toBe(0.5);
    expect(progressFor({ top: -500, height: 400 }, 800)).toBe(1);
  });
});

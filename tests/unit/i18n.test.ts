import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ar } from '../../src/i18n/ar';
import { en } from '../../src/i18n/en';
import { localizePath, stripLocale, switchLocalePath, toLocale } from '../../src/i18n';

/** Collects the key paths of a nested dictionary (arrays by index). */
function shape(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [`${prefix}()`];
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) => shape(child, prefix ? `${prefix}.${key}` : key));
}

describe('dictionaries', () => {
  it('have exactly the same keys in Arabic and English', () => {
    const arKeys = shape(ar).filter((key) => !/\.\d+(\.|$)/.test(key));
    const enKeys = shape(en).filter((key) => !/\.\d+(\.|$)/.test(key));
    expect(enKeys).toEqual(arKeys);
  });

  it('have no empty strings', () => {
    for (const dict of [ar, en]) {
      const strings = JSON.stringify(dict);
      expect(strings).not.toContain('""');
    }
  });
});

describe('localized paths', () => {
  it('keeps the default language at the root', () => {
    expect(localizePath('/services/', 'ar')).toBe('/services/');
    expect(localizePath('/', 'ar')).toBe('/');
  });

  it('prefixes other languages', () => {
    expect(localizePath('/services/', 'en')).toBe('/en/services/');
    expect(localizePath('/', 'en')).toBe('/en/');
  });

  it('strips and switches locale prefixes while keeping the page', () => {
    expect(stripLocale('/en/services/ssd-recovery/')).toBe('/services/ssd-recovery/');
    expect(stripLocale('/services/')).toBe('/services/');
    expect(switchLocalePath('/en/faq/', 'ar')).toBe('/faq/');
    expect(switchLocalePath('/faq/', 'en')).toBe('/en/faq/');
    expect(switchLocalePath('/en/', 'ar')).toBe('/');
  });

  it('falls back to the default locale for unknown values', () => {
    expect(toLocale('fr')).toBe('ar');
    expect(toLocale(undefined)).toBe('ar');
    expect(toLocale('en')).toBe('en');
  });
});

describe('copywriting rules', () => {
  const BANNED = [
    /\bunlock/i,
    /\bseamless/i,
    /cutting-edge/i,
    /revolutionary/i,
    /world-class/i,
    /state-of-the-art/i,
    /\bempower/i,
    /\bleverage/i,
    /in today's digital world/i,
    /100\s?%/,
    /حلول متكاملة ومبتكرة/,
    /نسعى جاهدين/,
    /في عالم اليوم الرقمي/,
  ];

  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
    );

  it('never uses banned phrases in dictionaries or content', () => {
    const sources = [
      JSON.stringify(ar),
      JSON.stringify(en),
      ...files(join(process.cwd(), 'src/content')).map((file) => readFileSync(file, 'utf8')),
    ];
    for (const source of sources) {
      for (const pattern of BANNED) expect(source).not.toMatch(pattern);
    }
  });
});

import { site } from '../config';

export type Locale = (typeof site.languages.supported)[number];

export const LOCALES: readonly Locale[] = site.languages.supported;
export const DEFAULT_LOCALE: Locale = site.languages.default;

/** Per-locale facts the layout needs. Adding a locale = one entry here. */
export const LOCALE_META = {
  ar: { dir: 'rtl', htmlLang: 'ar', ogLocale: 'ar_AR', label: 'العربية' },
  en: { dir: 'ltr', htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
} as const satisfies Record<
  Locale,
  { dir: 'rtl' | 'ltr'; htmlLang: string; ogLocale: string; label: string }
>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

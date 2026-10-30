/**
 * i18n helpers: dictionaries, localized paths and text direction.
 * Components call `useI18n(Astro.currentLocale)` and never branch on a
 * specific language themselves.
 */
import { ar } from './ar';
import { en } from './en';
import { DEFAULT_LOCALE, LOCALE_META, LOCALES, isLocale, type Locale } from './locales';
import type { Dictionary } from './types';

export { DEFAULT_LOCALE, LOCALE_META, LOCALES, isLocale, type Locale, type Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ar, en };

/** Every internal route, written once. Paths always end with a slash. */
export const routes = {
  home: '/',
  services: '/services/',
  service: (slug: string) => `/services/${slug}/`,
  sectors: '/sectors/',
  sector: (slug: string) => `/sectors/#${slug}`,
  process: '/process/',
  about: '/about/',
  faq: '/faq/',
  startCase: '/start-a-case/',
  caseSent: '/start-a-case/sent/',
  contact: '/contact/',
  contactSent: '/contact/sent/',
  privacy: '/privacy/',
  terms: '/terms/',
} as const;

export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Adds the locale prefix (none for the default locale). */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}

/** Removes any locale prefix: "/en/services/" → "/services/". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (first && isLocale(first) && first !== DEFAULT_LOCALE) {
    return `/${rest.join('/')}`;
  }
  return pathname || '/';
}

/** Same page in another language — used by the language switch and hreflang. */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localizePath(stripLocale(pathname), target);
}

/** Static-path params for `src/pages/[...lang]/` routes. */
export function localeParams(): { params: { lang: string | undefined }; props: { locale: Locale } }[] {
  return LOCALES.map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

/** Everything a component needs for the current language. */
export function useI18n(current: string | undefined) {
  const locale = toLocale(current);
  const meta = LOCALE_META[locale];
  return {
    locale,
    t: getDictionary(locale),
    dir: meta.dir,
    path: (path: string) => localizePath(path, locale),
  };
}

/** Picks the current language's value from a `{ ar, en }` object. */
export function pick<T>(value: Record<Locale, T>, locale: Locale): T {
  return value[locale];
}

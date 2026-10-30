/**
 * Registry of self-hosted fonts (Fontsource packages).
 *
 * `site.config.ts → brand.fonts` picks fonts by key from this list. To offer a
 * new font: `pnpm add -E @fontsource-variable/<name>`, add an entry here, then
 * reference its key in the settings file. Only the subsets a page actually uses
 * are downloaded by the browser, thanks to `unicode-range` in Fontsource CSS.
 */
export interface FontDefinition {
  /** The webfont's family name, quoted. */
  readonly family: string;
  /** System fallbacks, ending with a generic family. */
  readonly fallback: string;
  /** CSS files to import (package subpaths). */
  readonly imports: readonly string[];
  /**
   * The one file worth preloading per script (package subpaths): the subset
   * that renders above-the-fold text. Preloading avoids a late font swap.
   */
  readonly preload: { readonly arabic?: string; readonly latin?: string };
}

const ARABIC_FALLBACK = "'Segoe UI', Tahoma, 'Noto Sans Arabic', sans-serif";
const LATIN_FALLBACK = "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const fontRegistry = {
  alexandria: {
    family: "'Alexandria Variable'",
    fallback: ARABIC_FALLBACK,
    imports: ['@fontsource-variable/alexandria/wght.css'],
    preload: {
      arabic: '@fontsource-variable/alexandria/files/alexandria-arabic-wght-normal.woff2',
      latin: '@fontsource-variable/alexandria/files/alexandria-latin-wght-normal.woff2',
    },
  },
  'ibm-plex-sans-arabic': {
    family: "'IBM Plex Sans Arabic'",
    fallback: ARABIC_FALLBACK,
    // Arabic subset, regular + semibold only (500 falls back to 400). Latin
    // characters inside Arabic text use the English body font instead (see
    // brand-css.ts), so Arabic pages don't download a second Latin family.
    imports: [
      '@fontsource/ibm-plex-sans-arabic/arabic-400.css',
      '@fontsource/ibm-plex-sans-arabic/arabic-600.css',
    ],
    preload: {
      arabic: '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2',
    },
  },
  'bricolage-grotesque': {
    family: "'Bricolage Grotesque Variable'",
    fallback: LATIN_FALLBACK,
    imports: ['@fontsource-variable/bricolage-grotesque/wght.css'],
    preload: {
      latin: '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
    },
  },
  'public-sans': {
    family: "'Public Sans Variable'",
    fallback: LATIN_FALLBACK,
    imports: ['@fontsource-variable/public-sans/wght.css'],
    preload: { latin: '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2' },
  },
  'jetbrains-mono': {
    family: "'JetBrains Mono Variable'",
    fallback: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
    imports: ['@fontsource-variable/jetbrains-mono/wght.css'],
    preload: {},
  },
  // System monospace: no download. Used for small numerals and case IDs,
  // where a webfont would cost ~40 KB per page for little visible gain.
  'system-mono': {
    family: 'ui-monospace',
    fallback: "'Cascadia Mono', 'SF Mono', Consolas, 'Liberation Mono', monospace",
    imports: [],
    preload: {},
  },
} as const satisfies Record<string, FontDefinition>;

/** Full `font-family` value for a font. */
export function fontStack(key: FontKey, ...extraFamilies: string[]): string {
  const font = fontRegistry[key];
  return [font.family, ...extraFamilies, font.fallback].join(', ');
}

export type FontKey = keyof typeof fontRegistry;
export const fontKeys = Object.keys(fontRegistry) as [FontKey, ...FontKey[]];

/**
 * Builds the CSS that turns `site.config.ts → brand` into custom properties
 * and @font-face imports. Served to the app as the virtual stylesheet
 * `virtual:recovik/brand.css` (see astro.config.ts), so brand changes need no
 * CSS edits and no inline styles (which the CSP would block).
 */
import { fontRegistry, fontStack, type FontDefinition, type FontKey } from './fonts';
import type { SiteConfig } from './schema';

type Brand = SiteConfig['brand'];
type Palette = Brand['light'];

const paletteVars = (palette: Palette): string =>
  Object.entries(palette)
    .map(([key, value]) => `  --brand-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value};`)
    .join('\n');

export function buildBrandCss(brand: Brand): string {
  const fonts = brand.fonts;
  const imports = new Set(Object.values(fonts).flatMap((key) => [...fontRegistry[key].imports]));
  return [
    ...[...imports].map((file) => `@import '${file}';`),
    '@layer tokens {',
    ':root {',
    paletteVars(brand.light),
    `  --font-ar-heading: ${fontStack(fonts.arHeading)};`,
    // Latin characters in Arabic body text use the English body font.
    `  --font-ar-body: ${fontStack(fonts.arBody, fontRegistry[fonts.enBody].family)};`,
    `  --font-en-heading: ${fontStack(fonts.enHeading)};`,
    `  --font-en-body: ${fontStack(fonts.enBody)};`,
    // Arabic characters inside mono labels use the Arabic body font, not a
    // system monospace that has poor Arabic glyphs.
    `  --font-mono: ${fontStack(fonts.mono, fontRegistry[fonts.arBody].family)};`,
    // The wordmark uses the Arabic heading font's Latin glyphs in both
    // languages: one consistent logo, and no extra font on Arabic pages.
    `  --font-wordmark: ${fontStack(fonts.arHeading)};`,
    '}',
    ':root[data-theme="dark"] {',
    paletteVars(brand.dark),
    '}',
    '}',
  ].join('\n');
}

/**
 * Builds the virtual module `virtual:recovik/font-preloads`: per language,
 * the hashed URLs of the heading and body font files that render the first
 * screen. Generated from the same settings so a font change needs no edits.
 */
export function buildFontPreloadModule(brand: Brand): string {
  const { fonts } = brand;
  const preload = (key: FontKey): FontDefinition['preload'] => fontRegistry[key].preload;
  const plan = {
    ar: [preload(fonts.arHeading).arabic, preload(fonts.arBody).arabic],
    en: [preload(fonts.enHeading).latin, preload(fonts.enBody).latin],
  };
  const imports: string[] = [];
  const entries = Object.entries(plan).map(([locale, files]) => {
    const names = [...new Set(files.filter((file): file is string => Boolean(file)))].map((file) => {
      const name = `font${imports.length}`;
      imports.push(`import ${name} from '${file}?url';`);
      return name;
    });
    return `${locale}: [${names.join(', ')}]`;
  });
  return [...imports, `export default { ${entries.join(', ')} };`, ''].join('\n');
}

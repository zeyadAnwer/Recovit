/** Virtual modules generated from site.config.ts by the plugin in astro.config.ts. */
declare module 'virtual:recovik/brand.css';

declare module 'virtual:recovik/font-preloads' {
  import type { Locale } from './i18n/locales';
  /** Hashed font URLs to preload, per language. */
  const preloads: Record<Locale, string[]>;
  export default preloads;
}

/**
 * Build-time guard: every slug listed in site.config.ts must have a content
 * file in every supported language. Pure function, unit-tested.
 */
export class MissingContentError extends Error {
  override name = 'MissingContentError';
}

/**
 * @param collection  Collection name, used in the message.
 * @param slugs       Slugs enabled in site.config.ts.
 * @param entryIds    Content entry ids, shaped "<locale>/<slug>".
 * @param locales     Supported locales.
 * @throws MissingContentError listing every missing file.
 */
export function assertContentCoverage(
  collection: string,
  slugs: readonly string[],
  entryIds: readonly string[],
  locales: readonly string[],
): void {
  const available = new Set(entryIds);
  const missing = slugs.flatMap((slug) =>
    locales
      .filter((locale) => !available.has(`${locale}/${slug}`))
      .map((locale) => `src/content/${collection}/${locale}/${slug}.md`),
  );
  if (missing.length > 0) {
    throw new MissingContentError(
      `site.config.ts lists ${collection} without content. Create these files ` +
        `(copy an existing one as a template):\n${missing.map((file) => `  • ${file}`).join('\n')}`,
    );
  }
}

/** Splits an entry id "<locale>/<slug>" into its parts. */
export function parseEntryId(id: string): { locale: string; slug: string } {
  const [locale = '', ...rest] = id.split('/');
  return { locale, slug: rest.join('/') };
}

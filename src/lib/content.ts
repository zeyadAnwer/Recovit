/**
 * Content access for pages. Joins the ordered/enabled lists from
 * site.config.ts with their localized content entries, and fails the build
 * when an entry is missing.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { enabledItems, site } from '../config';
import { LOCALES, type Locale } from '../i18n';
import { assertContentCoverage, parseEntryId } from './content-integrity';

export type ServiceEntry = CollectionEntry<'services'>;
export type SectorEntry = CollectionEntry<'sectors'>;
export type FaqEntry = CollectionEntry<'faq'>;

async function joinWithConfig<C extends 'services' | 'sectors'>(collection: C, locale: Locale) {
  const items = enabledItems(site[collection]);
  const entries = await getCollection(collection);
  assertContentCoverage(
    collection,
    items.map((item) => item.slug),
    entries.map((entry) => entry.id),
    LOCALES,
  );
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  return items.map((item) => ({
    ...item,
    entry: byId.get(`${locale}/${item.slug}`) as CollectionEntry<C>,
  }));
}

export const getServices = (locale: Locale) => joinWithConfig('services', locale);
export const getSectors = (locale: Locale) => joinWithConfig('sectors', locale);

export async function getFaqs(locale: Locale) {
  const entries = await getCollection('faq', (entry) => parseEntryId(entry.id).locale === locale);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getLegalPage(locale: Locale, slug: 'privacy' | 'terms') {
  const entries = await getCollection('legal');
  assertContentCoverage(
    'legal',
    [slug],
    entries.map((entry) => entry.id),
    LOCALES,
  );
  return entries.find((entry) => entry.id === `${locale}/${slug}`) as CollectionEntry<'legal'>;
}

/** Splits plain-text answers into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

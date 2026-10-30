/**
 * Content audit: every headline and sentence a visitor can read, per page,
 * and the duplicates and near-duplicates between them.
 *
 * Shared by tests/e2e/content.spec.ts (fails the build on repetition) and
 * scripts/content-audit.mjs (writes docs/redesign/CONTENT-INVENTORY.md).
 *
 * Scope: <main> only. Site chrome (header, footer band, navigation) repeats by
 * design and is excluded, as are hidden elements, aria-hidden decoration,
 * owner placeholders, form controls, units shorter than four words (labels,
 * names), eyebrow labels, headings that are entirely a link (a card title
 * naming the page it links to is navigation) and template headings marked
 * `data-structural` (e.g. "What we do", a section title on every service page).
 */

/** Runs in the browser: returns [{ kind, text }] for the page. */
export function extractUnitsInPage() {
  const main = document.querySelector('main');
  if (!main) return [];
  const skip = (el) =>
    el.closest(
      '[hidden], [aria-hidden="true"], nav, [data-placeholder], .visually-hidden, form, [data-structural], .label',
    );
  const units = [];
  for (const el of main.querySelectorAll('h1, h2, h3, h4, p, li, dd, summary')) {
    if (skip(el)) continue;
    // Leaf text only: skip containers whose text is made of other units.
    if (el.matches('li, dd') && el.querySelector('p, h3, h4')) continue;
    if (el.matches('summary') && el.querySelector('h2, h3, h4')) continue;
    const link = el.matches('h1, h2, h3, h4') ? el.querySelector('a') : null;
    if (link && link.textContent?.trim() === el.textContent?.trim()) continue;
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) units.push({ kind: /^H\d$/.test(el.tagName) ? 'heading' : 'text', text });
  }
  return units;
}

const ARABIC_MARKS = /[ً-ٰٟـ]/g;

export function normalize(text) {
  return text
    .toLowerCase()
    .replace(ARABIC_MARKS, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const words = (text) => normalize(text).split(' ').filter(Boolean);

function shingles(text, size = 3) {
  const list = words(text);
  const set = new Set();
  for (let i = 0; i + size <= list.length; i += 1) set.add(list.slice(i, i + size).join(' '));
  return set;
}

function similarity(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const s of a) if (b.has(s)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/**
 * @param pages  [{ url, lang, units: [{ kind, text }] }]
 * @returns { exact: [...], near: [...] } — each item lists both occurrences.
 */
export function findDuplicates(pages, { minWords = 4, nearThreshold = 0.8 } = {}) {
  const items = pages.flatMap((page) =>
    page.units
      .filter((unit) => words(unit.text).length >= minWords)
      .map((unit) => ({
        ...unit,
        url: page.url,
        lang: page.lang,
        key: normalize(unit.text),
        grams: shingles(unit.text),
      })),
  );
  const exact = [];
  const near = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      if (a.lang !== b.lang) continue;
      if (a.key === b.key) exact.push({ a, b });
      else if (similarity(a.grams, b.grams) >= nearThreshold) near.push({ a, b });
    }
  }
  const strip = ({ a, b }) => ({
    text: a.text,
    first: a.url,
    second: b.url,
    other: b.text,
  });
  return { exact: exact.map(strip), near: near.map(strip) };
}

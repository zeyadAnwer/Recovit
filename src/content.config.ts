/**
 * Content collections. One Markdown file per item per language:
 *   src/content/<collection>/<locale>/<slug>.md  →  entry id "<locale>/<slug>"
 * Frontmatter is validated by these schemas at build time.
 * See docs/CONTENT-GUIDE.md for how to write each type.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const qa = z.object({ question: text, answer: text });

const step = z.object({ title: text, body: text });

/**
 * Services are structured for scanning. Each field appears in exactly one
 * place, so no sentence is shown twice (see docs/redesign/CONTENT-RULES.md):
 *   tagline  → home page list and the header services menu
 *   summary  → services index card
 *   lead     → service page header
 *   body     → "What it is" on the service page
 *   description → meta description only
 */
const services = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/services' }),
  schema: z.object({
    title: text,
    tagline: text.max(70),
    summary: text.max(170),
    lead: text.max(220),
    description: text.max(160),
    signs: z.array(text).min(3).max(6),
    whatWeDo: z.array(step).min(2).max(5),
    deliverables: z.array(text).min(2).max(6),
    weNeed: z.array(text).min(2).max(5),
    faq: z.array(qa).default([]),
  }),
});

const sectors = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/sectors' }),
  schema: z.object({
    title: text,
    summary: text.max(200),
    caresAbout: z.array(text).min(2),
    howWeWork: z.array(text).min(2),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: text,
    /** Plain text. Separate paragraphs with a blank line. */
    answer: text,
    category: z.enum(['ransom', 'privacy', 'working', 'cost']),
    order: z.number().int(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: text,
    description: text.max(160),
    updated: z.coerce.date(),
  }),
});

export const collections = { services, sectors, faq, legal };

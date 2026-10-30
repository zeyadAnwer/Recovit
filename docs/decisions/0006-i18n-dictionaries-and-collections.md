# 0006 — i18n: typed dictionaries + per-language content files

**Status:** accepted · 2026-10-28

**Decision.** Arabic at `/` (default), English at `/en/`, one route file per page
under `src/pages/[...lang]/`. UI strings in `ar.ts` (reference) and `en.ts`
typed from it, so a missing key fails type-checking. Long-form content as one
Markdown file per item per language; the build fails if a configured slug lacks
a language. Arabic copy is written natively, not translated.

**Consequences.** Adding a locale is data-only (dictionary + content + config).
URL slugs are English in both languages for stable, shareable links.

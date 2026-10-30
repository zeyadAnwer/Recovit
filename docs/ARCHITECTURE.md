# Architecture

Recovik is a bilingual (Arabic default, English) marketing site built with
**Astro 7**. Every page is pre-rendered to static HTML at build time. The only
code that runs on a server is the pair of form **Actions** and the two
"receipt" pages that show their result to visitors without JavaScript.

```
Browser ──HTTPS──▶ nginx ──(static files)──▶ dist/client/**
                     │
                     └──/_actions/*, */sent/──▶ Node (dist/server/entry.mjs) ──SMTP──▶ team inbox
```

## Stack and why

| Concern   | Choice                                        | Why                                                                                   |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Framework | Astro 7, static output + Node adapter         | Zero JS by default, content collections, i18n routing, Actions, built-in CSP.         |
| Language  | TypeScript (`astro/tsconfigs/strictest`)      | Typed config, dictionaries, content and props; `any` is a lint error.                 |
| Styling   | Plain CSS, cascade layers, logical properties | No framework look, RTL for free, tokens retunable from the settings file.             |
| Content   | Content Collections + zod (`astro/zod`)       | One Markdown file per item per language, validated at build time.                     |
| Fonts     | Fontsource packages, self-hosted              | No third-party requests; `unicode-range` means only used subsets download.            |
| Forms     | Astro Actions + zod + nodemailer (SMTP)       | Typed server validation; SMTP works with any mailbox provider.                        |
| Hosting   | Own server: nginx + systemd + Node 24 LTS     | nginx serves static files with TLS and headers; Node only handles form requests.      |
| Tests     | Vitest, Playwright, axe-core, Lighthouse CI   | Logic, user flows, accessibility and performance budgets all fail CI when they break. |

Dependencies beyond the ones requested: **nodemailer** (Node has no SMTP
client) and **postcss-html** (lets Stylelint lint `<style>` blocks inside
`.astro` files, so the logical-properties rule covers component CSS too).

## Folder structure

```
src/
  config/        site.config.ts (ALL business data), schema.ts (zod), fonts.ts, brand-css.ts
  content/       services/ sectors/ faq/ legal/  →  <collection>/<ar|en>/<slug>.md
  content.config.ts   collection schemas
  i18n/          ar.ts (reference dictionary), en.ts, types.ts, locales.ts, index.ts (helpers, routes)
  layouts/       BaseLayout (document, SEO, theme), PageLayout (breadcrumb + page header)
  components/
    ui/          Button, Icon (+icons.ts), Label, SectionHeader, Field, ChoiceGroup, Logo,
                 PhotoPlaceholder, ContentPlaceholder, illustrations/ (Spot set + spots.ts)
    layout/      Header, MobileNav, Footer, LanguageSwitch, ThemeToggle, EmergencyBanner,
                 WhatsAppButton, Analytics, nav.ts
    sections/    Hero (incident console), FirstAid, HomeSections, FaqList, Stats,
                 LegalPage, NotFound
    forms/       FormShell, CaseForm, ContactForm, Receipt, ReceiptPage
  scripts/       theme.ts, reveal.ts, forms.ts, case-form.ts, contact-form.ts (client, vanilla TS)
  styles/        global.css (layer order), reset, tokens, base, utilities
  lib/           pure logic: validation/, email/, forms/security.ts, rate-limit.ts, seo.ts,
                 content.ts, content-integrity.ts, contact.ts, case-ref.ts, security-headers.ts
  actions/       index.ts — submitCase, sendMessage
  middleware.ts  security headers on server-rendered responses
  pages/         [...lang]/… one file per route for both languages; 404.astro, en/404.astro,
                 robots.txt.ts, .well-known/security.txt.ts
tests/unit       Vitest      tests/e2e   Playwright + axe + layout/content checks
scripts/         screenshots.mjs, content-audit.mjs, generate-assets.mjs, brand/ (wordmark outlines)
deploy/          nginx/, systemd/, server-setup.sh, deploy.sh
docs/            this file, CONTENT-GUIDE, DEPLOYMENT, LAUNCH-CHECKLIST, DESIGN, decisions/
```

## Data flow

1. **Settings** — `src/config/site.config.ts` is parsed by `schema.ts` when
   `src/config/index.ts` is first imported (and again in `astro.config.ts`).
   Components import the parsed `site` object, never the raw file. Values that
   are empty or still `[PLACEHOLDERS]` are hidden through `filled()`.
2. **Brand** — `brand` colours and font keys become CSS custom properties via
   the virtual stylesheet `virtual:recovik/brand.css` (a 15-line Vite plugin in
   `astro.config.ts`). No inline styles, so the CSP stays strict.
3. **Content** — `lib/content.ts` joins the ordered, enabled list from the
   settings with the matching content entries for the current language, and
   `assertContentCoverage()` fails the build if any language is missing.
4. **UI text** — components call `useI18n(Astro.currentLocale)` and read
   `t.section.key`. `en.ts` is typed from `ar.ts`, so a missing or extra key is
   a compile error.
5. **Routing** — `src/pages/[...lang]/` holds one file per route. The rest
   parameter is `undefined` for Arabic (served at `/`) and `en` for English.
   `routes` in `i18n/index.ts` is the only place paths are written.
6. **Forms** — the form posts to `/<lang>/…/sent/?_action=…` (works with no
   JavaScript). With JavaScript, `scripts/case-form.ts` calls the same Action
   in place. Both paths share `lib/validation/forms.ts`.

## Security model

- Static HTML everywhere except the Actions; nothing user-supplied is rendered
  into HTML. Receipt pages show field _labels_ and generic messages only.
- **CSP**: Astro emits a `<meta>` CSP with SHA-256 hashes for every script and
  style (`security.csp` in `astro.config.ts`). No `unsafe-inline`, no
  `unsafe-eval`. nginx/middleware add a header CSP with `frame-ancestors`,
  `base-uri`, `form-action`, `object-src`, which a meta tag cannot carry.
- **Headers**: one source, `lib/security-headers.ts`; a unit test checks the
  nginx snippet and `public/_headers` match it.
- **Forms**: zod allow-list and length limits → Astro `checkOrigin`
  (Sec-Fetch-Site) + our Origin check → per-IP rate limit (memory store) +
  nginx `limit_req` → honeypot (silent fake success) → optional Turnstile →
  plain-text email. Logs contain error class names only.
- **Secrets** only in environment variables (`.env.example`), checked by
  `scripts/check-env.mjs` before systemd starts the service.

## Extension points (not built yet)

### Blog / knowledge base

1. Add a `posts` collection in `src/content.config.ts` (title, description,
   date, tags) with files in `src/content/posts/<lang>/<slug>.md`.
2. Add `src/pages/[...lang]/blog/index.astro` and `blog/[slug].astro`, built
   on `PageLayout` with the `.prose` container.
3. Add a `blog` entry to `routes` and `nav.ts`, and dictionary keys for its labels.
   JSON-LD: add an `articleJsonLd()` helper to `lib/seo.ts`.

### More languages

1. Add the code to `languages.supported` in `site.config.ts`, the `localeSchema`
   enum and `localized()` in `schema.ts`, and `LOCALE_META` in `i18n/locales.ts`.
2. Create `src/i18n/<code>.ts` typed as `Dictionary` and register it in `i18n/index.ts`.
3. Add `src/content/*/<code>/` files. The build lists anything missing.
   No component changes are needed.

### Client portal / case tracking

Form data shapes live in `src/lib/validation/` (zod) and are framework-free.
A separate app or API can import the same schemas (or publish them as a small
package). `lib/case-ref.ts` already issues a stable case reference that a
tracking system can adopt as its key.

### Git-based CMS (Keystatic or Decap)

Content is already plain Markdown with typed frontmatter in predictable
folders. Adding Keystatic means `pnpm add @keystatic/core @keystatic/astro`,
mirroring the zod schemas as Keystatic collections pointing at the same
paths, and protecting `/keystatic` behind authentication. No content moves.

### Landing pages per sector or city

Sections are self-contained components that take typed props
(`Hero`, `FirstAid`, `HomeSections`, `FaqList`, `Stats`…). A landing
page is a new route that composes them with filtered data — e.g.
`[...lang]/for/[sector].astro` reading one sector entry and its relevant services.

### Another host

- **Cloudflare**: `pnpm add -E @astrojs/cloudflare`, swap the adapter in
  `astro.config.ts`, replace nodemailer with an HTTP email API provider
  (implement `EmailProvider`), and swap `MemoryStore` for a KV-backed
  `RateLimitStore`. `public/_headers` already carries the security headers.
- **Netlify / Vercel**: swap the adapter (`@astrojs/netlify`, `@astrojs/vercel`).
  The same notes about email and rate-limit stores apply to serverless.

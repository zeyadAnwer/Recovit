# Content guide

Everything a non-developer may want to change, and where it lives.

| What                                         | Where                                           |
| -------------------------------------------- | ----------------------------------------------- |
| Phones, emails, address, hours, social links | `src/config/site.config.ts`                     |
| Figures (cases handled, years, success rate) | `src/config/site.config.ts → stats`             |
| Which services/sectors appear, and order     | `src/config/site.config.ts → services/sectors`  |
| Service and sector text                      | `src/content/services/`, `src/content/sectors/` |
| FAQ                                          | `src/content/faq/<ar                            | en>/<slug>.md` |
| Privacy policy, terms                        | `src/content/legal/<ar                          | en>/`          |
| Buttons, headings, form labels, errors       | `src/i18n/ar.ts` and `src/i18n/en.ts`           |
| Colours and fonts                            | `src/config/site.config.ts → brand`             |

After any change run `pnpm dev` and check the page, then `pnpm test`.

## Writing rules (both languages)

- Calm, specific, short sentences. The reader is stressed.
- Never promise 100% recovery; the ransomware outcome is worded exactly as in the launch checklist. Never invent numbers, awards, clients or
  testimonials. A figure you can't prove stays a placeholder (it is hidden).
- Banned (a test fails if they appear): unlock, seamless, cutting-edge,
  revolutionary, world-class, state-of-the-art, empower, leverage,
  "in today's digital world", «حلول متكاملة ومبتكرة», «نسعى جاهدين»,
  «في عالم اليوم الرقمي».
- Arabic is written natively in Modern Standard Arabic for a Gulf reader,
  not translated. Use Western digits (0–9) for consistency with phone numbers.
- The brand is always **Recovik** (Arabic rendering ريكوفِك in metadata).
- Every headline says something concrete a customer cares about.

## Add a service (≈5 minutes)

1. In `src/config/site.config.ts → services`, add one line:
   `{ slug: 'email-recovery', icon: 'mailbox', order: 7, enabled: true }`
   (`icon` must be a name from `src/components/ui/icons.ts`).
2. Copy `src/content/services/en/deleted-data-recovery.md` to
   `src/content/services/en/email-recovery.md` and edit it.
3. Do the same in `src/content/services/ar/`.
4. `pnpm dev` → the service appears on the home page, the services index and
   at `/services/email-recovery/` and `/en/services/email-recovery/`.

If one language file is missing, the build stops and names the file to create.

### Service frontmatter

Each field is shown in exactly one place, so nothing repeats
(docs/redesign/CONTENT-RULES.md):

```yaml
title: Email recovery # page title, card titles, menus
tagline: Bring back deleted mail. # home cards + header menu (≤ 70 chars)
summary: One sentence for the services index (≤ 170 chars)
lead: The page's opening line — the outcome first (≤ 220 chars)
description: Meta description for search engines (≤ 160 chars)
signs: # 3–6, phrased as the customer sees them
  - …
whatWeDo: # 2–5 steps
  - title: …
    body: …
deliverables: # 2–6: what the client receives
  - …
weNeed: # 2–5
  - …
faq: # questions specific to this service only
  - question: …
    answer: …
```

The body (below the `---`) is "What it is": one or two short paragraphs.
Wrap any value containing `: ` in double quotes. After editing, run
`pnpm build && pnpm content:audit` to confirm nothing repeats another page.

## Add a sector

Same as a service, in `sectors` and `src/content/sectors/`. Frontmatter:
`title`, `summary`, `caresAbout` (≥ 2), `howWeWork` (≥ 2). No body.

## Add a FAQ entry

Create `src/content/faq/en/<slug>.md` and `src/content/faq/ar/<slug>.md`:

```yaml
question: How long does it take?
answer: "First paragraph.\n\nSecond paragraph."
category: process # privacy | pricing | process | technical
order: 8 # position in the list
home: true # also show on the home page
```

## Change a phone number or email

Edit `src/config/site.config.ts`. Phones use international format without
spaces: `+966500000000`. That's the only place — header, footer, contact page,
structured data and the emergency banner all read from it.

## Replace a photo placeholder

1. Put the photo in `src/assets/photos/` (JPEG or PNG, at least 1600 px wide).
2. In the page, replace `<PhotoPlaceholder subject="…" />` with:

   ```astro
   ---
   import { Image } from 'astro:assets';
   import lab from '../../assets/photos/lab.jpg';
   ---

   <Image
     src={lab}
     alt="Describe what the photo shows"
     widths={[480, 800, 1200]}
     sizes="(min-width: 60rem) 40vw, 100vw"
     loading="lazy"
   />
   ```

   Astro generates AVIF/WebP in several sizes with width/height set.

3. Run `pnpm launch:check` — the item disappears from the list.

## Change colours or fonts

`src/config/site.config.ts → brand`. Colours are hex. `pnpm test` checks
WCAG AA contrast for every text/background pair in both themes and fails if a
new colour is too light. For fonts, see `src/config/fonts.ts`.

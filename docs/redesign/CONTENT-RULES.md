# Content rules

How much text the site carries, and where, is decided by published research
and guidance, not taste. This file names the sources and shows how each one
shaped the copy. Every page follows these rules in Arabic and English, each
written natively rather than translated sentence by sentence.

## Sources and what we took from each

| Source                                                                                                                                                       | Finding                                                                                                                                                                                                            | How it shaped the copy                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nielsen Norman Group, _How Users Read on the Web_ (Nielsen, 1997) and _Concise, SCANNABLE, and Objective: How to Write for the Web_ (Morkes & Nielsen, 1997) | 79 % of test users scanned instead of reading word by word. Concise text improved measured usability by 58 %, scannable layout by 47 %, objective (non-promotional) language by 27 %; all three combined by 124 %. | Home sections hold one headline, at most two short lines and one action. Service pages break detail into labelled lists. No promotional adjectives; claims are concrete ("written investigation report") and checkable. |
| Nielsen Norman Group, _F-Shaped Pattern of Reading on the Web_ (Pernice, 2006/2017)                                                                          | Readers fixate on the first words of headings, paragraphs and list items and skip the rest.                                                                                                                        | Important words come first: "Disconnect", "Don’t wipe", "Decryption first". List items start with the noun or verb that matters.                                                                                        |
| Nielsen Norman Group, _Inverted Pyramid: Writing for Comprehension_ (Pernice, 2017)                                                                          | Put the conclusion first, then supporting detail, then background.                                                                                                                                                 | Each service page opens with the lead (the outcome), then "What it is", signs, what we do, what you get, what we need, FAQ.                                                                                             |
| Nielsen Norman Group, _Progressive Disclosure_ (Nielsen, 2006)                                                                                               | Show the essentials first; defer secondary detail to where it is requested.                                                                                                                                        | Home = summaries with one link each; depth lives on service, process and sector pages; answers sit in accordions.                                                                                                       |
| GOV.UK Service Manual and _Content design: planning, writing and managing content_ (GOV.UK, ongoing)                                                         | Plain English, short sentences (around 25 words maximum), active voice, front-loaded headings, no duplication of content across pages, write for the user's task.                                                  | Average sentence length kept short; active voice ("We decrypt"); one canonical place per idea (see the duplicate check below); headings name what the user wants ("First hour of an attack: do this").                  |
| GOV.UK _Writing for GOV.UK_ — words to avoid                                                                                                                 | Avoid vague, inflated and metaphorical words.                                                                                                                                                                      | Kept and enforced the banned list from the original brief (unlock, seamless, cutting-edge, world-class, empower, leverage, «حلول متكاملة ومبتكرة», …) via `tests/unit/i18n.test.ts`.                                    |

## Rules applied

1. **Home = summaries.** One headline, ≤ 2 short lines, one action per section.
2. **Detail where it belongs.** Service pages: what it is · signs · what we do ·
   what you get · what we need · FAQ. Process page: what we do and the outcome
   of each stage. Sectors page: what matters and how we work per sector.
3. **Each idea once.** Every content field has exactly one display location:
   - service `tagline` → home cards and the header menu (navigation)
   - service `summary` → services index
   - service `lead` → service page header
   - process `summary` → home; process `detail` and `outcome` → process page
   - commitments → home only; values ("How we think") → About only
   - general FAQ → FAQ page only; service FAQs → their service page only
   - the closing call to action → footer band only (removed from 8 pages)
   - incident first aid → home only (removed from services, process, case form)
4. **Front-load, shorten, plain words.** No filler, no clichés, no invented
   numbers; figures appear only when filled in `site.config.ts`.
5. **The ransomware outcome is stated exactly once**, as a deliverable on the
   ransomware service page: "restored correctly and reliably — complete, or with
   only a small portion missing". No "100 %", no success rate unless provided.

## Duplicate check

`pnpm build && pnpm content:audit` visits every page in the sitemap (32 pages,
both languages), extracts every headline and sentence inside `<main>`, and
compares them within each language:

- **Exact duplicates:** identical after normalising case, punctuation and
  Arabic diacritics/alef forms.
- **Near-duplicates:** two units sharing ≥ 80 % of their three-word sequences.

Excluded by design: site chrome (header, navigation, footer band), hidden and
`aria-hidden` decoration, owner placeholders, form labels, units under four
words (names, labels), eyebrow labels, headings that are entirely a link to
the page of the same name, and template section titles marked
`data-structural` ("What we do" on each service page).

The full inventory of every headline and sentence is written to
[CONTENT-INVENTORY.md](CONTENT-INVENTORY.md). Result at the time of writing:
**0 exact duplicates, 0 near-duplicates.** The same check runs in CI as
`tests/e2e/layout.spec.ts › content › no headline or sentence is repeated`.

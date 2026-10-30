# Redesign audit — build `98955e1`

Method: `node scripts/screenshots.mjs` captured **308 full-page screenshots**:
11 pages × Arabic/English × light/dark × 375, 768, 1280, 1366, 1440, 1536 and
1920 px. File names are `<lang>_<page>_<width>_<theme>.jpeg`. A representative
set is committed in [`before/`](before/) (home, ransomware service and process
pages at every width, both languages, light; plus dark samples). Regenerate the
full set with the command above.

## 1. Business and content (critical)

| #   | Problem                                                                                                                                                                                                                  | Where                            | Screenshot                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------- |
| C1  | The site describes a **hardware** recovery lab (platters, clean room, write-blocker, "bring the device", clicking drives, water damage). Recovik is a software-based, cyber-incident recovery company.                   | Every page                       | `en_home_1366_light`, `en_services_1366_light`                         |
| C2  | Six of eight services are hardware media (HDD, SSD, RAID/NAS, USB/cards, phones, VMs as disks). Forensics, deleted-data, SaaS and post-incident hardening are missing.                                                   | `/services/`                     | `en_services_1440_light`                                               |
| C3  | Ransomware is the last service and framed defensively ("we don't promise decryption"). Decryption should be the lead capability, with reconstruction as a strength.                                                      | `/services/ransomware-recovery/` | `ar_services-ransomware-recovery_1366_light`                           |
| C4  | Process describes a repair lab: "bring in the device", "recovery in the lab", "new media". Must become contain → investigate → recover → harden.                                                                         | `/process/`                      | `en_process_1440_light`                                                |
| C5  | First aid is for failing disks ("don't put it in the freezer"). Needs incident first aid: isolate, don't pay or contact attackers, don't wipe or reinstall, call.                                                        | Home                             | `en_home_768_light`                                                    |
| C6  | **Repetition**: the same closing CTA band appears on 8 pages; first aid is repeated on home, services and process; FAQ answers appear on home and the FAQ page; trust items overlap the about page values and lab rules. | Site-wide                        | `en_services_1366_light`, `en_process_1366_light`, `en_faq_1366_light` |
| C7  | Home sections carry 2–4 sentences each plus lists; depth belongs on detail pages.                                                                                                                                        | Home                             | `en_home_1366_light`                                                   |
| C8  | Hero "intake card" shows a hard drive and hardware fields.                                                                                                                                                               | Home                             | `en_home_1920_light`                                                   |
| C9  | Case form asks for device type/model (HDD, SSD, phone…), not affected systems and incident type.                                                                                                                         | `/start-a-case/`                 | `en_start-a-case_1366_light`                                           |

## 2. Layout (bugs)

| #   | Problem                                                                                                                                     | Cause                                                                                | Screenshot                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| L1  | Content sits in a 1248 px column: 65 % of the screen at 1920 px, with ~336 px empty margins.                                                | `--page-max: 78rem`                                                                  | `en_home_1920_light`, `en_home_1536_light`       |
| L2  | Hero headline wraps after 2–3 words while half its column is empty.                                                                         | `.hero__text h1 { max-inline-size: 18ch }` (20ch in Arabic)                          | `en_home_1366_light`, `ar_home_1440_light`       |
| L3  | Page headings wrap early on every inner page ("استعادة البيانات / بعد هجمات الفدية").                                                       | `.page-header__text h1 { max-inline-size: 24ch }`                                    | `ar_services-ransomware-recovery_1366_light`     |
| L4  | Process steps use only the left 40 % of the page; right side empty.                                                                         | `.process__step > p, .process__outcome { max-inline-size: 34rem }`, no second column | `en_process_1440_light`, `en_process_1920_light` |
| L5  | First-aid and CTA headings break early.                                                                                                     | `max-inline-size: 28ch` / `22ch`                                                     | `en_home_1280_light`                             |
| L6  | Leads are capped at 38rem even in wide columns, producing short ragged lines next to empty space.                                           | `.lead { max-inline-size: 38rem }`                                                   | `en_services_1440_light`                         |
| L7  | `text-wrap: balance` is applied to every heading, including long FAQ questions and 4-line headings, which creates artificially short lines. | `base.css`                                                                           | `en_faq_768_light`                               |
| L8  | Service detail: 8/4 split with a 42rem prose cap leaves a gap between body and sidebar at ≥1440 px.                                         | `.service__main .prose { max-inline-size: 42rem }`                                   | `en_services-ransomware-recovery_1536_light`     |
| L9  | Side padding stops at 32 px; on laptops the brief asks for up to 48 px with a wider container.                                              | `--gutter`                                                                           | `en_home_1366_light`                             |

## 3. Typography and visual

| #   | Problem                                                                                                     | Screenshot                                    |
| --- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| V1  | Paper/amber palette reads as a craft workshop, not an incident-response firm.                               | `en_home_1366_light`                          |
| V2  | Weak contrast between headline, lead and body sizes on inner pages; leads are close to body size.           | `en_about_1366_light`                         |
| V3  | Mono labels in Arabic switch to body font but keep letter-spacing intent; section numbers "§ 01" add noise. | `ar_home_1366_light`                          |
| V4  | Every section uses the same "label + heading + ruled list" block; rhythm feels repetitive.                  | `en_home_1440_light`                          |
| V5  | The logo (platter with a sector) is a hard-disk symbol — wrong business; not approved.                      | Header, all pages                             |
| V6  | Arabic pages show only the Latin name; no bilingual lockup.                                                 | `ar_home_1366_light`                          |
| V7  | Header has no services menu, no compact state, and the emergency action is a quiet outline button.          | `en_home_1366_light`                          |
| V8  | Footer is a plain four-column list with no closing call-to-action and no emergency prominence.              | `en_home_1366_dark`                           |
| V9  | Illustrations are hardware drawings (platter, circuit board, write-blocker).                                | `en_home_1920_light`, `en_process_1440_light` |
| V10 | Photo placeholders on About show lab hardware subjects.                                                     | `en_about_1366_light`                         |

## 4. Redesign plan

**Layout system.** `--page-max: 84rem` (1344 px), `--page-wide: 90rem` (1440 px)
for hero, process and footer; side padding `clamp(16px, 4vw, 48px)`. At 1366 px
content spans 1270 px (93 %). 12-column grid; headings span their column; no
`ch` caps on headings, leads or labels; only long-form `.prose` keeps a 70ch
measure. `text-wrap: balance` on h1–h2 (short display headings), `pretty` on
paragraphs.

**Type scale.** 8 px rhythm; ratio 1.25 for body steps, 1.333 for display:
body 17/18 px, lead 21–24 px, h2 32–44 px, h1 44–68 px; muted leads, ink
headings, tight headline leading (1.08 EN / 1.3 AR).

**Palette.** Ink navy `#0C1B26` on cool paper `#F4F6F5`; emerald `#0A7258`
= data restored (primary actions, progress); blue `#1F57A0` = links/focus;
red-orange `#B4361C` = incident/emergency only. Dark theme mirrors roles.
All pairs tested ≥ 4.5:1.

**Header.** 64 px sticky bar that compacts to 56 px with a translucent
background and a hairline border after scrolling. Bilingual lockup (Arabic
pages), Services mega menu (native `popover`, zero JS) listing six services
with one-line descriptions, grouped language/theme switches, red "Incident?
Call now" button on every width. Mobile: full-height panel, 56 px rows,
contact actions pinned to the bottom.

**Hero.** Split 7/5 using the full width. Headline about recovering from
ransomware and data loss, one supporting line, two actions, trust row with
only checklist-confirmed claims. Visual: an "incident console" — a grid of
encrypted file tiles that resolve into readable files while the phase rail
moves contain → investigate → recover (CSS only, `aria-hidden`, static under
reduced motion, not the LCP element).

**Footer.** Dark closing band (single site-wide CTA, replacing per-page CTA
sections), then columns: services, company, resources, contact (emergency
number first, hours), bilingual lockup, legal links, © current year.

**Logo.** "Restore R": an R whose bowl is a rewind arc ending in an arrowhead
that closes around a recovered data block (emerald). Built on a 32 px grid
with 3.6 px strokes so it holds at 16 px. Two alternates kept for review in
`logo-concepts.html`.

**Content structure.** Home = summaries (one headline, ≤ 2 short lines, one
action per section): hero → incident first aid → services → ransomware
two-stage recovery → process → commitments → sectors. Detail lives on service
pages (what it is, signs, what we do, deliverables, what we need, FAQ),
sectors, process and FAQ pages. Each idea appears once; verified by
`scripts/content-audit.mjs` (see CONTENT-RULES.md).

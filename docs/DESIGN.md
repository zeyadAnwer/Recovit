# Design notes

**Positioning.** Recovik is a software-based recovery and response firm for
cybersecurity incidents. The visual language is calm and credible — the people
you want on the line during an attack — with no hacker clichés, padlocks,
glowing grids or stock photos.

**Palette.** Cool paper `#F4F6F5` and deep ink navy `#0C1B26`. Each accent
has one job:

- **Emerald** `#0A7258` (dark `#3CC9A0`) — data restored: primary actions,
  progress, restored tiles, the recovered block in the logo.
- **Blue** `#1F57A0` (dark `#8AB8F0`) — links and focus.
- **Red-orange** `#B4361C` (dark `#FF8C6B`) — incidents only: the "Incident?
  Call now" action, first aid, ransom notes in illustrations.

Every text/background pair is tested ≥ 4.5:1 in both themes
(`tests/unit/contrast.test.ts`) and by axe on every page.

**Type.** Arabic: Alexandria headings, IBM Plex Sans Arabic body (line-height
1.85). English: Bricolage Grotesque headings, Public Sans body. JetBrains Mono
for case numbers and the console. Text steps on a 1.25 ratio, display sizes
jump further (hero up to 72 px) for strong headline/lead/body contrast.
Spacing on a 4/8 px rhythm.

**Layout.** Content container 1344 px, wide sections (hero, process, footer)
1440 px, side padding `clamp(16px, 4vw, 48px)`. Headings span their column;
only long body text keeps a 70-character measure; `text-wrap: balance` on h1/h2
only. Sections vary deliberately: split hero, alert panel, card grid,
two-stage comparison, numbered timeline, rule-topped commitments, chip cloud,
full-width stage rows, accordions.

**Logo.** "Restore R": the bowl of the R is a rewind arc whose arrowhead closes
around a recovered data block. Strokes on a 32 px grid hold at 16 px. On
Arabic pages the lockup is bilingual — «ريكوفِك» primary, RECOVIK in spaced
capitals beneath, both aligned to the start edge. Wordmarks in the SVG files
are outlined from Alexandria with HarfBuzz shaping (no font dependency).
Alternatives B and C: `docs/redesign/logo-concepts.html`.

**Header.** 64 px sticky bar; after 8 px of scroll it compacts to 56 px with a
translucent background and hairline border. Services opens a mega menu (native
`popover`, no JavaScript). The red incident action is visible at every width.
Mobile: full-height panel, 56 px rows, contact actions pinned to the bottom.

**Hero visual.** The incident console: twelve encrypted tiles resolve into
restored files while the phase rail moves contain → investigate → recover.
CSS only, decorative (`aria-hidden`), final state under reduced motion; the
headline stays the LCP element.

**Illustrations.** One spot set on a 64 px grid with the icon pen: isolation,
investigation timeline, encrypted→restored file, recovered deleted file,
database, cloud, hardening. No hardware drawings.

**Motion.** Native view transitions, the hero console (once), card hover lift,
the process progress line, one-time reveal. All off under
`prefers-reduced-motion`.

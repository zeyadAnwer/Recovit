# 0003 — Plain CSS with cascade layers and logical properties

**Status:** accepted · 2026-10-28

**Decision.** No CSS framework. `@layer reset, tokens, base, components,
utilities`; component styles live in `.astro` files inside `@layer components`.
Only logical properties (`margin-inline`, `inset-inline-start`…), enforced by
Stylelint, so RTL needs no overrides. Brand tokens are generated from
`site.config.ts` into a virtual stylesheet.

**Consequences.** A distinctive look, tiny CSS, no specificity wars. Developers
must know modern CSS; the docs and lint rules guide them.

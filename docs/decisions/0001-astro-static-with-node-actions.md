# 0001 — Astro, static output, Node only for form Actions

**Status:** accepted · 2026-10-28

**Context.** A bilingual marketing site that must be fast, secure and easy to
grow (blog, landing pages) with two dynamic surfaces: the case and contact forms.

**Decision.** Astro 7 with `output: 'static'` and the `@astrojs/node` adapter.
All pages are pre-rendered; only the two Actions and their no-JS receipt pages
(`prerender = false`) run on the server.

**Consequences.** Smallest attack surface and best performance; nginx serves
HTML directly. A future island framework (React/Vue) or more on-demand routes
can be added without a rewrite. Swapping hosts = swapping the adapter.

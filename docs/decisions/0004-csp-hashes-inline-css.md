# 0004 — Strict CSP with hashes; CSS inlined

**Status:** accepted · 2026-10-28

**Decision.** Astro's built-in `security.csp` emits a `<meta>` CSP with SHA-256
hashes for every script and style — no `unsafe-inline`/`unsafe-eval`. A header
CSP (nginx + middleware) adds `frame-ancestors`, `base-uri`, `form-action`,
`object-src`. CSS is inlined per page (`inlineStylesheets: 'always'`) to remove
render-blocking requests; Vite asset inlining is disabled so no `data:` fonts
violate `font-src 'self'`. View transitions use the native CSS API because
Astro's `<ClientRouter>` is not CSP-compatible.

**Consequences.** Third-party scripts need an explicit origin in
`astro.config.ts` (done automatically for Turnstile/analytics when enabled).

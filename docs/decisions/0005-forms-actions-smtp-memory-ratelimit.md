# 0005 — Forms: Actions, SMTP behind an interface, in-memory rate limiting

**Status:** accepted · 2026-10-28

**Decision.** Astro Actions with shared zod schemas (`lib/validation`), working
with and without JavaScript. Email through an `EmailProvider` interface with an
SMTP implementation (nodemailer) — any mailbox provider works. Per-IP limits in
a memory store behind a `RateLimitStore` interface, plus nginx `limit_req`.
Honeypot returns a fake success; Turnstile is optional and verified server-side.

**Consequences.** One Node process is assumed for the memory store; a shared
store (Redis/KV) is a drop-in when scaling out. Nothing is persisted: if SMTP
is down, the visitor is told to call — no silent data loss.

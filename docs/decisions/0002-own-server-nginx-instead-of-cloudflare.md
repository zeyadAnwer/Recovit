# 0002 — Own server with nginx instead of Cloudflare Pages

**Status:** accepted · 2026-10-28

**Context.** The brief suggested Cloudflare Pages/Workers; the owner already
runs an Ubuntu server and wants the site there.

**Decision.** nginx (TLS via Let's Encrypt, HTTP/2, security headers,
`gzip_static`, `limit_req`) in front of a hardened systemd Node service.
Releases are atomic symlink switches, built on the server from `git archive`.

**Consequences.** Full control and no vendor lock-in. We own patching and
certificate renewal (certbot timer + reload hook). Cloudflare can still sit in
front as a proxy/WAF; `public/_headers` keeps the Pages option open.

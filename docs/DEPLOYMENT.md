# Deployment

Production runs on our own Ubuntu server behind nginx with Let's Encrypt TLS.

| Item         | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Server       | `84.13.150.184` (Ubuntu 26.04, arm64)                        |
| Domain now   | `recovik.protosoftdev.com`                                   |
| Domain later | `recovik.com` (+ `www`)                                      |
| App folder   | `/srv/recovik/releases/<timestamp>` → `/srv/recovik/current` |
| Env file     | `/etc/recovik/recovik.env` (mode 640, root:recovik)          |
| Service      | `recovik.service` (Node, 127.0.0.1:4321)                     |
| nginx site   | `/etc/nginx/sites-available/recovik.conf`                    |

nginx serves every static page straight from `dist/client` (pre-compressed
`.gz`, security headers, HTTP/2, HSTS). Only `/_actions/*` and the `…/sent/`
receipt pages are proxied to Node, with `limit_req` rate limiting.

## 1. DNS

Create an **A record** `recovik.protosoftdev.com → 84.13.150.184`. If the zone
is on Cloudflare, start with **DNS only** (grey cloud) so Let's Encrypt can
reach the server. You may switch the proxy on afterwards; then set SSL mode to
**Full (strict)** and add Cloudflare's IP ranges to nginx `set_real_ip_from`
with `real_ip_header CF-Connecting-IP` so rate limiting sees real client IPs.

On Oracle Cloud, also allow TCP 80 and 443 in the instance's VCN security list
(the script opens the host firewall; the cloud firewall is in the console).

## 2. One-time server setup

```bash
git archive --format=tar.gz HEAD | ssh protocol 'mkdir -p ~/recovik-setup && tar -xzf - -C ~/recovik-setup'
ssh protocol 'cd ~/recovik-setup && sudo DOMAIN=recovik.protosoftdev.com bash deploy/server-setup.sh'
```

It installs nginx, certbot and Node 24 (official binaries, checksum verified),
creates the `recovik` user, opens ports 80/443, obtains the certificate,
installs the nginx site and the hardened systemd unit. Safe to re-run.

## 3. Environment

```bash
ssh protocol 'sudo nano /etc/recovik/recovik.env'
```

Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
`MAIL_FROM`. Keep `TRUST_PROXY=true` (nginx sets `X-Real-IP`). The service
refuses to start while a required value is missing — the static site stays up,
only the forms are unavailable.

## 4. Deploy a release

From a clean checkout of the commit you want live:

```bash
DEPLOY_TARGET=protocol bash scripts/deploy.sh
```

This ships `git archive HEAD`, then on the server installs dependencies,
builds with `SITE_URL` from the env file, switches the `current` symlink
atomically, restarts the service and keeps the last five releases.

**Rollback:** `ssh protocol 'ls /srv/recovik/releases'`, then
`sudo ln -sfn /srv/recovik/releases/<previous> /srv/recovik/current && sudo systemctl restart recovik`.

**Logs:** `sudo journalctl -u recovik -f` (no personal data is ever logged).

## 5. Moving to recovik.com

1. Point `recovik.com` and `www.recovik.com` A records to the server.
2. `sudo certbot certonly --webroot -w /var/www/certbot -d recovik.com -d www.recovik.com`
3. Re-run `server-setup.sh` with `DOMAIN=recovik.com`, add a `www → apex`
   redirect server block, set `SITE_URL=https://recovik.com` in the env file.
4. 301-redirect `recovik.protosoftdev.com` to `https://recovik.com$request_uri`.
5. Deploy again (canonical URLs, sitemap and hreflang are generated at build time).
6. Submit `https://recovik.com/sitemap-index.xml` in Google Search Console.
   Consider submitting the domain to hstspreload.org once stable.

## Automatic deploys (optional)

Add repository secrets `DEPLOY_SSH_KEY` (a key authorised for the server user)
and `DEPLOY_HOST` (`ubuntu@84.13.150.184`), then add a job to
`.github/workflows/ci.yml` that runs after all checks on `main`:
`DEPLOY_TARGET=$DEPLOY_HOST bash scripts/deploy.sh`.

## Other hosts

See "Another host" in `docs/ARCHITECTURE.md` (Cloudflare, Netlify, Vercel).

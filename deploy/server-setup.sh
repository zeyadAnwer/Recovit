#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# One-time (idempotent) server preparation for Recovik on Ubuntu 24.04+.
# Run as a sudo-capable user:
#   sudo DOMAIN=recovik.protosoftdev.com [EMAIL=you@example.com] bash deploy/server-setup.sh
# EMAIL is optional (Let's Encrypt expiry notices); renewal is automatic.
# Installs nginx, certbot and Node.js LTS (official binaries, checksum
# verified), creates the `recovik` service user and directories, opens ports
# 80/443, installs nginx + systemd config and obtains a Let's Encrypt
# certificate. Safe to re-run.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN, e.g. DOMAIN=recovik.protosoftdev.com}"
EMAIL="${EMAIL:-}"
NODE_MAJOR="${NODE_MAJOR:-24}"
APP_DIR=/srv/recovik
ENV_FILE=/etc/recovik/recovik.env
HERE="$(cd "$(dirname "$0")" && pwd)"

log() { printf '\n\033[1;33m▶ %s\033[0m\n' "$*"; }

log "System packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  nginx certbot curl ca-certificates xz-utils tar iptables-persistent

log "Node.js ${NODE_MAJOR} LTS (official build, SHA-256 verified)"
ARCH="$(dpkg --print-architecture)"; case "$ARCH" in amd64) NARCH=x64;; arm64) NARCH=arm64;; *) echo "Unsupported arch $ARCH"; exit 1;; esac
NODE_VERSION="$(curl -fsSL https://nodejs.org/dist/index.json | grep -o "\"version\":\"v${NODE_MAJOR}\.[0-9.]*\"" | head -1 | cut -d'"' -f4)"
if [ "$(node -v 2>/dev/null || true)" != "$NODE_VERSION" ]; then
  TMP="$(mktemp -d)"
  TARBALL="node-${NODE_VERSION}-linux-${NARCH}.tar.xz"
  curl -fsSLo "$TMP/$TARBALL" "https://nodejs.org/dist/${NODE_VERSION}/${TARBALL}"
  curl -fsSLo "$TMP/SHASUMS256.txt" "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"
  (cd "$TMP" && grep " ${TARBALL}\$" SHASUMS256.txt | sha256sum -c -)
  rm -rf /opt/node && mkdir -p /opt/node
  tar -xJf "$TMP/$TARBALL" -C /opt/node --strip-components=1
  ln -sf /opt/node/bin/node /usr/local/bin/node
  ln -sf /opt/node/bin/npm /usr/local/bin/npm
  ln -sf /opt/node/bin/npx /usr/local/bin/npx
  rm -rf "$TMP"
fi
node -v
PNPM_VERSION="$(grep -o '"packageManager": *"pnpm@[0-9.]*"' "$HERE/../package.json" | grep -o '[0-9.]*$' || echo latest)"
npm install -g "pnpm@${PNPM_VERSION}" --no-fund --no-audit >/dev/null
ln -sf /opt/node/bin/pnpm /usr/local/bin/pnpm
pnpm -v

log "Service user and directories"
id recovik >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/recovik --shell /usr/sbin/nologin recovik
mkdir -p "$APP_DIR/releases" /etc/recovik /var/www/certbot
chown -R recovik:recovik "$APP_DIR"
if [ ! -f "$ENV_FILE" ]; then
  install -m 640 -o root -g recovik "$HERE/../.env.example" "$ENV_FILE"
  sed -i "s#^SITE_URL=.*#SITE_URL=https://${DOMAIN}#; s#^TRUST_PROXY=.*#TRUST_PROXY=true#" "$ENV_FILE"
  echo "Created $ENV_FILE — fill in SMTP_* and MAIL_FROM."
fi
install -m 755 "$HERE/release.sh" "$APP_DIR/release.sh"

log "Firewall: allow HTTP and HTTPS"
for PORT in 80 443; do
  iptables -C INPUT -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT 2>/dev/null \
    || iptables -I INPUT 4 -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT
  ip6tables -C INPUT -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT 2>/dev/null \
    || ip6tables -I INPUT 1 -p tcp --dport "$PORT" -m state --state NEW -j ACCEPT
done
netfilter-persistent save

log "systemd service"
install -m 644 "$HERE/systemd/recovik.service" /etc/systemd/system/recovik.service
systemctl daemon-reload
systemctl enable recovik.service >/dev/null

log "nginx"
PUBLIC_IP="$(curl -fsS -4 https://api.ipify.org || true)"
DNS_IP="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}' || true)"
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] && [ "$DNS_IP" != "$PUBLIC_IP" ]; then
  echo "DNS for ${DOMAIN} points to '${DNS_IP:-nothing}', this server is ${PUBLIC_IP}."
  echo "Create an A record ${DOMAIN} -> ${PUBLIC_IP}, wait for it to resolve, then re-run this script."
  exit 2
fi
install -m 644 "$HERE/nginx/security-headers.conf" /etc/nginx/snippets/recovik-security-headers.conf
rm -f /etc/nginx/sites-enabled/default
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  # Temporary HTTP-only server so Let's Encrypt can reach the challenge.
  cat > /etc/nginx/sites-available/recovik.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 503; }
}
EOF
  ln -sf /etc/nginx/sites-available/recovik.conf /etc/nginx/sites-enabled/recovik.conf
  nginx -t && systemctl reload nginx
  log "Let's Encrypt certificate for ${DOMAIN}"
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    $([ -n "$EMAIL" ] && echo "--email $EMAIL --no-eff-email" || echo "--register-unsafely-without-email")     --agree-tos --non-interactive
fi
sed "s/__DOMAIN__/${DOMAIN}/g" "$HERE/nginx/recovik.conf" > /etc/nginx/sites-available/recovik.conf
ln -sf /etc/nginx/sites-available/recovik.conf /etc/nginx/sites-enabled/recovik.conf
nginx -t && systemctl reload nginx

# Reload nginx after each automatic renewal.
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

log "Done. Next: fill $ENV_FILE, then deploy a release (see docs/DEPLOYMENT.md)."

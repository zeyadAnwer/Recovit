#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Builds and activates a release ON the server (atomic symlink switch).
#   sudo /srv/recovik/release.sh /tmp/recovik-<sha>.tar.gz
# The tarball is a `git archive` of the repository (see scripts/deploy.sh).
# Keeps the last 5 releases; roll back with:
#   sudo ln -sfn /srv/recovik/releases/<older> /srv/recovik/current && sudo systemctl restart recovik
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ARCHIVE="${1:?Usage: release.sh <archive.tar.gz>}"
APP_DIR=/srv/recovik
ENV_FILE=/etc/recovik/recovik.env
RELEASE="$APP_DIR/releases/$(date -u +%Y%m%d%H%M%S)"

as_app() { sudo -u recovik -H env PATH="/usr/local/bin:/usr/bin:/bin" "$@"; }

mkdir -p "$RELEASE"
tar -xzf "$ARCHIVE" -C "$RELEASE"
chown -R recovik:recovik "$RELEASE"
rm -f "$ARCHIVE"

# Build-time variables only (SITE_URL); secrets are read at runtime by systemd.
SITE_URL="$(grep -E '^SITE_URL=' "$ENV_FILE" | cut -d= -f2- || true)"

cd "$RELEASE"
as_app pnpm install --frozen-lockfile --prod=false
as_app env SITE_URL="$SITE_URL" pnpm build

ln -sfn "$RELEASE" "$APP_DIR/current"
systemctl restart recovik.service || true
sleep 2

if systemctl is-active --quiet recovik.service; then
  echo "✔ Node service running (forms enabled)."
else
  echo "⚠ Node service is NOT running — static pages are live, forms are not."
  echo "  Check: sudo journalctl -u recovik -n 30   (usually missing SMTP_* in $ENV_FILE)"
fi
systemctl reload nginx

# Keep the five most recent releases.
ls -1dt "$APP_DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf
echo "✔ Release $(basename "$RELEASE") is live."

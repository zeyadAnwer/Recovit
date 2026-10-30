#!/usr/bin/env bash
# Ships the committed HEAD to the server and activates it.
#   DEPLOY_TARGET=ubuntu@84.13.150.184 bash scripts/deploy.sh
# (or an ~/.ssh/config alias, e.g. DEPLOY_TARGET=protocol)
# Only committed files are shipped (git archive), never .env or local builds.
set -euo pipefail

TARGET="${DEPLOY_TARGET:?Set DEPLOY_TARGET=user@host or an ssh alias}"
SHA="$(git rev-parse --short HEAD)"
ARCHIVE="/tmp/recovik-${SHA}.tar.gz"

if [ -n "$(git status --porcelain)" ]; then
  echo "⚠ Uncommitted changes are NOT deployed (only HEAD ${SHA} is)."
fi

git archive --format=tar.gz HEAD | ssh "$TARGET" "cat > ${ARCHIVE}"
ssh "$TARGET" "sudo /srv/recovik/release.sh ${ARCHIVE}"

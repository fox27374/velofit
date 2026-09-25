#!/usr/bin/env bash
set -euo pipefail

# Deploy velofit + bikedb to podman host.
# Assumes, as one-time host setup:
#   sudo loginctl enable-linger claude   (rootless containers survive logout/reboot)
#   ghcr package visibility set to public (host pulls anonymously)
# HOST is an ssh alias: user claude on ataltpr06, via the dk-gate jump host.
# The host is not reachable from here on any port but 22, so health checks
# run over ssh rather than curling it directly.

VELOFIT_REPO=/Users/dkofler/code/velofit
BIKEDB_REPO=/Users/dkofler/code/bikedb
HOST=${VELOFIT_HOST:-tpr06}
HOST_DIR=velofit  # relative to the remote $HOME; never expand locally

# Resolve tag from velofit HEAD
TAG=$(cd "$VELOFIT_REPO" && git rev-parse --short HEAD)

# Refuse to run if either repo's working tree is dirty
if ! (cd "$VELOFIT_REPO" && git diff --quiet && git diff --cached --quiet); then
  echo "velofit working tree is dirty. Commit or stash changes."
  exit 1
fi

if ! (cd "$BIKEDB_REPO" && git diff --quiet && git diff --cached --quiet); then
  echo "bikedb working tree is dirty. Commit or stash changes."
  exit 1
fi

echo "Building images for tag: $TAG"

# Build both images for linux/amd64
cd "$VELOFIT_REPO"
podman build --platform linux/amd64 -f deploy/Containerfile -t ghcr.io/fox27374/velofit:$TAG -t ghcr.io/fox27374/velofit:latest .

cd "$BIKEDB_REPO"
for svc in api scraper web; do
  podman build --platform linux/amd64 -f Dockerfile.$svc -t ghcr.io/fox27374/bikedb-$svc:$TAG -t ghcr.io/fox27374/bikedb-$svc:latest .
done

# Login and push images
echo "Pushing images to ghcr.io..."
gh auth token | podman login ghcr.io -u fox27374 --password-stdin

podman push ghcr.io/fox27374/velofit:$TAG
podman push ghcr.io/fox27374/velofit:latest
for svc in api scraper web; do
  podman push ghcr.io/fox27374/bikedb-$svc:$TAG
  podman push ghcr.io/fox27374/bikedb-$svc:latest
done

# Copy compose and systemd unit to host
echo "Copying config to host..."
ssh "$HOST" "mkdir -p \$HOME/$HOST_DIR"
scp "$VELOFIT_REPO/deploy/compose.yaml" "$HOST:$HOST_DIR/"
scp "$VELOFIT_REPO/deploy/velofit.service" "$HOST:$HOST_DIR/"

# Generate or update .env on host
echo "Setting up .env on host..."
ssh "$HOST" "
  cd \$HOME/$HOST_DIR
  if [ ! -f .env ]; then
    umask 077
    PASS=\$(openssl rand -base64 32 | tr -d '/@ \"')
    echo \"POSTGRES_PASSWORD=\$PASS\" > .env
    echo \"IMAGE_TAG=$TAG\" >> .env
  else
    sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/' .env
  fi
  grep -q '^BIKEDB_INTERNAL_TOKEN=' .env || echo \"BIKEDB_INTERNAL_TOKEN=\$(openssl rand -hex 32)\" >> .env
"

# Install systemd user unit
echo "Installing systemd user unit..."
ssh "$HOST" "
  set -e
  mkdir -p \$HOME/.config/systemd/user
  cp \$HOME/$HOST_DIR/velofit.service \$HOME/.config/systemd/user/
  systemctl --user daemon-reload
  systemctl --user enable velofit
  cd \$HOME/$HOST_DIR
  podman-compose pull
  systemctl --user restart velofit
"

# Health check
echo "Waiting for services to be healthy..."
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  if ssh "$HOST" 'curl -sf http://localhost:8080/health >/dev/null && curl -sf http://localhost:8081/ >/dev/null'; then
    echo "Health check passed!"
    exit 0
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

echo "Health check timeout after $TIMEOUT seconds"
exit 1

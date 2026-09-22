#!/usr/bin/env bash
set -euo pipefail

# Deploy velofit + bikedb to podman host.
# Assumes: sudo loginctl enable-linger ansible (one-time setup on host)
# Assumes: ghcr package visibility is public (one-time setup)

VELOFIT_REPO=/Users/dkofler/code/velofit
BIKEDB_REPO=/Users/dkofler/code/bikedb
HOST=ansible@ataltpr06.lnxnet.org
HOST_DIR=~/velofit

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
podman build --platform linux/amd64 -f Dockerfile -t ghcr.io/fox27374/bikedb:$TAG -t ghcr.io/fox27374/bikedb:latest .

# Login and push images
echo "Pushing images to ghcr.io..."
gh auth token | podman login ghcr.io -u fox27374 --password-stdin

podman push ghcr.io/fox27374/velofit:$TAG
podman push ghcr.io/fox27374/velofit:latest
podman push ghcr.io/fox27374/bikedb:$TAG
podman push ghcr.io/fox27374/bikedb:latest

# Copy compose and systemd unit to host
echo "Copying config to host..."
ssh $HOST "mkdir -p $HOST_DIR"
scp "$VELOFIT_REPO/deploy/compose.yaml" $HOST:$HOST_DIR/
scp "$VELOFIT_REPO/deploy/velofit.service" $HOST:$HOST_DIR/

# Generate or update .env on host
echo "Setting up .env on host..."
ssh $HOST "
  if [ ! -f $HOST_DIR/.env ]; then
    PASS=\$(openssl rand -base64 32)
    echo \"POSTGRES_PASSWORD=\$PASS\" > $HOST_DIR/.env
    echo \"IMAGE_TAG=$TAG\" >> $HOST_DIR/.env
  else
    sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/' $HOST_DIR/.env
  fi
"

# Install systemd user unit
echo "Installing systemd user unit..."
ssh $HOST "
  mkdir -p ~/.config/systemd/user
  cp $HOST_DIR/velofit.service ~/.config/systemd/user/
  systemctl --user daemon-reload
  podman-compose -f $HOST_DIR/compose.yaml pull
  systemctl --user restart velofit
"

# Health check
echo "Waiting for services to be healthy..."
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -sf http://ataltpr06.lnxnet.org:8080/health > /dev/null 2>&1 && \
     curl -sf http://ataltpr06.lnxnet.org:8081/ > /dev/null 2>&1; then
    echo "Health check passed!"
    exit 0
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

echo "Health check timeout after $TIMEOUT seconds"
exit 1

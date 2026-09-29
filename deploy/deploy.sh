#!/usr/bin/env bash
# Build velofit and bikedb at their checked-out HEADs on the container host
# and roll the stack onto them.
#
# Usage, from anywhere: deploy/deploy.sh
#   BIKEDB_REPO  bikedb checkout (default: ../bikedb next to this repo)
#   VELOFIT_HOST ssh target      (default: claude@ataltpr06.lnxnet.org)
#
# Images are built on the host itself through `podhost`, so nothing travels
# through a registry: the ghcr packages are private and the host has no login.
# Each image is tagged with its repo's short HEAD sha, and those tags go into
# ~/velofit/.env as VELOFIT_TAG and BIKEDB_TAG.
#
# The update is a plain `podman-compose up -d`. podman-compose (1.6 on the
# host) runs the stack as pod_velofit and may restart db along with the app
# containers; the volume survives, and a dump is taken first. This replaced
# recreate.sh, which swapped containers one by one and cannot attach them to
# a pod.
set -euo pipefail

VELOFIT_REPO=$(cd "$(dirname "$0")/.." && pwd)
BIKEDB_REPO=${BIKEDB_REPO:-$VELOFIT_REPO/../bikedb}
HOST=${VELOFIT_HOST:-claude@ataltpr06.lnxnet.org}

for repo in "$VELOFIT_REPO" "$BIKEDB_REPO"; do
  if [ -n "$(git -C "$repo" status --porcelain)" ]; then
    echo "$repo has uncommitted changes; commit or stash them first." >&2
    exit 1
  fi
done
VT=$(git -C "$VELOFIT_REPO" rev-parse --short HEAD)
BT=$(git -C "$BIKEDB_REPO" rev-parse --short HEAD)
echo "velofit $VT, bikedb $BT"

(cd "$VELOFIT_REPO" &&
  podhost podman build -q --platform linux/amd64 -f deploy/Containerfile \
    -t "ghcr.io/fox27374/velofit:$VT" .)
(cd "$BIKEDB_REPO" &&
  podhost "for x in api scraper web; do podman build -q --platform linux/amd64 -f Dockerfile.\$x -t ghcr.io/fox27374/bikedb-\$x:$BT . || exit 1; done")

# compose.yaml and the unit are copied too, so the host never runs a stale one.
scp -q "$VELOFIT_REPO/deploy/compose.yaml" "$VELOFIT_REPO/deploy/velofit.service" "$HOST:velofit/"

ssh "$HOST" "set -euo pipefail
  cd ~/velofit
  mkdir -p backups
  if podman container exists velofit_db_1; then
    podman exec velofit_db_1 pg_dump -U bikedb -d bikedb > backups/bikedb-\$(date +%Y%m%d-%H%M%S).sql
  fi
  sed -i -e 's/^VELOFIT_TAG=.*/VELOFIT_TAG=$VT/' -e 's/^BIKEDB_TAG=.*/BIKEDB_TAG=$BT/' .env
  podman-compose up -d >/dev/null
  for _ in \$(seq 60); do
    curl -sf localhost:8080/health >/dev/null && curl -sf localhost:8081/ >/dev/null && break
    sleep 2
  done
  podman ps --format '{{.Names}} {{.Image}} {{.Status}}' | grep velofit_
  curl -sf localhost:8081/api/v1/brands >/dev/null && echo 'deployed velofit $VT, bikedb $BT'"

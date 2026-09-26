#!/usr/bin/env bash
# Recreate the four app containers on new images, leaving db running.
# Usage (on the host, in ~/velofit): bash recreate.sh <bikedb-tag> <velofit-tag>
#
# Why not podman-compose: 1.0.6 ignores --no-deps and stops/restarts db and
# the API along with whatever it recreates, and the API cannot be replaced
# alone while its dependents hold --requires on it. This copies each
# container's own env, compose labels, network alias, ports and restart
# policy from `podman inspect`, so nothing is re-derived from compose.yaml.
set -euo pipefail
BT=$1; VT=$2
D=$(mktemp -d); trap 'rm -rf "$D"' EXIT
declare -A IMG=(
  [velofit_bikedb_1]=ghcr.io/fox27374/bikedb-api:$BT
  [velofit_bikedb-scraper_1]=ghcr.io/fox27374/bikedb-scraper:$BT
  [velofit_bikedb-web_1]=ghcr.io/fox27374/bikedb-web:$BT
  [velofit_velofit_1]=ghcr.io/fox27374/velofit:$VT
)
# Compose's healthchecks do not survive a plain `podman run`, so restate them.
declare -A HEALTH=(
  [velofit_bikedb_1]="wget -qO- http://localhost:8080/health"
  [velofit_bikedb-scraper_1]="wget -qO- http://localhost:8091/health"
)
declare -A REQ=(
  [velofit_bikedb_1]=velofit_db_1
  [velofit_bikedb-scraper_1]=velofit_bikedb_1,velofit_db_1
  [velofit_bikedb-web_1]=velofit_bikedb_1,velofit_db_1
  [velofit_velofit_1]=velofit_db_1,velofit_bikedb_1
)
for c in "${!IMG[@]}"; do podman inspect "$c" > "$D/$c.json"; done
echo "captured ${#IMG[@]} configs"
for c in velofit_velofit_1 velofit_bikedb-web_1 velofit_bikedb-scraper_1 velofit_bikedb_1; do
  podman stop -t 15 "$c" >/dev/null && podman rm "$c" >/dev/null && echo "removed $c"
done
run() {
  local c=$1 j=$D/$1.json args=()
  while IFS= read -r e; do args+=(-e "$e"); done < <(jq -r '.[0].Config.Env[] | select(startswith("HOSTNAME=") | not)' "$j")
  if [ -n "${HEALTH[$c]:-}" ]; then
    args+=(--health-cmd "${HEALTH[$c]}" --health-interval 10s --health-retries 3 --health-timeout 5s)
  fi
  while IFS= read -r l; do args+=(--label "$l"); done < <(jq -r '.[0].Config.Labels | to_entries[] | select(.key|test("^(io.podman.compose|com.docker.compose|PODMAN_SYSTEMD_UNIT)")) | "\(.key)=\(.value)"' "$j")
  while IFS= read -r p; do args+=(-p "$p"); done < <(jq -r '.[0].HostConfig.PortBindings // {} | to_entries[] | "\(.value[0].HostPort):\(.key|split("/")[0])"' "$j")
  local net alias
  net=$(jq -r '.[0].NetworkSettings.Networks | keys[0]' "$j")
  alias=$(jq -r --arg c "$c" '.[0].Config.Labels["com.docker.compose.service"]' "$j")
  podman run -d --name "$c" --requires "${REQ[$c]}" "${args[@]}" --net "$net" --network-alias "$alias" \
    --restart "$(jq -r '.[0].HostConfig.RestartPolicy.Name' "$j")" "${IMG[$c]}" >/dev/null
  echo "started $c on ${IMG[$c]}"
}
run velofit_bikedb_1
for _ in $(seq 30); do curl -sf localhost:8080/health >/dev/null && break; sleep 1; done
curl -sf localhost:8080/health >/dev/null && echo "api healthy" || { echo "api NOT healthy"; exit 1; }
run velofit_bikedb-scraper_1
run velofit_bikedb-web_1
run velofit_velofit_1

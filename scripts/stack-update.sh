#!/bin/bash
set -e

if [[ -z "$VERSION" ]]; then
  echo "ERROR: VERSION environment variable must be set." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

STACK_VERSION=6
STACK_VERSION_FILE="/var/lib/timelines/stack-version"

BACKEND_SERVICES=(
  "timelines_rhea"
  "timelines_calliope"
  "timelines_styx"
  "timelines_orpheus"
)
GATEKEEPER="timelines_gatekeeper"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

short_name() { echo "${1#timelines_}"; }

# Run a docker service update, prefixing every output line with [label].
# Captures the exit code so we can check it after `wait`.
labeled_update() {
  local svc="$1"
  local image="$2"
  local name; name=$(short_name "$svc")
  docker service update --image "$image" "$svc" 2>&1 \
    | sed "s/^/[${name}] /" &
}

print_service_diagnostics() {
  local svc="$1"
  local name; name=$(short_name "$svc")
  echo ""
  echo "--- [${name}] task history ---"
  docker service ps "$svc" --no-trunc --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}"
  echo "--- [${name}] recent logs ---"
  docker service logs --tail 100 "$svc" 2>&1 || true
}

# ---------------------------------------------------------------------------
# Full deploy if stack version changed
# ---------------------------------------------------------------------------

needs_full_deploy=false
if [[ ! -f "$STACK_VERSION_FILE" ]]; then
  echo "Stack version file not found — running full deploy."
  needs_full_deploy=true
else
  current_version=$(cat "$STACK_VERSION_FILE")
  if [[ "$current_version" != "$STACK_VERSION" ]]; then
    echo "Stack version changed (${current_version} -> ${STACK_VERSION}) — running full deploy."
    needs_full_deploy=true
  fi
fi

if $needs_full_deploy; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  "$SCRIPT_DIR/stack-deploy.sh"
  mkdir -p "$(dirname "$STACK_VERSION_FILE")"
  echo "$STACK_VERSION" > "$STACK_VERSION_FILE"
  echo "Stack version saved: $STACK_VERSION"
  exit 0
fi

# ---------------------------------------------------------------------------
# Rolling update
# ---------------------------------------------------------------------------

docker system prune -f

# Kick off all backend updates in parallel, with labeled output
echo "Starting backend updates (version: ${VERSION})..."
for svc in "${BACKEND_SERVICES[@]}"; do
  name=$(short_name "$svc")
  image="tenebrie/timelines-${name}:${VERSION}"
  labeled_update "$svc" "$image"
done

wait

# Check for failures
FAILED=false
for svc in "${BACKEND_SERVICES[@]}"; do
  STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
  if [[ "$STATE" != "completed" ]]; then
    echo "FAILED: [$(short_name "$svc")] state is '${STATE}'"
    print_service_diagnostics "$svc"
    FAILED=true
  fi
done

if $FAILED; then
  echo ""
  echo "Rolling back failed services..."
  for svc in "${BACKEND_SERVICES[@]}"; do
    STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
    if [[ "$STATE" != "completed" ]]; then
      name=$(short_name "$svc")
      echo "[${name}] Rolling back..."
      docker service update --rollback "$svc" 2>&1 | sed "s/^/[${name}] /" &
    fi
  done
  wait
  exit 1
fi

# Update gatekeeper last, once all backends are confirmed healthy
echo ""
name=$(short_name "$GATEKEEPER")
echo "[${name}] Updating to tenebrie/timelines-gatekeeper:${VERSION}..."
docker service update --image "tenebrie/timelines-gatekeeper:${VERSION}" "$GATEKEEPER" 2>&1 \
  | sed "s/^/[${name}] /"

GK_STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$GATEKEEPER")
if [[ "$GK_STATE" != "completed" ]]; then
  echo "FAILED: [${name}] state is '${GK_STATE}'"
  print_service_diagnostics "$GATEKEEPER"
  echo "[${name}] Rolling back..."
  docker service update --rollback "$GATEKEEPER" 2>&1 | sed "s/^/[${name}] /"
  exit 1
fi

echo ""
echo "All services updated successfully."
docker system prune -f
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

MAX_WAIT_ITERATIONS=300  # 300 * 2s = 10 minutes

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

short_name() { echo "${1#timelines_}"; }

service_state() {
  docker service inspect --format '{{.UpdateStatus.State}}' "$1" 2>/dev/null || echo "unknown"
}

service_msg() {
  docker service inspect --format '{{.UpdateStatus.State}}: {{.UpdateStatus.Message}}' "$1" 2>/dev/null || echo "unknown"
}

# Wait until none of the given services are in any of the <wait_states>.
# Prints labeled status lines only when the message changes.
# Exits with error if the timeout is reached.
# Usage: monitor_until_done "state1|state2" service1 service2 ...
monitor_until_done() {
  local wait_states="$1"; shift
  local svcs=("$@")
  local iterations=0

  declare -A last_msg

  while true; do
    local all_done=true

    for svc in "${svcs[@]}"; do
      local name; name=$(short_name "$svc")
      local state; state=$(service_state "$svc")
      local msg;   msg=$(service_msg "$svc")

      if [[ "${last_msg[$svc]}" != "$msg" ]]; then
        echo "[${name}] ${msg}"
        last_msg[$svc]="$msg"
      fi

      if [[ "$state" =~ ^(${wait_states})$ ]]; then
        all_done=false
      fi
    done

    $all_done && break

    iterations=$((iterations + 1))
    if (( iterations >= MAX_WAIT_ITERATIONS )); then
      echo "ERROR: Timed out waiting for services to leave state '${wait_states}'" >&2
      exit 1
    fi

    sleep 2
  done
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

rollback_services() {
  local svcs=("$@")
  echo ""
  echo "Rolling back..."
  for svc in "${svcs[@]}"; do
    local name; name=$(short_name "$svc")
    echo "[${name}] Rolling back..."
    docker service update --detach --rollback "$svc"
  done
  echo ""
  echo "Waiting for rollbacks to complete..."
  monitor_until_done "rollback_started|rollback_in_progress" "${svcs[@]}"
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

# Kick off all backend updates in parallel
echo "Starting backend updates (version: ${VERSION})..."
for svc in "${BACKEND_SERVICES[@]}"; do
  name=$(short_name "$svc")
  image="tenebrie/timelines-${name}:${VERSION}"
  echo "[${name}] Updating to ${image}..."
  docker service update --detach --image "$image" "$svc"
done

echo ""
echo "Waiting for backend rollouts to complete..."
monitor_until_done "updating" "${BACKEND_SERVICES[@]}"

# Check for failures
failed_services=()
for svc in "${BACKEND_SERVICES[@]}"; do
  state=$(service_state "$svc")
  if [[ "$state" != "completed" ]]; then
    echo "FAILED: [$(short_name "$svc")] state is '${state}'"
    print_service_diagnostics "$svc"
    failed_services+=("$svc")
  fi
done

if (( ${#failed_services[@]} > 0 )); then
  rollback_services "${failed_services[@]}"
  exit 1
fi

# Update gatekeeper last, once all backends are confirmed healthy
echo ""
echo "[gatekeeper] Updating to tenebrie/timelines-gatekeeper:${VERSION}..."
docker service update --detach --image "tenebrie/timelines-gatekeeper:${VERSION}" "$GATEKEEPER"
echo "Waiting for gatekeeper rollout to complete..."
monitor_until_done "updating" "$GATEKEEPER"

gk_state=$(service_state "$GATEKEEPER")
if [[ "$gk_state" != "completed" ]]; then
  echo "FAILED: [gatekeeper] state is '${gk_state}'"
  print_service_diagnostics "$GATEKEEPER"
  rollback_services "$GATEKEEPER"
  exit 1
fi

echo ""
echo "All services updated successfully."
docker system prune -f
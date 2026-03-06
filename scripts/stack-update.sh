#!/bin/bash
set -e

if [[ -z "$VERSION" ]]; then
  echo "Must provide VERSION environment" 1>&2
  exit 1
fi

STACK_VERSION=9
STACK_VERSION_FILE="/var/lib/timelines/stack-version"

# Check if we need to do a full deploy instead of update
NEEDS_DEPLOY=false
if [[ ! -f "$STACK_VERSION_FILE" ]]; then
  echo "Stack version file not found, will run full deploy"
  NEEDS_DEPLOY=true
elif [[ "$(cat "$STACK_VERSION_FILE")" != "$STACK_VERSION" ]]; then
  echo "Stack version changed ($(cat "$STACK_VERSION_FILE") -> $STACK_VERSION), will run full deploy"
  NEEDS_DEPLOY=true
fi

if $NEEDS_DEPLOY; then
  echo "Running stack-deploy.sh instead of update..."
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  "$SCRIPT_DIR/stack-deploy.sh"
  
  # Save the new stack version
  mkdir -p "$(dirname "$STACK_VERSION_FILE")"
  echo "$STACK_VERSION" > "$STACK_VERSION_FILE"
  echo "Stack version saved: $STACK_VERSION"

  exit 0
fi

docker system prune -f

ALL_SERVICES=("timelines_rhea" "timelines_calliope" "timelines_styx" "timelines_orpheus" "timelines_thetis" "timelines_chronos")
ALL_IMAGES=(
  "tenebrie/timelines-rhea:${VERSION}"
  "tenebrie/timelines-calliope:${VERSION}"
  "tenebrie/timelines-styx:${VERSION}"
  "tenebrie/timelines-orpheus:${VERSION}"
  "tenebrie/timelines-thetis:${VERSION}"
  "tenebrie/timelines-chronos:${VERSION}"
)

# Pull images and only update services where the image content actually changed
SERVICES=()
IMAGES=()
for i in "${!ALL_SERVICES[@]}"; do
  docker pull "${ALL_IMAGES[$i]}" > /dev/null 2>&1
  NEW_DIGEST=$(docker image inspect --format '{{index .RepoDigests 0}}' "${ALL_IMAGES[$i]}" | grep -o 'sha256:[a-f0-9]*')
  CURRENT_DIGEST=$(docker service inspect --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' "${ALL_SERVICES[$i]}" | grep -o 'sha256:[a-f0-9]*')
  if [[ -n "$NEW_DIGEST" && "$NEW_DIGEST" == "$CURRENT_DIGEST" ]]; then
    echo "Skipping ${ALL_SERVICES[$i]}: image unchanged"
  else
    SERVICES+=("${ALL_SERVICES[$i]}")
    IMAGES+=("${ALL_IMAGES[$i]}")
  fi
done

for i in "${!SERVICES[@]}"; do
  docker service update --image "${IMAGES[$i]}" "${SERVICES[$i]}" &
done

wait

# Wait for all services to finish updating
echo "Waiting for rollouts to complete..."
for svc in "${SERVICES[@]}"; do
  while true; do
    STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
    if [[ "$STATE" != "updating" ]]; then
      break
    fi
    sleep 2
  done
done

FAILED=false
for svc in "${SERVICES[@]}"; do
  STATE=$(docker service inspect --format '{{.UpdateStatus.State}}' "$svc")
  if [[ "$STATE" != "completed" ]]; then
    echo "FAILED: $svc state is $STATE"
    echo "--- $svc task history ---"
    docker service ps "$svc" --no-trunc --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}"
    echo "--- $svc recent logs ---"
    docker service logs --tail 100 "$svc" 2>&1 || true
    FAILED=true
  fi
done

if $FAILED; then
  echo "Rolling back all services..."
  for svc in "${SERVICES[@]}"; do
    docker service update --rollback "$svc" &
  done
  wait
  exit 1
fi

docker pull "tenebrie/timelines-gatekeeper:${VERSION}" > /dev/null 2>&1
NEW_DIGEST=$(docker image inspect --format '{{index .RepoDigests 0}}' "tenebrie/timelines-gatekeeper:${VERSION}" | grep -o 'sha256:[a-f0-9]*')
CURRENT_DIGEST=$(docker service inspect --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' "timelines_gatekeeper" | grep -o 'sha256:[a-f0-9]*')
if [[ -n "$NEW_DIGEST" && "$NEW_DIGEST" == "$CURRENT_DIGEST" ]]; then
  echo "Skipping timelines_gatekeeper: image unchanged"
else
  docker service update --image "tenebrie/timelines-gatekeeper:${VERSION}" "timelines_gatekeeper"
fi

echo "All services updated successfully"
docker system prune -f